"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Loader2, Wallet } from "lucide-react";

interface Payout {
    id: string;
    amount: number;
    method: string;
    status: string;
    processedAt: string | null;
    createdAt: string;
}

export default function RespondentPayoutsPage() {
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("upi");

    useEffect(() => {
        api.respondent
            .payouts()
            .then((data) => setPayouts(Array.isArray(data) ? data : []))
            .catch(() => setPayouts([]))
            .finally(() => setLoading(false));
    }, []);

    async function handleRequest() {
        if (!amount || Number(amount) <= 0) return;
        setRequesting(true);
        try {
            const payout = await api.respondent.requestPayout({
                amount: Number(amount),
                method,
            });
            setPayouts((prev) => [payout, ...prev]);
            setAmount("");
        } catch {
            // handle error
        } finally {
            setRequesting(false);
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
                <h1 className="text-2xl font-bold text-slate-900">Payouts</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Request and track your payout history
                </p>
            </div>

            {/* Request Payout */}
            <Card>
                <CardHeader>
                    <CardTitle>Request Payout</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Amount (₹)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div className="w-48">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Method
                            </label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                                <option value="upi">UPI</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="paytm">Paytm</option>
                            </select>
                        </div>
                        <div className="pt-6">
                            <Button onClick={handleRequest} disabled={requesting || !amount}>
                                {requesting ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Wallet className="w-4 h-4 mr-2" />
                                )}
                                Request
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payout History */}
            <Card>
                <CardHeader>
                    <CardTitle>Payout History</CardTitle>
                </CardHeader>
                <CardContent>
                    {payouts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-3 font-medium text-slate-500">Amount</th>
                                        <th className="text-left py-3 px-3 font-medium text-slate-500">Method</th>
                                        <th className="text-left py-3 px-3 font-medium text-slate-500">Status</th>
                                        <th className="text-left py-3 px-3 font-medium text-slate-500">Requested</th>
                                        <th className="text-left py-3 px-3 font-medium text-slate-500">Processed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payouts.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="py-3 px-3 font-medium text-slate-900">
                                                ₹{p.amount.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-3 text-slate-600 uppercase text-xs">
                                                {p.method}
                                            </td>
                                            <td className="py-3 px-3">
                                                <Badge
                                                    variant={
                                                        p.status === "completed"
                                                            ? "success"
                                                            : p.status === "pending"
                                                                ? "warning"
                                                                : "default"
                                                    }
                                                >
                                                    {p.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-3 text-slate-500">
                                                {new Date(p.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-3 text-slate-500">
                                                {p.processedAt
                                                    ? new Date(p.processedAt).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">No payout history</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
