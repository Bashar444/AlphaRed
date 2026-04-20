"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Save, Loader2, Upload, X } from "lucide-react";

export type FieldType = "text" | "email" | "password" | "number" | "url" | "textarea" | "boolean" | "select" | "image";

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
    extraActions?: React.ReactNode;
}

type Values = Record<string, string | number | boolean>;

export default function SettingsForm({ group, sections, title, description, icon, extraActions }: Props) {
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

                <div className="flex justify-end gap-2">
                    {extraActions}
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
            {field.type === "image" ? (
                <ImageField value={String(value ?? "")} onChange={(v) => onChange(v)} />
            ) : field.type === "textarea" ? (
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

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function handleFile(file: File) {
        setBusy(true);
        setErr(null);
        try {
            const res = await api.adminSettings.uploadFile(file);
            onChange(res.url);
        } catch (e) {
            setErr(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                {value ? (
                    <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt="preview"
                            className="h-16 w-16 object-contain rounded-lg border border-slate-200 bg-slate-50 p-1"
                        />
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 shadow-sm"
                            aria-label="Remove image"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div className="h-16 w-16 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
                        none
                    </div>
                )}
                <div className="flex-1 space-y-2">
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void handleFile(f);
                            e.target.value = "";
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700 disabled:opacity-50"
                    >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
                    </button>
                    <input
                        type="url"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="…or paste an image URL"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                </div>
            </div>
            {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
    );
}
