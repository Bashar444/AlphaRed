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
exports.ResponsesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ResponsesService = class ResponsesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submit(dto, ipHash, userAgent) {
        const survey = await this.prisma.survey.findUnique({
            where: { id: dto.surveyId },
            include: { questions: true },
        });
        if (!survey)
            throw new common_1.NotFoundException('Survey not found');
        if (survey.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Survey is not accepting responses');
        }
        const existing = await this.prisma.response.findFirst({
            where: {
                surveyId: dto.surveyId,
                respondentId: dto.respondentId,
                status: 'COMPLETED',
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('You have already completed this survey');
        }
        const response = await this.prisma.$transaction(async (tx) => {
            const resp = await tx.response.create({
                data: {
                    surveyId: dto.surveyId,
                    respondentId: dto.respondentId,
                    status: 'COMPLETED',
                    durationSecs: dto.durationSecs,
                    ipHash,
                    userAgent,
                    completedAt: new Date(),
                    answers: {
                        create: dto.answers.map((a) => ({
                            questionId: a.questionId,
                            value: a.value,
                        })),
                    },
                },
                include: { answers: true },
            });
            await tx.survey.update({
                where: { id: dto.surveyId },
                data: {
                    collectedCount: { increment: 1 },
                    validCount: { increment: 1 },
                },
            });
            await tx.respondent.update({
                where: { id: dto.respondentId },
                data: {
                    totalResponses: { increment: 1 },
                    acceptedCount: { increment: 1 },
                    lastActiveAt: new Date(),
                },
            });
            return resp;
        });
        return { responseId: response.id, status: 'COMPLETED' };
    }
    async findBySurvey(surveyId, params) {
        const { page = 1, limit = 20, status } = params;
        const skip = (page - 1) * limit;
        const where = { surveyId };
        if (status)
            where.status = status;
        const [responses, total] = await Promise.all([
            this.prisma.response.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    answers: true,
                    respondent: {
                        select: { id: true, email: true, name: true, qualityScore: true },
                    },
                },
            }),
            this.prisma.response.count({ where }),
        ]);
        return {
            responses,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findById(id) {
        const response = await this.prisma.response.findUnique({
            where: { id },
            include: {
                answers: { include: { question: true } },
                respondent: {
                    select: { id: true, email: true, name: true, qualityScore: true },
                },
                survey: { select: { id: true, title: true, userId: true } },
            },
        });
        if (!response)
            throw new common_1.NotFoundException('Response not found');
        return response;
    }
    async flagResponse(id, flags) {
        return this.prisma.response.update({
            where: { id },
            data: {
                status: 'FLAGGED',
                qualityFlags: flags,
            },
        });
    }
    async rejectResponse(id) {
        const resp = await this.prisma.response.findUnique({ where: { id } });
        if (!resp)
            throw new common_1.NotFoundException('Response not found');
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.response.update({
                where: { id },
                data: { status: 'REJECTED' },
            });
            await tx.survey.update({
                where: { id: resp.surveyId },
                data: { validCount: { decrement: 1 } },
            });
            await tx.respondent.update({
                where: { id: resp.respondentId },
                data: {
                    rejectedCount: { increment: 1 },
                    acceptedCount: { decrement: 1 },
                },
            });
            return updated;
        });
    }
};
exports.ResponsesService = ResponsesService;
exports.ResponsesService = ResponsesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResponsesService);
//# sourceMappingURL=responses.service.js.map