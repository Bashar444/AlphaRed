"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, Check, CheckCheck, Trash2, Loader2 } from "lucide-react";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
}

export default function NotificationsPage() {
    const [items, setItems] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    useEffect(() => { load(); }, [filter]);

    async function load() {
        setLoading(true);
        try {
            const data = await api.notifications.list(filter === "unread");
            setItems(Array.isArray(data) ? data : []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }

    async function markRead(id: string) {
        try {
            await api.notifications.markRead(id);
            setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Failed");
        }
    }

    async function markAllRead() {
        try {
            await api.notifications.markAllRead();
            setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Failed");
        }
    }

    async function remove(id: string) {
        if (!confirm("Delete this notification?")) return;
        try {
            await api.notifications.remove(id);
            setItems((prev) => prev.filter((n) => n.id !== id));
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Failed");
        }
    }

    const unreadCount = items.filter((n) => !n.isRead).length;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-violet-600" /> Notifications
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-violet-100 text-violet-700">{unreadCount} unread</span>
                        )}
                    </h1>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">
                        <CheckCheck className="w-4 h-4" /> Mark all read
                    </button>
                )}
            </div>

            <div className="flex gap-2">
                <button onClick={() => setFilter("all")} className={`px-3 py-1.5 text-sm rounded-lg ${filter === "all" ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>All</button>
                <button onClick={() => setFilter("unread")} className={`px-3 py-1.5 text-sm rounded-lg ${filter === "unread" ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>Unread</button>
            </div>

            <Card>
                <CardHeader><CardTitle>Inbox</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">No notifications</div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {items.map((n) => {
                                const Body = (
                                    <div className="flex items-start gap-3 py-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${n.isRead ? "bg-slate-300" : "bg-violet-500"}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm ${n.isRead ? "text-slate-600" : "text-slate-900 font-semibold"}`}>{n.title}</div>
                                            <div className="text-sm text-slate-500 mt-0.5">{n.message}</div>
                                            <div className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()} · {n.type}</div>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            {!n.isRead && (
                                                <button onClick={(e) => { e.preventDefault(); markRead(n.id); }} title="Mark as read" className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-slate-50 rounded">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={(e) => { e.preventDefault(); remove(n.id); }} title="Delete" className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                                return (
                                    <li key={n.id}>
                                        {n.link ? <Link href={n.link} className="block hover:bg-slate-50 -mx-2 px-2 rounded">{Body}</Link> : Body}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
