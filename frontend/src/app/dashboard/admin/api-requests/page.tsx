"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    KeyRound,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
} from "lucide-react";

type Status = "PENDING" | "APPROVED" | "REJECTED";

interface Req {
    id: string;
    userId: string;
    reason: string;
    useCase: string;
    status: Status;
    adminNotes?: string | null;
    reviewedAt?: string | null;
    createdAt: string;
    user?: { id: string; email: string; name: string; organization?: string | null };
}

const TABS: { key: "" | Status; label: string; tone: string }[] = [
    { key: "", label: "All", tone: "bg-slate-100 text-slate-700" },
    { key: "PENDING", label: "Pending", tone: "bg-amber-100 text-amber-700" },
    { key: "APPROVED", label: "Approved", tone: "bg-emerald-100 text-emerald-700" },
    { key: "REJECTED", label: "Rejected", tone: "bg-red-100 text-red-700" },
];

function StatusBadge({ status }: { status: Status }) {
    if (status === "PENDING")
        return (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pending
            </Badge>
        );
    if (status === "APPROVED")
        return (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Approved
            </Badge>
        );
    return (
        <Badge className="bg-red-100 text-red-700 border-red-200 inline-flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Rejected
        </Badge>
    );
}

export default function ApiRequestsAdminPage() {
    const [filter, setFilter] = useState<"" | Status>("PENDING");
    const [items, setItems] = useState<Req[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [notesById, setNotesById] = useState<Record<string, string>>({});

    const load = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            const data = (await api.apiAccessRequests.listAll(filter || undefined)) as Req[];
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            setErr(e instanceof Error ? e.message : "Failed to load requests");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        load();
    }, [load]);

    async function handleReview(id: string, status: "APPROVED" | "REJECTED") {
        setActing(id);
        try {
            await api.apiAccessRequests.review(id, status, notesById[id]);
            await load();
        } catch (e) {
            setErr(e instanceof Error ? e.message : "Action failed");
        } finally {
            setActing(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                    <KeyRound className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">API Access Requests</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Review and approve developer requests for programmatic API access.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                {TABS.map((t) => (
                    <button
                        key={t.key || "all"}
                        onClick={() => setFilter(t.key)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === t.key
                            ? "bg-violet-600 text-white"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {err && (
                <div className="flex items-start gap-2 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{err}</span>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
                </div>
            ) : items.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-sm text-slate-500">
                        No requests found.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {items.map((r) => (
                        <Card key={r.id}>
                            <CardHeader className="flex flex-row items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-base">
                                        {r.user?.name || "Unknown user"}{" "}
                                        <span className="text-xs text-slate-400 font-normal">
                                            ({r.user?.email})
                                        </span>
                                    </CardTitle>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {r.user?.organization || "Independent"} · Submitted{" "}
                                        {new Date(r.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <StatusBadge status={r.status} />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <h4 className="text-xs uppercase font-semibold text-slate-500 mb-1">Reason</h4>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.reason}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs uppercase font-semibold text-slate-500 mb-1">Use Case</h4>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.useCase}</p>
                                </div>

                                {r.status === "PENDING" ? (
                                    <div className="pt-3 border-t border-slate-100 space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Admin notes (optional)
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={notesById[r.id] || ""}
                                                onChange={(e) =>
                                                    setNotesById((p) => ({ ...p, [r.id]: e.target.value }))
                                                }
                                                placeholder="Notes visible to the requester…"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => handleReview(r.id, "REJECTED")}
                                                disabled={acting === r.id}
                                                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-sm font-medium transition disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleReview(r.id, "APPROVED")}
                                                disabled={acting === r.id}
                                                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-50"
                                            >
                                                {acting === r.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                )}
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ) : r.adminNotes ? (
                                    <div className="pt-3 border-t border-slate-100">
                                        <h4 className="text-xs uppercase font-semibold text-slate-500 mb-1">
                                            Admin Notes
                                        </h4>
                                        <p className="text-sm text-slate-600 italic">{r.adminNotes}</p>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
