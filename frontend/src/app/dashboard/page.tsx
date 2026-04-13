"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChartWidget } from "@/components/charts/line-chart-widget";
import { BarChartWidget } from "@/components/charts/bar-chart-widget";
import { PieChartWidget } from "@/components/charts/pie-chart-widget";
import {
    BarChart3,
    Users,
    FileText,
    TrendingUp,
    Activity,
    DollarSign,
    CreditCard,
    FolderKanban,
    Clock,
} from "lucide-react";

interface DashboardData {
    total_surveys: number;
    total_responses: number;
    active_surveys: number;
    avg_quality: number;
    recent_surveys: Array<{
        id: number;
        title: string;
        status: string;
        response_count: number;
        created_at: string;
    }>;
}

interface AdminStats {
    team_members: number;
    clients: number;
    projects: number;
    tasks: number;
    open_tickets: number;
    invoice_total: number;
    invoice_due: number;
    expense_total: number;
    active_subscriptions: number;
}

interface ActivityItem {
    id: number;
    type: string;
    description: string;
    user_name: string;
    created_at: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const isAdmin = user?.is_admin;

    const [data, setData] = useState<DashboardData | null>(null);
    const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
    const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
    const [responsesTimeline, setResponsesTimeline] = useState<Array<Record<string, unknown>>>([]);
    const [revenueTrend, setRevenueTrend] = useState<Array<Record<string, unknown>>>([]);
    const [qualityDist, setQualityDist] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
    const [taskStatus, setTaskStatus] = useState<Array<Record<string, unknown>>>([]);
    const [loading, setLoading] = useState(true);
    const [chartsLoading, setChartsLoading] = useState(true);

    useEffect(() => {
        loadBasicData();
        if (isAdmin) {
            loadAdminData();
        }
    }, [isAdmin]);

    async function loadBasicData() {
        try {
            const surveys = await api.surveys.list();
            const total = surveys.length;
            const active = surveys.filter((s: { status: string }) => s.status === "live").length;
            const totalResponses = surveys.reduce(
                (sum: number, s: { response_count?: number }) => sum + (s.response_count || 0),
                0
            );
            setData({
                total_surveys: total,
                total_responses: totalResponses,
                active_surveys: active,
                avg_quality: 0,
                recent_surveys: surveys.slice(0, 5),
            });
        } catch {
            setData({ total_surveys: 0, total_responses: 0, active_surveys: 0, avg_quality: 0, recent_surveys: [] });
        } finally {
            setLoading(false);
        }
    }

    async function loadAdminData() {
        try {
            const [stats, timeline, revenue, quality, tasks, activity] = await Promise.all([
                api.admin.stats().catch(() => null),
                api.admin.charts("responses_timeline").catch(() => []),
                api.admin.charts("revenue_trend").catch(() => []),
                api.admin.charts("quality_distribution").catch(() => []),
                api.admin.charts("task_status").catch(() => []),
                api.admin.activity().catch(() => []),
            ]);

            if (stats) setAdminStats(stats);
            setResponsesTimeline(timeline || []);
            setRevenueTrend(revenue || []);
            if (quality && Array.isArray(quality)) {
                setQualityDist({
                    labels: quality.map((q: { bracket: string }) => q.bracket),
                    values: quality.map((q: { count: number }) => q.count),
                });
            }
            setTaskStatus(tasks || []);
            setActivityFeed(activity || []);
        } catch {
            // admin data optional
        } finally {
            setChartsLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Welcome back, {user?.name || "Researcher"}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Here&apos;s an overview of your platform analytics
                </p>
            </div>

            {/* Primary Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Surveys"
                    value={data?.total_surveys ?? 0}
                    icon={<BarChart3 className="w-5 h-5" />}
                    subtitle="All time"
                />
                <StatCard
                    title="Active Surveys"
                    value={data?.active_surveys ?? 0}
                    icon={<Activity className="w-5 h-5" />}
                    subtitle="Currently live"
                    trend={{ value: "Active", positive: true }}
                />
                <StatCard
                    title="Total Responses"
                    value={data?.total_responses ?? 0}
                    icon={<Users className="w-5 h-5" />}
                    subtitle="All surveys"
                />
                <StatCard
                    title="Avg. Quality"
                    value={data?.avg_quality ? `${data.avg_quality}%` : "N/A"}
                    icon={<TrendingUp className="w-5 h-5" />}
                    subtitle="Quality score"
                />
            </div>

            {/* Admin Extended Stats */}
            {isAdmin && adminStats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard
                        title="Revenue"
                        value={`₹${(adminStats.invoice_total || 0).toLocaleString()}`}
                        icon={<DollarSign className="w-5 h-5" />}
                        subtitle="Total invoiced"
                    />
                    <StatCard
                        title="Active Subs"
                        value={adminStats.active_subscriptions}
                        icon={<CreditCard className="w-5 h-5" />}
                        subtitle="Subscriptions"
                    />
                    <StatCard
                        title="Projects"
                        value={adminStats.projects}
                        icon={<FolderKanban className="w-5 h-5" />}
                        subtitle="All projects"
                    />
                    <StatCard
                        title="Team"
                        value={adminStats.team_members}
                        icon={<Users className="w-5 h-5" />}
                        subtitle="Staff members"
                    />
                    <StatCard
                        title="Open Tickets"
                        value={adminStats.open_tickets}
                        icon={<Clock className="w-5 h-5" />}
                        subtitle="Pending"
                    />
                </div>
            )}

            {/* Charts — Admin Only */}
            {isAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LineChartWidget
                        title="Responses Over Time (30 days)"
                        data={responsesTimeline}
                        xKey="date"
                        yKey="count"
                        loading={chartsLoading}
                    />
                    <PieChartWidget
                        title="Quality Score Distribution"
                        labels={qualityDist.labels}
                        values={qualityDist.values}
                        loading={chartsLoading}
                    />
                    <BarChartWidget
                        title="Tasks by Status"
                        data={taskStatus}
                        xKey="status"
                        yKey="count"
                        color="#06b6d4"
                        loading={chartsLoading}
                    />
                    <LineChartWidget
                        title="Revenue Trend (12 months)"
                        data={revenueTrend}
                        xKey="month"
                        yKey="total"
                        color="#10b981"
                        loading={chartsLoading}
                    />
                </div>
            )}

            {/* Bottom Row: Recent Surveys + Activity Feed */}
            <div className={`grid grid-cols-1 ${isAdmin ? "lg:grid-cols-2" : ""} gap-6`}>
                {/* Recent Surveys */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Surveys</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data && data.recent_surveys.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {data.recent_surveys.map((survey) => (
                                    <div key={survey.id} className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{survey.title}</p>
                                                <p className="text-xs text-slate-500">{survey.response_count || 0} responses</p>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${survey.status === "live"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : survey.status === "draft"
                                                    ? "bg-slate-100 text-slate-600"
                                                    : "bg-amber-50 text-amber-700"
                                                }`}
                                        >
                                            {survey.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No surveys yet</p>
                                <p className="text-xs text-slate-400 mt-1">Create your first survey to get started</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Activity Feed — Admin Only */}
                {isAdmin && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activityFeed.length > 0 ? (
                                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                                    {activityFeed.map((item) => (
                                        <div key={item.id} className="py-3 flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                <Activity className="w-3.5 h-3.5 text-slate-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm text-slate-700 truncate">
                                                    {item.description || item.type}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {item.user_name && `${item.user_name} · `}
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm text-slate-500">No recent activity</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
