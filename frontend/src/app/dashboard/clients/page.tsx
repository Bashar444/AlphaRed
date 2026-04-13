"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { clients } from "@/lib/api";
import { Plus, Building2, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

interface Client {
    id: number;
    company_name: string;
    primary_contact: string;
    total_projects: number;
    invoice_value: number;
    payment_received: number;
    created_date: string;
    [key: string]: unknown;
}

export default function ClientsPage() {
    const router = useRouter();
    const [data, setData] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ company_name: "", address: "", city: "", phone: "", email: "" });

    const loadData = () => {
        setLoading(true);
        clients.list().then((d) => setData(Array.isArray(d) ? d : d?.data ?? [])).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async () => {
        setCreating(true);
        try {
            await clients.create(form);
            setShowCreate(false);
            setForm({ company_name: "", address: "", city: "", phone: "", email: "" });
            loadData();
        } catch (e) { console.error(e); } finally { setCreating(false); }
    };

    const columns: Column<Client>[] = [
        { key: "id", label: "ID", sortable: true },
        { key: "company_name", label: "Company", sortable: true },
        { key: "primary_contact", label: "Contact", sortable: true },
        { key: "total_projects", label: "Projects", sortable: true },
        { key: "invoice_value", label: "Invoice Value", sortable: true, render: (r) => <span>${Number(r.invoice_value || 0).toFixed(2)}</span> },
        { key: "created_date", label: "Created", sortable: true },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
                <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> New Client</Button>
            </div>
            <Card>
                <CardHeader><CardTitle>All Clients</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No clients" message="Add your first client." icon={<Building2 className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="company_name" onRowClick={(r) => router.push(`/dashboard/clients/${r.id}`)} />
                    )}
                </CardContent>
            </Card>

            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Client" footer={
                <><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Create</Button></>
            }>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                        <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Company name" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                        <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                        <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" /></div>
                </div>
            </Modal>
        </div>
    );
}
