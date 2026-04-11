"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { invoices } from "@/lib/api";
import { Plus, FileText, Loader2 } from "lucide-react";

interface Invoice {
    id: number;
    client_id: number;
    company_name: string;
    invoice_total: number;
    payment_received: number;
    due_date: string;
    status: string;
    currency_symbol: string;
    [key: string]: unknown;
}

const statusVariant = (s: string) => {
    switch (s) {
        case "fully_paid": return "success";
        case "partially_paid": return "warning";
        case "not_paid": return "danger";
        case "overdue": return "danger";
        case "draft": return "neutral";
        case "cancelled": return "neutral";
        default: return "neutral";
    }
};

export default function InvoicesPage() {
    const router = useRouter();
    const [data, setData] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        invoices.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const columns: Column<Invoice>[] = [
        { key: "id", label: "#", sortable: true },
        { key: "company_name", label: "Client", sortable: true },
        { key: "invoice_total", label: "Amount", sortable: true, render: (r) => <span>{r.currency_symbol || "$"}{Number(r.invoice_total).toFixed(2)}</span> },
        { key: "payment_received", label: "Paid", render: (r) => <span>{r.currency_symbol || "$"}{Number(r.payment_received).toFixed(2)}</span> },
        { key: "due_date", label: "Due Date", sortable: true },
        { key: "status", label: "Status", render: (r) => <StatusBadge label={r.status?.replace(/_/g, " ") || "—"} variant={statusVariant(r.status)} /> },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Invoices</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Invoice</Button>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">All Invoices</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No invoices" message="Create your first invoice." icon={<FileText className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="company_name" onRowClick={(r) => router.push(`/dashboard/invoices/${r.id}`)} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
