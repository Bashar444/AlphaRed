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
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

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
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ client_id: "", invoice_total: "", due_date: "", note: "" });

    const loadData = () => {
        setLoading(true);
        invoices.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async () => {
        setCreating(true);
        try {
            await invoices.create(form);
            setShowCreate(false);
            setForm({ client_id: "", invoice_total: "", due_date: "", note: "" });
            loadData();
        } catch (e) { console.error(e); } finally { setCreating(false); }
    };

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
                <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
                <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> New Invoice</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>All Invoices</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No invoices" message="Create your first invoice." icon={<FileText className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="company_name" onRowClick={(r) => router.push(`/dashboard/invoices/${r.id}`)} />
                    )}
                </CardContent>
            </Card>

            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Invoice" footer={
                <><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Create</Button></>
            }>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Client ID *</label>
                        <Input value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} placeholder="Client ID" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Invoice Total *</label>
                        <Input type="number" value={form.invoice_total} onChange={(e) => setForm({ ...form, invoice_total: e.target.value })} placeholder="0.00" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
                        <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                        <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional note" /></div>
                </div>
            </Modal>
        </div>
    );
}
