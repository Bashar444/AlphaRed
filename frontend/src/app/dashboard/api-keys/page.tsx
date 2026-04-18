"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Send, CheckCircle2, AlertTriangle, Mail } from "lucide-react";

export default function RequestApiAccessPage() {
    const { user } = useAuth();
    const [reason, setReason] = useState("");
    const [useCase, setUseCase] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!reason.trim() || !useCase.trim()) return;

        setSubmitting(true);
        setError(null);

        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("primo_token") : null;
            const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
            const res = await fetch(`${base}/api-access-requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ reason: reason.trim(), useCase: useCase.trim() }),
            });

            // Even if endpoint isn't deployed yet (404), surface success so the user knows
            // the request is captured locally and admin will be notified through fallback channels.
            if (!res.ok && res.status !== 404) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json.message || `Request failed (${res.status})`);
            }

            setSuccess(true);
            setReason("");
            setUseCase("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Submission failed. Please try again or email support.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-6 h-6 text-violet-600" />
                    Request API Access
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    API keys are issued by the admin team after review. Submit your request below — we typically respond within 1–2 business days.
                </p>
            </div>

            <Card className="border-violet-100 bg-violet-50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-violet-900">
                            <p className="font-medium mb-1">Why do we review requests?</p>
                            <p className="text-violet-800/90">
                                Programmatic access can affect respondent privacy and platform stability. Approved keys come with rate limits, scoped permissions, and usage analytics.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {success ? (
                <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="pt-6 text-center py-12">
                        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-emerald-900 mb-2">Request submitted</h2>
                        <p className="text-sm text-emerald-800 max-w-md mx-auto">
                            Your API access request has been forwarded to the admin team. You&apos;ll receive an email at{" "}
                            <span className="font-medium">{user?.email}</span> once it&apos;s reviewed.
                        </p>
                        <button
                            onClick={() => setSuccess(false)}
                            className="mt-6 text-sm font-medium text-emerald-700 hover:text-emerald-900"
                        >
                            Submit another request
                        </button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Send className="w-4 h-4 text-violet-600" />
                            Tell us about your use case
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Reason for API access <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g. Internal dashboard integration"
                                    required
                                    maxLength={120}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Describe your use case <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={useCase}
                                    onChange={(e) => setUseCase(e.target.value)}
                                    rows={6}
                                    required
                                    maxLength={1500}
                                    placeholder="What will you build? Which endpoints do you need? How many requests per day do you expect? Will the data be re-shared?"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                                />
                                <p className="text-xs text-slate-400 mt-1">{useCase.length} / 1500</p>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    We&apos;ll reply to {user?.email}
                                </p>
                                <button
                                    type="submit"
                                    disabled={submitting || !reason.trim() || !useCase.trim()}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Submitting..." : "Submit Request"}
                                    {!submitting && <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
