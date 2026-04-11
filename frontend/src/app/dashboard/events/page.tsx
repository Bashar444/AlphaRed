"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { events } from "@/lib/api";
import { Plus, Loader2, Calendar } from "lucide-react";

interface EventRow {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    created_by_name: string;
    [key: string]: unknown;
}

export default function EventsPage() {
    const [data, setData] = useState<EventRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        events.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const columns: Column<EventRow>[] = [
        { key: "title", label: "Event", sortable: true },
        { key: "start_date", label: "Start", sortable: true },
        { key: "end_date", label: "End", sortable: true },
        { key: "location", label: "Location" },
        { key: "created_by_name", label: "Created By" },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Events</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Event</Button>
            </div>
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">All Events</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No events" message="Schedule your first event." icon={<Calendar className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="title" />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
