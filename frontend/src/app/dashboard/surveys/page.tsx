"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { PlanUsageBanner } from "@/components/plan-usage-banner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Search,
    FileText,
    MoreVertical,
    Trash2,
    Eye,
    BarChart3,
    Copy,
    Sparkles,
} from "lucide-react";

interface Survey {
    id: string;
    title: string;
    description: string;
    status: string;
    _count?: { questions: number; responses: number };
    createdAt: string;
}

const statusColor: Record<string, "success" | "warning" | "info" | "default"> = {
    ACTIVE: "success",
    DRAFT: "default",
    PAUSED: "warning",
    COMPLETED: "info",
    ARCHIVED: "default",
};

export default function SurveysPage() {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadSurveys();
    }, []);

    async function loadSurveys() {
        try {
            const data = await api.surveys.list();
            setSurveys(Array.isArray(data) ? data as Survey[] : []);
        } catch {
            setSurveys([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        setCreating(true);
        try {
            const survey = await api.surveys.create({
                title: "Untitled Survey",
                description: "",
            });
            window.location.href = `/dashboard/surveys/${survey.id}`;
        } catch {
            setCreating(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this survey? This action cannot be undone.")) return;
        try {
            await api.surveys.delete(id as unknown as number);
            setSurveys((prev) => prev.filter((s) => s.id !== id));
        } catch {
            // ignore
        }
    }

    async function handleDuplicate(id: string) {
        try {
            const copy = await api.surveys.duplicate(id);
            window.location.href = `/dashboard/surveys/${copy.id}`;
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to duplicate");
        }
    }

    const filtered = surveys.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PlanUsageBanner />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Surveys</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage and create your surveys
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/surveys/templates">
                        <Button variant="outline">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Templates
                        </Button>
                    </Link>
                    <Button onClick={handleCreate} disabled={creating}>
                        <Plus className="w-4 h-4 mr-2" />
                        {creating ? "Creating..." : "New Survey"}
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search surveys..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
            </div>

            {/* Survey grid */}
            {filtered.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((survey) => (
                        <Card key={survey.id} className="group hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Badge variant={statusColor[survey.status] || "default"}>
                                            {survey.status.toLowerCase()}
                                        </Badge>
                                        <button
                                            onClick={() => handleDuplicate(survey.id)}
                                            title="Duplicate"
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(survey.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <Link href={`/dashboard/surveys/${survey.id}`}>
                                    <h3 className="text-sm font-semibold text-slate-900 hover:text-violet-700 transition-colors line-clamp-1">
                                        {survey.title}
                                    </h3>
                                </Link>
                                {survey.description && (
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                        {survey.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <MoreVertical className="w-3.5 h-3.5" />
                                        {survey._count?.questions || 0} questions
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Eye className="w-3.5 h-3.5" />
                                        {survey._count?.responses || 0} responses
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href={`/dashboard/surveys/${survey.id}`}
                                        className="flex-1 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href={`/dashboard/analysis?survey=${survey.id}`}
                                        className="flex-1 h-8 flex items-center justify-center rounded-lg bg-violet-50 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors"
                                    >
                                        <BarChart3 className="w-3 h-3 mr-1" /> Analyze
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-12 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {search ? "No surveys found" : "No surveys yet"}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            {search
                                ? "Try a different search term"
                                : "Create your first survey to start collecting responses"}
                        </p>
                        {!search && (
                            <Button onClick={handleCreate} disabled={creating}>
                                <Plus className="w-4 h-4 mr-2" /> Create Survey
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
