"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

type Status = "loading" | "success" | "error";

function VerifyEmailInner() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token");
    const [status, setStatus] = useState<Status>("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Missing verification token.");
            return;
        }
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/auth/verify-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });
                const json = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(json.message || "Verification failed");
                setStatus("success");
                setMessage(json.message || "Your email has been verified.");
                setTimeout(() => router.push("/login"), 3000);
            } catch (err) {
                setStatus("error");
                setMessage(err instanceof Error ? err.message : "Verification failed");
            }
        })();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                {status === "loading" && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                        </div>
                        <h1 className="text-xl font-semibold text-slate-900">Verifying your email…</h1>
                        <p className="text-sm text-slate-500 mt-2">This will only take a moment.</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h1 className="text-xl font-semibold text-slate-900">Email verified!</h1>
                        <p className="text-sm text-slate-600 mt-2">{message}</p>
                        <p className="text-xs text-slate-400 mt-4">Redirecting to login…</p>
                        <Link
                            href="/login"
                            className="mt-6 inline-flex items-center justify-center w-full h-11 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition"
                        >
                            Continue to login
                        </Link>
                    </>
                )}
                {status === "error" && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-xl font-semibold text-slate-900">Verification failed</h1>
                        <p className="text-sm text-slate-600 mt-2">{message}</p>
                        <div className="mt-6 flex flex-col gap-2">
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center w-full h-11 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition"
                            >
                                Go to login
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center w-full h-11 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition"
                            >
                                Back to sign up
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Mail className="w-8 h-8 text-slate-300 animate-pulse" />
                </div>
            }
        >
            <VerifyEmailInner />
        </Suspense>
    );
}
