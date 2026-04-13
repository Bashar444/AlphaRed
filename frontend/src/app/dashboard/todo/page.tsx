"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { todo } from "@/lib/api";
import { Plus, Loader2, CheckSquare } from "lucide-react";

interface TodoItem {
    id: number;
    title: string;
    description: string;
    status: string;
    start_date: string;
    [key: string]: unknown;
}

export default function TodoPage() {
    const [data, setData] = useState<TodoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState("");

    const load = () => {
        setLoading(true);
        todo.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(load, []);

    const addTodo = async () => {
        if (!newTitle.trim()) return;
        await todo.create({ title: newTitle });
        setNewTitle("");
        load();
    };

    const toggleTodo = async (id: number) => {
        await todo.toggle(id);
        load();
    };

    const pending = data.filter((t) => t.status !== "done");
    const done = data.filter((t) => t.status === "done");

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">To-Do</h1>

            <div className="flex gap-2">
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Add a new to-do..." className="border-slate-200 max-w-lg" onKeyDown={(e) => e.key === "Enter" && addTodo()} />
                <Button size="sm" onClick={addTodo}><Plus className="w-4 h-4" /></Button>
            </div>

            {data.length === 0 ? (
                <EmptyState title="No to-do items" message="Add your first task above." icon={<CheckSquare className="w-6 h-6 text-slate-500" />} />
            ) : (
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Pending ({pending.length})</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {pending.map((t) => (
                                <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => toggleTodo(t.id)}>
                                    <div className="w-5 h-5 rounded border-2 border-slate-300 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-900">{t.title}</p>
                                        {t.description && <p className="text-xs text-slate-500">{t.description}</p>}
                                    </div>
                                    {t.start_date && <span className="text-xs text-slate-600">{t.start_date}</span>}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {done.length > 0 && (
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader><CardTitle className="text-white text-sm">Done ({done.length})</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {done.map((t) => (
                                    <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer opacity-60" onClick={() => toggleTodo(t.id)}>
                                        <div className="w-5 h-5 rounded border-2 border-emerald-500 bg-emerald-50 flex-shrink-0 flex items-center justify-center">
                                            <CheckSquare className="w-3 h-3 text-emerald-600" />
                                        </div>
                                        <p className="text-sm text-slate-400 line-through">{t.title}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
