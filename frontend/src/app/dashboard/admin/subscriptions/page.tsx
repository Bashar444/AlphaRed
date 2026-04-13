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
    ToggleLeft,
    ToggleRight,
    Users,
    DollarSign,
    Package,
    CheckCircle2,
    XCircle,
    Clock,
} from "lucide-react";

/* Types matching real NestJS backend */
interface Plan {
    id: string;
    name: string;
    slug: string;
    description?: string;
    priceInr: number;
    priceUsd: number;
    billingCycle: string;
    isActive: boolean;
    isFeatured: boolean;
    sortOrder: number;
    trialDays: number;
    maxSurveys: number;
    maxResponses: number;
    maxQuestions: number;
    maxTeamMembers: number;
    features: string[];
    supportLevel: string;
}

interface PendingSub {
    id: string;
    userId: string;
    planId: string;
    billingCycle: string;
    status: string;
    createdAt: string;
    user?: { id: string; name: string; email: string; organization?: string };
    plan?: { name: string; priceInr: number };
}

const defaultPlanForm = {
    name: "",
    slug: "",
    description: "",
    priceInr: "",
    priceUsd: "",
    billingCycle: "MONTHLY",
    maxSurveys: "1",
    maxResponses: "50",
    maxQuestions: "10",
    maxTeamMembers: "0",
    features: "",
    supportLevel: "community",
    trialDays: "0",
    sortOrder: "0",
    isFeatured: false,
};

