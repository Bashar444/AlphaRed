"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, type SurveyTemplateListItem } from "@/lib/api";
import {
    TrendingUp,
    Smile,
    Users,
    MessageSquare,
    BarChart3,
    Calendar,
    GraduationCap,
    Globe,
    FileText,
    Clock,
    ArrowLeft,
    Sparkles,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    TrendingUp,
    Smile,
    Users,
    MessageSquare,
    BarChart3,
    Calendar,
    GraduationCap,
    Globe,
    FileText,
};

export default function TemplatesPage() {
    const router = useRouter();
    const [items, setItems] = useState<SurveyTemplateListItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [creatingId, setCreatingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        load();
    }, [activeCategory]);

    async function load() {
        setLoading(true);
        try {
            const [list, cats] = await Promise.all([
                api.templates.list(activeCategory || undefined),
                api.templates.categories(),
            ]);
            setItems(list);
            setCategories(cats);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleUse(id: string) {
        setError(null);
        setCreatingId(id);
        try {
            const created = await api.templates.use(id);
            router.push(`/dashboard/surveys/${created.id}`);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to create survey from template";
            setError(msg);
            setCreatingId(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/dashboard/surveys"
                        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to surveys
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-violet-600" />
                        Survey Templates
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Start with a proven template and customize it for your audience.
                    </p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveCategory("")}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        activeCategory === ""
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-slate-700 border-slate-200 hover:border-violet-300"
                    }`}
                >
                    All
                </button>
                {categories.map((c) => (
                    <button
                        key={c}
                        onClick={() => setActiveCategory(c)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                            activeCategory === c
                                ? "bg-violet-600 text-white border-violet-600"
                                : "bg-white text-slate-700 border-slate-200 hover:border-violet-300"
                        }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                    No templates in this category.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((tpl) => {
                        const Icon = ICONS[tpl.icon] || FileText;
                        return (
                            <div
                                key={tpl.id}
                                className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-violet-300 hover:shadow-md transition flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-100">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                        {tpl.category}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1">{tpl.title}</h3>
                                <p className="text-sm text-slate-500 flex-1 mb-3">{tpl.description}</p>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                                    <span className="inline-flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5" /> {tpl.questionCount} questions
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" /> ~{tpl.estimatedMinutes} min
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleUse(tpl.id)}
                                    disabled={creatingId === tpl.id}
                                    className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
                                >
                                    {creatingId === tpl.id ? "Creating..." : "Use template"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
