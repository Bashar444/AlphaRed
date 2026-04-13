import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvitationDto, BulkInviteByFilterDto } from './dto';

@Injectable()
export class InvitationsService {
    constructor(private prisma: PrismaService) { }

    async createBatch(dto: CreateInvitationDto) {
        const survey = await this.prisma.survey.findUnique({ where: { id: dto.surveyId } });
        if (!survey) throw new NotFoundException('Survey not found');

        const results = { created: 0, skipped: 0, errors: [] as string[] };

        for (const respondentId of dto.respondentIds) {
            try {
                const existing = await this.prisma.surveyInvitation.findUnique({
                    where: { surveyId_respondentId: { surveyId: dto.surveyId, respondentId } },
                });
                if (existing) {
                    results.skipped++;
                    continue;
                }

                await this.prisma.surveyInvitation.create({
                    data: {
                        surveyId: dto.surveyId,
                        respondentId,
                        status: 'pending',
                        sentAt: new Date(),
                    },
                });
                results.created++;
            } catch {
                results.errors.push(respondentId);
            }
        }

        return results;
    }

    async bulkInviteByFilter(dto: BulkInviteByFilterDto) {
        const survey = await this.prisma.survey.findUnique({ where: { id: dto.surveyId } });
        if (!survey) throw new NotFoundException('Survey not found');

        const where: any = {
            status: 'ACTIVE',
            kycStatus: 'FULL_VERIFIED',
        };
        if (dto.country) where.country = dto.country;
        if (dto.state) where.state = dto.state;
        if (dto.minQualityScore) where.qualityScore = { gte: dto.minQualityScore };

        // Exclude already-invited respondents
        where.NOT = {
            invitations: { some: { surveyId: dto.surveyId } },
        };

        const respondents = await this.prisma.respondent.findMany({
            where,
            select: { id: true },
            take: dto.maxCount || 500,
            orderBy: { qualityScore: 'desc' },
        });

        if (respondents.length === 0) {
            throw new BadRequestException('No matching respondents found');
        }

        return this.createBatch({
            surveyId: dto.surveyId,
            respondentIds: respondents.map((r) => r.id),
        });
    }

    async listBySurvey(surveyId: string, page = 1, limit = 20, status?: string) {
        const skip = (page - 1) * limit;
        const where: any = { surveyId };
        if (status) where.status = status;

        const [invitations, total] = await Promise.all([
            this.prisma.surveyInvitation.findMany({
                where,
                include: { respondent: { select: { id: true, name: true, email: true, qualityScore: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.surveyInvitation.count({ where }),
        ]);

        return {
            invitations,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async markOpened(token: string) {
        const invitation = await this.prisma.surveyInvitation.findUnique({ where: { token } });
        if (!invitation) throw new NotFoundException('Invitation not found');
        if (!invitation.openedAt) {
            await this.prisma.surveyInvitation.update({
                where: { token },
                data: { status: 'opened', openedAt: new Date() },
            });
        }
        return { surveyId: invitation.surveyId, respondentId: invitation.respondentId };
    }

    async markCompleted(token: string) {
        const invitation = await this.prisma.surveyInvitation.findUnique({ where: { token } });
        if (!invitation) throw new NotFoundException('Invitation not found');

        await this.prisma.surveyInvitation.update({
            where: { token },
            data: { status: 'completed', completedAt: new Date() },
        });

        return { success: true };
    }

    async getStats(surveyId: string) {
        const [total, pending, opened, completed] = await Promise.all([
            this.prisma.surveyInvitation.count({ where: { surveyId } }),
            this.prisma.surveyInvitation.count({ where: { surveyId, status: 'pending' } }),
            this.prisma.surveyInvitation.count({ where: { surveyId, status: 'opened' } }),
            this.prisma.surveyInvitation.count({ where: { surveyId, status: 'completed' } }),
        ]);

        return {
            total,
            pending,
            opened,
            completed,
            openRate: total > 0 ? ((opened + completed) / total * 100).toFixed(1) : '0.0',
            completionRate: total > 0 ? (completed / total * 100).toFixed(1) : '0.0',
        };
    }

    async cancel(invitationId: string) {
        return this.prisma.surveyInvitation.update({
            where: { id: invitationId },
            data: { status: 'cancelled' },
        });
    }
}
