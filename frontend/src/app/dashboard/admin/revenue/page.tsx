"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import {
    DollarSign,
    TrendingUp,
    Shield,
    CreditCard,
} from "lucide-react";

interface Revenue {
    monthly: Array<{ month: string; amount: number; count: number }>;
    total: number;
    thisMonth: number;
    activeSubscriptions: number;
}

export default function AdminRevenuePage() {
    const { user } = useAuth();
    const [revenue, setRevenue] = useState<Revenue | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRevenue();
    }, []);

    async function loadRevenue() {
        try {
            const data = await api.admin.revenue();
            setRevenue(data);
        } catch {
            setRevenue(null);
        } finally {
            setLoading(false);
        }
    }

    if (!user?.is_admin) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900">Access Denied</h2>
                    <p className="text-sm text-slate-500">Admin access required.</p>
                </div>
            </div>
        );
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
                <h1 className="text-2xl font-bold text-slate-900">Revenue</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Subscription revenue analytics
                </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Revenue"
                    value={`₹${(revenue?.total || 0).toLocaleString()}`}
                    icon={<DollarSign className="w-5 h-5" />}
                />
                <StatCard
                    title="This Month"
                    value={`₹${(revenue?.thisMonth || 0).toLocaleString()}`}
                    icon={<TrendingUp className="w-5 h-5" />}
                />
                <StatCard
                    title="Active Subscriptions"
                    value={revenue?.activeSubscriptions || 0}
                    icon={<CreditCard className="w-5 h-5" />}
                />
            </div>

            {/* Monthly Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    {revenue?.monthly && revenue.monthly.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Month</th>
                                        <th className="text-right py-3 px-2 font-medium text-slate-500">Transactions</th>
                                        <th className="text-right py-3 px-2 font-medium text-slate-500">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {revenue.monthly.map((m, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="py-3 px-2 font-medium text-slate-900">{m.month}</td>
                                            <td className="py-3 px-2 text-right text-slate-600">{m.count}</td>
                                            <td className="py-3 px-2 text-right font-medium text-slate-900">
                                                ₹{m.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-slate-200">
                                        <td className="py-3 px-2 font-bold text-slate-900">Total</td>
                                        <td className="py-3 px-2 text-right font-medium text-slate-600">
                                            {revenue.monthly.reduce((s, m) => s + m.count, 0)}
                                        </td>
                                        <td className="py-3 px-2 text-right font-bold text-slate-900">
                                            ₹{revenue.total.toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-8">
                            No revenue data available
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
