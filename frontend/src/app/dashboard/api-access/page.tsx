"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, KeyRound, Send, Clock, CheckCircle2, XCircle } from "lucide-react";

interface MyRequest {
    id: string;
    reason: string;
    useCase: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    adminNotes?: string | null;
    reviewedAt?: string | null;
    createdAt: string;
}

function StatusBadge({ status }: { status: MyRequest["status"] }) {
    if (status === "PENDING")
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
    if (status === "APPROVED")
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>;
    return <Badge className="bg-red-100 text-red-700 border-red-200 inline-flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
}

export default function ApiAccessPage() {
    const [items, setItems] = useState<MyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [reason, setReason] = useState("");
    const [useCase, setUseCase] = useState("");

    async function load() {
        try {
            const data = (await api.apiAccessRequests.listMine()) as MyRequest[];
            setItems(Array.isArray(data) ? data : []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!reason.trim() || !useCase.trim()) return;
        setSubmitting(true);
        try {
            await api.apiAccessRequests.create(reason.trim(), useCase.trim());
            setReason("");
            setUseCase("");
            await load();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to submit");
        } finally {
            setSubmitting(false);
        }
    }

    const hasPending = items.some((i) => i.status === "PENDING");

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                    <KeyRound className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">API Access</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Request programmatic access to the PrimoData API. Approved users get an API key.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>Submit a request</CardTitle></CardHeader>
                <CardContent>
                    {hasPending && (
                        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                            You already have a pending request — please wait for review before submitting another.
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Why do you need API access?</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                placeholder="e.g. Integrate survey data into our internal BI dashboard"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Describe your use case</label>
                            <textarea
                                value={useCase}
                                onChange={(e) => setUseCase(e.target.value)}
                                rows={4}
                                placeholder="Endpoints needed, expected request volume, data handling..."
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={submitting || hasPending}>
                            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            Submit Request
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>My requests</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                        </div>
                    ) : items.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">No requests yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {items.map((r) => (
                                <div key={r.id} className="rounded-lg border border-slate-200 p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="text-xs text-slate-400">
                                            Submitted {new Date(r.createdAt).toLocaleString()}
                                        </p>
                                        <StatusBadge status={r.status} />
                                    </div>
                                    <p className="text-sm text-slate-700 mb-2"><span className="font-medium">Reason:</span> {r.reason}</p>
                                    <p className="text-sm text-slate-700"><span className="font-medium">Use case:</span> {r.useCase}</p>
                                    {r.adminNotes && (
                                        <div className="mt-3 pt-3 border-t border-slate-100">
                                            <p className="text-xs uppercase font-semibold text-slate-500 mb-1">Admin notes</p>
                                            <p className="text-sm text-slate-600 italic">{r.adminNotes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
