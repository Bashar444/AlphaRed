"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, CreditCard } from "lucide-react";

interface Plan {
    id: string;
    name: string;
    slug: string;
    description?: string;
    priceUsd: number;
    priceInr: number;
    billingCycle: "MONTHLY" | "ANNUAL";
    isFeatured: boolean;
    features: string[] | Record<string, unknown>;
    maxSurveys: number;
    maxResponses: number;
    maxQuestions: number;
}

interface SiteConfig {
    payment: {
        defaultGateway: string;
        currency: string;
        gateways: {
            stripe: { enabled: boolean; publishableKey: string };
            razorpay: { enabled: boolean; keyId: string };
        };
    };
}

declare global {
    interface Window {
        Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
    }
}

export default function UpgradePage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [busyPlan, setBusyPlan] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

    useEffect(() => {
        Promise.all([api.plans.list(), api.publicCms.siteConfig()])
            .then(([p, c]) => {
                setPlans(Array.isArray(p) ? (p as Plan[]) : []);
                setConfig(c as SiteConfig);
            })
            .catch(() => { setPlans([]); })
            .finally(() => setLoading(false));
    }, []);

    function loadRazorpayScript(): Promise<boolean> {
        return new Promise((resolve) => {
            if (window.Razorpay) return resolve(true);
            const s = document.createElement("script");
            s.src = "https://checkout.razorpay.com/v1/checkout.js";
            s.onload = () => resolve(true);
            s.onerror = () => resolve(false);
            document.body.appendChild(s);
        });
    }

    async function handleSubscribe(plan: Plan, gateway: "stripe" | "razorpay") {
        setBusyPlan(plan.id);
        try {
            const result = await api.payments.checkout(plan.id, gateway, billingCycle);

            if (gateway === "stripe" && result.url) {
                window.location.href = result.url;
                return;
            }

            if (gateway === "razorpay" && result.orderId) {
                const ok = await loadRazorpayScript();
                if (!ok || !window.Razorpay) {
                    alert("Failed to load Razorpay checkout");
                    return;
                }
                const rz = new window.Razorpay({
                    key: result.keyId,
                    amount: result.amount,
                    currency: result.currency,
                    name: "PrimoData",
                    description: `${plan.name} (${billingCycle})`,
                    order_id: result.orderId,
                    handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
                        try {
                            await api.payments.verifyRazorpay(response);
                            alert("Payment successful!");
                            window.location.href = "/dashboard";
                        } catch (e: unknown) {
                            alert(e instanceof Error ? e.message : "Verification failed");
                        }
                    },
                });
                rz.open();
            }
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Checkout failed");
        } finally {
            setBusyPlan(null);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading plans...
            </div>
        );
    }

    const stripeOn = config?.payment?.gateways?.stripe?.enabled;
    const razorpayOn = config?.payment?.gateways?.razorpay?.enabled;
    const noGateway = !stripeOn && !razorpayOn;

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Upgrade your plan</h1>
                    <p className="text-sm text-slate-500 mt-2">Pick a plan and pay securely</p>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="inline-flex p-1 bg-slate-200 rounded-lg">
                        <button onClick={() => setBillingCycle("MONTHLY")} className={`px-4 py-1.5 text-sm rounded ${billingCycle === "MONTHLY" ? "bg-white shadow text-slate-900" : "text-slate-600"}`}>Monthly</button>
                        <button onClick={() => setBillingCycle("ANNUAL")} className={`px-4 py-1.5 text-sm rounded ${billingCycle === "ANNUAL" ? "bg-white shadow text-slate-900" : "text-slate-600"}`}>Annual</button>
                    </div>
                </div>

                {noGateway && (
                    <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                        No payment gateway is enabled. Ask an admin to enable Stripe or Razorpay in <code>/dashboard/admin/payment-config</code>.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((p) => {
                        const features = Array.isArray(p.features) ? p.features as string[] : Object.keys(p.features || {});
                        const price = (config?.payment?.currency === "INR" ? p.priceInr : p.priceUsd) || 0;
                        const cur = config?.payment?.currency === "INR" ? "₹" : "$";
                        return (
                            <Card key={p.id} className={p.isFeatured ? "border-violet-500 shadow-lg" : ""}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{p.name}</span>
                                        {p.isFeatured && <Badge className="bg-violet-100 text-violet-700">Popular</Badge>}
                                    </CardTitle>
                                    {p.description && <p className="text-xs text-slate-500 mt-1">{p.description}</p>}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-3xl font-bold text-slate-900">
                                        {cur}{price}
                                        <span className="text-sm font-normal text-slate-500">/{billingCycle === "MONTHLY" ? "mo" : "yr"}</span>
                                    </div>
                                    <ul className="space-y-2 text-sm text-slate-700">
                                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5" /> {p.maxSurveys === -1 ? "Unlimited" : p.maxSurveys} surveys</li>
                                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5" /> {p.maxResponses === -1 ? "Unlimited" : p.maxResponses.toLocaleString()} responses</li>
                                        <li className="flex gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5" /> {p.maxQuestions === -1 ? "Unlimited" : p.maxQuestions} questions per survey</li>
                                        {features.slice(0, 4).map((f, i) => (
                                            <li key={i} className="flex gap-2"><Check className="w-4 h-4 text-green-600 mt-0.5" /> {String(f)}</li>
                                        ))}
                                    </ul>

                                    <div className="space-y-2 pt-2">
                                        {stripeOn && (
                                            <button
                                                onClick={() => handleSubscribe(p, "stripe")}
                                                disabled={busyPlan === p.id}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-50"
                                            >
                                                <CreditCard className="w-4 h-4" /> Pay with Stripe
                                            </button>
                                        )}
                                        {razorpayOn && (
                                            <button
                                                onClick={() => handleSubscribe(p, "razorpay")}
                                                disabled={busyPlan === p.id}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-violet-600 text-violet-700 text-sm rounded-lg hover:bg-violet-50 disabled:opacity-50"
                                            >
                                                <CreditCard className="w-4 h-4" /> Pay with Razorpay
                                            </button>
                                        )}
                                        {noGateway && <button disabled className="w-full px-4 py-2 bg-slate-200 text-slate-500 text-sm rounded-lg cursor-not-allowed">Unavailable</button>}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
