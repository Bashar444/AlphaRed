"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { announcements } from "@/lib/api";
import { Plus, Loader2, Megaphone } from "lucide-react";

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

    useEffect(() => {
        announcements.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

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
                <h1 className="text-2xl font-bold text-white">Announcements</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Announcement</Button>
            </div>
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">All Announcements</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No announcements" icon={<Megaphone className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="title" />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
