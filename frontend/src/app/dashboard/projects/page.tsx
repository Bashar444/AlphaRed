"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { projects } from "@/lib/api";
import { Plus, FolderOpen, Loader2 } from "lucide-react";

interface Project {
    id: number;
    title: string;
    company_name: string;
    start_date: string;
    deadline: string;
    status_id: number;
    status_title: string;
    total_points: number;
    completed_points: number;
    [key: string]: unknown;
}

const statusVariant = (id: number) => {
    switch (id) {
        case 1: return "info";
        case 2: return "success";
        case 3: return "warning";
        default: return "neutral";
    }
};

export default function ProjectsPage() {
    const router = useRouter();
    const [data, setData] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        projects.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const columns: Column<Project>[] = [
        { key: "id", label: "ID", sortable: true },
        { key: "title", label: "Title", sortable: true },
        { key: "company_name", label: "Client", sortable: true },
        { key: "start_date", label: "Start", sortable: true },
        { key: "deadline", label: "Deadline", sortable: true },
        {
            key: "status_title", label: "Status", render: (r) => (
                <StatusBadge label={r.status_title || "Unknown"} variant={statusVariant(r.status_id)} />
            ),
        },
        {
            key: "progress", label: "Progress", render: (r) => {
                const pct = r.total_points ? Math.round((r.completed_points / r.total_points) * 100) : 0;
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">{pct}%</span>
                    </div>
                );
            },
        },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Projects</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Project</Button>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">All Projects</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No projects" message="Create your first project to get started." icon={<FolderOpen className="w-6 h-6 text-slate-500" />} />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="title" onRowClick={(r) => router.push(`/dashboard/projects/${r.id}`)} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
