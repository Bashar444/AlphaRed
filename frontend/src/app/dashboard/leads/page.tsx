"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { leads } from "@/lib/api";
import { Plus, Loader2 } from "lucide-react";

interface Lead {
    id: number;
    company_name: string;
    primary_contact: string;
    lead_status_title: string;
    lead_status_color: string;
    lead_status_id: number;
    owner_name: string;
    [key: string]: unknown;
}

interface LeadStatus {
    id: number;
    title: string;
    color: string;
    [key: string]: unknown;
}

export default function LeadsPage() {
    const [data, setData] = useState<Lead[]>([]);
    const [statuses, setStatuses] = useState<LeadStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            leads.list(),
            leads.statuses().catch(() => []),
        ]).then(([l, s]) => { setData(Array.isArray(l) ? l : l?.data ?? []); setStatuses(s ?? []); }).finally(() => setLoading(false));
    }, []);

    const leadsByStatus = (sid: number) => data.filter((l) => Number(l.lead_status_id) === sid);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Leads Pipeline</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Lead</Button>
            </div>

            {data.length === 0 ? (
                <EmptyState title="No leads" message="Add your first lead." />
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {statuses.map((s) => (
                        <div key={s.id} className="flex-shrink-0 w-72 space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-3 h-3 rounded-full" style={{ background: s.color || "#6366f1" }} />
                                <h3 className="text-sm font-medium text-slate-300">{s.title}</h3>
                                <span className="text-xs text-slate-500">{leadsByStatus(s.id).length}</span>
                            </div>
                            <div className="space-y-2 min-h-[120px]">
                                {leadsByStatus(s.id).map((l) => (
                                    <Card key={l.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                                        <CardContent className="p-3 space-y-1">
                                            <p className="text-sm font-medium text-white">{l.company_name || "Unnamed"}</p>
                                            <p className="text-xs text-slate-500">{l.primary_contact || "No contact"}</p>
                                            {l.owner_name && <p className="text-xs text-slate-400">Owner: {l.owner_name}</p>}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
