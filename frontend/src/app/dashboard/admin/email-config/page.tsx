"use client";

import { useState } from "react";
import SettingsForm from "@/components/admin/settings-form";
import { api } from "@/lib/api";
import { Mail, Send, Loader2 } from "lucide-react";

function TestEmailButton() {
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

    async function send() {
        setBusy(true);
        setResult(null);
        try {
            const res = await api.adminSettings.sendTestEmail();
            setResult({ ok: !!res.ok, text: res.message });
        } catch (err) {
            setResult({ ok: false, text: err instanceof Error ? err.message : "Test send failed" });
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex items-center gap-3">
            {result && (
                <span className={`text-xs ${result.ok ? "text-emerald-600" : "text-red-600"}`}>
                    {result.text}
                </span>
            )}
            <button
                type="button"
                onClick={send}
                disabled={busy}
                className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border border-violet-300 text-violet-700 hover:bg-violet-50 disabled:opacity-50 text-sm font-medium transition"
            >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {busy ? "Sending…" : "Send test email"}
            </button>
        </div>
    );
}

export default function EmailConfigPage() {
    return (
        <SettingsForm
            group="email"
            title="Email Configuration"
            description="SMTP credentials used by transactional emails (verification, password reset, notifications). Save changes first, then send a test email to verify."
            icon={<Mail className="w-6 h-6" />}
            extraActions={<TestEmailButton />}
            sections={[
                {
                    title: "SMTP Server",
                    description: "Configure the outgoing mail server.",
                    fields: [
                        { key: "smtp_host", label: "SMTP Host", type: "text", placeholder: "smtp.gmail.com", required: true },
                        { key: "smtp_port", label: "SMTP Port", type: "number", placeholder: "587", required: true },
                        {
                            key: "smtp_encryption",
                            label: "Encryption",
                            type: "select",
                            options: [
                                { value: "tls", label: "TLS (recommended)" },
                                { value: "ssl", label: "SSL" },
                                { value: "none", label: "None" },
                            ],
                        },
                        { key: "smtp_user", label: "Username", type: "text", placeholder: "user@example.com" },
                        { key: "smtp_pass", label: "Password / App Token", type: "password", placeholder: "••••••••" },
                    ],
                },
                {
                    title: "Sender Identity",
                    fields: [
                        { key: "smtp_from_email", label: "From Address", type: "email", placeholder: "no-reply@primodata.com", required: true },
                        { key: "smtp_from_name", label: "From Name", type: "text", placeholder: "PrimoData" },
                        { key: "smtp_reply_to", label: "Reply-To", type: "email", placeholder: "support@primodata.com" },
                    ],
                },
                {
                    title: "Test",
                    description: "Send a test email after saving to verify the connection.",
                    fields: [
                        { key: "smtp_test_recipient", label: "Test Recipient Email", type: "email", placeholder: "you@example.com" },
                    ],
                },
            ]}
        />
    );
}
