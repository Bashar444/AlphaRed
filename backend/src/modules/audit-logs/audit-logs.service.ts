import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogQueryDto } from './dto';

@Injectable()
export class AuditLogsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: AuditLogQueryDto) {
        const where: any = {};

        if (query.userId) where.userId = query.userId;
        if (query.entity) where.entity = query.entity;
        if (query.action) where.action = query.action;
        if (query.from || query.to) {
            where.createdAt = {};
            if (query.from) where.createdAt.gte = new Date(query.from);
            if (query.to) where.createdAt.lte = new Date(query.to);
        }

        return this.prisma.auditLog.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }

    /** Helper — called from other services to log actions */
    async log(
        userId: string,
        action: string,
        entity: string,
        entityId?: string,
        oldValues?: any,
        newValues?: any,
        ipAddress?: string,
        userAgent?: string,
    ) {
        return this.prisma.auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                oldValues: oldValues ?? undefined,
                newValues: newValues ?? undefined,
                ipAddress,
                userAgent,
            },
        });
    }
}
