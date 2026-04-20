"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollText, Loader2, RefreshCw } from "lucide-react";

interface AuditLog {
    id: string;
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    oldValues?: unknown;
    newValues?: unknown;
    ipAddress?: string;
    createdAt: string;
    user?: { name: string; email: string };
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterEntity, setFilterEntity] = useState("");
    const [filterAction, setFilterAction] = useState("");
    const [expanded, setExpanded] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.auditLogs.list({
                entity: filterEntity || undefined,
                action: filterAction || undefined,
            });
            setLogs(Array.isArray(data) ? (data as AuditLog[]) : []);
        } catch {
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [filterEntity, filterAction]);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
                    <p className="text-sm text-slate-500 mt-1">Recent administrative actions (last 100)</p>
                </div>
                <button onClick={load} className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 text-sm rounded-lg hover:bg-slate-50">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            <Card>
                <CardHeader><CardTitle className="text-base">Filters</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)} placeholder="Entity (e.g. AppSetting, Page)" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                        <input value={filterAction} onChange={(e) => setFilterAction(e.target.value)} placeholder="Action (e.g. update, create, delete)" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                        <button onClick={load} className="px-3 py-2 bg-violet-600 text-white text-sm rounded-lg">Apply</button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <ScrollText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-sm">No audit log entries.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                                    <th className="py-3 px-4">Time</th>
                                    <th className="py-3 px-4">User</th>
                                    <th className="py-3 px-4">Action</th>
                                    <th className="py-3 px-4">Entity</th>
                                    <th className="py-3 px-4">IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((l) => (
                                    <Fragment key={l.id}>
                                        <tr className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(expanded === l.id ? null : l.id)}>
                                            <td className="py-2 px-4 text-xs text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                                            <td className="py-2 px-4 text-slate-700">{l.user?.name || l.userId.slice(0, 8)}</td>
                                            <td className="py-2 px-4"><code className="text-xs px-1.5 py-0.5 bg-slate-100 rounded">{l.action}</code></td>
                                            <td className="py-2 px-4 text-slate-700">{l.entity}{l.entityId ? <span className="text-slate-400 text-xs"> #{l.entityId.slice(0, 8)}</span> : null}</td>
                                            <td className="py-2 px-4 text-xs text-slate-500 font-mono">{l.ipAddress || "-"}</td>
                                        </tr>
                                        {expanded === l.id && (
                                            <tr className="bg-slate-50">
                                                <td colSpan={5} className="px-6 py-3 text-xs">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <div className="font-semibold text-slate-600 mb-1">Before</div>
                                                            <pre className="bg-white p-2 rounded border border-slate-200 overflow-auto max-h-48">{JSON.stringify(l.oldValues ?? null, null, 2)}</pre>
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-600 mb-1">After</div>
                                                            <pre className="bg-white p-2 rounded border border-slate-200 overflow-auto max-h-48">{JSON.stringify(l.newValues ?? null, null, 2)}</pre>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
