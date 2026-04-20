"use client";

import SettingsForm from "@/components/admin/settings-form";
import { Settings } from "lucide-react";

export default function SystemSettingsPage() {
    return (
        <SettingsForm
            group="system"
            title="System Settings"
            description="Branding, locale and global behavior."
            icon={<Settings className="w-6 h-6" />}
            sections={[
                {
                    title: "Branding",
                    fields: [
                        { key: "system_site_name", label: "Site Name", type: "text", placeholder: "PrimoData" },
                        { key: "system_tagline", label: "Tagline", type: "text", placeholder: "Survey & Analytics Platform" },
                        { key: "system_logo_url", label: "Logo URL", type: "url", placeholder: "https://primodata.com/logo.svg", helper: "Used in the navbar and emails." },
                        { key: "system_favicon_url", label: "Favicon URL", type: "url", placeholder: "https://primodata.com/favicon.ico" },
                        { key: "system_primary_color", label: "Primary Color (hex)", type: "text", placeholder: "#7C3AED", helper: "Used for buttons and accents." },
                        {
                            key: "system_theme",
                            label: "Default Theme",
                            type: "select",
                            options: [
                                { value: "light", label: "Light" },
                                { value: "dark", label: "Dark" },
                                { value: "system", label: "Follow system" },
                            ],
                        },
                    ],
                },
                {
                    title: "Locale & Time",
                    fields: [
                        {
                            key: "system_timezone",
                            label: "Default Timezone",
                            type: "select",
                            options: [
                                { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
                                { value: "UTC", label: "UTC" },
                                { value: "America/New_York", label: "America/New_York" },
                                { value: "Europe/London", label: "Europe/London" },
                                { value: "Asia/Singapore", label: "Asia/Singapore" },
                            ],
                        },
                        {
                            key: "system_date_format",
                            label: "Date Format",
                            type: "select",
                            options: [
                                { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                                { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                                { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" },
                            ],
                        },
                        {
                            key: "system_time_format",
                            label: "Time Format",
                            type: "select",
                            options: [
                                { value: "12h", label: "12-hour (AM/PM)" },
                                { value: "24h", label: "24-hour" },
                            ],
                        },
                        {
                            key: "system_default_language",
                            label: "Default Language",
                            type: "select",
                            options: [
                                { value: "en", label: "English" },
                                { value: "hi", label: "हिंदी" },
                                { value: "es", label: "Español" },
                                { value: "fr", label: "Français" },
                            ],
                        },
                    ],
                },
                {
                    title: "Operational",
                    fields: [
                        { key: "system_maintenance_mode", label: "Maintenance Mode", type: "boolean", helper: "Hide the site from public visitors." },
                        { key: "system_maintenance_message", label: "Maintenance Message", type: "textarea", placeholder: "We'll be back shortly." },
                        { key: "system_signup_enabled", label: "Allow new signups", type: "boolean" },
                        { key: "system_admin_email", label: "Admin Email (alerts)", type: "email", placeholder: "admin@primodata.com" },
                        { key: "system_support_url", label: "Support URL", type: "url", placeholder: "https://primodata.com/support" },
                    ],
                },
            ]}
        />
    );
}
