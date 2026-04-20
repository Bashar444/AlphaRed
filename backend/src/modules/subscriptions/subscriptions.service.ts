import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto';

@Injectable()
export class SubscriptionsService {
    constructor(private prisma: PrismaService) { }

    async getUserSubscription(userId: string) {
        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
        return sub;
    }

    /**
     * Returns the user's current usage vs their plan limits.
     * If no active subscription, returns Free-tier defaults (1 survey, 50 responses, 10 questions).
     */
    async getUsage(userId: string) {
        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });

        // Defaults for users without an active subscription (Free tier)
        let plan = sub?.plan;
        if (!plan || !sub || !['ACTIVE', 'TRIALING'].includes(sub.status)) {
            const free = await this.prisma.plan.findFirst({ where: { slug: 'free' } });
            plan = free || {
                id: 'free',
                slug: 'free',
                name: 'Free',
                maxSurveys: 1,
                maxResponses: 50,
                maxQuestions: 10,
                maxTeamMembers: 0,
                features: {},
            } as any;
        }

        const planSafe = plan!;

        const [surveysUsed, responsesUsed, surveys] = await Promise.all([
            this.prisma.survey.count({ where: { userId, status: { not: 'ARCHIVED' } } }),
            this.prisma.response.count({ where: { survey: { userId } } }),
            this.prisma.survey.findMany({
                where: { userId, status: { not: 'ARCHIVED' } },
                select: { id: true, _count: { select: { questions: true } } },
            }),
        ]);
        const maxQuestionsUsed = surveys.reduce((m, s) => Math.max(m, s._count.questions), 0);

        return {
            plan: {
                id: planSafe.id,
                slug: planSafe.slug,
                name: planSafe.name,
                maxSurveys: planSafe.maxSurveys,
                maxResponses: planSafe.maxResponses,
                maxQuestions: planSafe.maxQuestions,
                maxTeamMembers: planSafe.maxTeamMembers,
                features: planSafe.features,
            },
            usage: {
                surveys: surveysUsed,
                responses: responsesUsed,
                maxQuestionsInAnySurvey: maxQuestionsUsed,
            },
            limits: {
                surveys: { used: surveysUsed, max: planSafe.maxSurveys, exceeded: planSafe.maxSurveys > 0 && surveysUsed >= planSafe.maxSurveys },
                responses: { used: responsesUsed, max: planSafe.maxResponses, exceeded: planSafe.maxResponses > 0 && responsesUsed >= planSafe.maxResponses },
                questions: { used: maxQuestionsUsed, max: planSafe.maxQuestions, exceeded: planSafe.maxQuestions > 0 && maxQuestionsUsed >= planSafe.maxQuestions },
            },
            subscriptionStatus: sub?.status || 'NONE',
        };
    }

    async subscribe(userId: string, dto: CreateSubscriptionDto) {
        // Check if user already has an active subscription
        const existing = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (existing && ['ACTIVE', 'TRIALING', 'PENDING_APPROVAL'].includes(existing.status)) {
            throw new BadRequestException('You already have an active subscription');
        }

        const plan = await this.prisma.plan.findUnique({
            where: { id: dto.planId },
        });
        if (!plan || !plan.isActive) {
            throw new NotFoundException('Plan not found or inactive');
        }

        // Handle discount codes
        let discountPercent: number | undefined;
        if (dto.discountCode) {
            const discount = await this.prisma.discountCode.findUnique({
                where: { code: dto.discountCode },
            });
            if (!discount || !discount.isActive) {
                throw new BadRequestException('Invalid discount code');
            }
            if (discount.maxUses && discount.usedCount >= discount.maxUses) {
                throw new BadRequestException('Discount code has been fully used');
            }
            if (discount.validUntil && discount.validUntil < new Date()) {
                throw new BadRequestException('Discount code has expired');
            }
            discountPercent = discount.value;

            // Increment usage
            await this.prisma.discountCode.update({
                where: { id: discount.id },
                data: { usedCount: { increment: 1 } },
            });
        }

        // Free plan → auto-approve
        const isFree = plan.priceUsd === 0 && plan.priceInr === 0;

        const data: Record<string, unknown> = {
            userId,
            planId: dto.planId,
            billingCycle: dto.billingCycle || 'MONTHLY',
            status: isFree ? 'ACTIVE' : 'PENDING_APPROVAL',
            discountCode: dto.discountCode,
            discountPercent,
        };

        if (isFree) {
            data.currentPeriodStart = new Date();
            data.currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        }

        if (plan.trialDays > 0 && !isFree) {
            data.status = 'TRIALING';
            data.trialEndsAt = new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000);
        }

        // Upsert — create new or update existing cancelled
        if (existing) {
            return this.prisma.subscription.update({
                where: { userId },
                data,
                include: { plan: true },
            });
        }

        return this.prisma.subscription.create({
            data: data as any,
            include: { plan: true },
        });
    }

    async approve(subscriptionId: string, approvedById: string) {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });
        if (!sub) throw new NotFoundException('Subscription not found');
        if (sub.status !== 'PENDING_APPROVAL') {
            throw new BadRequestException('Subscription is not pending approval');
        }

        return this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'ACTIVE',
                approvedBy: approvedById,
                approvedAt: new Date(),
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(
                    Date.now() + (sub.billingCycle === 'ANNUAL' ? 365 : 30) * 24 * 60 * 60 * 1000,
                ),
            },
            include: { plan: true, user: { select: { id: true, email: true, name: true } } },
        });
    }

    async reject(subscriptionId: string) {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });
        if (!sub) throw new NotFoundException('Subscription not found');

        return this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: 'REJECTED' },
            include: { plan: true },
        });
    }

    async cancel(userId: string) {
        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (!sub) throw new NotFoundException('No subscription found');

        return this.prisma.subscription.update({
            where: { userId },
            data: {
                cancelAtPeriodEnd: true,
                cancelledAt: new Date(),
            },
            include: { plan: true },
        });
    }

    async listPending(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [subs, total] = await Promise.all([
            this.prisma.subscription.findMany({
                where: { status: 'PENDING_APPROVAL' },
                include: {
                    plan: true,
                    user: { select: { id: true, email: true, name: true, organization: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.subscription.count({ where: { status: 'PENDING_APPROVAL' } }),
        ]);

        return {
            subscriptions: subs,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
}
