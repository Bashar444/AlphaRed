"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, ExternalLink, Loader2 } from "lucide-react";

interface CmsPage {
    id: string;
    title: string;
    slug: string;
    metaTitle?: string | null;
    metaDesc?: string | null;
    content: unknown;
    published: boolean;
    updatedAt: string;
}

const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

export default function CmsPageEditor() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const id = params.id;
    const slugFromQuery = searchParams.get("slug") || "";

    const [page, setPage] = useState<CmsPage | null>(null);
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDesc, setMetaDesc] = useState("");
    const [html, setHtml] = useState("");
    const [published, setPublished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<Date | null>(null);

    const load = useCallback(async () => {
        if (!slugFromQuery) {
            setLoading(false);
            return;
        }
        try {
            const data = (await api.adminCms.getPage(slugFromQuery)) as CmsPage;
            setPage(data);
            setTitle(data.title);
            setSlug(data.slug);
            setMetaTitle(data.metaTitle || "");
            setMetaDesc(data.metaDesc || "");
            setPublished(data.published);
            const c = data.content as { html?: string } | string | null;
            if (typeof c === "string") setHtml(c);
            else if (c && typeof c === "object" && "html" in c) setHtml(String(c.html ?? ""));
            else setHtml(JSON.stringify(c ?? "", null, 2));
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [slugFromQuery]);

    useEffect(() => { load(); }, [load]);

    async function handleSave() {
        setSaving(true);
        try {
            await api.adminCms.updatePage(id, {
                title,
                slug,
                metaTitle: metaTitle || null,
                metaDesc: metaDesc || null,
                content: { html },
                published,
            });
            setSavedAt(new Date());
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Failed to save");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading page...
            </div>
        );
    }

    if (!page) {
        return (
            <div className="space-y-4">
                <Link href="/dashboard/admin/cms/pages" className="inline-flex items-center gap-1 text-sm text-violet-600">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <p className="text-sm text-slate-500">Page not found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Link href="/dashboard/admin/cms/pages" className="inline-flex items-center gap-1 text-sm text-violet-600 hover:underline">
                    <ArrowLeft className="w-4 h-4" /> All pages
                </Link>
                <div className="flex items-center gap-3">
                    {savedAt && <span className="text-xs text-green-600">Saved {savedAt.toLocaleTimeString()}</span>}
                    {page.published && (
                        <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 text-sm rounded-lg text-slate-700 hover:bg-slate-50">
                            <ExternalLink className="w-4 h-4" /> View
                        </a>
                    )}
                    <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-50">
                        <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Content</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-500">Title</label>
                                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">HTML body</label>
                                <textarea
                                    value={html}
                                    onChange={(e) => setHtml(e.target.value)}
                                    rows={20}
                                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                                    placeholder="<h2>Heading</h2>\n<p>Paragraph...</p>"
                                />
                                <p className="text-xs text-slate-400 mt-1">HTML is rendered as-is at /p/{slug}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Publish</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4" />
                                Published
                            </label>
                            <div>
                                <label className="text-xs text-slate-500">Slug</label>
                                <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-500">Meta title</label>
                                <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Meta description</label>
                                <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
