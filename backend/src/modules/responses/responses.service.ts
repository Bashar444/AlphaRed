import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitResponseDto } from './dto';

@Injectable()
export class ResponsesService {
    constructor(private prisma: PrismaService) { }

    async submit(dto: SubmitResponseDto, ipHash?: string, userAgent?: string) {
        // Validate survey exists and is active
        const survey = await this.prisma.survey.findUnique({
            where: { id: dto.surveyId },
            include: { questions: true },
        });
        if (!survey) throw new NotFoundException('Survey not found');
        if (survey.status !== 'ACTIVE') {
            throw new BadRequestException('Survey is not accepting responses');
        }

        // Check if respondent already responded
        const existing = await this.prisma.response.findFirst({
            where: {
                surveyId: dto.surveyId,
                respondentId: dto.respondentId,
                status: 'COMPLETED',
            },
        });
        if (existing) {
            throw new BadRequestException('You have already completed this survey');
        }

        // Create response + answers in a transaction
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
                            value: a.value as any,
                        })),
                    },
                },
                include: { answers: true },
            });

            // Update survey collected count
            await tx.survey.update({
                where: { id: dto.surveyId },
                data: {
                    collectedCount: { increment: 1 },
                    validCount: { increment: 1 },
                },
            });

            // Update respondent stats
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

    async findBySurvey(surveyId: string, params: {
        page?: number;
        limit?: number;
        status?: string;
    }) {
        const { page = 1, limit = 20, status } = params;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = { surveyId };
        if (status) where.status = status;

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

    async findById(id: string) {
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
        if (!response) throw new NotFoundException('Response not found');
        return response;
    }

    async flagResponse(id: string, flags: unknown) {
        return this.prisma.response.update({
            where: { id },
            data: {
                status: 'FLAGGED',
                qualityFlags: flags as any,
            },
        });
    }

    async rejectResponse(id: string) {
        const resp = await this.prisma.response.findUnique({ where: { id } });
        if (!resp) throw new NotFoundException('Response not found');

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
}
