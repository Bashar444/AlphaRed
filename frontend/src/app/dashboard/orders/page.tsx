"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
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

    useEffect(() => {
        orders.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

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
                <h1 className="text-2xl font-bold text-white">Orders</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Order</Button>
            </div>
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">All Orders</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No orders" icon={<ShoppingCart className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="client_name" />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
