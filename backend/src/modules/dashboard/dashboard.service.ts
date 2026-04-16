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

    /** Chart data for admin dashboard widgets */
    async getChartData(type: string) {
        switch (type) {
            case 'responses_timeline': {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const responses = await this.prisma.response.findMany({
                    where: { createdAt: { gte: thirtyDaysAgo } },
                    select: { createdAt: true },
                    orderBy: { createdAt: 'asc' },
                });
                const grouped: Record<string, number> = {};
                for (const r of responses) {
                    const date = r.createdAt.toISOString().split('T')[0];
                    grouped[date] = (grouped[date] || 0) + 1;
                }
                return Object.entries(grouped).map(([date, count]) => ({ date, count }));
            }
            case 'revenue_trend': {
                const invoices = await this.prisma.invoice.findMany({
                    where: { status: 'PAID' },
                    select: { amount: true, paidAt: true, createdAt: true },
                    orderBy: { createdAt: 'asc' },
                });
                const grouped: Record<string, number> = {};
                for (const inv of invoices) {
                    const d = (inv.paidAt || inv.createdAt);
                    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    grouped[month] = (grouped[month] || 0) + Number(inv.amount || 0);
                }
                return Object.entries(grouped).map(([month, total]) => ({ month, total }));
            }
            case 'quality_distribution': {
                const responses = await this.prisma.response.findMany({
                    select: { qualityScore: true },
                    where: { qualityScore: { not: null } },
                });
                const brackets = ['0-20', '21-40', '41-60', '61-80', '81-100'];
                const counts = [0, 0, 0, 0, 0];
                for (const r of responses) {
                    const score = Number(r.qualityScore || 0);
                    if (score <= 20) counts[0]++;
                    else if (score <= 40) counts[1]++;
                    else if (score <= 60) counts[2]++;
                    else if (score <= 80) counts[3]++;
                    else counts[4]++;
                }
                return brackets.map((bracket, i) => ({ bracket, count: counts[i] }));
            }
            case 'survey_status': {
                const surveys = await this.prisma.survey.groupBy({
                    by: ['status'],
                    _count: { id: true },
                });
                return surveys.map(s => ({ status: s.status, count: s._count.id }));
            }
            case 'task_status':
                // Tasks are not yet in Prisma schema — return placeholder
                return [];
            default:
                return [];
        }
    }
}
