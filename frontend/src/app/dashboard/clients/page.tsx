"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { clients } from "@/lib/api";
import { Plus, Building2, Loader2 } from "lucide-react";

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

    useEffect(() => {
        clients.list().then((d) => setData(Array.isArray(d) ? d : d?.data ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

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
                <h1 className="text-2xl font-bold text-white">Clients</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Client</Button>
            </div>
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">All Clients</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No clients" message="Add your first client." icon={<Building2 className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="company_name" onRowClick={(r) => router.push(`/dashboard/clients/${r.id}`)} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
