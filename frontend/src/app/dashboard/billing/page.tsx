"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Receipt, ArrowUpRight, XCircle, Loader2, Download } from "lucide-react";

interface SubscriptionInfo {
    id?: string;
    status?: string;
    billingCycle?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    plan?: { id: string; name: string; priceUsd: number; priceInr: number };
}

interface Invoice {
    id: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    status: string;
    issuedAt: string;
    pdfUrl?: string | null;
}

export default function BillingPage() {
    const [sub, setSub] = useState<SubscriptionInfo | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        try {
            const [s, inv] = await Promise.all([
                api.subscriptions.me().catch(() => null),
                api.payments.myInvoices().catch(() => []),
            ]);
            setSub(s as SubscriptionInfo | null);
            setInvoices(Array.isArray(inv) ? (inv as Invoice[]) : []);
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel() {
        if (!confirm("Cancel your subscription at the end of the current period?")) return;
        setCancelling(true);
        try {
            await api.subscriptions.cancel();
            await load();
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Cancel failed");
        } finally {
            setCancelling(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading billing...
            </div>
        );
    }

    const hasActive = sub && sub.status && sub.status !== "CANCELLED";

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-violet-600" /> Billing & Subscription
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your plan and view past invoices</p>
                </div>
                <Link href="/billing/upgrade" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700">
                    <ArrowUpRight className="w-4 h-4" /> {hasActive ? "Change plan" : "Upgrade"}
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current plan</CardTitle>
                </CardHeader>
                <CardContent>
                    {!hasActive ? (
                        <div className="text-sm text-slate-500">
                            You don&apos;t have an active subscription. <Link href="/billing/upgrade" className="text-violet-600 hover:underline">Choose a plan</Link>.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-bold text-slate-900">{sub?.plan?.name || "Plan"}</span>
                                <Badge className={sub?.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>{sub?.status}</Badge>
                                {sub?.cancelAtPeriodEnd && <Badge className="bg-rose-100 text-rose-700">Cancels at period end</Badge>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-xs text-slate-500">Billing cycle</div>
                                    <div className="font-medium text-slate-700">{sub?.billingCycle || "-"}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Current period start</div>
                                    <div className="font-medium text-slate-700">{sub?.currentPeriodStart ? new Date(sub.currentPeriodStart).toLocaleDateString() : "-"}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Renews / ends</div>
                                    <div className="font-medium text-slate-700">{sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "-"}</div>
                                </div>
                            </div>
                            {!sub?.cancelAtPeriodEnd && (
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-rose-300 text-rose-700 rounded-lg hover:bg-rose-50 disabled:opacity-50"
                                >
                                    <XCircle className="w-4 h-4" /> {cancelling ? "Cancelling..." : "Cancel subscription"}
                                </button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5" /> Invoice history</CardTitle>
                </CardHeader>
                <CardContent>
                    {invoices.length === 0 ? (
                        <div className="text-sm text-slate-500 py-8 text-center">No invoices yet</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs uppercase text-slate-500 border-b">
                                    <tr>
                                        <th className="py-2 px-3">Invoice #</th>
                                        <th className="py-2 px-3">Date</th>
                                        <th className="py-2 px-3">Amount</th>
                                        <th className="py-2 px-3">Status</th>
                                        <th className="py-2 px-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50">
                                            <td className="py-2 px-3 font-mono text-xs">{inv.invoiceNumber}</td>
                                            <td className="py-2 px-3">{new Date(inv.issuedAt).toLocaleDateString()}</td>
                                            <td className="py-2 px-3 font-semibold">{inv.currency} {inv.amount.toFixed(2)}</td>
                                            <td className="py-2 px-3">
                                                <Badge className={inv.status === "PAID" ? "bg-green-100 text-green-700" : inv.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}>{inv.status}</Badge>
                                            </td>
                                            <td className="py-2 px-3">
                                                {inv.pdfUrl && (
                                                    <a href={inv.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline">
                                                        <Download className="w-3 h-3" /> PDF
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
