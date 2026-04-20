"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Mail, Save } from "lucide-react";

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    variables?: unknown;
    isSystem: boolean;
    updatedAt: string;
}

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selected, setSelected] = useState<EmailTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newTpl, setNewTpl] = useState({ name: "", subject: "", body: "" });

    async function load() {
        setLoading(true);
        try {
            const data = await api.adminCms.emailTemplates();
            setTemplates(data);
            if (data.length > 0 && !selected) setSelected(data[0]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

    async function handleSave() {
        if (!selected) return;
        setSaving(true);
        try {
            await api.adminCms.updateEmailTemplate(selected.id, {
                subject: selected.subject,
                body: selected.body,
            });
            await load();
        } catch (e) {
            alert(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(t: EmailTemplate) {
        if (t.isSystem) return alert("Cannot delete system templates");
        if (!confirm(`Delete template "${t.name}"?`)) return;
        try {
            await api.adminCms.deleteEmailTemplate(t.id);
            setSelected(null);
            await load();
        } catch (e) {
            alert(e instanceof Error ? e.message : "Delete failed");
        }
    }

    async function handleCreate() {
        if (!newTpl.name || !newTpl.subject || !newTpl.body) {
            return alert("Name, subject, and body are required");
        }
        try {
            const created = await api.adminCms.createEmailTemplate(newTpl) as EmailTemplate;
            setNewTpl({ name: "", subject: "", body: "" });
            setShowCreate(false);
            setSelected(created);
            await load();
        } catch (e) {
            alert(e instanceof Error ? e.message : "Create failed");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage transactional email content. Use variables like <code className="bg-slate-100 px-1 rounded">{'{{name}}'}</code>.</p>
                </div>
                <Button onClick={() => setShowCreate((v) => !v)}>
                    <Plus className="w-4 h-4 mr-2" /> New Template
                </Button>
            </div>

            {showCreate && (
                <Card>
                    <CardHeader><CardTitle>Create Template</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <input value={newTpl.name} onChange={(e) => setNewTpl({ ...newTpl, name: e.target.value })} placeholder="Template name (e.g. welcome_email)" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
                        <input value={newTpl.subject} onChange={(e) => setNewTpl({ ...newTpl, subject: e.target.value })} placeholder="Subject line" className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm" />
                        <textarea value={newTpl.body} onChange={(e) => setNewTpl({ ...newTpl, body: e.target.value })} rows={6} placeholder="HTML body..." className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono" />
                        <div className="flex gap-2">
                            <Button onClick={handleCreate}>Create</Button>
                            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Templates ({templates.length})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {templates.length === 0 ? (
                            <div className="p-6 text-center text-sm text-slate-400">
                                <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                No templates yet
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {templates.map((t) => (
                                    <li key={t.id}>
                                        <button
                                            onClick={() => setSelected(t)}
                                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${selected?.id === t.id ? "bg-violet-50 border-l-2 border-violet-600" : ""}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm text-slate-900">{t.name}</span>
                                                {t.isSystem && <Badge variant="info">system</Badge>}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">{t.subject}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    {selected ? (
                        <>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{selected.name}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        {!selected.isSystem && (
                                            <Button variant="outline" size="sm" onClick={() => handleDelete(selected)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button size="sm" onClick={handleSave} disabled={saving}>
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                                    <input
                                        value={selected.subject}
                                        onChange={(e) => setSelected({ ...selected, subject: e.target.value })}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Body (HTML)</label>
                                    <textarea
                                        value={selected.body}
                                        onChange={(e) => setSelected({ ...selected, body: e.target.value })}
                                        rows={16}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Preview</label>
                                    <div className="rounded-lg border border-slate-200 bg-white p-4 max-h-96 overflow-auto">
                                        <div className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100 mb-3">{selected.subject}</div>
                                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selected.body }} />
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="p-12 text-center text-sm text-slate-400">
                            Select a template to edit
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
