"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";

interface Plan {
    id: string;
    name: string;
    slug: string;
    description?: string;
    priceInr: number;
    priceUsd: number;
    billingCycle: string;
    maxSurveys: number;
    maxResponses: number;
    maxQuestions: number;
    maxTeamMembers: number;
    features: string[];
    supportLevel: string;
    isActive: boolean;
    isFeatured: boolean;
}

interface CurrentSub {
    id: string;
    planId: string;
    status: string;
    billingCycle: string;
    currentPeriodEnd?: string;
    plan?: Plan;
}

export default function SubscriptionPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [current, setCurrent] = useState<CurrentSub | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([api.plans.list(), api.subscriptions.me()])
            .then(([p, sub]) => {
                setPlans(Array.isArray(p) ? p : []);
                setCurrent(sub || null);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    async function handleSubscribe(planId: string) {
        setPurchasing(planId);
        try {
            const sub = await api.subscriptions.subscribe(planId);
            setCurrent(sub);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to subscribe");
        } finally {
            setPurchasing(null);
        }
    }

    async function handleCancel() {
        if (!confirm("Cancel your subscription? You will lose access at the end of the billing period."))
            return;
        try {
            await api.subscriptions.cancel();
            setCurrent((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
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

    const statusLabel = (s: string) => {
        const map: Record<string, string> = {
            ACTIVE: "Active",
            TRIALING: "Trial",
            PENDING_APPROVAL: "Pending",
            CANCELLED: "Cancelled",
            PAST_DUE: "Past Due",
        };
        return map[s] || s;
    };

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
                                            {current.plan?.name || "Unknown"}
                                        </span>
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {current.status === "ACTIVE" && current.currentPeriodEnd
                                            ? `Active until ${new Date(current.currentPeriodEnd).toLocaleDateString()}`
                                            : `Status: ${statusLabel(current.status)}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={current.status === "ACTIVE" ? "success" : "warning"}
                                >
                                    {statusLabel(current.status)}
                                </Badge>
                                {(current.status === "ACTIVE" || current.status === "TRIALING") && (
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
                    const isCurrent = current?.planId === plan.id;
                    return (
                        <Card
                            key={plan.id}
                            className={isCurrent ? "border-violet-300 ring-1 ring-violet-200" : ""}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    {plan.name}
                                    {isCurrent && <Badge variant="info">Current</Badge>}
                                    {plan.isFeatured && !isCurrent && <Badge variant="default">Popular</Badge>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-2">
                                    <span className="text-3xl font-bold text-slate-900">
                                        ₹{plan.priceInr?.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-slate-500">/month</span>
                                </div>
                                {plan.description && (
                                    <p className="text-xs text-slate-500 mb-4">{plan.description}</p>
                                )}
                                <div className="text-xs text-slate-500 mb-4 space-y-1">
                                    <p>{plan.maxSurveys} surveys &bull; {plan.maxResponses} responses &bull; {plan.maxQuestions} questions</p>
                                    {plan.maxTeamMembers > 0 && <p>{plan.maxTeamMembers} team members</p>}
                                </div>
                                <ul className="space-y-2.5 mb-6">
                                    {(Array.isArray(plan.features) ? plan.features : []).map((f) => (
                                        <li
                                            key={String(f)}
                                            className="flex items-center gap-2 text-sm text-slate-600"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" />
                                            {String(f)}
                                        </li>
                                    ))}
                                </ul>
                                {!isCurrent && (
                                    <Button
                                        className="w-full"
                                        variant={plan.isFeatured ? "primary" : "outline"}
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={purchasing === plan.id}
                                    >
                                        {purchasing === plan.id && (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        )}
                                        {current ? "Switch Plan" : "Subscribe"}
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
