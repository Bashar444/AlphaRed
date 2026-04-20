import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSurveyDto, UpdateSurveyDto, QuestionItemDto } from './dto';

@Injectable()
export class SurveysService {
    constructor(private prisma: PrismaService) { }

    private async getPlanLimits(userId: string): Promise<{ maxSurveys: number; maxResponses: number; maxQuestions: number }> {
        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
        let plan = sub?.plan;
        if (!plan || !sub || !['ACTIVE', 'TRIALING'].includes(sub.status)) {
            plan = (await this.prisma.plan.findFirst({ where: { slug: 'free' } })) || null as any;
        }
        return {
            maxSurveys: plan?.maxSurveys ?? 1,
            maxResponses: plan?.maxResponses ?? 50,
            maxQuestions: plan?.maxQuestions ?? 10,
        };
    }

    private async assertCanCreateSurvey(userId: string) {
        const limits = await this.getPlanLimits(userId);
        if (limits.maxSurveys <= 0) return;
        const used = await this.prisma.survey.count({ where: { userId, status: { not: 'ARCHIVED' } } });
        if (used >= limits.maxSurveys) {
            throw new ForbiddenException(`Plan limit reached: ${limits.maxSurveys} survey(s). Upgrade your plan to create more.`);
        }
    }

    private async assertCanAddQuestions(userId: string, count: number) {
        const limits = await this.getPlanLimits(userId);
        if (limits.maxQuestions <= 0) return;
        if (count > limits.maxQuestions) {
            throw new ForbiddenException(`Plan limit reached: ${limits.maxQuestions} question(s) per survey. Upgrade to add more.`);
        }
    }

    async create(userId: string, dto: CreateSurveyDto) {
        await this.assertCanCreateSurvey(userId);
        return this.prisma.survey.create({
            data: {
                ...dto,
                userId,
            },
        });
    }

