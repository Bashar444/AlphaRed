"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
    Shield,
    Plus,
    FileText,
    Trash2,
    ExternalLink,
    Pencil,
} from "lucide-react";

interface CmsPage {
    id: number;
    title: string;
    slug: string;
    status: string;
    full_width: number;
    created_at: string;
}

export default function CmsPagesListPage() {
    const { user } = useAuth();
    const [pages, setPages] = useState<CmsPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadPages();
    }, []);

    async function loadPages() {
        try {
            const data = await api.adminCms.pages();
            setPages(Array.isArray(data) ? data : []);
        } catch {
            setPages([]);
        } finally {
            setLoading(false);
        }
    }

    function slugify(text: string) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setCreating(true);
        try {
            await api.adminCms.createPage({
                title: newTitle.trim(),
                slug: newSlug || slugify(newTitle),
                status: "draft",
            });
            setNewTitle("");
            setNewSlug("");
            setShowCreate(false);
            loadPages();
        } catch {
            alert("Failed to create page");
        } finally {
            setCreating(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Delete this page?")) return;
        try {
            await api.adminCms.deletePage(id);
            setPages((prev) => prev.filter((p) => p.id !== id));
        } catch {
            alert("Failed to delete page");
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Pages</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Create and manage content pages
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700"
                >
                    <Plus className="w-4 h-4" />
                    New Page
                </button>
            </div>

            {/* Create form */}
            {showCreate && (
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleCreate} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Title</label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => {
                                            setNewTitle(e.target.value);
                                            setNewSlug(slugify(e.target.value));
                                        }}
                                        placeholder="About Us"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Slug</label>
                                    <input
                                        type="text"
                                        value={newSlug}
                                        onChange={(e) => setNewSlug(e.target.value)}
                                        placeholder="about-us"
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-50"
                                >
                                    {creating ? "Creating..." : "Create Page"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="px-4 py-2 border border-slate-200 text-sm rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Pages list */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        All Pages ({pages.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                        </div>
                    ) : pages.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">No pages yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {pages.map((page) => (
                                <div
                                    key={page.id}
                                    className="flex items-center justify-between py-4"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {page.title}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-400 font-mono">
                                                /{page.slug}
                                            </span>
                                            <Badge
                                                variant={
                                                    page.status === "published"
                                                        ? "success"
                                                        : "default"
                                                }
                                            >
                                                {page.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={`/dashboard/admin/cms/pages/${page.id}`}
                                            className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <a
                                            href={`/about/${page.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                            title="View"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(page.id)}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
