"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, Users, FileText, TrendingUp, Activity } from "lucide-react";

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

export default function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const surveys = await api.surveys.list();
                const total = surveys.length;
                const active = surveys.filter(
                    (s: { status: string }) => s.status === "live"
                ).length;
                const totalResponses = surveys.reduce(
                    (sum: number, s: { response_count?: number }) =>
                        sum + (s.response_count || 0),
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
                // Fallback for demo
                setData({
                    total_surveys: 0,
                    total_responses: 0,
                    active_surveys: 0,
                    avg_quality: 0,
                    recent_surveys: [],
                });
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

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
                    Welcome back, {user?.first_name || "Researcher"}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Here&apos;s an overview of your survey analytics
                </p>
            </div>

            {/* Stat Cards */}
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
                    trend={{ direction: "up", value: "Active" }}
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

            {/* Recent Surveys */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Surveys</CardTitle>
                </CardHeader>
                <CardContent>
                    {data && data.recent_surveys.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {data.recent_surveys.map((survey) => (
                                <div
                                    key={survey.id}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {survey.title}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {survey.response_count || 0} responses
                                            </p>
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
                            <p className="text-xs text-slate-400 mt-1">
                                Create your first survey to get started
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
