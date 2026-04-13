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
exports.SurveysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SurveysService = class SurveysService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.survey.create({
            data: {
                ...dto,
                userId,
            },
        });
    }
    async findAllByUser(userId, params) {
        const { page = 1, limit = 20, status, search } = params;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (status)
            where.status = status;
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
    async findById(id, userId) {
        const survey = await this.prisma.survey.findUnique({
            where: { id },
            include: {
                questions: { orderBy: { order: 'asc' } },
                _count: { select: { responses: true } },
            },
        });
        if (!survey)
            throw new common_1.NotFoundException('Survey not found');
        if (userId && survey.userId !== userId) {
            throw new common_1.ForbiddenException('You do not own this survey');
        }
        return survey;
    }
    async update(id, userId, dto) {
        const survey = await this.findById(id, userId);
        if (survey.status !== 'DRAFT' && survey.status !== 'PAUSED') {
            throw new common_1.BadRequestException('Can only edit DRAFT or PAUSED surveys');
        }
        return this.prisma.survey.update({
            where: { id },
            data: dto,
        });
    }
    async updateQuestions(surveyId, userId, questions) {
        const survey = await this.findById(surveyId, userId);
        if (survey.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Can only edit questions in DRAFT status');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.question.deleteMany({ where: { surveyId } });
            await tx.question.createMany({
                data: questions.map((q, idx) => ({
                    surveyId,
                    order: q.order ?? idx + 1,
                    type: q.type,
                    text: q.text,
                    description: q.description,
                    required: q.required ?? true,
                    options: q.options,
                    validation: q.validation,
                    logic: q.logic,
                    mediaUrl: q.mediaUrl,
                })),
            });
        });
        return this.prisma.question.findMany({
            where: { surveyId },
            orderBy: { order: 'asc' },
        });
    }
    async launch(id, userId, startsAt, endsAt) {
        const survey = await this.findById(id, userId);
        if (survey.status !== 'DRAFT' && survey.status !== 'PAUSED') {
            throw new common_1.BadRequestException('Survey must be in DRAFT or PAUSED status to launch');
        }
        const questionCount = await this.prisma.question.count({ where: { surveyId: id } });
        if (questionCount === 0) {
            throw new common_1.BadRequestException('Survey must have at least one question');
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
    async pause(id, userId) {
        const survey = await this.findById(id, userId);
        if (survey.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Only active surveys can be paused');
        }
        return this.prisma.survey.update({
            where: { id },
            data: { status: 'PAUSED' },
        });
    }
    async complete(id, userId) {
        const survey = await this.findById(id, userId);
        if (survey.status !== 'ACTIVE' && survey.status !== 'PAUSED') {
            throw new common_1.BadRequestException('Only active or paused surveys can be completed');
        }
        return this.prisma.survey.update({
            where: { id },
            data: { status: 'COMPLETED', completedAt: new Date() },
        });
    }
    async archive(id, userId) {
        await this.findById(id, userId);
        return this.prisma.survey.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });
    }
    async delete(id, userId) {
        const survey = await this.findById(id, userId);
        if (survey.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Only DRAFT surveys can be deleted');
        }
        await this.prisma.survey.delete({ where: { id } });
        return { message: 'Survey deleted' };
    }
    async getStats(id, userId) {
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
};
exports.SurveysService = SurveysService;
exports.SurveysService = SurveysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SurveysService);
//# sourceMappingURL=surveys.service.js.map