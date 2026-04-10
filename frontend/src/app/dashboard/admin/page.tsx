"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    BarChart3,
    DollarSign,
    FileText,
    Shield,
    Eye,
    EyeOff,
    Ban,
} from "lucide-react";

interface AdminDashboard {
    total_revenue: number;
    active_subscriptions: number;
    total_respondents: number;
    total_surveys: number;
    total_responses: number;
}

interface Respondent {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    age: number;
    gender: string;
    location_state: string;
}

interface Dataset {
    id: number;
    title: string;
    status: string;
    view_count: number;
    category: string;
}

export default function AdminPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<"overview" | "respondents" | "datasets">(
        "overview"
    );
    const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
    const [respondents, setRespondents] = useState<Respondent[]>([]);
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            const data = await api.admin.dashboard();
            setDashboard(data);
        } catch {
            // non-admin or API error
        } finally {
            setLoading(false);
        }
    }

    async function loadRespondents() {
        try {
            const data = await api.admin.respondents();
            setRespondents(data);
        } catch {
            setRespondents([]);
        }
    }

    async function loadDatasets() {
        try {
            const data = await api.admin.datasets();
            setDatasets(data);
        } catch {
            setDatasets([]);
        }
    }

    function switchTab(t: "overview" | "respondents" | "datasets") {
        setTab(t);
        if (t === "respondents" && respondents.length === 0) loadRespondents();
        if (t === "datasets" && datasets.length === 0) loadDatasets();
    }

    async function suspendRespondent(id: number) {
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

    async function toggleDataset(id: number, action: "publish" | "unpublish") {
        try {
            if (action === "publish") await api.admin.publishDataset(id);
            else await api.admin.unpublishDataset(id);
            setDatasets((prev) =>
                prev.map((d) =>
                    d.id === id
                        ? { ...d, status: action === "publish" ? "published" : "draft" }
                        : d
                )
            );
        } catch {
            // ignore
        }
    }

    if (!user?.is_admin) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900">Access Denied</h2>
                    <p className="text-sm text-slate-500">
                        You need admin privileges to access this page.
                    </p>
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
                <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Manage platform operations
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                {(["overview", "respondents", "datasets"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => switchTab(t)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t
                                ? "border-violet-600 text-violet-700"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {tab === "overview" && dashboard && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        title="Revenue"
                        value={`₹${(dashboard.total_revenue || 0).toLocaleString()}`}
                        icon={<DollarSign className="w-5 h-5" />}
                    />
                    <StatCard
                        title="Subscriptions"
                        value={dashboard.active_subscriptions || 0}
                        icon={<FileText className="w-5 h-5" />}
                    />
                    <StatCard
                        title="Respondents"
                        value={dashboard.total_respondents || 0}
                        icon={<Users className="w-5 h-5" />}
                    />
                    <StatCard
                        title="Surveys"
                        value={dashboard.total_surveys || 0}
                        icon={<BarChart3 className="w-5 h-5" />}
                    />
                    <StatCard
                        title="Responses"
                        value={dashboard.total_responses || 0}
                        icon={<FileText className="w-5 h-5" />}
                    />
                </div>
            )}

            {/* Respondents */}
            {tab === "respondents" && (
                <Card>
                    <CardHeader>
                        <CardTitle>All Respondents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {respondents.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-2 font-medium text-slate-500">
                                                Name
                                            </th>
                                            <th className="text-left py-3 px-2 font-medium text-slate-500">
                                                Email
                                            </th>
                                            <th className="text-left py-3 px-2 font-medium text-slate-500">
                                                Age
                                            </th>
                                            <th className="text-left py-3 px-2 font-medium text-slate-500">
                                                Gender
                                            </th>
                                            <th className="text-left py-3 px-2 font-medium text-slate-500">
                                                State
                                            </th>
                                            <th className="text-left py-3 px-2 font-medium text-slate-500">
                                                Status
                                            </th>
                                            <th className="text-right py-3 px-2 font-medium text-slate-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {respondents.map((r) => (
                                            <tr key={r.id} className="hover:bg-slate-50">
                                                <td className="py-3 px-2 font-medium text-slate-900">
                                                    {r.first_name} {r.last_name}
                                                </td>
                                                <td className="py-3 px-2 text-slate-600">{r.email}</td>
                                                <td className="py-3 px-2 text-slate-600">{r.age}</td>
                                                <td className="py-3 px-2 text-slate-600">{r.gender}</td>
                                                <td className="py-3 px-2 text-slate-600">
                                                    {r.location_state}
                                                </td>
                                                <td className="py-3 px-2">
                                                    <Badge
                                                        variant={
                                                            r.status === "active" ? "success" : "danger"
                                                        }
                                                    >
                                                        {r.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-2 text-right">
                                                    {r.status === "active" && (
                                                        <button
                                                            onClick={() => suspendRespondent(r.id)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                            title="Suspend"
                                                        >
                                                            <Ban className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-8">
                                No respondents found
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Datasets */}
            {tab === "datasets" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Public Datasets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {datasets.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {datasets.map((d) => (
                                    <div
                                        key={d.id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {d.title}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-slate-500">
                                                    {d.category}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {d.view_count} views
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    d.status === "published" ? "success" : "default"
                                                }
                                            >
                                                {d.status}
                                            </Badge>
                                            <button
                                                onClick={() =>
                                                    toggleDataset(
                                                        d.id,
                                                        d.status === "published" ? "unpublish" : "publish"
                                                    )
                                                }
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                                                title={
                                                    d.status === "published" ? "Unpublish" : "Publish"
                                                }
                                            >
                                                {d.status === "published" ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-8">
                                No datasets found
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
