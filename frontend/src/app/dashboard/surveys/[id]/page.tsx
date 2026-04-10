"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Plus,
    Trash2,
    GripVertical,
    Save,
    Rocket,
    Target,
    Loader2,
} from "lucide-react";

interface Question {
    id?: number;
    question_text: string;
    question_type: string;
    options?: string;
    is_required: number;
    sort_order: number;
}

interface Survey {
    id: number;
    title: string;
    description: string;
    status: string;
}

const questionTypes = [
    { value: "multiple_choice", label: "Multiple Choice" },
    { value: "single_choice", label: "Single Choice" },
    { value: "text", label: "Short Text" },
    { value: "textarea", label: "Long Text" },
    { value: "rating", label: "Rating (1–5)" },
    { value: "likert", label: "Likert Scale" },
    { value: "dropdown", label: "Dropdown" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
];

export default function SurveyBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const surveyId = Number(params.id);

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [launching, setLaunching] = useState(false);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const [s, q] = await Promise.all([
                api.surveys.get(surveyId),
                api.surveys.questions(surveyId),
            ]);
            setSurvey(s);
            setTitle(s.title);
            setDescription(s.description || "");
            setQuestions(q || []);
        } catch {
            router.push("/dashboard/surveys");
        } finally {
            setLoading(false);
        }
    }, [surveyId, router]);

    useEffect(() => {
        load();
    }, [load]);

    async function handleSave() {
        setSaving(true);
        try {
            await api.surveys.update(surveyId, { title, description });
            // Save questions
            for (const q of questions) {
                const payload = { ...q } as Record<string, unknown>;
                if (q.id) {
                    await api.surveys.updateQuestion(surveyId, q.id, payload);
                } else {
                    const created = await api.surveys.addQuestion(surveyId, payload);
                    q.id = created.id;
                }
            }
            await load();
        } finally {
            setSaving(false);
        }
    }

    async function handleLaunch() {
        if (!confirm("Launch this survey? It will become live and start collecting responses."))
            return;
        setLaunching(true);
        try {
            await api.surveys.launch(surveyId, {});
            await load();
        } finally {
            setLaunching(false);
        }
    }

    function addQuestion() {
        setQuestions((prev) => [
            ...prev,
            {
                question_text: "",
                question_type: "single_choice",
                options: "",
                is_required: 1,
                sort_order: prev.length + 1,
            },
        ]);
    }

    function updateQuestion(index: number, field: string, value: string | number) {
        setQuestions((prev) =>
            prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
        );
    }

    async function removeQuestion(index: number) {
        const q = questions[index];
        if (q.id) {
            await api.surveys.deleteQuestion(surveyId, q.id);
        }
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/dashboard/surveys")}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900">Survey Builder</h1>
                            {survey && <Badge variant={survey.status === "live" ? "success" : "default"}>
                                {survey.status}
                            </Badge>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/surveys/${surveyId}/targeting`)}
                    >
                        <Target className="w-4 h-4 mr-2" /> Targeting
                    </Button>
                    {survey?.status === "draft" && (
                        <Button onClick={handleLaunch} disabled={launching}>
                            {launching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                            Launch
                        </Button>
                    )}
                </div>
            </div>

            {/* Survey details */}
            <Card>
                <CardHeader>
                    <CardTitle>Survey Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-11 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            placeholder="Survey title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                            placeholder="Describe your survey..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Questions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Questions ({questions.length})
                    </h2>
                    <Button variant="outline" size="sm" onClick={addQuestion}>
                        <Plus className="w-4 h-4 mr-1" /> Add Question
                    </Button>
                </div>

                {questions.map((q, idx) => (
                    <Card key={idx}>
                        <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                                <div className="pt-2 text-slate-300 cursor-grab">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                            Q{idx + 1}
                                        </span>
                                        <select
                                            value={q.question_type}
                                            onChange={(e) =>
                                                updateQuestion(idx, "question_type", e.target.value)
                                            }
                                            className="h-8 px-2 rounded border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        >
                                            {questionTypes.map((t) => (
                                                <option key={t.value} value={t.value}>
                                                    {t.label}
                                                </option>
                                            ))}
                                        </select>
                                        <label className="flex items-center gap-1.5 text-xs text-slate-500 ml-auto">
                                            <input
                                                type="checkbox"
                                                checked={q.is_required === 1}
                                                onChange={(e) =>
                                                    updateQuestion(
                                                        idx,
                                                        "is_required",
                                                        e.target.checked ? 1 : 0
                                                    )
                                                }
                                                className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                            />
                                            Required
                                        </label>
                                        <button
                                            onClick={() => removeQuestion(idx)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        value={q.question_text}
                                        onChange={(e) =>
                                            updateQuestion(idx, "question_text", e.target.value)
                                        }
                                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        placeholder="Enter your question..."
                                    />

                                    {["multiple_choice", "single_choice", "dropdown", "likert"].includes(
                                        q.question_type
                                    ) && (
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">
                                                    Options (one per line)
                                                </label>
                                                <textarea
                                                    value={q.options || ""}
                                                    onChange={(e) =>
                                                        updateQuestion(idx, "options", e.target.value)
                                                    }
                                                    rows={4}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none font-mono"
                                                    placeholder={"Option 1\nOption 2\nOption 3"}
                                                />
                                            </div>
                                        )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {questions.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-sm text-slate-500 mb-4">
                                No questions yet. Start building your survey.
                            </p>
                            <Button variant="outline" onClick={addQuestion}>
                                <Plus className="w-4 h-4 mr-2" /> Add First Question
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
