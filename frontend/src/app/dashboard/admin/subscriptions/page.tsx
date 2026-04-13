"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
    Plus,
    Loader2,
    CreditCard,
    Pencil,
    Trash2,
    Users,
    DollarSign,
    Package,
} from "lucide-react";

interface Plan {
    id: string;
    key: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    billing_cycle: string;
    features: string[];
    limits: Record<string, number>;
    status: string;
    subscribers_count?: number;
}

interface Subscription {
    id: string;
    userId: string;
    user?: { name: string; email: string };
    planId: string;
    plan?: { name: string };
    status: string;
    startDate: string;
    endDate: string;
}

const defaultPlanForm = {
    name: "",
    description: "",
    price: "",
    currency: "INR",
    billing_cycle: "per_request",
    features: "",
    max_surveys: "",
    max_questions: "",
    max_responses: "",
};

export default function AdminSubscriptionsPage() {
    const [tab, setTab] = useState<"plans" | "subscribers">("plans");
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscriptionsList, setSubscriptionsList] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [form, setForm] = useState(defaultPlanForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadPlans(); }, []);

    async function loadPlans() {
        try {
            const data = await api.adminSubscriptions.listPlans();
            setPlans(Array.isArray(data) ? data : []);
        } catch { setPlans([]); }
        finally { setLoading(false); }
    }

    async function loadSubscribers() {
        try {
            const data = await api.adminSubscriptions.listSubscriptions();
            setSubscriptionsList(Array.isArray(data) ? data : []);
        } catch { setSubscriptionsList([]); }
    }

    function switchTab(t: "plans" | "subscribers") {
        setTab(t);
        if (t === "subscribers" && subscriptionsList.length === 0) loadSubscribers();
    }

    function openCreate() {
        setEditingPlan(null);
        setForm(defaultPlanForm);
        setShowModal(true);
    }

    function openEdit(plan: Plan) {
        setEditingPlan(plan);
        setForm({
            name: plan.name,
            description: plan.description || "",
            price: String(plan.price),
            currency: plan.currency || "INR",
            billing_cycle: plan.billing_cycle || "per_request",
            features: (plan.features || []).join("\n"),
            max_surveys: String(plan.limits?.max_surveys || ""),
            max_questions: String(plan.limits?.max_questions || ""),
            max_responses: String(plan.limits?.max_responses || ""),
        });
        setShowModal(true);
    }

    async function handleSave() {
        if (!form.name || !form.price) return;
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description,
                price: Number(form.price),
                currency: form.currency,
                billing_cycle: form.billing_cycle,
                features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
                limits: {
                    max_surveys: Number(form.max_surveys) || 0,
                    max_questions: Number(form.max_questions) || 0,
                    max_responses: Number(form.max_responses) || 0,
                },
            };
            if (editingPlan) {
                await api.adminSubscriptions.updatePlan(editingPlan.id, payload);
            } else {
                await api.adminSubscriptions.createPlan(payload);
            }
            setShowModal(false);
            loadPlans();
        } catch {
            alert("Failed to save plan");
        } finally {
            setSaving(false);
        }
    }

    async function handleDeletePlan(id: string) {
        if (!confirm("Delete this plan? Existing subscribers will not be affected.")) return;
        try {
            await api.adminSubscriptions.deletePlan(id);
            setPlans((prev) => prev.filter((p) => p.id !== id));
        } catch { alert("Failed to delete plan"); }
    }

    async function handleCancelSubscription(id: string) {
        if (!confirm("Cancel this subscription?")) return;
        try {
            await api.adminSubscriptions.cancelSubscription(id);
            setSubscriptionsList((prev) =>
                prev.map((s) => (s.id === id ? { ...s, status: "cancelled" } : s))
            );
        } catch { alert("Failed to cancel subscription"); }
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Subscription Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Create and manage pricing plans for researchers</p>
                </div>
                {tab === "plans" && (
                    <Button onClick={openCreate} className="gap-1">
                        <Plus className="w-4 h-4" /> Create Plan
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                {(["plans", "subscribers"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => switchTab(t)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        {t === "plans" ? "Plans" : "Subscribers"}
                    </button>
                ))}
            </div>

            {/* Plans Tab */}
            {tab === "plans" && (
                <div className="space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Plans</p>
                                    <p className="text-xl font-bold text-slate-900">{plans.length}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Active Subscribers</p>
                                    <p className="text-xl font-bold text-slate-900">
                                        {plans.reduce((sum, p) => sum + (p.subscribers_count || 0), 0)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Pricing Model</p>
                                    <p className="text-xl font-bold text-slate-900">Per Request</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Plans grid */}
                    {plans.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center">
                                <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500 mb-4">No plans created yet.</p>
                                <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Create First Plan</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {plans.map((plan) => (
                                <Card key={plan.id} className="relative">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-base">{plan.name}</CardTitle>
                                                <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                                            </div>
                                            <Badge variant={plan.status === "active" ? "success" : "default"}>
                                                {plan.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <span className="text-3xl font-bold text-slate-900">
                                                {plan.currency === "INR" ? "₹" : "$"}{plan.price}
                                            </span>
                                            <span className="text-sm text-slate-500 ml-1">
                                                /{plan.billing_cycle === "per_request" ? "request" : plan.billing_cycle}
                                            </span>
                                        </div>
                                        {plan.features && plan.features.length > 0 && (
                                            <ul className="space-y-1.5">
                                                {plan.features.slice(0, 4).map((f, i) => (
                                                    <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                                                        <span className="w-1 h-1 rounded-full bg-violet-500" />{f}
                                                    </li>
                                                ))}
                                                {plan.features.length > 4 && (
                                                    <li className="text-xs text-slate-400">+{plan.features.length - 4} more</li>
                                                )}
                                            </ul>
                                        )}
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                            <span className="text-xs text-slate-500">
                                                {plan.subscribers_count || 0} subscribers
                                            </span>
                                            <div className="flex-1" />
                                            <button onClick={() => openEdit(plan)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-violet-600">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDeletePlan(plan.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Subscribers Tab */}
            {tab === "subscribers" && (
                <Card>
                    <CardHeader><CardTitle>Active Subscriptions</CardTitle></CardHeader>
                    <CardContent>
                        {subscriptionsList.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No subscriptions yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-500">
                                            <th className="text-left px-4 py-3 font-medium">User</th>
                                            <th className="text-left px-4 py-3 font-medium">Plan</th>
                                            <th className="text-left px-4 py-3 font-medium">Status</th>
                                            <th className="text-left px-4 py-3 font-medium">Start</th>
                                            <th className="text-left px-4 py-3 font-medium">End</th>
                                            <th className="text-right px-4 py-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscriptionsList.map((sub) => (
                                            <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900">{sub.user?.name || "—"}</p>
                                                    <p className="text-xs text-slate-400">{sub.user?.email}</p>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">{sub.plan?.name || sub.planId}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={sub.status === "active" ? "success" : sub.status === "cancelled" ? "danger" : "warning"}>
                                                        {sub.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : "—"}</td>
                                                <td className="px-4 py-3 text-slate-500">{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "—"}</td>
                                                <td className="px-4 py-3 text-right">
                                                    {sub.status === "active" && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleCancelSubscription(sub.id)}>
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Create/Edit Plan Modal */}
            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                title={editingPlan ? "Edit Plan" : "Create New Plan"}
                footer={
                    <>
                        <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                            {editingPlan ? "Update" : "Create"}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name *</label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Professional" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Plan description" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price *</label>
                            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Billing Cycle</label>
                            <select
                                value={form.billing_cycle}
                                onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                                <option value="per_request">Per Request</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="one_time">One Time</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Features (one per line)</label>
                        <textarea
                            value={form.features}
                            onChange={(e) => setForm({ ...form, features: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                            placeholder={"Unlimited surveys\nAI analysis\nPriority support"}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Max Surveys</label>
                            <Input type="number" value={form.max_surveys} onChange={(e) => setForm({ ...form, max_surveys: e.target.value })} placeholder="0 = unlimited" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Max Questions</label>
                            <Input type="number" value={form.max_questions} onChange={(e) => setForm({ ...form, max_questions: e.target.value })} placeholder="0 = unlimited" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Max Responses</label>
                            <Input type="number" value={form.max_responses} onChange={(e) => setForm({ ...form, max_responses: e.target.value })} placeholder="0 = unlimited" />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
