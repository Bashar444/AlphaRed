"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { orders } from "@/lib/api";
import { Plus, Loader2, ShoppingCart } from "lucide-react";

interface OrderRow {
    id: number;
    client_name: string;
    order_total: number;
    order_date: string;
    status_title: string;
    status_color: string;
    [key: string]: unknown;
}

export default function OrdersPage() {
    const [data, setData] = useState<OrderRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ client_name: "", order_total: "", note: "" });

    function loadData() {
        orders.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }

    useEffect(() => { loadData(); }, []);

    async function handleCreate() {
        if (!form.client_name) return;
        setCreating(true);
        try {
            await orders.create({ client_name: form.client_name, order_total: Number(form.order_total) || 0, note: form.note });
            setShowCreate(false);
            setForm({ client_name: "", order_total: "", note: "" });
            loadData();
        } catch { alert("Failed to create order"); }
        finally { setCreating(false); }
    }

    const columns: Column<OrderRow>[] = [
        { key: "id", label: "#", sortable: true },
        { key: "client_name", label: "Client", sortable: true },
        { key: "order_total", label: "Total", sortable: true, render: (r) => <span>${Number(r.order_total || 0).toFixed(2)}</span> },
        { key: "order_date", label: "Date", sortable: true },
        { key: "status_title", label: "Status", render: (r) => <StatusBadge label={r.status_title || "—"} variant="info" /> },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
                <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> New Order</Button>
            </div>
            <Card>
                <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No orders" icon={<ShoppingCart className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="client_name" />
                    )}
                </CardContent>
            </Card>

            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Order" footer={
                <><Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={creating}>{creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Create</Button></>
            }>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
                        <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Client name" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Order Total</label>
                        <Input type="number" value={form.order_total} onChange={(e) => setForm({ ...form, order_total: e.target.value })} placeholder="0.00" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                        <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional note" /></div>
                </div>
            </Modal>
        </div>
    );
}
