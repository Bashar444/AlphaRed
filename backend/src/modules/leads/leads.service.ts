import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    CreateLeadDto,
    UpdateLeadDto,
    AddLeadActivityDto,
    LeadQueryDto,
} from './dto';

@Injectable()
export class LeadsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: LeadQueryDto) {
        const where: any = {};

        if (query.status) where.status = query.status;
        if (query.assignedToId) where.assignedToId = query.assignedToId;
        if (query.source) where.source = query.source;
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { organization: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.lead.findMany({
            where,
            include: {
                assignedTo: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true, email: true } },
                _count: { select: { activities: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                assignedTo: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true, email: true } },
                activities: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!lead) throw new NotFoundException('Lead not found');
        return lead;
    }

    async create(dto: CreateLeadDto, userId: string) {
        return this.prisma.lead.create({
            data: {
                ...dto,
                createdById: userId,
            },
        });
    }

    /** Public lead capture — no auth required */
    async capture(dto: CreateLeadDto) {
        return this.prisma.lead.create({
            data: {
                ...dto,
                source: dto.source || 'website',
            },
        });
    }

    async update(id: string, dto: UpdateLeadDto) {
        await this.findById(id);
        return this.prisma.lead.update({
            where: { id },
            data: dto as any,
        });
    }

    async assign(id: string, assignedToId: string, currentUserId: string) {
        await this.findById(id);
        const lead = await this.prisma.lead.update({
            where: { id },
            data: { assignedToId },
        });
        await this.prisma.leadActivity.create({
            data: {
                leadId: id,
                type: 'assignment',
                note: `Lead assigned to user ${assignedToId}`,
                createdBy: currentUserId,
            },
        });
        return lead;
    }

    async changeStatus(id: string, status: string, userId: string) {
        const lead = await this.findById(id);
        const data: any = { status };
        if (status === 'CONVERTED') data.convertedAt = new Date();

        const updated = await this.prisma.lead.update({
            where: { id },
            data,
        });

        await this.prisma.leadActivity.create({
            data: {
                leadId: id,
                type: 'status_change',
                note: `Status changed from ${lead.status} to ${status}`,
                createdBy: userId,
            },
        });

        return updated;
    }

    async addActivity(id: string, dto: AddLeadActivityDto, userId: string) {
        await this.findById(id);
        return this.prisma.leadActivity.create({
            data: {
                leadId: id,
                type: dto.type,
                note: dto.note,
                createdBy: userId,
            },
        });
    }

    async getActivities(id: string) {
        await this.findById(id);
        return this.prisma.leadActivity.findMany({
            where: { leadId: id },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getPipelineSummary() {
        const statuses = [
            'NEW', 'CONTACTED', 'QUALIFIED',
            'PROPOSAL_SENT', 'NEGOTIATION', 'CONVERTED', 'LOST',
        ];

        const counts = await Promise.all(
            statuses.map(async (status) => ({
                status,
                count: await this.prisma.lead.count({ where: { status: status as any } }),
            })),
        );

        return counts;
    }

    async delete(id: string) {
        await this.findById(id);
        await this.prisma.leadActivity.deleteMany({ where: { leadId: id } });
        return this.prisma.lead.delete({ where: { id } });
    }
}
