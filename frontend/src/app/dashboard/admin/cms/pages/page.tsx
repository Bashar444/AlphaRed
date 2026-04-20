"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Trash2, ExternalLink, Pencil, Loader2 } from "lucide-react";

interface CmsPage {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    updatedAt: string;
}

const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

export default function CmsPagesListPage() {
    const [pages, setPages] = useState<CmsPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [creating, setCreating] = useState(false);

    async function load() {
        setLoading(true);
        try {
            const data = await api.adminCms.pages();
            setPages(Array.isArray(data) ? (data as CmsPage[]) : []);
        } catch {
            setPages([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setCreating(true);
        try {
            await api.adminCms.createPage({
                title: newTitle.trim(),
                slug: (newSlug || slugify(newTitle)).trim(),
                content: { html: "<p>Edit this page...</p>" },
                published: false,
            });
            setNewTitle("");
            setNewSlug("");
            setShowCreate(false);
            await load();
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Failed to create");
        } finally {
            setCreating(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this page?")) return;
        try {
            await api.adminCms.deletePage(id);
            setPages((p) => p.filter((x) => x.id !== id));
        } catch {
            alert("Failed to delete");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">CMS Pages</h1>
                    <p className="text-sm text-slate-500 mt-1">Public pages render at /p/&lt;slug&gt;</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700"
                >
                    <Plus className="w-4 h-4" /> New Page
                </button>
            </div>

            {showCreate && (
                <Card>
                    <CardHeader><CardTitle>Create page</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <input
                                value={newTitle}
                                onChange={(e) => { setNewTitle(e.target.value); if (!newSlug) setNewSlug(slugify(e.target.value)); }}
                                placeholder="Page title"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                required
                            />
                            <input
                                value={newSlug}
                                onChange={(e) => setNewSlug(slugify(e.target.value))}
                                placeholder="slug (auto from title)"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                            />
                            <div className="flex gap-2">
                                <button type="submit" disabled={creating} className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg disabled:opacity-50">
                                    {creating ? "Creating..." : "Create draft"}
                                </button>
                                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-300 text-sm rounded-lg">Cancel</button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                        </div>
                    ) : pages.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-sm">No pages yet.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                                    <th className="py-3 px-4">Title</th>
                                    <th className="py-3 px-4">Slug</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Updated</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pages.map((p) => (
                                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium text-slate-900">{p.title}</td>
                                        <td className="py-3 px-4 font-mono text-xs text-slate-500">/p/{p.slug}</td>
                                        <td className="py-3 px-4">
                                            {p.published ? (
                                                <Badge className="bg-green-100 text-green-700">Published</Badge>
                                            ) : (
                                                <Badge className="bg-slate-100 text-slate-600">Draft</Badge>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 text-xs">{new Date(p.updatedAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                {p.published && (
                                                    <a href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-violet-600" title="View">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <Link href={`/dashboard/admin/cms/pages/${p.id}?slug=${encodeURIComponent(p.slug)}`} className="p-2 text-slate-500 hover:text-violet-600" title="Edit">
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-500 hover:text-red-600" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}