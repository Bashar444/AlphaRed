"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { contracts } from "@/lib/api";
import { Plus, Loader2, ScrollText } from "lucide-react";

interface ContractRow {
    id: number;
    subject: string;
    client_name: string;
    contract_value: number;
    start_date: string;
    end_date: string;
    status: string;
    [key: string]: unknown;
}

const statusVar = (s: string) => {
    switch (s?.toLowerCase()) {
        case "active": return "success";
        case "signed": return "success";
        case "expired": return "danger";
        case "draft": return "neutral";
        default: return "neutral";
    }
};

export default function ContractsPage() {
    const [data, setData] = useState<ContractRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        contracts.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const columns: Column<ContractRow>[] = [
        { key: "id", label: "#", sortable: true },
        { key: "subject", label: "Subject", sortable: true },
        { key: "client_name", label: "Client", sortable: true },
        { key: "contract_value", label: "Value", sortable: true, render: (r) => <span>${Number(r.contract_value || 0).toFixed(2)}</span> },
        { key: "start_date", label: "Start", sortable: true },
        { key: "end_date", label: "End", sortable: true },
        { key: "status", label: "Status", render: (r) => <StatusBadge label={r.status || "—"} variant={statusVar(r.status)} /> },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Contracts</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Contract</Button>
            </div>
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">All Contracts</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No contracts" icon={<ScrollText className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="subject" />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
