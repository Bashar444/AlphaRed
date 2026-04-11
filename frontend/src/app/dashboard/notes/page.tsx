"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { notes } from "@/lib/api";
import { Plus, Loader2, StickyNote, Trash2 } from "lucide-react";

interface Note {
    id: number;
    title: string;
    description: string;
    created_at: string;
    labels: string;
    [key: string]: unknown;
}

export default function NotesPage() {
    const [data, setData] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        notes.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(load, []);

    const handleDelete = async (id: number) => {
        await notes.remove(id);
        load();
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Notes</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Note</Button>
            </div>

            {data.length === 0 ? (
                <EmptyState title="No notes" message="Create your first note." icon={<StickyNote className="w-6 h-6 text-slate-500" />} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((n) => (
                        <Card key={n.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors group">
                            <CardContent className="pt-6 space-y-2">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-sm font-medium text-white">{n.title || "Untitled"}</h3>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 h-6 w-6 p-0" onClick={() => handleDelete(n.id)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-3">{n.description}</p>
                                {n.labels && <p className="text-xs text-violet-400">{n.labels}</p>}
                                <p className="text-xs text-slate-600">{n.created_at}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
