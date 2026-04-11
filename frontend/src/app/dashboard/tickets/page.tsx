"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { tickets } from "@/lib/api";
import { Plus, Loader2, Ticket } from "lucide-react";

interface TicketRow {
    id: number;
    title: string;
    ticket_type_title: string;
    client_name: string;
    assigned_to_name: string;
    status: string;
    created_at: string;
    [key: string]: unknown;
}

const statusVar = (s: string) => {
    switch (s?.toLowerCase()) {
        case "open": return "warning";
        case "closed": return "success";
        case "new": return "info";
        default: return "neutral";
    }
};

export default function TicketsPage() {
    const router = useRouter();
    const [data, setData] = useState<TicketRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        tickets.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const columns: Column<TicketRow>[] = [
        { key: "id", label: "#", sortable: true },
        { key: "title", label: "Title", sortable: true },
        { key: "ticket_type_title", label: "Type" },
        { key: "client_name", label: "Client", sortable: true },
        { key: "assigned_to_name", label: "Assigned To" },
        { key: "status", label: "Status", render: (r) => <StatusBadge label={r.status || "—"} variant={statusVar(r.status)} /> },
        { key: "created_at", label: "Created", sortable: true },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Ticket</Button>
            </div>
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">All Tickets</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No tickets" message="All clear!" icon={<Ticket className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="title" onRowClick={(r) => router.push(`/dashboard/tickets/${r.id}`)} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
