"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Wallet, ArrowUpRight } from "lucide-react";

interface EarningsData {
    incentiveBalance: number;
    totalEarned: number;
    totalPaidOut: number;
    pendingPayouts: number;
}

export default function RespondentEarningsPage() {
    const [data, setData] = useState<EarningsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.respondent
            .earnings()
            .then((res) => setData(res))
            .catch(() => setData(null))
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
                <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Track your survey incentives and payouts
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Available Balance"
                    value={`₹${(data?.incentiveBalance || 0).toLocaleString()}`}
                    icon={<Wallet className="w-5 h-5" />}
                    subtitle="Ready for payout"
                />
                <StatCard
                    title="Total Earned"
                    value={`₹${(data?.totalEarned || 0).toLocaleString()}`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    subtitle="All time"
                />
                <StatCard
                    title="Total Paid Out"
                    value={`₹${(data?.totalPaidOut || 0).toLocaleString()}`}
                    icon={<DollarSign className="w-5 h-5" />}
                    subtitle="Withdrawn"
                />
                <StatCard
                    title="Pending"
                    value={`₹${(data?.pendingPayouts || 0).toLocaleString()}`}
                    icon={<ArrowUpRight className="w-5 h-5" />}
                    subtitle="In process"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>How Earnings Work</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm text-slate-600">
                        <p>
                            <strong className="text-slate-900">Complete surveys</strong> — Each survey
                            has an incentive amount set by the researcher. You earn when your response is
                            accepted.
                        </p>
                        <p>
                            <strong className="text-slate-900">Quality matters</strong> — Responses
                            flagged for low quality may be rejected. Maintain a high quality score to keep
                            receiving survey invitations.
                        </p>
                        <p>
                            <strong className="text-slate-900">Request payouts</strong> — Once your
                            balance reaches the minimum threshold, you can request a payout from the
                            Payouts page.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
