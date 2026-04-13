"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Save, Loader2 } from "lucide-react";

interface ProfileData {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    location: string | null;
    language: string | null;
    education: string | null;
    occupation: string | null;
}

export default function RespondentProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        location: "",
        language: "",
        education: "",
        occupation: "",
    });

    useEffect(() => {
        api.respondent
            .profile()
            .then((p: ProfileData) => {
                setForm({
                    name: p.name || "",
                    phone: p.phone || "",
                    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split("T")[0] : "",
                    gender: p.gender || "",
                    location: p.location || "",
                    language: p.language || "",
                    education: p.education || "",
                    occupation: p.occupation || "",
                });
            })
            .catch(() => {
                setForm({
                    name: user?.name || "",
                    phone: "",
                    dateOfBirth: "",
                    gender: "",
                    location: "",
                    language: "",
                    education: "",
                    occupation: "",
                });
            })
            .finally(() => setLoading(false));
    }, [user]);

    async function handleSave() {
        setSaving(true);
        try {
            await api.respondent.profile(); // placeholder – would be PATCH
            // For now, just show saved
        } catch {
            // handle
        } finally {
            setSaving(false);
        }
    }

    function onChange(field: string, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    const fields: { label: string; key: string; type?: string; options?: string[] }[] = [
        { label: "Full Name", key: "name" },
        { label: "Phone", key: "phone", type: "tel" },
        { label: "Date of Birth", key: "dateOfBirth", type: "date" },
        {
            label: "Gender",
            key: "gender",
            options: ["male", "female", "non-binary", "prefer-not-to-say"],
        },
        { label: "Location", key: "location" },
        { label: "Language", key: "language" },
        { label: "Education", key: "education" },
        { label: "Occupation", key: "occupation" },
    ];

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Update your demographics to receive better-matched surveys
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Email (read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500"
                            />
                        </div>

                        {fields.map((f) => (
                            <div key={f.key}>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    {f.label}
                                </label>
                                {f.options ? (
                                    <select
                                        value={(form as Record<string, string>)[f.key]}
                                        onChange={(e) => onChange(f.key, e.target.value)}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    >
                                        <option value="">Select…</option>
                                        {f.options.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt.charAt(0).toUpperCase() + opt.slice(1).replace(/-/g, " ")}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={f.type || "text"}
                                        value={(form as Record<string, string>)[f.key]}
                                        onChange={(e) => onChange(f.key, e.target.value)}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                )}
                            </div>
                        ))}

                        <div className="pt-4">
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Save Profile
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
