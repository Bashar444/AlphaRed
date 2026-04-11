"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Shield,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Save,
    ExternalLink,
    GripVertical,
} from "lucide-react";

interface MenuItem {
    id: string;
    label: string;
    url: string;
    target: "_self" | "_blank";
    parent_id: string | null;
    sort_order: number;
    status: "active" | "hidden";
}

function generateId() {
    return Math.random().toString(36).slice(2, 10);
}

export default function CmsMenuEditorPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const loadMenus = useCallback(async () => {
        try {
            const data = await api.adminCms.menus();
            const menus = Array.isArray(data) ? data : [];
            if (menus.length > 0 && Array.isArray(menus[0].items)) {
                setItems(menus[0].items);
            }
        } catch {
            // empty
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMenus();
    }, [loadMenus]);

    function addItem() {
        const newItem: MenuItem = {
            id: generateId(),
            label: "",
            url: "/",
            target: "_self",
            parent_id: null,
            sort_order: items.length,
            status: "active",
        };
        setItems([...items, newItem]);
        setDirty(true);
    }

    function updateItem(id: string, field: keyof MenuItem, value: string) {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
        setDirty(true);
    }

    function removeItem(id: string) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setDirty(true);
    }

    function moveItem(index: number, direction: -1 | 1) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= items.length) return;
        const updated = [...items];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        updated.forEach((item, i) => (item.sort_order = i));
        setItems(updated);
        setDirty(true);
    }

    async function handleSave() {
        setSaving(true);
        try {
            await api.adminCms.saveMenus({
                title: "Main Menu",
                location: "header",
                items: items.map((item, i) => ({ ...item, sort_order: i })),
            });
            setDirty(false);
        } catch {
            alert("Failed to save menu");
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Header Menu</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage navigation links shown in the site header
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-sm rounded-lg hover:bg-slate-50"
                    >
                        <Plus className="w-4 h-4" />
                        Add Link
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!dirty || saving}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Menu"}
                    </button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Menu Items ({items.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-slate-500">No menu items yet</p>
                            <button
                                onClick={addItem}
                                className="mt-3 text-sm text-violet-600 hover:underline"
                            >
                                Add your first link
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-white"
                                >
                                    <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />

                                    {/* Label */}
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateItem(item.id, "label", e.target.value)}
                                        placeholder="Label"
                                        className="flex-1 min-w-0 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />

                                    {/* URL */}
                                    <input
                                        type="text"
                                        value={item.url}
                                        onChange={(e) => updateItem(item.id, "url", e.target.value)}
                                        placeholder="/about"
                                        className="flex-1 min-w-0 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />

                                    {/* Target */}
                                    <button
                                        onClick={() =>
                                            updateItem(
                                                item.id,
                                                "target",
                                                item.target === "_self" ? "_blank" : "_self"
                                            )
                                        }
                                        className={`p-1.5 rounded ${item.target === "_blank"
                                                ? "text-violet-600 bg-violet-50"
                                                : "text-slate-400"
                                            }`}
                                        title={item.target === "_blank" ? "Opens in new tab" : "Opens in same tab"}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>

                                    {/* Status toggle */}
                                    <button
                                        onClick={() =>
                                            updateItem(
                                                item.id,
                                                "status",
                                                item.status === "active" ? "hidden" : "active"
                                            )
                                        }
                                        className={`px-2 py-1 rounded text-xs font-medium ${item.status === "active"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-slate-100 text-slate-500"
                                            }`}
                                    >
                                        {item.status}
                                    </button>

                                    {/* Move up/down */}
                                    <button
                                        onClick={() => moveItem(index, -1)}
                                        disabled={index === 0}
                                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => moveItem(index, 1)}
                                        disabled={index === items.length - 1}
                                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {dirty && (
                <p className="text-sm text-amber-600">You have unsaved changes</p>
            )}
        </div>
    );
}
