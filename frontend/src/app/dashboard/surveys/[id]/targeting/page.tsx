"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, Users } from "lucide-react";

interface Targeting {
    age_min?: number;
    age_max?: number;
    gender?: string;
    location_state?: string;
    location_city?: string;
    education?: string;
    income_bracket?: string;
    occupation?: string;
    estimated_reach?: number;
}

const genders = ["", "male", "female", "other"];
const educations = [
    "",
    "high_school",
    "bachelors",
    "masters",
    "doctorate",
    "other",
];
const incomeBrackets = [
    "",
    "below_2l",
    "2l_5l",
    "5l_10l",
    "10l_20l",
    "above_20l",
];

export default function TargetingPage() {
    const params = useParams();
    const router = useRouter();
    const surveyId = Number(params.id);
    const [targeting, setTargeting] = useState<Targeting>({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const data = await api.surveys.targeting(surveyId);
            setTargeting(data || {});
        } catch {
            // no targeting yet
        } finally {
            setLoading(false);
        }
    }, [surveyId]);

    useEffect(() => {
        load();
    }, [load]);

    function set(field: string, value: string | number) {
        setTargeting((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSave() {
        setSaving(true);
        try {
            await api.surveys.saveTargeting(surveyId, targeting);
            await load();
        } finally {
            setSaving(false);
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
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push(`/dashboard/surveys/${surveyId}`)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">
                        Audience Targeting
                    </h1>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Targeting
                </Button>
            </div>

            {targeting.estimated_reach !== undefined && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-violet-50 border border-violet-200">
                    <Users className="w-5 h-5 text-violet-600" />
                    <div>
                        <p className="text-sm font-medium text-violet-900">
                            Estimated Reach:{" "}
                            <span className="text-lg font-bold">
                                {targeting.estimated_reach?.toLocaleString()}
                            </span>{" "}
                            respondents
                        </p>
                        <p className="text-xs text-violet-600">
                            Based on your current targeting criteria
                        </p>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Demographics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Min Age
                            </label>
                            <input
                                type="number"
                                min={18}
                                max={100}
                                value={targeting.age_min || ""}
                                onChange={(e) => set("age_min", Number(e.target.value))}
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Max Age
                            </label>
                            <input
                                type="number"
                                min={18}
                                max={100}
                                value={targeting.age_max || ""}
                                onChange={(e) => set("age_max", Number(e.target.value))}
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Gender
                        </label>
                        <select
                            value={targeting.gender || ""}
                            onChange={(e) => set("gender", e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="">Any</option>
                            {genders
                                .filter(Boolean)
                                .map((g) => (
                                    <option key={g} value={g}>
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Education
                        </label>
                        <select
                            value={targeting.education || ""}
                            onChange={(e) => set("education", e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="">Any</option>
                            {educations
                                .filter(Boolean)
                                .map((e) => (
                                    <option key={e} value={e}>
                                        {e.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Income Bracket
                        </label>
                        <select
                            value={targeting.income_bracket || ""}
                            onChange={(e) => set("income_bracket", e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="">Any</option>
                            {incomeBrackets
                                .filter(Boolean)
                                .map((b) => (
                                    <option key={b} value={b}>
                                        {b.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                    </option>
                                ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            State
                        </label>
                        <input
                            type="text"
                            value={targeting.location_state || ""}
                            onChange={(e) => set("location_state", e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            placeholder="e.g. Tamil Nadu"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            City
                        </label>
                        <input
                            type="text"
                            value={targeting.location_city || ""}
                            onChange={(e) => set("location_city", e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            placeholder="e.g. Chennai"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
