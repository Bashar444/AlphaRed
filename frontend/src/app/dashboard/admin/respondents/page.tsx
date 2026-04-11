"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Ban, Search, CheckCircle } from "lucide-react";

interface Respondent {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: string;
    age: number;
    gender: string;
    location_state: string;
    location_city: string;
    created_at: string;
}

export default function AdminRespondentsPage() {
    const { user } = useAuth();
    const [respondents, setRespondents] = useState<Respondent[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadRespondents();
    }, []);

    async function loadRespondents() {
        try {
            const data = await api.admin.respondents();
            setRespondents(Array.isArray(data) ? data : []);
        } catch {
            setRespondents([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleSuspend(id: number) {
        if (!confirm("Suspend this respondent?")) return;
        try {
            await api.admin.suspendRespondent(id);
            setRespondents((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: "suspended" } : r))
            );
        } catch {
            // ignore
        }
    }

    const filtered = respondents.filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            `${r.first_name} ${r.last_name}`.toLowerCase().includes(q) ||
            r.email?.toLowerCase().includes(q) ||
            r.location_state?.toLowerCase().includes(q)
        );
    });

    const activeCount = respondents.filter((r) => r.status === "active").length;
    const suspendedCount = respondents.filter((r) => r.status === "suspended").length;

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
                <h1 className="text-2xl font-bold text-slate-900">Respondents</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Manage survey respondents across the platform
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-slate-900">{respondents.length}</p>
                        <p className="text-sm text-slate-500">Total</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
                        <p className="text-sm text-slate-500">Active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-red-600">{suspendedCount}</p>
                        <p className="text-sm text-slate-500">Suspended</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by name, email, or state..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Respondents ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">
                            No respondents found
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Name</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Email</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Age</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Gender</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">State</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                                        <th className="text-right py-3 px-2 font-medium text-slate-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="py-3 px-2 font-medium text-slate-900">
                                                {r.first_name} {r.last_name}
                                            </td>
                                            <td className="py-3 px-2 text-slate-600">{r.email}</td>
                                            <td className="py-3 px-2 text-slate-600">{r.age || "—"}</td>
                                            <td className="py-3 px-2 text-slate-600">{r.gender || "—"}</td>
                                            <td className="py-3 px-2 text-slate-600">{r.location_state || "—"}</td>
                                            <td className="py-3 px-2">
                                                <Badge variant={r.status === "active" ? "success" : "danger"}>
                                                    {r.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                {r.status === "active" ? (
                                                    <button
                                                        onClick={() => handleSuspend(r.id)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                        title="Suspend"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <CheckCircle className="w-4 h-4 text-slate-300 inline" />
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
