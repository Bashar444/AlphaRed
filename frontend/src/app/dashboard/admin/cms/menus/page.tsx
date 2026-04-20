"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2, Menu as MenuIcon } from "lucide-react";

interface MenuItem {
    id: string;
    label: string;
    url?: string;
    pageId?: string;
    order: number;
    target: string;
}
interface Menu {
    id: string;
    name: string;
    location: string;
    items: MenuItem[];
}

export default function MenuBuilderPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newLocation, setNewLocation] = useState("header");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.adminCms.menus();
            setMenus(Array.isArray(data) ? (data as Menu[]) : []);
        } catch {
            setMenus([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function handleCreateMenu(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) return;
        try {
            await api.adminCms.createMenu({ name: newName.trim(), location: newLocation });
            setNewName("");
            setShowCreate(false);
            await load();
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Failed");
        }
    }

    async function handleAddItem(menuId: string, label: string, url: string) {
        if (!label.trim()) return;
        try {
            await api.adminCms.addMenuItem({ menuId, label: label.trim(), url: url.trim() || undefined, order: 0 });
            await load();
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Failed");
        }
    }

    async function handleRemoveItem(itemId: string) {
        if (!confirm("Remove menu item?")) return;
        try {
            await api.adminCms.removeMenuItem(itemId);
            await load();
        } catch {
            alert("Failed to remove");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Menus</h1>
                    <p className="text-sm text-slate-500 mt-1">Header / footer navigation menus</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700">
                    <Plus className="w-4 h-4" /> New Menu
                </button>
            </div>

            {showCreate && (
                <Card>
                    <CardHeader><CardTitle>Create menu</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateMenu} className="space-y-3">
                            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Menu name (e.g. Main)" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" required />
                            <select value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                                <option value="header">Header</option>
                                <option value="footer">Footer</option>
                                <option value="sidebar">Sidebar</option>
                            </select>
                            <div className="flex gap-2">
                                <button type="submit" className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg">Create</button>
                                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-300 text-sm rounded-lg">Cancel</button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div>
            ) : menus.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-slate-400">
                        <MenuIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm">No menus yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {menus.map((m) => (
                        <MenuCard key={m.id} menu={m} onAdd={handleAddItem} onRemove={handleRemoveItem} />
                    ))}
                </div>
            )}
        </div>
    );
}

function MenuCard({ menu, onAdd, onRemove }: { menu: Menu; onAdd: (menuId: string, label: string, url: string) => void; onRemove: (itemId: string) => void }) {
    const [label, setLabel] = useState("");
    const [url, setUrl] = useState("");
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                    <span>{menu.name}</span>
                    <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-100 text-slate-600">{menu.location}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {menu.items.length === 0 ? (
                    <p className="text-xs text-slate-400">No items yet.</p>
                ) : (
                    <ul className="space-y-1">
                        {menu.items.sort((a, b) => a.order - b.order).map((it) => (
                            <li key={it.id} className="flex items-center justify-between p-2 rounded border border-slate-100 text-sm">
                                <div>
                                    <div className="font-medium text-slate-900">{it.label}</div>
                                    {it.url && <div className="text-xs text-slate-500 font-mono">{it.url}</div>}
                                </div>
                                <button onClick={() => onRemove(it.id)} className="p-1.5 text-slate-400 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                    <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
                    <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL or /p/slug" className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm font-mono" />
                    <button
                        onClick={() => { onAdd(menu.id, label, url); setLabel(""); setUrl(""); }}
                        className="w-full px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-sm rounded flex items-center justify-center gap-1"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add item
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
