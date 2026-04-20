"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, AlertTriangle, CheckCircle2, ShieldAlert, Star } from "lucide-react";

type Quality = Awaited<ReturnType<typeof api.surveys.quality>>;

const BUCKET_META: Array<{ key: keyof Quality["buckets"]; label: string; color: string }> = [
    { key: "excellent", label: "Excellent (≥0.85)", color: "bg-emerald-500" },
    { key: "good", label: "Good (0.65–0.85)", color: "bg-violet-500" },
    { key: "fair", label: "Fair (0.4–0.65)", color: "bg-amber-500" },
    { key: "poor", label: "Poor (<0.4)", color: "bg-red-500" },
    { key: "unscored", label: "Unscored", color: "bg-slate-400" },
];

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "danger" | "default" }> = {
    COMPLETED: { label: "Completed", variant: "success" },
    PENDING: { label: "Pending", variant: "warning" },
    FLAGGED: { label: "Flagged", variant: "warning" },
    REJECTED: { label: "Rejected", variant: "danger" },
    DUPLICATE: { label: "Duplicate", variant: "danger" },
};

export default function SurveyQualityPage() {
    const params = useParams();
    const router = useRouter();
    const surveyId = params.id as string;
    const [data, setData] = useState<Quality | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const q = await api.surveys.quality(surveyId);
            setData(q);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load quality data");
        } finally {
            setLoading(false);
        }
    }, [surveyId]);

    useEffect(() => { load(); }, [load]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error || "No data"}
            </div>
        );
    }

    const total = data.total || 1;
    const flagEntries = Object.entries(data.flagCounts).sort((a, b) => b[1] - a[1]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 inline-flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-600" />
                            Response Quality
                        </h1>
                        <p className="text-sm text-slate-500">{data.title}</p>
                    </div>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                                <Star className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{data.avgQuality.toFixed(2)}</p>
                                <p className="text-xs text-slate-500">Avg quality score</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{data.acceptanceRate.toFixed(1)}%</p>
                                <p className="text-xs text-slate-500">Acceptance rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                <ShieldAlert className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{data.rejectionRate.toFixed(1)}%</p>
                                <p className="text-xs text-slate-500">Rejection / flag rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{data.scored}/{data.total}</p>
                                <p className="text-xs text-slate-500">Scored responses</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quality buckets */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Quality distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {BUCKET_META.map((b) => {
                            const v = data.buckets[b.key] || 0;
                            const pct = (v / total) * 100;
                            return (
                                <div key={b.key}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-slate-700">{b.label}</span>
                                        <span className="text-slate-500">{v} <span className="text-xs">({pct.toFixed(1)}%)</span></span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${b.color}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Status & flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Response status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(data.statusCounts)
                                .filter(([, v]) => v > 0)
                                .map(([k, v]) => {
                                    const meta = STATUS_LABEL[k] || { label: k, variant: "default" as const };
                                    return (
                                        <div key={k} className="flex items-center justify-between py-1">
                                            <Badge variant={meta.variant}>{meta.label}</Badge>
                                            <span className="text-sm font-medium text-slate-700">{v}</span>
                                        </div>
                                    );
                                })}
                            {Object.values(data.statusCounts).every((v) => v === 0) && (
                                <p className="text-sm text-slate-500">No responses yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base inline-flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            Quality flags
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {flagEntries.length === 0 ? (
                            <p className="text-sm text-slate-500">No flagged responses. </p>
                        ) : (
                            <div className="space-y-2">
                                {flagEntries.map(([flag, count]) => (
                                    <div key={flag} className="flex items-center justify-between py-1">
                                        <span className="text-sm text-slate-700 capitalize">{flag.replace(/[_-]/g, " ")}</span>
                                        <span className="text-sm font-medium text-slate-700">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
