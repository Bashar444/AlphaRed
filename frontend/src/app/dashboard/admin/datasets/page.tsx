"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Database,
    Shield,
    Eye,
    EyeOff,
    Search,
} from "lucide-react";

interface Dataset {
    id: string;
    title: string;
    status: string;
    viewCount: number;
    category: string;
    createdAt: string;
}

export default function AdminDatasetsPage() {
    const { user } = useAuth();
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadDatasets();
    }, []);

    async function loadDatasets() {
        try {
            const data = await api.admin.datasets();
            setDatasets(Array.isArray(data) ? data : []);
        } catch {
            setDatasets([]);
        } finally {
            setLoading(false);
        }
    }

    async function toggleDataset(id: string, action: "publish" | "unpublish") {
        try {
            if (action === "publish") await api.admin.publishDataset(id as unknown as number);
            else await api.admin.unpublishDataset(id as unknown as number);
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

    const filtered = datasets.filter((d) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            d.title?.toLowerCase().includes(q) ||
            d.category?.toLowerCase().includes(q)
        );
    });

    const publishedCount = datasets.filter((d) => d.status === "published").length;
    const draftCount = datasets.filter((d) => d.status !== "published").length;

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
                <h1 className="text-2xl font-bold text-slate-900">Datasets</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Manage public datasets — publish or unpublish survey data
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-slate-900">{datasets.length}</p>
                        <p className="text-sm text-slate-500">Total</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{publishedCount}</p>
                        <p className="text-sm text-slate-500">Published</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-amber-600">{draftCount}</p>
                        <p className="text-sm text-slate-500">Draft</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by title or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
            </div>

            {/* Datasets Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Datasets ({filtered.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">
                            No datasets found
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Title</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Category</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Views</th>
                                        <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                                        <th className="text-right py-3 px-2 font-medium text-slate-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((d) => (
                                        <tr key={d.id} className="hover:bg-slate-50">
                                            <td className="py-3 px-2 font-medium text-slate-900">{d.title}</td>
                                            <td className="py-3 px-2 text-slate-600">{d.category || "—"}</td>
                                            <td className="py-3 px-2 text-slate-600">{d.viewCount}</td>
                                            <td className="py-3 px-2">
                                                <Badge variant={d.status === "published" ? "success" : "default"}>
                                                    {d.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                <button
                                                    onClick={() =>
                                                        toggleDataset(
                                                            d.id,
                                                            d.status === "published" ? "unpublish" : "publish"
                                                        )
                                                    }
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                                                    title={d.status === "published" ? "Unpublish" : "Publish"}
                                                >
                                                    {d.status === "published" ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
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
