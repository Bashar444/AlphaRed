"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type PlanUsage } from "@/lib/api";
import { AlertTriangle, Sparkles, X } from "lucide-react";

function pct(used: number, max: number): number {
    if (!max || max <= 0) return 0;
    return Math.min(100, Math.round((used / max) * 100));
}

export function PlanUsageBanner({ compact = false }: { compact?: boolean }) {
    const [data, setData] = useState<PlanUsage | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        api.subscriptions.usage().then(setData).catch(() => setData(null));
    }, []);

    if (!data || dismissed) return null;

    const anyExceeded = data.limits.surveys.exceeded || data.limits.responses.exceeded || data.limits.questions.exceeded;
    const isFree = data.plan.slug === "free" || data.subscriptionStatus === "NONE";

    if (compact) {
        return (
            <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-lg bg-violet-50 border border-violet-100 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span><strong>{data.plan.name}</strong> · {data.usage.surveys}/{data.plan.maxSurveys} surveys · {data.usage.responses}/{data.plan.maxResponses} responses</span>
                </div>
                {isFree && <Link href="/billing/upgrade" className="text-violet-700 font-medium hover:underline">Upgrade →</Link>}
            </div>
        );
    }

    return (
        <div className={`relative rounded-xl border p-4 ${anyExceeded ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"}`}>
            <button onClick={() => setDismissed(true)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
                {anyExceeded ? <AlertTriangle className="w-5 h-5 text-amber-600" /> : <Sparkles className="w-5 h-5 text-violet-600" />}
                <h3 className="text-sm font-semibold text-slate-900">
                    {anyExceeded ? "Plan limit reached" : `Your ${data.plan.name} plan`}
                </h3>
                {isFree && (
                    <Link href="/billing/upgrade" className="ml-auto inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-violet-600 text-white font-medium hover:bg-violet-700">
                        Upgrade
                    </Link>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <UsageBar label="Surveys" used={data.limits.surveys.used} max={data.limits.surveys.max} exceeded={data.limits.surveys.exceeded} />
                <UsageBar label="Responses" used={data.limits.responses.used} max={data.limits.responses.max} exceeded={data.limits.responses.exceeded} />
                <UsageBar label="Questions/survey" used={data.limits.questions.used} max={data.limits.questions.max} exceeded={data.limits.questions.exceeded} />
            </div>
        </div>
    );
}

function UsageBar({ label, used, max, exceeded }: { label: string; used: number; max: number; exceeded: boolean }) {
    const p = pct(used, max);
    return (
        <div>
            <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600">{label}</span>
                <span className={`font-medium ${exceeded ? "text-amber-700" : "text-slate-700"}`}>{used} / {max}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all ${exceeded ? "bg-amber-500" : p > 80 ? "bg-amber-400" : "bg-violet-500"}`} style={{ width: `${p}%` }} />
            </div>
        </div>
    );
}
