"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { timesheets } from "@/lib/api";
import { Plus, Loader2, Timer } from "lucide-react";

interface TimesheetRow {
    id: number;
    member_name: string;
    project_title: string;
    task_title: string;
    start_time: string;
    end_time: string;
    hours: string;
    note: string;
    [key: string]: unknown;
}

export default function TimesheetsPage() {
    const [data, setData] = useState<TimesheetRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        timesheets.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const totalHours = data.reduce((s, t) => s + parseFloat(String(t.hours || "0")), 0);

    const columns: Column<TimesheetRow>[] = [
        { key: "member_name", label: "Member", sortable: true },
        { key: "project_title", label: "Project", sortable: true },
        { key: "task_title", label: "Task" },
        { key: "start_time", label: "Start", sortable: true },
        { key: "end_time", label: "End" },
        { key: "hours", label: "Hours", render: (r) => <span className="text-violet-400">{r.hours || "0"}h</span> },
        { key: "note", label: "Note" },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Timesheets</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Log Time</Button>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center"><Timer className="w-5 h-5 text-violet-400" /></div>
                    <div><p className="text-sm text-slate-400">Total Logged</p><p className="text-xl font-bold text-white">{totalHours.toFixed(1)} hours</p></div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">All Entries</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No timesheet entries" message="Log your first time entry." />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="member_name" />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
