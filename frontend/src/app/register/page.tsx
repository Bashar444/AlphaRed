"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        user_type: "researcher",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const set = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await register(form);
            router.push("/dashboard");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Registration failed";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 to-indigo-700 p-12 flex-col justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white text-sm">
                        P
                    </div>
                    <span className="text-lg font-bold text-white">PrimoData</span>
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Start collecting insights today
                    </h2>
                    <p className="text-violet-200 leading-relaxed">
                        Join hundreds of researchers using PrimoData for publication-quality
                        survey analytics and AI-powered insights.
                    </p>
                </div>
                <p className="text-xs text-violet-300">&copy; 2025 PrimoData Analytics</p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                            P
                        </div>
                        <span className="text-lg font-bold text-slate-900">PrimoData</span>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Get started with a free trial — no credit card required
                    </p>

                    {error && (
                        <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    First name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.first_name}
                                    onChange={(e) => set("first_name", e.target.value)}
                                    className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Last name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.last_name}
                                    onChange={(e) => set("last_name", e.target.value)}
                                    className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>
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

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                I am a
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: "researcher", label: "Researcher" },
                                    { value: "respondent", label: "Respondent" },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => set("user_type", opt.value)}
                                        className={`h-11 rounded-lg border text-sm font-medium transition-colors ${form.user_type === opt.value
                                                ? "border-violet-500 bg-violet-50 text-violet-700"
                                                : "border-slate-300 text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create account
                        </button>
                    </form>

                    <p className="text-sm text-slate-500 text-center mt-8">
                        Already have an account?{" "}
                        <Link href="/login" className="text-violet-600 font-medium hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
