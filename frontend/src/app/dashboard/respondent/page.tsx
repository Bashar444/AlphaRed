"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { respondent as respondentApi } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
    ClipboardList,
    DollarSign,
    FileText,
    Star,
    TrendingUp,
    Wallet,
} from "lucide-react";

interface RespondentProfile {
    id: string;
    name: string;
    email: string;
    qualityScore: number;
    totalResponses: number;
    acceptedCount: number;
    rejectedCount: number;
    incentiveBalance: number;
    status: string;
}

interface AvailableSurvey {
    id: string;
    title: string;
    description: string | null;
    estimatedMinutes: number | null;
    _count: { questions: number; responses: number };
    user: { name: string; organization: string | null };
}

export default function RespondentDashboardPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<RespondentProfile | null>(null);
    const [surveys, setSurveys] = useState<AvailableSurvey[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            respondentApi.profile().catch(() => null),
            respondentApi.availableSurveys({ limit: "5" }).catch(() => ({ surveys: [] })),
        ])
            .then(([p, surveyData]) => {
                setProfile(p as RespondentProfile | null);
                const d = surveyData as { surveys: AvailableSurvey[] };
                setSurveys(Array.isArray(d?.surveys) ? d.surveys : []);
            })
            .finally(() => setLoading(false));
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
                    Welcome, {user?.name || "Respondent"}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Your respondent dashboard overview
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Quality Score"
                    value={profile?.qualityScore?.toFixed(1) || "N/A"}
                    icon={<Star className="w-5 h-5" />}
                    subtitle="Your rating"
                />
                <StatCard
                    title="Total Responses"
                    value={profile?.totalResponses || 0}
                    icon={<FileText className="w-5 h-5" />}
                    subtitle="Surveys completed"
                />
                <StatCard
                    title="Accepted"
                    value={profile?.acceptedCount || 0}
                    icon={<TrendingUp className="w-5 h-5" />}
                    subtitle="Quality responses"
                />
                <StatCard
                    title="Balance"
                    value={`₹${(profile?.incentiveBalance || 0).toLocaleString()}`}
                    icon={<Wallet className="w-5 h-5" />}
                    subtitle="Available for payout"
                />
            </div>

            {/* Recent Available Surveys */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Available Surveys</span>
                        <Link
                            href="/dashboard/respondent/surveys"
                            className="text-sm font-normal text-emerald-600 hover:text-emerald-700"
                        >
                            View all →
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {surveys.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {surveys.map((s) => (
                                <div key={s.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <ClipboardList className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {s.title}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {s._count.questions} questions · ~{s.estimatedMinutes || 5} min
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/dashboard/respondent/take/${s.id}`}
                                        className="text-xs text-emerald-600 hover:underline font-medium"
                                    >
                                        Take Survey →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">No surveys available yet</p>
                            <p className="text-xs text-slate-400 mt-1">
                                When researchers launch surveys, they will appear here
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-4">
                <Link href="/dashboard/respondent/surveys">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-5 text-center">
                            <ClipboardList className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                            <h3 className="text-sm font-semibold text-slate-900">Available Surveys</h3>
                            <p className="text-xs text-slate-500 mt-1">Browse and take surveys</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/dashboard/respondent/earnings">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-5 text-center">
                            <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                            <h3 className="text-sm font-semibold text-slate-900">My Earnings</h3>
                            <p className="text-xs text-slate-500 mt-1">Track your incentives</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/dashboard/respondent/payouts">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-5 text-center">
                            <Wallet className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                            <h3 className="text-sm font-semibold text-slate-900">Request Payout</h3>
                            <p className="text-xs text-slate-500 mt-1">Withdraw your balance</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
