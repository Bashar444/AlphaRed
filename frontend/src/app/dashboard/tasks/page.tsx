"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { tasks } from "@/lib/api";
import { Plus, List, LayoutGrid, Loader2 } from "lucide-react";

interface Task {
    id: number;
    title: string;
    project_title: string;
    status_id: number;
    status_title: string;
    assigned_to: number;
    deadline: string;
    points: number;
    [key: string]: unknown;
}

interface TaskStatus {
    id: number;
    title: string;
    [key: string]: unknown;
}

const statusVariant = (id: number) => {
    if (id === 1) return "info";
    if (id === 2) return "warning";
    if (id === 3) return "success";
    return "neutral";
};

export default function TasksPage() {
    const [data, setData] = useState<Task[]>([]);
    const [statuses, setStatuses] = useState<TaskStatus[]>([]);
    const [view, setView] = useState<"board" | "list">("board");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            tasks.list(),
            tasks.statuses().catch(() => []),
        ]).then(([t, s]) => { setData(t ?? []); setStatuses(s ?? []); }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    const tasksByStatus = (statusId: number) => data.filter((t) => t.status_id === statusId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Tasks</h1>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setView("board")} className={view === "board" ? "text-violet-400" : ""}>
                        <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setView("list")} className={view === "list" ? "text-violet-400" : ""}>
                        <List className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Task</Button>
                </div>
            </div>

            {data.length === 0 ? (
                <EmptyState title="No tasks" message="Create your first task." />
            ) : view === "board" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {statuses.map((s) => (
                        <div key={s.id} className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-sm font-medium text-slate-400">{s.title}</h3>
                                <span className="text-xs text-slate-500">{tasksByStatus(s.id).length}</span>
                            </div>
                            <div className="space-y-2 min-h-[100px]">
                                {tasksByStatus(s.id).map((t) => (
                                    <Card key={t.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 cursor-pointer transition-colors">
                                        <CardContent className="p-3 space-y-2">
                                            <p className="text-sm font-medium text-white">{t.title}</p>
                                            <p className="text-xs text-slate-500">{t.project_title || "No project"}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-500">{t.deadline || "No deadline"}</span>
                                                {t.points > 0 && <span className="text-xs text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{t.points}pts</span>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader><CardTitle className="text-white">All Tasks</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-slate-800 text-slate-400">
                                    <th className="px-4 py-3 text-left">Title</th>
                                    <th className="px-4 py-3 text-left">Project</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Deadline</th>
                                    <th className="px-4 py-3 text-left">Points</th>
                                </tr></thead>
                                <tbody>{data.map((t) => (
                                    <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/50">
                                        <td className="px-4 py-3 text-slate-300">{t.title}</td>
                                        <td className="px-4 py-3 text-slate-400">{t.project_title || "—"}</td>
                                        <td className="px-4 py-3"><StatusBadge label={t.status_title || "—"} variant={statusVariant(t.status_id)} /></td>
                                        <td className="px-4 py-3 text-slate-400">{t.deadline || "—"}</td>
                                        <td className="px-4 py-3 text-slate-400">{t.points}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
