"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Shield,
    Save,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Eye,
    EyeOff,
    Settings2,
    Layers,
} from "lucide-react";

interface PageData {
    id: number;
    title: string;
    slug: string;
    meta_title: string;
    meta_description: string;
    status: string;
    full_width: number;
    hide_topbar: number;
}

interface Section {
    id?: number;
    type: string;
    title: string;
    content: Record<string, unknown>;
    sort_order: number;
    status: "active" | "hidden";
}

const SECTION_TYPES = [
    "hero",
    "text_block",
    "features_grid",
    "cta",
    "testimonials",
    "faq",
    "image_gallery",
    "pricing",
    "stats",
    "contact_form",
];

export default function CmsPageEditorPage() {
    const { user } = useAuth();
    const params = useParams();
    const pageId = Number(params.id);

    const [page, setPage] = useState<PageData | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"settings" | "sections">("sections");
    const [savingPage, setSavingPage] = useState(false);
    const [savingSections, setSavingSections] = useState(false);
    const [dirtyPage, setDirtyPage] = useState(false);
    const [dirtySections, setDirtySections] = useState(false);

    const loadPage = useCallback(async () => {
        try {
            const [pageData, sectionData] = await Promise.all([
                api.adminCms.getPage(pageId),
                api.adminCms.getSections(pageId),
            ]);
            setPage(pageData);
            setSections(Array.isArray(sectionData) ? sectionData : []);
        } catch {
            // 404 or error
        } finally {
            setLoading(false);
        }
    }, [pageId]);

    useEffect(() => {
        if (pageId) loadPage();
    }, [pageId, loadPage]);

    function updatePageField(field: keyof PageData, value: string | number) {
        if (!page) return;
        setPage({ ...page, [field]: value });
        setDirtyPage(true);
    }

    async function handleSavePage() {
        if (!page) return;
        setSavingPage(true);
        try {
            await api.adminCms.updatePage(pageId, {
                title: page.title,
                slug: page.slug,
                meta_title: page.meta_title,
                meta_description: page.meta_description,
                status: page.status,
                full_width: page.full_width,
                hide_topbar: page.hide_topbar,
            });
            setDirtyPage(false);
        } catch {
            alert("Failed to save page");
        } finally {
            setSavingPage(false);
        }
    }

    function addSection(type: string) {
        const newSection: Section = {
            type,
            title: type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            content: {},
            sort_order: sections.length,
            status: "active",
        };
        setSections([...sections, newSection]);
        setDirtySections(true);
    }

    function updateSection(index: number, field: keyof Section, value: unknown) {
        setSections((prev) =>
            prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
        );
        setDirtySections(true);
    }

    function updateSectionContent(index: number, key: string, value: string) {
        setSections((prev) =>
            prev.map((s, i) =>
                i === index
                    ? { ...s, content: { ...s.content, [key]: value } }
                    : s
            )
        );
        setDirtySections(true);
    }

    function removeSection(index: number) {
        setSections((prev) => prev.filter((_, i) => i !== index));
        setDirtySections(true);
    }

    function moveSection(index: number, direction: -1 | 1) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= sections.length) return;
        const updated = [...sections];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        updated.forEach((s, i) => (s.sort_order = i));
        setSections(updated);
        setDirtySections(true);
    }

    async function handleSaveSections() {
        setSavingSections(true);
        try {
            await api.adminCms.saveSections(
                pageId,
                sections.map((s, i) => ({ ...s, sort_order: i }))
            );
            setDirtySections(false);
            loadPage(); // Reload to get IDs
        } catch {
            alert("Failed to save sections");
        } finally {
            setSavingSections(false);
        }
    }

    function getContentFields(type: string): string[] {
        const fields: Record<string, string[]> = {
            hero: ["heading", "subheading", "cta_text", "cta_url", "background_image"],
            text_block: ["body_html"],
            features_grid: ["features_json"],
            cta: ["heading", "description", "button_text", "button_url"],
            testimonials: ["items_json"],
            faq: ["items_json"],
            image_gallery: ["images_json"],
            pricing: ["plans_json"],
            stats: ["items_json"],
            contact_form: ["fields_json", "submit_url"],
        };
        return fields[type] || [];
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!page) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-slate-500">Page not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{page.title}</h1>
                    <p className="text-sm text-slate-500 mt-1 font-mono">/{page.slug}</p>
                </div>
                <Badge variant={page.status === "published" ? "success" : "default"}>
                    {page.status}
                </Badge>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                <button
                    onClick={() => setTab("sections")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "sections"
                            ? "border-violet-600 text-violet-700"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <Layers className="w-4 h-4" />
                    Sections ({sections.length})
                </button>
                <button
                    onClick={() => setTab("settings")}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "settings"
                            ? "border-violet-600 text-violet-700"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <Settings2 className="w-4 h-4" />
                    Page Settings
                </button>
            </div>

            {/* Settings Tab */}
            {tab === "settings" && (
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Title</label>
                                <input
                                    type="text"
                                    value={page.title}
                                    onChange={(e) => updatePageField("title", e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Slug</label>
                                <input
                                    type="text"
                                    value={page.slug}
                                    onChange={(e) => updatePageField("slug", e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Meta Title (SEO)</label>
                            <input
                                type="text"
                                value={page.meta_title || ""}
                                onChange={(e) => updatePageField("meta_title", e.target.value)}
                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Meta Description (SEO)</label>
                            <textarea
                                value={page.meta_description || ""}
                                onChange={(e) => updatePageField("meta_description", e.target.value)}
                                rows={2}
                                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-sm">
                                <select
                                    value={page.status}
                                    onChange={(e) => updatePageField("status", e.target.value)}
                                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                                Status
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={!!page.full_width}
                                    onChange={(e) => updatePageField("full_width", e.target.checked ? 1 : 0)}
                                    className="rounded border-slate-300"
                                />
                                Full Width
                            </label>
                        </div>
                        <button
                            onClick={handleSavePage}
                            disabled={!dirtyPage || savingPage}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {savingPage ? "Saving..." : "Save Settings"}
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* Sections Tab */}
            {tab === "sections" && (
                <>
                    {/* Add section dropdown */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Plus className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500">Add section:</span>
                                <div className="flex flex-wrap gap-2">
                                    {SECTION_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => addSection(type)}
                                            className="px-3 py-1 text-xs font-medium border border-slate-200 rounded-full hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-colors"
                                        >
                                            {type.replace(/_/g, " ")}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section list */}
                    {sections.length === 0 ? (
                        <div className="text-center py-12 text-sm text-slate-500">
                            No sections yet — add one above
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sections.map((section, index) => (
                                <Card key={section.id || index}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <Badge variant="default">
                                                    {section.type.replace(/_/g, " ")}
                                                </Badge>
                                                <input
                                                    type="text"
                                                    value={section.title}
                                                    onChange={(e) =>
                                                        updateSection(index, "title", e.target.value)
                                                    }
                                                    className="px-2 py-1 border border-transparent hover:border-slate-200 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-slate-200"
                                                />
                                            </CardTitle>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() =>
                                                        updateSection(
                                                            index,
                                                            "status",
                                                            section.status === "active" ? "hidden" : "active"
                                                        )
                                                    }
                                                    className="p-1.5 rounded text-slate-400 hover:text-slate-600"
                                                    title={section.status}
                                                >
                                                    {section.status === "active" ? (
                                                        <Eye className="w-4 h-4" />
                                                    ) : (
                                                        <EyeOff className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => moveSection(index, -1)}
                                                    disabled={index === 0}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <ArrowUp className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => moveSection(index, 1)}
                                                    disabled={index === sections.length - 1}
                                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeSection(index)}
                                                    className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {getContentFields(section.type).map((field) => (
                                                <div key={field}>
                                                    <label className="text-xs font-medium text-slate-500 uppercase">
                                                        {field.replace(/_/g, " ")}
                                                    </label>
                                                    {field.endsWith("_html") || field.endsWith("_json") ? (
                                                        <textarea
                                                            value={
                                                                (section.content[field] as string) || ""
                                                            }
                                                            onChange={(e) =>
                                                                updateSectionContent(
                                                                    index,
                                                                    field,
                                                                    e.target.value
                                                                )
                                                            }
                                                            rows={4}
                                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                            placeholder={
                                                                field.endsWith("_json")
                                                                    ? "JSON array..."
                                                                    : "HTML content..."
                                                            }
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={
                                                                (section.content[field] as string) || ""
                                                            }
                                                            onChange={(e) =>
                                                                updateSectionContent(
                                                                    index,
                                                                    field,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <button
                                onClick={handleSaveSections}
                                disabled={!dirtySections || savingSections}
                                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {savingSections ? "Saving..." : "Save All Sections"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
