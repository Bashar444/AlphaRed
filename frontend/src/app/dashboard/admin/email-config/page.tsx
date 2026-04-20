"use client";

import SettingsForm from "@/components/admin/settings-form";
import { Mail } from "lucide-react";

export default function EmailConfigPage() {
    return (
        <SettingsForm
            group="email"
            title="Email Configuration"
            description="SMTP credentials used by transactional emails (verification, password reset, notifications)."
            icon={<Mail className="w-6 h-6" />}
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
