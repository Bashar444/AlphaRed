"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    UserCog,
    Shield,
    Search,
    ChevronLeft,
    ChevronRight,
    Ban,
    CheckCircle,
} from "lucide-react";

interface UserRow {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    user_type: string;
    status: string;
    created_at: string;
    last_online: string;
}

interface Summary {
    total: number;
    staff: number;
    clients: number;
    respondents: number;
    subscribed: number;
    suspended: number;
}

interface Pagination {
    total: number;
    page: number;
    per_page: number;
    pages: number;
}

const TYPE_TABS = [
    { key: "", label: "All" },
    { key: "staff", label: "Staff" },
    { key: "client", label: "Clients" },
    { key: "respondent", label: "Respondents" },
];

export default function AdminUsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserRow[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, per_page: 25, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const loadUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params: Record<string, string> = { page: String(page), per_page: "25" };
            if (typeFilter) params.type = typeFilter;
            if (statusFilter) params.status = statusFilter;
            if (search) params.search = search;
            const data = await api.adminUsers.list(params);
            setUsers(data.users || []);
            setSummary(data.summary || null);
            setPagination(data.pagination || { total: 0, page: 1, per_page: 25, pages: 0 });
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [typeFilter, statusFilter, search]);

    useEffect(() => {
        loadUsers(1);
    }, [loadUsers]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setSearch(searchInput);
    }

    async function handleSuspend(id: number) {
        if (!confirm("Suspend this user?")) return;
        await api.adminUsers.suspend(id);
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "inactive" } : u)));
    }

    async function handleActivate(id: number) {
        await api.adminUsers.activate(id);
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "active" } : u)));
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
                <h1 className="text-2xl font-bold text-slate-900">Users & Clients</h1>
                <p className="text-sm text-slate-500 mt-1">Manage all platform users</p>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard title="Total" value={summary.total} icon={<Users className="w-5 h-5" />} />
                    <StatCard title="Staff" value={summary.staff} icon={<UserCog className="w-5 h-5" />} />
                    <StatCard title="Clients" value={summary.clients} icon={<Users className="w-5 h-5" />} />
                    <StatCard title="Respondents" value={summary.respondents} icon={<Users className="w-5 h-5" />} />
                    <StatCard title="Subscribed" value={summary.subscribed} icon={<CheckCircle className="w-5 h-5" />} />
                    <StatCard title="Suspended" value={summary.suspended} icon={<Ban className="w-5 h-5" />} />
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Type Tabs */}
                        <div className="flex gap-1">
                            {TYPE_TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setTypeFilter(tab.key)}
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${typeFilter === tab.key
                                            ? "bg-violet-100 text-violet-700 font-medium"
                                            : "text-slate-500 hover:bg-slate-100"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                            <span className="border-l border-slate-200 mx-2" />
                            <button
                                onClick={() => setStatusFilter(statusFilter === "suspended" ? "" : "suspended")}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${statusFilter === "suspended"
                                        ? "bg-red-100 text-red-700 font-medium"
                                        : "text-slate-500 hover:bg-slate-100"
                                    }`}
                            >
                                Suspended
                            </button>
                        </div>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search name or email..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Users ({pagination.total})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 text-sm text-slate-500">No users found</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-2 font-medium text-slate-500">Name</th>
                                            <th className="text-left py-3 px-2 font-medium text-slate-500">Email / Phone</th>
                                            <th className="text-left py-3 px-2 font-medium text-slate-500">Type</th>
                                            <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                                            <th className="text-left py-3 px-2 font-medium text-slate-500">Joined</th>
                                            <th className="text-right py-3 px-2 font-medium text-slate-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50">
                                                <td className="py-3 px-2 font-medium text-slate-900">
                                                    {u.first_name} {u.last_name}
                                                </td>
                                                <td className="py-3 px-2 text-slate-600">
                                                    {u.email || u.phone || "—"}
                                                </td>
                                                <td className="py-3 px-2">
                                                    <Badge variant="default">
                                                        {u.user_type}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <Badge variant={u.status === "active" ? "success" : "danger"}>
                                                        {u.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-2 text-slate-500">
                                                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                                                </td>
                                                <td className="py-3 px-2 text-right">
                                                    {u.status === "active" || u.status === "inactive" ? (
                                                        u.status === "active" ? (
                                                            <button
                                                                onClick={() => handleSuspend(u.id)}
                                                                className="text-xs text-red-600 hover:underline"
                                                                title="Suspend"
                                                            >
                                                                <Ban className="w-4 h-4 inline" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleActivate(u.id)}
                                                                className="text-xs text-emerald-600 hover:underline"
                                                                title="Activate"
                                                            >
                                                                <CheckCircle className="w-4 h-4 inline" />
                                                            </button>
                                                        )
                                                    ) : null}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-sm text-slate-500">
                                        Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => loadUsers(pagination.page - 1)}
                                            disabled={pagination.page <= 1}
                                            className="p-2 rounded-md border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => loadUsers(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.pages}
                                            className="p-2 rounded-md border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
