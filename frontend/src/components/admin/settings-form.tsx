"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Save, Loader2 } from "lucide-react";

export type FieldType = "text" | "email" | "password" | "number" | "url" | "textarea" | "boolean" | "select";

export interface SettingField {
    key: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    helper?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
}

export interface SettingsSection {
    title: string;
    description?: string;
    fields: SettingField[];
}

interface Props {
    group: string;
    sections: SettingsSection[];
    title: string;
    description?: string;
    icon?: React.ReactNode;
}

type Values = Record<string, string | number | boolean>;

export default function SettingsForm({ group, sections, title, description, icon }: Props) {
    const [values, setValues] = useState<Values>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const list = (await api.adminSettings.list(group)) || [];
            const initial: Values = {};
            for (const item of list) {
                initial[item.key] = item.value as string | number | boolean;
            }
            // Ensure every field exists (default empty string / false)
            for (const s of sections) {
                for (const f of s.fields) {
                    if (initial[f.key] === undefined) {
                        initial[f.key] = f.type === "boolean" ? false : "";
                    }
                }
            }
            setValues(initial);
        } catch (err) {
            const text = err instanceof Error ? err.message : "Failed to load settings";
            setMsg({ kind: "err", text });
        } finally {
            setLoading(false);
        }
    }, [group, sections]);

    useEffect(() => {
        load();
    }, [load]);

    function set<T extends string | number | boolean>(key: string, value: T) {
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            await api.adminSettings.upsertMany(group, values);
            setMsg({ kind: "ok", text: "Settings saved successfully" });
        } catch (err) {
            const text = err instanceof Error ? err.message : "Save failed";
            setMsg({ kind: "err", text });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading settings…
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                {icon && (
                    <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
                </div>
            </div>

            {msg && (
                <div
                    className={`flex items-start gap-2 p-3 rounded-lg text-sm ${msg.kind === "ok"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                >
                    {msg.kind === "ok" ? (
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    )}
                    <span>{msg.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {sections.map((section) => (
                    <Card key={section.title}>
                        <CardHeader>
                            <CardTitle>{section.title}</CardTitle>
                            {section.description && (
                                <p className="text-xs text-slate-500 mt-1">{section.description}</p>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {section.fields.map((f) => (
                                <FieldRenderer
                                    key={f.key}
                                    field={f}
                                    value={values[f.key]}
                                    onChange={(v) => set(f.key, v)}
                                />
                            ))}
                        </CardContent>
                    </Card>
                ))}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium transition"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function FieldRenderer({
    field,
    value,
    onChange,
}: {
    field: SettingField;
    value: string | number | boolean | undefined;
    onChange: (v: string | number | boolean) => void;
}) {
    const baseInput =
        "w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500";

    if (field.type === "boolean") {
        return (
            <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => onChange(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>
                    <span className="block text-sm font-medium text-slate-700">{field.label}</span>
                    {field.helper && <span className="block text-xs text-slate-500 mt-0.5">{field.helper}</span>}
                </span>
            </label>
        );
    }

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {field.type === "textarea" ? (
                <textarea
                    rows={4}
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className={`${baseInput} h-auto py-2`}
                />
            ) : field.type === "select" ? (
                <select
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                    className={baseInput}
                >
                    <option value="">— select —</option>
                    {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={field.type}
                    value={String(value ?? "")}
                    onChange={(e) =>
                        onChange(field.type === "number" ? Number(e.target.value) : e.target.value)
                    }
                    placeholder={field.placeholder}
                    className={baseInput}
                />
            )}
            {field.helper && <p className="text-xs text-slate-500 mt-1">{field.helper}</p>}
        </div>
    );
}
