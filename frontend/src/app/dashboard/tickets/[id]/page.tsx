"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { tickets } from "@/lib/api";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function TicketDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [ticket, setTicket] = useState<Record<string, unknown> | null>(null);
    const [comments, setComments] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");

    const load = () => {
        if (!id) return;
        const tid = Number(id);
        Promise.all([
            tickets.get(tid),
            tickets.comments(tid).catch(() => []),
        ]).then(([t, c]) => { setTicket(t); setComments(c ?? []); }).finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    const submit = async () => {
        if (!newComment.trim() || !id) return;
        await tickets.addComment(Number(id), { description: newComment });
        setNewComment("");
        load();
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;
    if (!ticket) return <EmptyState title="Not found" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/tickets"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
                <h1 className="text-2xl font-bold text-white">{String(ticket.title ?? `Ticket #${id}`)}</h1>
                <StatusBadge label={String(ticket.status ?? "")} variant="info" />
            </div>

            <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-6 text-sm text-slate-300 space-y-1">
                <p><span className="text-slate-500">Type:</span> {String(ticket.ticket_type_title ?? "—")}</p>
                <p><span className="text-slate-500">Client:</span> {String(ticket.client_name ?? "—")}</p>
                <p><span className="text-slate-500">Assigned:</span> {String(ticket.assigned_to_name ?? "—")}</p>
                <p><span className="text-slate-500">Created:</span> {String(ticket.created_at ?? "—")}</p>
            </CardContent></Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">Comments</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {comments.length === 0 ? <p className="text-sm text-slate-500">No comments yet</p> : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {comments.map((c, i) => (
                                <div key={i} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-violet-400 font-medium">{String(c.created_by_name ?? "User")}</span>
                                        <span className="text-xs text-slate-600">{String(c.created_at ?? "")}</span>
                                    </div>
                                    <p className="text-slate-300">{String(c.description ?? "")}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2 pt-2">
                        <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="bg-slate-800 border-slate-700 text-white flex-1" onKeyDown={(e) => e.key === "Enter" && submit()} />
                        <Button size="sm" onClick={submit}><Send className="w-4 h-4" /></Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
