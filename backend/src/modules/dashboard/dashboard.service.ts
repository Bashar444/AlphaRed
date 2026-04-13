import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    /** Admin dashboard — platform-wide stats */
    async getAdminStats() {
        const [
            totalUsers,
            activeUsers,
            totalSurveys,
            activeSurveys,
            totalResponses,
            totalLeads,
            newLeadsThisMonth,
            activeSubscriptions,
            totalRevenue,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { status: 'ACTIVE' } }),
            this.prisma.survey.count(),
            this.prisma.survey.count({ where: { status: 'ACTIVE' } }),
            this.prisma.response.count(),
            this.prisma.lead.count(),
            this.prisma.lead.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            this.prisma.invoice.aggregate({
                _sum: { amount: true },
                where: { status: 'PAID' },
            }),
        ]);

        return {
            users: { total: totalUsers, active: activeUsers },
            surveys: { total: totalSurveys, active: activeSurveys },
            responses: { total: totalResponses },
            leads: { total: totalLeads, newThisMonth: newLeadsThisMonth },
            subscriptions: { active: activeSubscriptions },
            revenue: { total: totalRevenue._sum.amount || 0 },
        };
    }

    /** User dashboard — personal stats */
    async getUserStats(userId: string) {
        const [
            totalSurveys,
            activeSurveys,
            totalResponses,
            subscription,
        ] = await Promise.all([
            this.prisma.survey.count({ where: { userId } }),
            this.prisma.survey.count({ where: { userId, status: 'ACTIVE' } }),
            this.prisma.response.count({
                where: { survey: { userId } },
            }),
            this.prisma.subscription.findUnique({
                where: { userId },
                include: { plan: { select: { name: true, maxSurveys: true, maxResponses: true } } },
            }),
        ]);

        return {
            surveys: { total: totalSurveys, active: activeSurveys },
            responses: { total: totalResponses },
            subscription: subscription
                ? {
                    plan: subscription.plan.name,
                    status: subscription.status,
                    maxSurveys: subscription.plan.maxSurveys,
                    maxResponses: subscription.plan.maxResponses,
                    surveysUsed: totalSurveys,
                    responsesUsed: totalResponses,
                }
                : null,
        };
    }

    /** Recent activity for admin dashboard */
    async getRecentActivity() {
        const [recentUsers, recentLeads, recentSurveys] = await Promise.all([
            this.prisma.user.findMany({
                select: { id: true, name: true, email: true, role: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            this.prisma.lead.findMany({
                select: { id: true, name: true, email: true, status: true, source: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            this.prisma.survey.findMany({
                select: { id: true, title: true, status: true, collectedCount: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ]);

        return { recentUsers, recentLeads, recentSurveys };
    }
}
