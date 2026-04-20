"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, type RespondentsAdminListResponse } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Shield,
    Ban,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    Star,
} from "lucide-react";

type Respondent = RespondentsAdminListResponse["respondents"][number];

interface Stats {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    banned: number;
    avgQualityScore: number;
}

const KYC_TABS: Array<{ key: string; label: string }> = [
    { key: "", label: "All" },
    { key: "PENDING", label: "Pending KYC" },
    { key: "OTP_VERIFIED", label: "OTP verified" },
    { key: "FULL_VERIFIED", label: "Verified" },
    { key: "REJECTED", label: "Rejected" },
];

function kycBadgeVariant(s: string): "success" | "warning" | "danger" | "info" | "default" {
    if (s === "FULL_VERIFIED") return "success";
    if (s === "OTP_VERIFIED") return "info";
    if (s === "PENDING") return "warning";
    if (s === "REJECTED" || s === "SUSPENDED") return "danger";
    return "default";
}

function statusBadgeVariant(s: string): "success" | "warning" | "danger" | "default" {
    if (s === "ACTIVE") return "success";
    if (s === "PENDING") return "warning";
    if (s === "SUSPENDED" || s === "BANNED") return "danger";
    return "default";
}

export default function AdminRespondentsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<Respondent[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [kycFilter, setKycFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [resp, st] = await Promise.all([
                api.respondentsAdmin.list({ page, limit: 25, kycStatus: kycFilter || undefined, search: search || undefined }),
                api.respondentsAdmin.stats().catch(() => null),
            ]);
            setData(resp.respondents);
            setTotalPages(resp.pagination.totalPages);
            if (st) setStats(st);
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [page, kycFilter, search]);

    useEffect(() => {
        load();
    }, [load]);

    async function handleKyc(id: string, kycStatus: string, label: string) {
        if (!confirm(`${label} this respondent?`)) return;
        setError(null);
        setBusyId(id);
        try {
            await api.respondentsAdmin.updateKyc(id, kycStatus);
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to update KYC");
        } finally {
            setBusyId(null);
        }
    }

    async function handleBan(id: string) {
        if (!confirm("Ban this respondent permanently?")) return;
        setError(null);
        setBusyId(id);
        try {
            await api.respondentsAdmin.ban(id);
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to ban");
        } finally {
            setBusyId(null);
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Respondent Panel</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Review KYC submissions, manage quality, and moderate the panel.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-slate-900">{stats?.total ?? "â€”"}</p>
                        <p className="text-xs text-slate-500 mt-1">Total respondents</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{stats?.active ?? "â€”"}</p>
                        <p className="text-xs text-slate-500 mt-1">Active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-amber-600">{stats?.pending ?? "â€”"}</p>
                        <p className="text-xs text-slate-500 mt-1">Pending</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-red-600">{(stats?.suspended ?? 0) + (stats?.banned ?? 0)}</p>
                        <p className="text-xs text-slate-500 mt-1">Suspended / Banned</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-violet-600 inline-flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {stats ? stats.avgQualityScore.toFixed(2) : "â€”"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Avg quality</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-wrap gap-2">
                {KYC_TABS.map((t) => (
                    <button
                        key={t.key || "all"}
                        onClick={() => { setKycFilter(t.key); setPage(1); }}
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${kycFilter === t.key
                                ? "bg-violet-600 text-white border-violet-600"
                                : "bg-white text-slate-700 border-slate-200 hover:border-violet-300"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-9 pr-3 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Respondents ({data.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                        </div>
                    ) : data.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">No respondents found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Name / Email</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Location</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Quality</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Responses</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">KYC</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                                        <th className="text-right py-3 px-2 font-medium text-slate-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="py-3 px-2">
                                                <div className="font-medium text-slate-900">{r.name || "â€”"}</div>
                                                <div className="text-xs text-slate-500">{r.email || "â€”"}</div>
                                            </td>
                                            <td className="py-3 px-2 text-slate-600">
                                                {[r.city, r.state, r.country].filter(Boolean).join(", ") || "â€”"}
                                            </td>
                                            <td className="py-3 px-2 text-slate-600">{r.qualityScore?.toFixed(2) ?? "â€”"}</td>
                                            <td className="py-3 px-2 text-slate-600">{r._count?.responses ?? r.totalResponses ?? 0}</td>
                                            <td className="py-3 px-2">
                                                <Badge variant={kycBadgeVariant(r.kycStatus)}>
                                                    {r.kycStatus.replace(/_/g, " ").toLowerCase()}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2">
                                                <Badge variant={statusBadgeVariant(r.status)}>
                                                    {r.status.toLowerCase()}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    {r.kycStatus !== "FULL_VERIFIED" && r.status !== "BANNED" && (
                                                        <button
                                                            onClick={() => handleKyc(r.id, "FULL_VERIFIED", "Approve KYC")}
                                                            disabled={busyId === r.id}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                                            title="Approve KYC"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {r.kycStatus !== "REJECTED" && r.status !== "BANNED" && (
                                                        <button
                                                            onClick={() => handleKyc(r.id, "REJECTED", "Reject KYC")}
                                                            disabled={busyId === r.id}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-50"
                                                            title="Reject KYC"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {r.status !== "BANNED" && (
                                                        <button
                                                            onClick={() => handleBan(r.id)}
                                                            disabled={busyId === r.id}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                            title="Ban"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {r.status === "BANNED" && (
                                                        <span className="text-xs text-red-500 inline-flex items-center gap-1 px-2">
                                                            <Clock className="w-3 h-3" /> banned
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
