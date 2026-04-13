"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Loader2, BarChart3, ClipboardList, Building2, GraduationCap, Users, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

type AccountType = "researcher" | "respondent" | null;

const ROLE_INFO = {
    researcher: {
        icon: BarChart3,
        title: "Researcher",
        subtitle: "Create surveys, analyze data & publish insights",
        features: ["Create unlimited surveys", "AI-powered analysis", "Export to CSV, Excel, PDF", "Team collaboration"],
        gradient: "from-violet-600 to-indigo-700",
        accentBg: "bg-violet-50",
        accentText: "text-violet-700",
        accentBorder: "border-violet-200",
        accentRing: "ring-violet-600",
    },
    respondent: {
        icon: ClipboardList,
        title: "Respondent",
        subtitle: "Take surveys, earn rewards & build your profile",
        features: ["Get matched to relevant surveys", "Earn incentives for quality responses", "Track your earnings & payouts", "Build your respondent reputation"],
        gradient: "from-emerald-600 to-teal-700",
        accentBg: "bg-emerald-50",
        accentText: "text-emerald-700",
        accentBorder: "border-emerald-200",
        accentRing: "ring-emerald-600",
    },
};

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [step, setStep] = useState<1 | 2>(1);
    const [accountType, setAccountType] = useState<AccountType>(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        organization: "",
        phone: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const set = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountType) return;
        setError("");
        setLoading(true);
        try {
            const payload: Record<string, unknown> = {
                name: form.name,
                email: form.email,
                password: form.password,
            };
            if (accountType === "researcher" && form.organization) {
                payload.organization = form.organization;
            }
            if (accountType === "respondent") {
                payload.accountType = "RESPONDENT";
                if (form.phone) payload.phone = form.phone;
            }
            await register(payload);
            if (accountType === "respondent") {
                router.push("/dashboard/respondent");
            } else {
                router.push("/dashboard");
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Registration failed";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const info = accountType ? ROLE_INFO[accountType] : null;

    return (
        <div className="min-h-screen flex">
            {/* Left panel — changes based on selected role */}
            <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br ${info ? info.gradient : "from-violet-600 to-indigo-700"} p-12 flex-col justify-between transition-all duration-500`}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white text-sm">
                        P
                    </div>
                    <span className="text-lg font-bold text-white">PrimoData</span>
                </div>
                <div>
                    {step === 1 ? (
                        <>
                            <h2 className="text-3xl font-bold text-white mb-4">
                                Choose how you want to use PrimoData
                            </h2>
                            <p className="text-white/70 leading-relaxed">
                                Select your account type to get a customized experience built for your needs.
                            </p>
                        </>
                    ) : info ? (
                        <>
                            <h2 className="text-3xl font-bold text-white mb-4">
                                {accountType === "researcher"
                                    ? "Start collecting insights today"
                                    : "Start earning by sharing your opinions"}
                            </h2>
                            <ul className="space-y-3">
                                {info.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-white/80">
                                        <CheckCircle2 className="w-4 h-4 text-white/60 flex-shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : null}
                </div>
                <p className="text-xs text-white/40">&copy; 2026 PrimoData Analytics</p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                            P
                        </div>
                        <span className="text-lg font-bold text-slate-900">PrimoData</span>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-500"}`}>1</div>
                        <div className={`flex-1 h-0.5 ${step >= 2 ? "bg-violet-600" : "bg-slate-200"}`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-500"}`}>2</div>
                    </div>

                    {step === 1 ? (
                        /* ─── STEP 1: Role Selection ─── */
                        <>
                            <h1 className="text-2xl font-bold text-slate-900">I want to...</h1>
                            <p className="text-sm text-slate-500 mt-1 mb-8">
                                Choose your account type
                            </p>

                            <div className="space-y-4">
                                {/* Researcher card */}
                                <button
                                    onClick={() => setAccountType("researcher")}
                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${accountType === "researcher"
                                        ? "border-violet-600 bg-violet-50 ring-2 ring-violet-600/20"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accountType === "researcher" ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-600"}`}>
                                            <BarChart3 className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-semibold text-slate-900">Researcher</h3>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">Create & Analyze</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Build surveys, collect responses, and generate publication-ready analytics with AI
                                            </p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-400"><GraduationCap className="w-3 h-3" /> Universities</span>
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Building2 className="w-3 h-3" /> Enterprises</span>
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Users className="w-3 h-3" /> Teams</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                {/* Respondent card */}
                                <button
                                    onClick={() => setAccountType("respondent")}
                                    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${accountType === "respondent"
                                        ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accountType === "respondent" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600"}`}>
                                            <ClipboardList className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-semibold text-slate-900">Respondent</h3>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Earn & Respond</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Take targeted surveys, earn incentive rewards, and contribute to impactful research
                                            </p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-400">💰 Earn rewards</span>
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-400">⭐ Quality score</span>
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-400">📊 Matched surveys</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={() => accountType && setStep(2)}
                                disabled={!accountType}
                                className="w-full mt-8 h-11 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>

                            <p className="text-sm text-slate-500 text-center mt-6">
                                Already have an account?{" "}
                                <Link href="/login" className="text-violet-600 font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    ) : (
                        /* ─── STEP 2: Registration Form ─── */
                        <>
                            <button
                                onClick={() => setStep(1)}
                                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>

                            <h1 className="text-2xl font-bold text-slate-900">
                                Create your {accountType === "researcher" ? "researcher" : "respondent"} account
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {accountType === "researcher"
                                    ? "Start with a free trial — no credit card required"
                                    : "Sign up to start taking surveys and earning rewards"}
                            </p>

                            {error && (
                                <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Full name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => set("name", e.target.value)}
                                        className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                        placeholder="Your full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => set("email", e.target.value)}
                                        className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={8}
                                            value={form.password}
                                            onChange={(e) => set("password", e.target.value)}
                                            className="w-full h-11 px-3 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            placeholder="Min. 8 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Role-specific fields */}
                                {accountType === "researcher" ? (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Organization
                                        </label>
                                        <input
                                            type="text"
                                            value={form.organization}
                                            onChange={(e) => set("organization", e.target.value)}
                                            className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            placeholder="University, company, or research institute"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Phone number
                                        </label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => set("phone", e.target.value)}
                                            className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full h-11 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${accountType === "respondent"
                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                        : "bg-violet-600 hover:bg-violet-700"
                                        }`}
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {accountType === "researcher" ? "Create Researcher Account" : "Create Respondent Account"}
                                </button>
                            </form>

                            <p className="text-sm text-slate-500 text-center mt-8">
                                Already have an account?{" "}
                                <Link href="/login" className="text-violet-600 font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
