"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { proposals } from "@/lib/api";
import { Plus, Loader2, FileCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

interface ProposalRow {
    id: number;
    subject: string;
    client_name: string;
    proposal_total: number;
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

export default function ProposalsPage() {
    const [data, setData] = useState<ProposalRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ subject: "", client_name: "", proposal_total: "", valid_until: "" });

    const loadData = () => {
        setLoading(true);
        proposals.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async () => {
        setCreating(true);
        try {
            await proposals.create(form);
            setShowCreate(false);
            setForm({ subject: "", client_name: "", proposal_total: "", valid_until: "" });
            loadData();
        } catch (e) { console.error(e); } finally { setCreating(false); }
    };

    const columns: Column<ProposalRow>[] = [
        { key: "id", label: "#", sortable: true },
        { key: "subject", label: "Subject", sortable: true },
        { key: "client_name", label: "Client", sortable: true },
        { key: "proposal_total", label: "Amount", sortable: true, render: (r) => <span>${Number(r.proposal_total || 0).toFixed(2)}</span> },
        { key: "valid_until", label: "Valid Until", sortable: true },
        { key: "status", label: "Status", render: (r) => <StatusBadge label={r.status || "—"} variant={statusVar(r.status)} /> },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Proposals</h1>
                <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> New Proposal</Button>
            </div>
            <Card>
                <CardHeader><CardTitle>All Proposals</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No proposals" icon={<FileCheck className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="subject" />
                    )}
                </CardContent>
            </Card>

            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Proposal" footer={
                <><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Create</Button></>
            }>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                        <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Proposal subject" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
                        <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Client name" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Proposal Total *</label>
                        <Input type="number" value={form.proposal_total} onChange={(e) => setForm({ ...form, proposal_total: e.target.value })} placeholder="0.00" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Valid Until</label>
                        <Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} /></div>
                </div>
            </Modal>
        </div>
    );
}
