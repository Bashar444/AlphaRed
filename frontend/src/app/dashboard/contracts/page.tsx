"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { contracts } from "@/lib/api";
import { Plus, Loader2, ScrollText } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

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
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ subject: "", client_name: "", contract_value: "", start_date: "", end_date: "" });

    const loadData = () => {
        setLoading(true);
        contracts.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async () => {
        setCreating(true);
        try {
            await contracts.create(form);
            setShowCreate(false);
            setForm({ subject: "", client_name: "", contract_value: "", start_date: "", end_date: "" });
            loadData();
        } catch (e) { console.error(e); } finally { setCreating(false); }
    };

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
                <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
                <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> New Contract</Button>
            </div>
            <Card>
                <CardHeader><CardTitle>All Contracts</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No contracts" icon={<ScrollText className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="subject" />
                    )}
                </CardContent>
            </Card>

            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Contract" footer={
                <><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Create</Button></>
            }>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                        <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Contract subject" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
                        <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Client name" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Contract Value *</label>
                        <Input type="number" value={form.contract_value} onChange={(e) => setForm({ ...form, contract_value: e.target.value })} placeholder="0.00" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                        <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                        <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
                </div>
            </Modal>
        </div>
    );
}
