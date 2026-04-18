"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, Mail, Camera, Save, CheckCircle2, AlertCircle, Building2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function apiPut(path: string, body: Record<string, unknown>) {
    const token = typeof window !== "undefined" ? localStorage.getItem("primo_token") : null;
    const res = await fetch(`${API_BASE}${path}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`);
    return json;
}

type Tab = "profile" | "password";

export default function ProfilePage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<Tab>("profile");

    // hash deep-link → switch tab
    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash === "#password") setTab("password");
    }, []);

    // Profile form state
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [organization, setOrganization] = useState(user?.organization || "");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

    // Password form state
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [pwdSaving, setPwdSaving] = useState(false);
    const [pwdMsg, setPwdMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setOrganization(user.organization || "");
            setAvatarPreview(user.avatarUrl || null);
        }
    }, [user]);

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setProfileMsg({ kind: "err", text: "Image must be under 2 MB" });
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    }

    async function handleProfileSave(e: React.FormEvent) {
        e.preventDefault();
        setProfileSaving(true);
        setProfileMsg(null);
        try {
            await apiPut("/auth/profile", { name, email, organization, avatarUrl: avatarPreview });
            setProfileMsg({ kind: "ok", text: "Profile updated successfully" });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Update failed";
            // 404 means backend endpoint isn't deployed yet — communicate clearly
            setProfileMsg({
                kind: "err",
                text: msg.includes("404")
                    ? "Profile update endpoint not yet available — changes will save once backend is updated."
                    : msg,
            });
        } finally {
            setProfileSaving(false);
        }
    }

    async function handlePasswordSave(e: React.FormEvent) {
        e.preventDefault();
        setPwdMsg(null);
        if (newPwd.length < 8) {
            setPwdMsg({ kind: "err", text: "New password must be at least 8 characters" });
            return;
        }
        if (newPwd !== confirmPwd) {
            setPwdMsg({ kind: "err", text: "New passwords do not match" });
            return;
        }
        setPwdSaving(true);
        try {
            await apiPut("/auth/password", { currentPassword: currentPwd, newPassword: newPwd });
            setPwdMsg({ kind: "ok", text: "Password changed successfully" });
            setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Update failed";
            setPwdMsg({
                kind: "err",
                text: msg.includes("404")
                    ? "Password change endpoint not yet available — pending backend update."
                    : msg,
            });
        } finally {
            setPwdSaving(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your personal information and security.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                {[
                    { id: "profile", label: "Profile", icon: User },
                    { id: "password", label: "Password", icon: Lock },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as Tab)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id
                            ? "border-violet-600 text-violet-700"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "profile" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <User className="w-4 h-4 text-violet-600" /> Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileSave} className="space-y-6">
                            {/* Avatar */}
                            <div className="flex flex-col sm:flex-row items-center gap-5">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                        {avatarPreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={avatarPreview} alt={name} className="w-full h-full object-cover" />
                                        ) : (
                                            name?.[0]?.toUpperCase() || "U"
                                        )}
                                    </div>
                                    <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-slate-50">
                                        <Camera className="w-3.5 h-3.5 text-slate-600" />
                                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                    </label>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-sm font-medium text-slate-900">{name || "Your name"}</p>
                                    <p className="text-xs text-slate-500">PNG/JPG up to 2 MB</p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={organization}
                                            onChange={(e) => setOrganization(e.target.value)}
                                            placeholder="Your company or institution"
                                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {profileMsg && <Banner msg={profileMsg} />}

                            <div className="flex justify-end pt-2 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={profileSaving}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {profileSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {tab === "password" && (
                <div id="password">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Lock className="w-4 h-4 text-violet-600" /> Change Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPwd}
                                        onChange={(e) => setCurrentPwd(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                                    <input
                                        type="password"
                                        value={newPwd}
                                        onChange={(e) => setNewPwd(e.target.value)}
                                        required
                                        minLength={8}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">At least 8 characters</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPwd}
                                        onChange={(e) => setConfirmPwd(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>

                                {pwdMsg && <Banner msg={pwdMsg} />}

                                <div className="flex justify-end pt-2 border-t border-slate-100">
                                    <button
                                        type="submit"
                                        disabled={pwdSaving}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4" />
                                        {pwdSaving ? "Updating..." : "Update Password"}
                                    </button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

function Banner({ msg }: { msg: { kind: "ok" | "err"; text: string } }) {
    const isOk = msg.kind === "ok";
    return (
        <div
            className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${isOk
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
                }`}
        >
            {isOk ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <span>{msg.text}</span>
        </div>
    );
}
