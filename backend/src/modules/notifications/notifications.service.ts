import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async findByUser(userId: string, unreadOnly = false) {
        const where: any = { userId };
        if (unreadOnly) where.read = false;

        return this.prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async unreadCount(userId: string) {
        return this.prisma.notification.count({
            where: { userId, read: false },
        });
    }

    async markAsRead(id: string, userId: string) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) throw new NotFoundException('Notification not found');

        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }

    async markAllRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }

    async create(dto: CreateNotificationDto) {
        return this.prisma.notification.create({
            data: {
                userId: dto.userId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                data: dto.data ?? undefined,
            },
        });
    }

    /** Helper to send notification from other services */
    async notify(userId: string, type: string, title: string, message: string, data?: any) {
        return this.create({ userId, type, title, message, data });
    }

    async delete(id: string, userId: string) {
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) throw new NotFoundException('Notification not found');

        return this.prisma.notification.delete({ where: { id } });
    }
}
