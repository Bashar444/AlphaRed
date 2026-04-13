"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { attendance } from "@/lib/api";
import { Loader2, Clock } from "lucide-react";

interface AttendanceRow {
    id: number;
    member_name: string;
    in_time: string;
    out_time: string;
    status: string;
    total_hours: string;
    attendance_date: string;
    [key: string]: unknown;
}

export default function AttendancePage() {
    const [data, setData] = useState<AttendanceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [clocking, setClocking] = useState(false);

    const load = () => {
        setLoading(true);
        attendance.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleClock = async (action: "in" | "out") => {
        setClocking(true);
        try {
            if (action === "in") await attendance.clockIn();
            else await attendance.clockOut();
            load();
        } catch { /* ignore */ } finally { setClocking(false); }
    };

    const columns: Column<AttendanceRow>[] = [
        { key: "member_name", label: "Member", sortable: true },
        { key: "attendance_date", label: "Date", sortable: true },
        { key: "in_time", label: "In" },
        { key: "out_time", label: "Out" },
        { key: "total_hours", label: "Hours" },
        { key: "status", label: "Status", render: (r) => <StatusBadge label={r.status || "—"} variant={r.status === "present" ? "success" : r.status === "absent" ? "danger" : "neutral"} /> },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
                <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={() => handleClock("in")} disabled={clocking}><Clock className="w-4 h-4 mr-1" /> Clock In</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleClock("out")} disabled={clocking}>Clock Out</Button>
                </div>
            </div>
            <Card>
                <CardHeader><CardTitle>Attendance Log</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No attendance records" message="Clock in to start." />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="member_name" />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
