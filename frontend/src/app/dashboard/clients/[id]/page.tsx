"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { clients } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ClientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [client, setClient] = useState<Record<string, unknown> | null>(null);
    const [contacts, setContacts] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const cid = Number(id);
        Promise.all([
            clients.get(cid),
            clients.contacts(cid).catch(() => []),
        ]).then(([c, ct]) => { setClient(c); setContacts(ct ?? []); }).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;
    if (!client) return <EmptyState title="Not found" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/clients"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
                <h1 className="text-2xl font-bold text-white">{String(client.company_name ?? "Client")}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-900 border-slate-800"><CardHeader><CardTitle className="text-white text-sm">Info</CardTitle></CardHeader><CardContent className="text-sm text-slate-300 space-y-1">
                    <p><span className="text-slate-500">Address:</span> {String(client.address ?? "—")}</p>
                    <p><span className="text-slate-500">City:</span> {String(client.city ?? "—")}</p>
                    <p><span className="text-slate-500">Phone:</span> {String(client.phone ?? "—")}</p>
                    <p><span className="text-slate-500">Website:</span> {String(client.website ?? "—")}</p>
                    <p><span className="text-slate-500">Created:</span> {String(client.created_date ?? "—")}</p>
                </CardContent></Card>
                <Card className="bg-slate-900 border-slate-800"><CardHeader><CardTitle className="text-white text-sm">Contacts ({contacts.length})</CardTitle></CardHeader><CardContent>
                    {contacts.length === 0 ? <p className="text-sm text-slate-500">No contacts</p> : (
                        <div className="space-y-2">{contacts.map((c, i) => (
                            <div key={i} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-300 space-y-1">
                                <p className="font-medium">{String(c.first_name ?? "")} {String(c.last_name ?? "")} {c.is_primary_contact ? <span className="text-xs text-violet-400">(Primary)</span> : ""}</p>
                                <p className="text-slate-500">{String(c.email ?? "")} &middot; {String(c.phone ?? "")}</p>
                            </div>
                        ))}</div>
                    )}
                </CardContent></Card>
            </div>
        </div>
    );
}
