"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SubscriptionsService = class SubscriptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserSubscription(userId) {
        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
        return sub;
    }
    async subscribe(userId, dto) {
        const existing = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (existing && ['ACTIVE', 'TRIALING', 'PENDING_APPROVAL'].includes(existing.status)) {
            throw new common_1.BadRequestException('You already have an active subscription');
        }
        const plan = await this.prisma.plan.findUnique({
            where: { id: dto.planId },
        });
        if (!plan || !plan.isActive) {
            throw new common_1.NotFoundException('Plan not found or inactive');
        }
        let discountPercent;
        if (dto.discountCode) {
            const discount = await this.prisma.discountCode.findUnique({
                where: { code: dto.discountCode },
            });
            if (!discount || !discount.isActive) {
                throw new common_1.BadRequestException('Invalid discount code');
            }
            if (discount.maxUses && discount.usedCount >= discount.maxUses) {
                throw new common_1.BadRequestException('Discount code has been fully used');
            }
            if (discount.validUntil && discount.validUntil < new Date()) {
                throw new common_1.BadRequestException('Discount code has expired');
            }
            discountPercent = discount.value;
            await this.prisma.discountCode.update({
                where: { id: discount.id },
                data: { usedCount: { increment: 1 } },
            });
        }
        const isFree = plan.priceUsd === 0 && plan.priceInr === 0;
        const data = {
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
        if (existing) {
            return this.prisma.subscription.update({
                where: { userId },
                data,
                include: { plan: true },
            });
        }
        return this.prisma.subscription.create({
            data: data,
            include: { plan: true },
        });
    }
    async approve(subscriptionId, approvedById) {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });
        if (!sub)
            throw new common_1.NotFoundException('Subscription not found');
        if (sub.status !== 'PENDING_APPROVAL') {
            throw new common_1.BadRequestException('Subscription is not pending approval');
        }
        return this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'ACTIVE',
                approvedBy: approvedById,
                approvedAt: new Date(),
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + (sub.billingCycle === 'ANNUAL' ? 365 : 30) * 24 * 60 * 60 * 1000),
            },
            include: { plan: true, user: { select: { id: true, email: true, name: true } } },
        });
    }
    async reject(subscriptionId) {
        const sub = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });
        if (!sub)
            throw new common_1.NotFoundException('Subscription not found');
        return this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: 'REJECTED' },
            include: { plan: true },
        });
    }
    async cancel(userId) {
        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (!sub)
            throw new common_1.NotFoundException('No subscription found');
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
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map