"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { projects } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Tab = "tasks" | "milestones" | "overview";

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Record<string, unknown> | null>(null);
    const [members, setMembers] = useState<Record<string, unknown>[]>([]);
    const [milestones, setMilestones] = useState<Record<string, unknown>[]>([]);
    const [tab, setTab] = useState<Tab>("overview");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const pid = Number(id);
        Promise.all([
            projects.get(pid),
            projects.members(pid).catch(() => []),
            projects.milestones(pid).catch(() => []),
        ]).then(([p, m, ml]) => {
            setProject(p);
            setMembers(m ?? []);
            setMilestones(ml ?? []);
        }).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;
    if (!project) return <EmptyState title="Not found" message="Project not found." />;

    const tabs: { key: Tab; label: string }[] = [
        { key: "overview", label: "Overview" },
        { key: "milestones", label: `Milestones (${milestones.length})` },
        { key: "tasks", label: "Members" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/projects"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
                <h1 className="text-2xl font-bold text-white">{String(project.title ?? "Project")}</h1>
                <StatusBadge label={String(project.status_title ?? "")} variant="info" />
            </div>

            <div className="flex gap-2 border-b border-slate-800 pb-0">
                {tabs.map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-violet-500 text-violet-400" : "border-transparent text-slate-400 hover:text-white"}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-slate-900 border-slate-800"><CardHeader><CardTitle className="text-white text-sm">Details</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-slate-300">
                        <p><span className="text-slate-500">Client:</span> {String(project.company_name ?? "—")}</p>
                        <p><span className="text-slate-500">Start:</span> {String(project.start_date ?? "—")}</p>
                        <p><span className="text-slate-500">Deadline:</span> {String(project.deadline ?? "—")}</p>
                        <p><span className="text-slate-500">Description:</span> {String(project.description ?? "—")}</p>
                    </CardContent></Card>
                    <Card className="bg-slate-900 border-slate-800"><CardHeader><CardTitle className="text-white text-sm">Progress</CardTitle></CardHeader><CardContent className="text-sm text-slate-300">
                        <p>Points: {String(project.completed_points ?? 0)} / {String(project.total_points ?? 0)}</p>
                        <div className="mt-2 w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${project.total_points ? Math.round(Number(project.completed_points ?? 0) / Number(project.total_points) * 100) : 0}%` }} />
                        </div>
                    </CardContent></Card>
                </div>
            )}

            {tab === "milestones" && (
                <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-6">
                    {milestones.length === 0 ? <EmptyState title="No milestones" /> : (
                        <div className="space-y-2">{milestones.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                <span className="text-sm text-slate-300">{String(m.title ?? "")}</span>
                                <span className="text-xs text-slate-500">{String(m.due_date ?? "")}</span>
                            </div>
                        ))}</div>
                    )}
                </CardContent></Card>
            )}

            {tab === "tasks" && (
                <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-6">
                    {members.length === 0 ? <EmptyState title="No members" /> : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{members.map((m, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-medium text-white">
                                    {String(m.first_name ?? "?")[0]}
                                </div>
                                <span className="text-sm text-slate-300">{String(m.first_name ?? "")} {String(m.last_name ?? "")}</span>
                            </div>
                        ))}</div>
                    )}
                </CardContent></Card>
            )}
        </div>
    );
}
