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
    BookOpen,
    Code,
    Terminal,
    Globe,
} from "lucide-react";

interface ApiKey {
    id: string;
    name: string;
    status: string;
    requestCount: number;
    lastUsedAt: string | null;
    expiresAt: string | null;
    createdAt: string;
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
            setNewKeyResult(res.apiKey || res.api_key);
            setNewKeyName("");
            loadKeys();
        } catch {
            alert("Failed to create API key");
        } finally {
            setCreating(false);
        }
    }

    async function handleRevoke(id: string) {
        if (!confirm("Revoke this API key? It will no longer work.")) return;
        try {
            await api.apiKeys.revoke(id as unknown as number);
            setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)));
        } catch {
            alert("Failed to revoke key");
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this API key permanently?")) return;
        try {
            await api.apiKeys.remove(id as unknown as number);
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
                                                Created {new Date(k.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {k.requestCount} requests
                                            </span>
                                            {k.lastUsedAt && (
                                                <span className="text-xs text-slate-400">
                                                    Last used {new Date(k.lastUsedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                            {k.expiresAt && (
                                                <span className="text-xs text-slate-400">
                                                    Expires {new Date(k.expiresAt).toLocaleDateString()}
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

            {/* ━━ API Documentation Guide ━━━━━━━━━━━━━━━ */}
            <div className="pt-4">
                <div className="flex items-center gap-2 mb-6">
                    <BookOpen className="w-5 h-5 text-violet-600" />
                    <h2 className="text-xl font-bold text-slate-900">Getting Started with the API</h2>
                </div>

                {/* Quick Start */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Terminal className="w-4 h-4 text-violet-600" /> Quick Start
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Use your API key to authenticate requests. Pass it as a Bearer token in the Authorization header.
                        </p>
                        <div className="bg-slate-950 rounded-xl p-5 font-mono text-sm overflow-x-auto">
                            <div className="text-slate-400 mb-2"># Create a new survey</div>
                            <pre className="text-slate-200">{`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/surveys \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Customer Feedback Q4 2026",
    "description": "Quarterly satisfaction survey",
    "questions": [
      {
        "type": "RATING",
        "text": "How satisfied are you with our service?",
        "required": true
      },
      {
        "type": "TEXT",
        "text": "Any additional feedback?",
        "required": false
      }
    ]
  }'`}</pre>
                            <div className="mt-3 pt-3 border-t border-slate-800 text-emerald-400 text-xs">
                                {`// Response: 201 Created`}
                                <br />
                                {`// { "id": "srv_abc123", "status": "DRAFT", "title": "Customer Feedback Q4 2026" }`}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Core Endpoints */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Globe className="w-4 h-4 text-violet-600" /> Core API Endpoints
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500">
                                        <th className="text-left py-3 pr-4 font-medium">Method</th>
                                        <th className="text-left py-3 pr-4 font-medium">Endpoint</th>
                                        <th className="text-left py-3 font-medium">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        { method: "POST", endpoint: "/api/v1/surveys", desc: "Create a new survey" },
                                        { method: "GET", endpoint: "/api/v1/surveys", desc: "List all your surveys" },
                                        { method: "GET", endpoint: "/api/v1/surveys/:id", desc: "Get survey details" },
                                        { method: "PUT", endpoint: "/api/v1/surveys/:id", desc: "Update a survey" },
                                        { method: "POST", endpoint: "/api/v1/surveys/:id/launch", desc: "Launch a survey to respondents" },
                                        { method: "GET", endpoint: "/api/v1/surveys/:id/responses", desc: "Get survey responses (paginated)" },
                                        { method: "POST", endpoint: "/api/v1/surveys/:id/analyze", desc: "Trigger AI-powered analysis" },
                                        { method: "GET", endpoint: "/api/v1/surveys/:id/export/:format", desc: "Export results (csv, excel, pdf)" },
                                        { method: "GET", endpoint: "/api/v1/api-keys", desc: "List your API keys" },
                                        { method: "POST", endpoint: "/api/v1/api-keys", desc: "Create a new API key" },
                                    ].map((ep) => (
                                        <tr key={ep.endpoint + ep.method} className="hover:bg-slate-50">
                                            <td className="py-2.5 pr-4">
                                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${ep.method === "GET" ? "bg-emerald-50 text-emerald-700" : ep.method === "POST" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                                                    {ep.method}
                                                </span>
                                            </td>
                                            <td className="py-2.5 pr-4 font-mono text-xs text-slate-700">{ep.endpoint}</td>
                                            <td className="py-2.5 text-slate-600">{ep.desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Code Examples */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Code className="w-4 h-4 text-violet-600" /> Code Examples
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* JavaScript example */}
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">JavaScript / Node.js</h4>
                            <div className="bg-slate-950 rounded-xl p-5 font-mono text-sm overflow-x-auto">
                                <pre className="text-slate-200">{`const API_KEY = "pk_live_your_key_here";
const BASE_URL = "/api/v1";

// List all surveys
const response = await fetch(\`\${BASE_URL}/surveys\`, {
  headers: {
    "Authorization": \`Bearer \${API_KEY}\`,
    "Content-Type": "application/json"
  }
});
const surveys = await response.json();
console.log(surveys);`}</pre>
                            </div>
                        </div>
                        {/* Python example */}
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Python</h4>
                            <div className="bg-slate-950 rounded-xl p-5 font-mono text-sm overflow-x-auto">
                                <pre className="text-slate-200">{`import requests

API_KEY = "pk_live_your_key_here"
BASE_URL = "https://alphared.vercel.app/api/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Get survey responses
response = requests.get(
    f"{BASE_URL}/surveys/srv_abc123/responses",
    headers=headers,
    params={"page": 1, "limit": 50}
)
data = response.json()
print(f"Total responses: {data['total']}")`}</pre>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Best Practices */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { title: "Secure your keys", desc: "Never commit API keys to source control. Use environment variables or secrets managers." },
                                { title: "Use scoped keys", desc: "Create separate keys for production, staging, and development with appropriate permissions." },
                                { title: "Handle rate limits", desc: "Check X-RateLimit-Remaining headers and implement exponential backoff for 429 responses." },
                                { title: "Rotate regularly", desc: "Rotate API keys periodically. Revoke old keys after deploying new ones." },
                                { title: "Validate webhook signatures", desc: "Always verify the HMAC-SHA256 signature on incoming webhook payloads." },
                                { title: "Paginate large datasets", desc: "Use page and limit parameters for response lists. Default limit is 25, max is 100." },
                            ].map((bp) => (
                                <div key={bp.title} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                                    <CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{bp.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{bp.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
