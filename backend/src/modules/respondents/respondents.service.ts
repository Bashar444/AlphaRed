import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRespondentDto, UpdateRespondentDto, CreatePayoutDto, UpdatePayoutDto } from './dto';

@Injectable()
export class RespondentsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateRespondentDto) {
        if (dto.email) {
            const existing = await this.prisma.respondent.findFirst({
                where: { email: dto.email },
            });
            if (existing) throw new BadRequestException('Respondent with this email already exists');
        }

        return this.prisma.respondent.create({
            data: dto as any,
        });
    }

    async findAll(page = 1, limit = 20, filters?: {
        status?: string;
        kycStatus?: string;
        country?: string;
        search?: string;
    }) {
        const skip = (page - 1) * limit;
        const where: any = {};

        if (filters?.status) where.status = filters.status;
        if (filters?.kycStatus) where.kycStatus = filters.kycStatus;
        if (filters?.country) where.country = filters.country;
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const [respondents, total] = await Promise.all([
            this.prisma.respondent.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: { _count: { select: { responses: true, invitations: true } } },
            }),
            this.prisma.respondent.count({ where }),
        ]);

        return {
            respondents,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string) {
        const respondent = await this.prisma.respondent.findUnique({
            where: { id },
            include: {
                responses: { orderBy: { createdAt: 'desc' }, take: 20, include: { survey: { select: { id: true, title: true } } } },
                payouts: { orderBy: { createdAt: 'desc' }, take: 20 },
                invitations: { orderBy: { createdAt: 'desc' }, take: 20, include: { survey: { select: { id: true, title: true } } } },
                _count: { select: { responses: true, payouts: true, invitations: true } },
            },
        });
        if (!respondent) throw new NotFoundException('Respondent not found');
        return respondent;
    }

    async update(id: string, dto: UpdateRespondentDto) {
        await this.findOne(id);
        const data: any = { ...dto };

        if (dto.kycStatus === 'FULL_VERIFIED') {
            data.verifiedAt = new Date();
        }

        return this.prisma.respondent.update({
            where: { id },
            data,
        });
    }

    async updateKyc(id: string, kycStatus: string) {
        await this.findOne(id);
        const data: any = { kycStatus };
        if (kycStatus === 'FULL_VERIFIED') data.verifiedAt = new Date();
        if (kycStatus === 'REJECTED' || kycStatus === 'SUSPENDED') data.status = 'SUSPENDED';

        return this.prisma.respondent.update({ where: { id }, data });
    }

    async ban(id: string) {
        return this.prisma.respondent.update({
            where: { id },
            data: { status: 'BANNED', kycStatus: 'SUSPENDED' },
        });
    }

    async getStats() {
        const [total, active, pending, suspended, banned, avgQuality] = await Promise.all([
            this.prisma.respondent.count(),
            this.prisma.respondent.count({ where: { status: 'ACTIVE' } }),
            this.prisma.respondent.count({ where: { status: 'PENDING' } }),
            this.prisma.respondent.count({ where: { status: 'SUSPENDED' } }),
            this.prisma.respondent.count({ where: { status: 'BANNED' } }),
            this.prisma.respondent.aggregate({ _avg: { qualityScore: true } }),
        ]);

        return {
            total,
            active,
            pending,
            suspended,
            banned,
            avgQualityScore: avgQuality._avg.qualityScore || 0,
        };
    }

    // ── Payouts ──

    async createPayout(dto: CreatePayoutDto) {
        const respondent = await this.prisma.respondent.findUnique({ where: { id: dto.respondentId } });
        if (!respondent) throw new NotFoundException('Respondent not found');
        if (respondent.incentiveBalance < dto.amount) {
            throw new BadRequestException('Insufficient incentive balance');
        }

        const [payout] = await this.prisma.$transaction([
            this.prisma.respondentPayout.create({
                data: {
                    respondentId: dto.respondentId,
                    amount: dto.amount,
                    method: dto.method,
                    status: 'pending',
                },
            }),
            this.prisma.respondent.update({
                where: { id: dto.respondentId },
                data: { incentiveBalance: { decrement: dto.amount } },
            }),
        ]);

        return payout;
    }

    async updatePayout(payoutId: string, dto: UpdatePayoutDto) {
        const payout = await this.prisma.respondentPayout.findUnique({ where: { id: payoutId } });
        if (!payout) throw new NotFoundException('Payout not found');

        const data: any = { status: dto.status };
        if (dto.status === 'completed') data.processedAt = new Date();

        // If failed, refund balance
        if (dto.status === 'failed' && payout.status !== 'failed') {
            await this.prisma.respondent.update({
                where: { id: payout.respondentId },
                data: { incentiveBalance: { increment: payout.amount } },
            });
        }

        return this.prisma.respondentPayout.update({ where: { id: payoutId }, data });
    }

    async listPayouts(page = 1, limit = 20, status?: string) {
        const skip = (page - 1) * limit;
        const where: any = {};
        if (status) where.status = status;

        const [payouts, total] = await Promise.all([
            this.prisma.respondentPayout.findMany({
                where,
                include: { respondent: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.respondentPayout.count({ where }),
        ]);

        return {
            payouts,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
}