    async findAllByUser(userId: string, params: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    }) {
        const { page = 1, limit = 20, status, search } = params;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = { userId };
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [surveys, total] = await Promise.all([
            this.prisma.survey.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { questions: true, responses: true } },
                },
            }),
            this.prisma.survey.count({ where }),
        ]);

        return {
            surveys,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    /**
     * List ACTIVE surveys for respondents to browse and take.
     * Returns surveys that are currently active (launched by researchers).
     */
    async findActiveForRespondents(params: {
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const { page = 1, limit = 20, search } = params;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = { status: 'ACTIVE' };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [surveys, total] = await Promise.all([
            this.prisma.survey.findMany({
                where,
                skip,
                take: limit,
                orderBy: { launchedAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    estimatedMinutes: true,
                    status: true,
                    launchedAt: true,
                    endsAt: true,
                    _count: { select: { questions: true, responses: true } },
                    user: { select: { name: true, organization: true } },
                },
            }),
            this.prisma.survey.count({ where }),
        ]);

        return {
            surveys,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    /**
     * Get a single ACTIVE survey by ID — for respondents to view/take.
     */
    async findActiveById(id: string) {
        const survey = await this.prisma.survey.findUnique({
            where: { id },
            include: {
                questions: { orderBy: { order: 'asc' } },
                user: { select: { name: true, organization: true } },
            },
        });

        if (!survey) throw new NotFoundException('Survey not found');
        if (survey.status !== 'ACTIVE') {
            throw new BadRequestException('This survey is not currently active');
        }

        return survey;
    }

    async findById(id: string, userId?: string) {
        const survey = await this.prisma.survey.findUnique({
            where: { id },
            include: {
                questions: { orderBy: { order: 'asc' } },
                _count: { select: { responses: true } },
            },
        });

        if (!survey) throw new NotFoundException('Survey not found');
        if (userId && survey.userId !== userId) {
            throw new ForbiddenException('You do not own this survey');
        }
        return survey;
    }

    async update(id: string, userId: string, dto: UpdateSurveyDto) {
        const survey = await this.findById(id, userId);
        if (survey.status !== 'DRAFT' && survey.status !== 'PAUSED') {
            throw new BadRequestException('Can only edit DRAFT or PAUSED surveys');
        }

        return this.prisma.survey.update({
            where: { id },
            data: dto,
        });
    }

    async updateQuestions(surveyId: string, userId: string, questions: QuestionItemDto[]) {
        const survey = await this.findById(surveyId, userId);
        if (survey.status !== 'DRAFT') {
            throw new BadRequestException('Can only edit questions in DRAFT status');
        }
        await this.assertCanAddQuestions(userId, questions.length);

        // Delete existing questions and recreate (transactional)
        await this.prisma.$transaction(async (tx) => {
            await tx.question.deleteMany({ where: { surveyId } });
            await tx.question.createMany({
                data: questions.map((q, idx) => ({
                    surveyId,
                    order: q.order ?? idx + 1,
                    type: q.type as any,
                    text: q.text,
                    description: q.description,
                    required: q.required ?? true,
                    options: q.options as any,
                    validation: q.validation as any,
                    logic: q.logic as any,
                    mediaUrl: q.mediaUrl,
                })),
            });
        });

        return this.prisma.question.findMany({
            where: { surveyId },
            orderBy: { order: 'asc' },
        });
    }

    async launch(id: string, userId: string, startsAt?: string, endsAt?: string) {
        const survey = await this.findById(id, userId);
        if (survey.status !== 'DRAFT' && survey.status !== 'PAUSED') {
            throw new BadRequestException('Survey must be in DRAFT or PAUSED status to launch');
        }

        const questionCount = await this.prisma.question.count({ where: { surveyId: id } });
        if (questionCount === 0) {
            throw new BadRequestException('Survey must have at least one question');
        }

        return this.prisma.survey.update({
            where: { id },
            data: {
                status: 'ACTIVE',
                launchedAt: new Date(),
                startsAt: startsAt ? new Date(startsAt) : new Date(),
                endsAt: endsAt ? new Date(endsAt) : null,
            },
        });
    }

    async pause(id: string, userId: string) {
        const survey = await this.findById(id, userId);
        if (survey.status !== 'ACTIVE') {
            throw new BadRequestException('Only active surveys can be paused');
        }

        return this.prisma.survey.update({
            where: { id },
            data: { status: 'PAUSED' },
        });
    }

    async complete(id: string, userId: string) {
        const survey = await this.findById(id, userId);
        if (survey.status !== 'ACTIVE' && survey.status !== 'PAUSED') {
            throw new BadRequestException('Only active or paused surveys can be completed');
        }

        return this.prisma.survey.update({
            where: { id },
            data: { status: 'COMPLETED', completedAt: new Date() },
        });
    }

    async archive(id: string, userId: string) {
        await this.findById(id, userId);
        return this.prisma.survey.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });
    }

    async delete(id: string, userId: string) {
        const survey = await this.findById(id, userId);
        if (survey.status !== 'DRAFT') {
            throw new BadRequestException('Only DRAFT surveys can be deleted');
        }

        await this.prisma.survey.delete({ where: { id } });
        return { message: 'Survey deleted' };
    }

    async duplicate(id: string, userId: string) {
        const original = await this.prisma.survey.findUnique({
            where: { id },
            include: { questions: { orderBy: { order: 'asc' } } },
        });
        if (!original) throw new NotFoundException('Survey not found');
        if (original.userId !== userId) throw new ForbiddenException('Cannot duplicate another user\'s survey');
        await this.assertCanCreateSurvey(userId);

        const copy = await this.prisma.survey.create({
            data: {
                userId,
                title: `${original.title} (Copy)`,
                description: original.description,
                status: 'DRAFT',
                targetResponses: original.targetResponses,
                targeting: original.targeting as any,
                estimatedMinutes: original.estimatedMinutes,
                language: original.language,
                welcomeMessage: original.welcomeMessage,
                thankYouMessage: original.thankYouMessage,
                progressBar: original.progressBar,
                randomizeQuestions: original.randomizeQuestions,
                allowAnonymous: original.allowAnonymous,
                category: original.category,
                tags: original.tags,
                questions: {
                    create: original.questions.map((q) => ({
                        order: q.order,
                        type: q.type,
                        text: q.text,
                        description: q.description,
                        required: q.required,
                        options: q.options as any,
                        validation: q.validation as any,
                        logic: q.logic as any,
                        mediaUrl: q.mediaUrl,
                    })),
                },
            },
            include: { questions: true },
        });
        return copy;
    }

    async getStats(id: string, userId: string) {
        const survey = await this.findById(id, userId);

        const [totalResponses, completedResponses, avgDuration] = await Promise.all([
            this.prisma.response.count({ where: { surveyId: id } }),
            this.prisma.response.count({ where: { surveyId: id, status: 'COMPLETED' } }),
            this.prisma.response.aggregate({
                where: { surveyId: id, status: 'COMPLETED' },
                _avg: { durationSecs: true },
            }),
        ]);

        return {
            surveyId: id,
            title: survey.title,
            status: survey.status,
            targetResponses: survey.targetResponses,
            totalResponses,
            completedResponses,
            completionRate: totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0,
            averageDurationSecs: avgDuration._avg.durationSecs ?? 0,
        };
    }
}
