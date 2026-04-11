"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { estimates } from "@/lib/api";
import { Plus, Loader2, FileSpreadsheet } from "lucide-react";

interface EstimateRow {
    id: number;
    client_name: string;
    estimate_total: number;
    valid_until: string;
    status: string;
    [key: string]: unknown;
}

const statusVar = (s: string) => {
    switch (s?.toLowerCase()) {
        case "accepted": return "success";
        case "sent": return "info";
        case "declined": return "danger";
        case "draft": return "neutral";
        default: return "neutral";
    }
};

export default function EstimatesPage() {
    const [data, setData] = useState<EstimateRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        estimates.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const columns: Column<EstimateRow>[] = [
        { key: "id", label: "#", sortable: true },
        { key: "client_name", label: "Client", sortable: true },
        { key: "estimate_total", label: "Amount", sortable: true, render: (r) => <span>${Number(r.estimate_total || 0).toFixed(2)}</span> },
        { key: "valid_until", label: "Valid Until", sortable: true },
        { key: "status", label: "Status", render: (r) => <StatusBadge label={r.status || "—"} variant={statusVar(r.status)} /> },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Estimates</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Estimate</Button>
            </div>
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">All Estimates</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No estimates" icon={<FileSpreadsheet className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="client_name" />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
