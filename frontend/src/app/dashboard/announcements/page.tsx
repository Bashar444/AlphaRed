"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { announcements } from "@/lib/api";
import { Plus, Loader2, Megaphone } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

interface AnnouncementRow {
    id: number;
    title: string;
    description: string;
    created_at: string;
    created_by_name: string;
    share_with: string;
    [key: string]: unknown;
}

export default function AnnouncementsPage() {
    const [data, setData] = useState<AnnouncementRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ title: "", description: "" });

    const loadData = () => {
        setLoading(true);
        announcements.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async () => {
        setCreating(true);
        try {
            await announcements.create(form);
            setShowCreate(false);
            setForm({ title: "", description: "" });
            loadData();
        } catch (e) { console.error(e); } finally { setCreating(false); }
    };

    const columns: Column<AnnouncementRow>[] = [
        { key: "title", label: "Title", sortable: true },
        { key: "share_with", label: "Shared With" },
        { key: "created_by_name", label: "By" },
        { key: "created_at", label: "Date", sortable: true },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
                <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> New Announcement</Button>
            </div>
            <Card>
                <CardHeader><CardTitle>All Announcements</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No announcements" icon={<Megaphone className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="title" />
                    )}
                </CardContent>
            </Card>

            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Announcement" footer={
                <><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Create</Button></>
            }>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                        <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" /></div>
                </div>
            </Modal>
        </div>
    );
}
