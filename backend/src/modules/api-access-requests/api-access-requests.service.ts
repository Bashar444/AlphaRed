import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApiAccessRequestDto, ReviewApiAccessRequestDto } from './dto';

@Injectable()
export class ApiAccessRequestsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateApiAccessRequestDto) {
        // Prevent duplicate pending requests
        const existingPending = await this.prisma.apiAccessRequest.findFirst({
            where: { userId, status: 'PENDING' },
        });
        if (existingPending) {
            throw new BadRequestException('You already have a pending API access request');
        }

        return this.prisma.apiAccessRequest.create({
            data: {
                userId,
                reason: dto.reason,
                useCase: dto.useCase,
            },
        });
    }

    async listMine(userId: string) {
        return this.prisma.apiAccessRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async listAll(status?: string) {
        return this.prisma.apiAccessRequest.findMany({
            where: status ? { status: status as any } : {},
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, email: true, name: true, organization: true },
                },
            },
        });
    }

    async review(id: string, reviewerId: string, dto: ReviewApiAccessRequestDto) {
        const req = await this.prisma.apiAccessRequest.findUnique({ where: { id } });
        if (!req) throw new NotFoundException('Request not found');
        if (req.status !== 'PENDING') {
            throw new BadRequestException('Request has already been reviewed');
        }

        return this.prisma.apiAccessRequest.update({
            where: { id },
            data: {
                status: dto.status,
                adminNotes: dto.adminNotes,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
            },
        });
    }
}
