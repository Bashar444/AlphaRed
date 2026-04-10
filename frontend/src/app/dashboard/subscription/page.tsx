"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";

interface Plan {
    key: string;
    name: string;
    price: number;
    features: string[];
}

interface CurrentSub {
    plan: string;
    status: string;
    expires_at: string;
}

export default function SubscriptionPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [current, setCurrent] = useState<CurrentSub | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([api.subscriptions.plans(), api.subscriptions.current()])
            .then(([p, c]) => {
                setPlans(p || []);
                setCurrent(c?.subscription || null);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    async function handleCheckout(planKey: string) {
        setPurchasing(planKey);
        try {
            const data = await api.subscriptions.checkout(planKey);
            // Redirect to Razorpay or handle checkout flow
            if (data.order_id) {
                alert(
                    `Razorpay order created: ${data.order_id}. Integrate Razorpay checkout JS to complete.`
                );
            }
        } catch {
            // handle error
        } finally {
            setPurchasing(null);
        }
    }

    async function handleCancel() {
        if (!confirm("Cancel your subscription? You will lose access at the end of the billing period."))
            return;
        try {
            await api.subscriptions.cancel();
            setCurrent((prev) => (prev ? { ...prev, status: "cancelled" } : null));
        } catch {
            // handle error
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Subscription</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Manage your plan and billing
                </p>
            </div>

            {/* Current plan */}
            {current && (
                <Card className="border-violet-200 bg-violet-50/30">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        Current Plan:{" "}
                                        <span className="text-violet-700">
                                            {current.plan?.charAt(0).toUpperCase() +
                                                current.plan?.slice(1)}
                                        </span>
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {current.status === "active"
                                            ? `Active until ${new Date(current.expires_at).toLocaleDateString()}`
                                            : `Status: ${current.status}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={current.status === "active" ? "success" : "warning"}
                                >
                                    {current.status}
                                </Badge>
                                {current.status === "active" && (
                                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Plans */}
            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isCurrent = current?.plan === plan.key;
                    return (
                        <Card
                            key={plan.key}
                            className={
                                isCurrent
                                    ? "border-violet-300 ring-1 ring-violet-200"
                                    : ""
                            }
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    {plan.name}
                                    {isCurrent && <Badge variant="info">Current</Badge>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6">
                                    <span className="text-3xl font-bold text-slate-900">
                                        ₹{plan.price?.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-slate-500">/month</span>
                                </div>
                                <ul className="space-y-2.5 mb-6">
                                    {plan.features?.map((f) => (
                                        <li
                                            key={f}
                                            className="flex items-center gap-2 text-sm text-slate-600"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                {!isCurrent && (
                                    <Button
                                        className="w-full"
                                        variant={plan.key === "advanced" ? "primary" : "outline"}
                                        onClick={() => handleCheckout(plan.key)}
                                        disabled={purchasing === plan.key}
                                    >
                                        {purchasing === plan.key ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : null}
                                        {isCurrent ? "Current Plan" : "Upgrade"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
