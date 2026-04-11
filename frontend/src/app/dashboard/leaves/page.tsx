"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { leaves } from "@/lib/api";
import { Plus, Loader2, CalendarOff } from "lucide-react";

interface LeaveRow {
    id: number;
    applicant_name: string;
    leave_type_title: string;
    start_date: string;
    end_date: string;
    total_days: number;
    status: string;
    [key: string]: unknown;
}

const statusVar = (s: string) => {
    switch (s?.toLowerCase()) {
        case "approved": return "success";
        case "pending": return "warning";
        case "rejected": return "danger";
        default: return "neutral";
    }
};

export default function LeavesPage() {
    const [data, setData] = useState<LeaveRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        leaves.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleAction = async (leaveId: number, action: "approve" | "reject") => {
        if (action === "approve") await leaves.approve(leaveId);
        else await leaves.reject(leaveId);
        load();
    };

    const columns: Column<LeaveRow>[] = [
        { key: "applicant_name", label: "Applicant", sortable: true },
        { key: "leave_type_title", label: "Type" },
        { key: "start_date", label: "From", sortable: true },
        { key: "end_date", label: "To", sortable: true },
        { key: "total_days", label: "Days" },
        { key: "status", label: "Status", render: (r) => <StatusBadge label={r.status || "—"} variant={statusVar(r.status)} /> },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Leave Applications</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Apply Leave</Button>
            </div>
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">All Applications</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No leave applications" icon={<CalendarOff className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable
                            columns={columns}
                            data={data}
                            searchKey="applicant_name"
                            actions={(r) => r.status?.toLowerCase() === "pending" ? (
                                <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 text-xs" onClick={() => handleAction(r.id, "approve")}>Approve</Button>
                                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 text-xs" onClick={() => handleAction(r.id, "reject")}>Reject</Button>
                                </div>
                            ) : null}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
