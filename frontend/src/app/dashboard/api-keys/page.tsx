"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Key,
    Plus,
    Copy,
    Trash2,
    ShieldOff,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";

interface ApiKey {
    id: number;
    name: string;
    status: string;
    request_count: number;
    last_used_at: string | null;
    expires_at: string | null;
    created_at: string;
}

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [creating, setCreating] = useState(false);
    const [newKeyResult, setNewKeyResult] = useState<string | null>(null);

    useEffect(() => {
        loadKeys();
    }, []);

    async function loadKeys() {
        try {
            const data = await api.apiKeys.list();
            setKeys(Array.isArray(data) ? data : []);
        } catch {
            setKeys([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newKeyName.trim()) return;
        setCreating(true);
        try {
            const res = await api.apiKeys.create(newKeyName.trim());
            setNewKeyResult(res.api_key);
            setNewKeyName("");
            loadKeys();
        } catch {
            alert("Failed to create API key");
        } finally {
            setCreating(false);
        }
    }

    async function handleRevoke(id: number) {
        if (!confirm("Revoke this API key? It will no longer work.")) return;
        try {
            await api.apiKeys.revoke(id);
            setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)));
        } catch {
            alert("Failed to revoke key");
        }
    }

    async function handleDelete(id: number) {
        if (!confirm("Delete this API key permanently?")) return;
        try {
            await api.apiKeys.remove(id);
            setKeys((prev) => prev.filter((k) => k.id !== id));
        } catch {
            alert("Failed to delete key");
        }
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage your API keys for programmatic access
                    </p>
                </div>
                <button
                    onClick={() => { setShowCreate(true); setNewKeyResult(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700"
                >
                    <Plus className="w-4 h-4" />
                    New Key
                </button>
            </div>

            {/* New key result banner */}
            {newKeyResult && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-amber-900">
                                    Save your API key now — it won&apos;t be shown again
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <code className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded text-xs font-mono break-all">
                                        {newKeyResult}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(newKeyResult)}
                                        className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
                                        title="Copy"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Create form */}
            {showCreate && !newKeyResult && (
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleCreate} className="flex items-end gap-3">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-slate-700">Key Name</label>
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="e.g. Production, Development..."
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-50"
                            >
                                {creating ? "Creating..." : "Generate"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 border border-slate-200 text-sm rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Keys list */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Your API Keys ({keys.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="text-center py-12">
                            <Key className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">No API keys yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {keys.map((k) => (
                                <div key={k.id} className="flex items-center justify-between py-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{k.name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-400">
                                                Created {new Date(k.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {k.request_count} requests
                                            </span>
                                            {k.last_used_at && (
                                                <span className="text-xs text-slate-400">
                                                    Last used {new Date(k.last_used_at).toLocaleDateString()}
                                                </span>
                                            )}
                                            {k.expires_at && (
                                                <span className="text-xs text-slate-400">
                                                    Expires {new Date(k.expires_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={k.status === "active" ? "success" : "danger"}>
                                            {k.status === "active" ? (
                                                <CheckCircle className="w-3 h-3 mr-1 inline" />
                                            ) : (
                                                <ShieldOff className="w-3 h-3 mr-1 inline" />
                                            )}
                                            {k.status}
                                        </Badge>
                                        {k.status === "active" && (
                                            <button
                                                onClick={() => handleRevoke(k.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                                title="Revoke"
                                            >
                                                <ShieldOff className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(k.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