export default function AdminSubscriptionsPage() {
    const [tab, setTab] = useState<"plans" | "pending">("plans");
    const [plans, setPlans] = useState<Plan[]>([]);
    const [pending, setPending] = useState<PendingSub[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [form, setForm] = useState(defaultPlanForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadPlans(); }, []);

    async function loadPlans() {
        setLoading(true);
        try {
            const data = await api.plans.list(true);
            setPlans(Array.isArray(data) ? data : []);
        } catch { setPlans([]); }
        finally { setLoading(false); }
    }

    async function loadPending() {
        try {
            const data = await api.adminSubscriptions.listPending();
            const list = (data as Record<string, unknown>)?.subscriptions || data;
            setPending(Array.isArray(list) ? list : []);
        } catch { setPending([]); }
    }

    function switchTab(t: "plans" | "pending") {
        setTab(t);
        if (t === "pending" && pending.length === 0) loadPending();
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
            slug: plan.slug,
            description: plan.description || "",
            priceInr: String(plan.priceInr),
            priceUsd: String(plan.priceUsd),
            billingCycle: plan.billingCycle || "MONTHLY",
            maxSurveys: String(plan.maxSurveys),
            maxResponses: String(plan.maxResponses),
            maxQuestions: String(plan.maxQuestions),
            maxTeamMembers: String(plan.maxTeamMembers),
            features: (Array.isArray(plan.features) ? plan.features : []).join("\n"),
            supportLevel: plan.supportLevel || "community",
            trialDays: String(plan.trialDays || 0),
            sortOrder: String(plan.sortOrder || 0),
            isFeatured: plan.isFeatured,
        });
        setShowModal(true);
    }

    async function handleSave() {
        if (!form.name || !form.slug) return;
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                slug: form.slug,
                description: form.description || undefined,
                priceInr: Number(form.priceInr) || 0,
                priceUsd: Number(form.priceUsd) || 0,
                billingCycle: form.billingCycle,
                maxSurveys: Number(form.maxSurveys) || 0,
                maxResponses: Number(form.maxResponses) || 0,
                maxQuestions: Number(form.maxQuestions) || 0,
                maxTeamMembers: Number(form.maxTeamMembers) || 0,
                features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
                supportLevel: form.supportLevel,
                trialDays: Number(form.trialDays) || 0,
                sortOrder: Number(form.sortOrder) || 0,
                isFeatured: form.isFeatured,
            };
            if (editingPlan) {
                await api.plans.update(editingPlan.id, payload);
            } else {
                await api.plans.create(payload);
            }
            setShowModal(false);
            loadPlans();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to save plan");
        } finally {
            setSaving(false);
        }
    }

    async function handleToggle(id: string) {
        try {
            await api.plans.toggle(id);
            setPlans((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !p.isActive } : p));
        } catch { alert("Failed to toggle plan"); }
    }

    async function handleApprove(subscriptionId: string) {
        try {
            await api.adminSubscriptions.approve(subscriptionId);
            setPending((prev) => prev.filter((s) => s.id !== subscriptionId));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to approve");
        }
    }

    async function handleReject(subscriptionId: string) {
        const reason = prompt("Rejection reason (optional):");
        try {
            await api.adminSubscriptions.reject(subscriptionId, reason || undefined);
            setPending((prev) => prev.filter((s) => s.id !== subscriptionId));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to reject");
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Subscription Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage pricing plans and approve subscription requests</p>
                </div>
                {tab === "plans" && (
                    <Button onClick={openCreate} className="gap-1">
                        <Plus className="w-4 h-4" /> Create Plan
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                {([
                    { key: "plans" as const, label: "Plans" },
                    { key: "pending" as const, label: `Pending Approvals${pending.length ? ` (${pending.length})` : ""}` },
                ]).map((t) => (
                    <button
                        key={t.key}
                        onClick={() => switchTab(t.key)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Plans Tab */}
            {tab === "plans" && (
                <div className="space-y-4">
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
                                    <p className="text-sm text-slate-500">Active Plans</p>
                                    <p className="text-xl font-bold text-slate-900">
                                        {plans.filter((p) => p.isActive).length}
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
                                    <p className="text-sm text-slate-500">Pending Approvals</p>
                                    <p className="text-xl font-bold text-slate-900">{pending.length}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

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
                                <Card key={plan.id} className={`relative ${!plan.isActive ? "opacity-60" : ""}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-base">{plan.name}</CardTitle>
                                                <p className="text-xs text-slate-500 mt-1">{plan.slug}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Badge variant={plan.isActive ? "success" : "default"}>
                                                    {plan.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                                {plan.isFeatured && <Badge variant="info">Featured</Badge>}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <span className="text-3xl font-bold text-slate-900">
                                                {"\u20B9"}{plan.priceInr.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-slate-500 ml-1">
                                                /{plan.billingCycle === "ANNUAL" ? "year" : "month"}
                                            </span>
                                            {plan.priceUsd > 0 && (
                                                <span className="text-xs text-slate-400 ml-2">(${plan.priceUsd})</span>
                                            )}
                                        </div>
                                        {plan.description && (
                                            <p className="text-xs text-slate-500">{plan.description}</p>
                                        )}
                                        <div className="text-xs text-slate-500 space-y-0.5">
                                            <p>{plan.maxSurveys} surveys &bull; {plan.maxResponses} responses &bull; {plan.maxQuestions} questions</p>
                                            {plan.maxTeamMembers > 0 && <p>{plan.maxTeamMembers} team members</p>}
                                            {plan.trialDays > 0 && <p>{plan.trialDays}-day trial</p>}
                                            <p>Support: {plan.supportLevel}</p>
                                        </div>
                                        {Array.isArray(plan.features) && plan.features.length > 0 && (
                                            <ul className="space-y-1.5">
                                                {plan.features.slice(0, 4).map((f, i) => (
                                                    <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                                                        <span className="w-1 h-1 rounded-full bg-violet-500" />{String(f)}
                                                    </li>
                                                ))}
                                                {plan.features.length > 4 && (
                                                    <li className="text-xs text-slate-400">+{plan.features.length - 4} more</li>
                                                )}
                                            </ul>
                                        )}
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                            <div className="flex-1" />
                                            <button onClick={() => openEdit(plan)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-violet-600" title="Edit">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleToggle(plan.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-600" title={plan.isActive ? "Deactivate" : "Activate"}>
                                                {plan.isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Pending Approvals Tab */}
            {tab === "pending" && (
                <Card>
                    <CardHeader><CardTitle>Pending Subscription Requests</CardTitle></CardHeader>
                    <CardContent>
                        {pending.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">No pending subscription requests.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-500">
                                            <th className="text-left px-4 py-3 font-medium">User</th>
                                            <th className="text-left px-4 py-3 font-medium">Plan</th>
                                            <th className="text-left px-4 py-3 font-medium">Billing</th>
                                            <th className="text-left px-4 py-3 font-medium">Requested</th>
                                            <th className="text-right px-4 py-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pending.map((sub) => (
                                            <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900">{sub.user?.name || "\u2014"}</p>
                                                    <p className="text-xs text-slate-400">{sub.user?.email}</p>
                                                    {sub.user?.organization && (
                                                        <p className="text-xs text-slate-400">{sub.user.organization}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-slate-700">{sub.plan?.name || sub.planId}</p>
                                                    {sub.plan?.priceInr !== undefined && (
                                                        <p className="text-xs text-slate-400">{"\u20B9"}{sub.plan.priceInr}/mo</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{sub.billingCycle}</td>
                                                <td className="px-4 py-3 text-slate-500">
                                                    {new Date(sub.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-emerald-600 hover:bg-emerald-50 gap-1"
                                                            onClick={() => handleApprove(sub.id)}
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-500 hover:bg-red-50 gap-1"
                                                            onClick={() => handleReject(sub.id)}
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" /> Reject
                                                        </Button>
                                                    </div>
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
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name *</label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Professional" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
                            <Input
                                value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                                placeholder="e.g. professional"
                                disabled={!!editingPlan}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Plan description" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price INR *</label>
                            <Input type="number" value={form.priceInr} onChange={(e) => setForm({ ...form, priceInr: e.target.value })} placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price USD</label>
                            <Input type="number" value={form.priceUsd} onChange={(e) => setForm({ ...form, priceUsd: e.target.value })} placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Billing Cycle</label>
                            <select
                                value={form.billingCycle}
                                onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="ANNUAL">Annual</option>
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
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Max Surveys</label>
                            <Input type="number" value={form.maxSurveys} onChange={(e) => setForm({ ...form, maxSurveys: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Max Responses</label>
                            <Input type="number" value={form.maxResponses} onChange={(e) => setForm({ ...form, maxResponses: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Max Questions</label>
                            <Input type="number" value={form.maxQuestions} onChange={(e) => setForm({ ...form, maxQuestions: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Max Team Members</label>
                            <Input type="number" value={form.maxTeamMembers} onChange={(e) => setForm({ ...form, maxTeamMembers: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Trial Days</label>
                            <Input type="number" value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Sort Order</label>
                            <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Support Level</label>
                            <select
                                value={form.supportLevel}
                                onChange={(e) => setForm({ ...form, supportLevel: e.target.value })}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                            >
                                <option value="community">Community</option>
                                <option value="email">Email</option>
                                <option value="priority">Priority</option>
                                <option value="dedicated">Dedicated</option>
                            </select>
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.isFeatured}
                            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                            className="rounded border-slate-300"
                        />
                        Mark as featured/popular plan
                    </label>
                </div>
            </Modal>
        </div>
    );
}
