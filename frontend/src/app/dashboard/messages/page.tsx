"use client";

import { useEffect, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { messages } from "@/lib/api";
import { Loader2, Send, MessageSquare } from "lucide-react";

interface Thread {
    id: number;
    subject: string;
    last_message: string;
    last_message_at: string;
    participant_names: string;
    unread: number;
    [key: string]: unknown;
}

interface Msg {
    id: number;
    message: string;
    created_by_name: string;
    created_at: string;
    [key: string]: unknown;
}

export default function MessagesPage() {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeThread, setActiveThread] = useState<number | null>(null);
    const [msgs, setMsgs] = useState<Msg[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMsg, setNewMsg] = useState("");

    useEffect(() => {
        messages.list().then((d) => setThreads(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const openThread = async (tid: number) => {
        setActiveThread(tid);
        const data = await messages.get(tid).catch(() => null);
        setMsgs((data?.messages as Msg[]) ?? []);
    };

    const sendMsg = async () => {
        if (!newMsg.trim() || !activeThread) return;
        await messages.reply(activeThread, { message: newMsg });
        setNewMsg("");
        openThread(activeThread);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Messages</h1>

            {threads.length === 0 ? (
                <EmptyState title="No messages" icon={<MessageSquare className="w-6 h-6 text-slate-500" />} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]">
                    <div className="space-y-2 overflow-y-auto max-h-[600px]">
                        {threads.map((t) => (
                            <div key={t.id} className={`cursor-pointer transition-colors rounded-lg border ${activeThread === t.id ? "bg-slate-800 border-violet-500" : "bg-slate-900 border-slate-800 hover:border-slate-700"}`} onClick={() => openThread(t.id)}>
                                <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-white truncate">{t.subject || "No subject"}</p>
                                        {t.unread > 0 && <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center">{t.unread}</span>}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mt-1">{t.last_message}</p>
                                    <p className="text-xs text-slate-600 mt-1">{t.participant_names}</p>
                                </CardContent>
                            </div>
                        ))}
                    </div>

                    <div className="md:col-span-2 flex flex-col">
                        {activeThread == null ? (
                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">Select a conversation</div>
                        ) : (
                            <>
                                <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] p-4">
                                    {msgs.map((m) => (
                                        <div key={m.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-violet-400 font-medium">{m.created_by_name}</span>
                                                <span className="text-xs text-slate-600">{m.created_at}</span>
                                            </div>
                                            <p className="text-slate-300">{m.message}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 p-4 border-t border-slate-800">
                                    <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message..." className="bg-slate-800 border-slate-700 text-white flex-1" onKeyDown={(e) => e.key === "Enter" && sendMsg()} />
                                    <Button size="sm" onClick={sendMsg}><Send className="w-4 h-4" /></Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
