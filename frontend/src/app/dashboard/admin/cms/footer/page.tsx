"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Shield,
    Save,
    Plus,
    Trash2,
    Footprints,
    Columns3,
    Globe,
} from "lucide-react";

interface FooterLink {
    label: string;
    url: string;
}

interface FooterColumn {
    title: string;
    links: FooterLink[];
}

interface SocialLink {
    platform: string;
    url: string;
}

interface FooterConfig {
    columns: FooterColumn[];
    copyright: string;
    social_links: SocialLink[];
}

const SOCIAL_PLATFORMS = [
    "twitter",
    "facebook",
    "linkedin",
    "instagram",
    "youtube",
    "github",
];

export default function CmsFooterEditorPage() {
    const { user } = useAuth();
    const [config, setConfig] = useState<FooterConfig>({
        columns: [],
        copyright: "",
        social_links: [],
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const loadFooter = useCallback(async () => {
        try {
            const data = await api.adminCms.getFooter();
            if (data && typeof data === "object") {
                setConfig({
                    columns: Array.isArray(data.columns) ? data.columns : [],
                    copyright: data.copyright || "",
                    social_links: Array.isArray(data.social_links)
                        ? data.social_links
                        : [],
                });
            }
        } catch {
            // empty
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFooter();
    }, [loadFooter]);

    function addColumn() {
        setConfig({
            ...config,
            columns: [...config.columns, { title: "New Column", links: [] }],
        });
        setDirty(true);
    }

    function removeColumn(index: number) {
        setConfig({
            ...config,
            columns: config.columns.filter((_, i) => i !== index),
        });
        setDirty(true);
    }

    function updateColumnTitle(index: number, title: string) {
        const cols = [...config.columns];
        cols[index] = { ...cols[index], title };
        setConfig({ ...config, columns: cols });
        setDirty(true);
    }

    function addLink(colIndex: number) {
        const cols = [...config.columns];
        cols[colIndex] = {
            ...cols[colIndex],
            links: [...cols[colIndex].links, { label: "", url: "/" }],
        };
        setConfig({ ...config, columns: cols });
        setDirty(true);
    }

    function updateLink(
        colIndex: number,
        linkIndex: number,
        field: "label" | "url",
        value: string
    ) {
        const cols = [...config.columns];
        const links = [...cols[colIndex].links];
        links[linkIndex] = { ...links[linkIndex], [field]: value };
        cols[colIndex] = { ...cols[colIndex], links };
        setConfig({ ...config, columns: cols });
        setDirty(true);
    }

    function removeLink(colIndex: number, linkIndex: number) {
        const cols = [...config.columns];
        cols[colIndex] = {
            ...cols[colIndex],
            links: cols[colIndex].links.filter((_, i) => i !== linkIndex),
        };
        setConfig({ ...config, columns: cols });
        setDirty(true);
    }

    function addSocial() {
        setConfig({
            ...config,
            social_links: [
                ...config.social_links,
                { platform: "twitter", url: "" },
            ],
        });
        setDirty(true);
    }

    function updateSocial(
        index: number,
        field: "platform" | "url",
        value: string
    ) {
        const links = [...config.social_links];
        links[index] = { ...links[index], [field]: value };
        setConfig({ ...config, social_links: links });
        setDirty(true);
    }

    function removeSocial(index: number) {
        setConfig({
            ...config,
            social_links: config.social_links.filter((_, i) => i !== index),
        });
        setDirty(true);
    }

    async function handleSave() {
        setSaving(true);
        try {
            await api.adminCms.saveFooter(config as unknown as Record<string, unknown>);
            setDirty(false);
        } catch {
            alert("Failed to save footer");
        } finally {
            setSaving(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Footer</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage footer columns, links, and social profiles
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Footer"}
                </button>
            </div>

            {/* Copyright */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Footprints className="w-4 h-4" />
                        Copyright Text
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <input
                        type="text"
                        value={config.copyright}
                        onChange={(e) => {
                            setConfig({ ...config, copyright: e.target.value });
                            setDirty(true);
                        }}
                        placeholder="© 2025 PrimoData. All rights reserved."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </CardContent>
            </Card>

            {/* Columns */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Columns3 className="w-4 h-4" />
                            Footer Columns ({config.columns.length})
                        </CardTitle>
                        <button
                            onClick={addColumn}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                            <Plus className="w-3 h-3" />
                            Add Column
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {config.columns.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-6">
                            No columns yet
                        </p>
                    ) : (
                        config.columns.map((col, colIndex) => (
                            <div
                                key={colIndex}
                                className="border border-slate-200 rounded-lg p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <input
                                        type="text"
                                        value={col.title}
                                        onChange={(e) =>
                                            updateColumnTitle(colIndex, e.target.value)
                                        }
                                        placeholder="Column title"
                                        className="px-2 py-1 border border-slate-200 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                    <button
                                        onClick={() => removeColumn(colIndex)}
                                        className="p-1 text-slate-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {col.links.map((link, linkIndex) => (
                                        <div
                                            key={linkIndex}
                                            className="flex items-center gap-2"
                                        >
                                            <input
                                                type="text"
                                                value={link.label}
                                                onChange={(e) =>
                                                    updateLink(
                                                        colIndex,
                                                        linkIndex,
                                                        "label",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Label"
                                                className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                            <input
                                                type="text"
                                                value={link.url}
                                                onChange={(e) =>
                                                    updateLink(
                                                        colIndex,
                                                        linkIndex,
                                                        "url",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="/page"
                                                className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            />
                                            <button
                                                onClick={() =>
                                                    removeLink(colIndex, linkIndex)
                                                }
                                                className="p-1 text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => addLink(colIndex)}
                                    className="text-xs text-violet-600 hover:underline"
                                >
                                    + Add link
                                </button>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Social Links ({config.social_links.length})
                        </CardTitle>
                        <button
                            onClick={addSocial}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                            <Plus className="w-3 h-3" />
                            Add Social
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {config.social_links.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-6">
                            No social links yet
                        </p>
                    ) : (
                        config.social_links.map((social, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <select
                                    value={social.platform}
                                    onChange={(e) =>
                                        updateSocial(index, "platform", e.target.value)
                                    }
                                    className="px-2 py-1.5 border border-slate-200 rounded text-sm"
                                >
                                    {SOCIAL_PLATFORMS.map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={social.url}
                                    onChange={(e) =>
                                        updateSocial(index, "url", e.target.value)
                                    }
                                    placeholder="https://..."
                                    className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                                <button
                                    onClick={() => removeSocial(index)}
                                    className="p-1 text-slate-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {dirty && (
                <p className="text-sm text-amber-600">You have unsaved changes</p>
            )}
        </div>
    );
}
