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

interface QuestionOption {
    label: string;
    value: string;
}

interface Question {
    id?: string;
    text: string;
    type: string;
    description?: string;
    options?: QuestionOption[] | null;
    required: boolean;
    order: number;
}

interface Survey {
    id: string;
    title: string;
    description: string;
    status: string;
    questions?: Question[];
}

const questionTypes = [
    { value: "SINGLE_CHOICE", label: "Single Choice" },
    { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
    { value: "SHORT_TEXT", label: "Short Text" },
    { value: "LONG_TEXT", label: "Long Text" },
    { value: "RATING", label: "Rating (1-5)" },
    { value: "LIKERT", label: "Likert Scale" },
    { value: "DROPDOWN", label: "Dropdown" },
    { value: "NUMBER", label: "Number" },
    { value: "DATE", label: "Date" },
    { value: "YES_NO", label: "Yes / No" },
    { value: "NET_PROMOTER", label: "Net Promoter Score" },
    { value: "SLIDER", label: "Slider" },
    { value: "MATRIX", label: "Matrix" },
    { value: "RANKING", label: "Ranking" },
];

const choiceTypes = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN", "LIKERT", "RANKING", "IMAGE_CHOICE"];

export default function SurveyBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const surveyId = params.id as string;

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [launching, setLaunching] = useState(false);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const s = await api.surveys.get(surveyId);
            setSurvey(s);
            setTitle(s.title);
            setDescription(s.description || "");
            setQuestions(s.questions || []);
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
            // Bulk update questions
            const payload = questions.map((q, idx) => ({
                type: q.type,
                text: q.text,
                description: q.description || undefined,
                required: q.required,
                order: idx + 1,
                options: q.options && q.options.length > 0 ? q.options : undefined,
            }));
            await api.surveys.updateQuestions(surveyId, payload);
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
                text: "",
                type: "SINGLE_CHOICE",
                description: "",
                options: [{ label: "Option 1", value: "option_1" }],
                required: true,
                order: prev.length + 1,
            },
        ]);
    }

    function updateQuestion(index: number, field: string, value: unknown) {
        setQuestions((prev) =>
            prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
        );
    }

    function removeQuestion(index: number) {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    }

    function addOption(qIdx: number) {
        setQuestions((prev) =>
            prev.map((q, i) => {
                if (i !== qIdx) return q;
                const opts = [...(q.options || [])];
                const n = opts.length + 1;
                opts.push({ label: `Option ${n}`, value: `option_${n}` });
                return { ...q, options: opts };
            })
        );
    }

    function updateOption(qIdx: number, optIdx: number, label: string) {
        setQuestions((prev) =>
            prev.map((q, i) => {
                if (i !== qIdx) return q;
                const opts = [...(q.options || [])];
                opts[optIdx] = { ...opts[optIdx], label, value: label.toLowerCase().replace(/\s+/g, "_") };
                return { ...q, options: opts };
            })
        );
    }

    function removeOption(qIdx: number, optIdx: number) {
        setQuestions((prev) =>
            prev.map((q, i) => {
                if (i !== qIdx) return q;
                const opts = (q.options || []).filter((_, j) => j !== optIdx);
                return { ...q, options: opts };
            })
        );
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
                            {survey && <Badge variant={survey.status === "ACTIVE" ? "success" : "default"}>
                                {survey.status.toLowerCase()}
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
                    {survey?.status === "DRAFT" && (
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
                                            value={q.type}
                                            onChange={(e) =>
                                                updateQuestion(idx, "type", e.target.value)
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
                                                checked={q.required}
                                                onChange={(e) =>
                                                    updateQuestion(idx, "required", e.target.checked)
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
                                        value={q.text}
                                        onChange={(e) =>
                                            updateQuestion(idx, "text", e.target.value)
                                        }
                                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        placeholder="Enter your question..."
                                    />

                                    <input
                                        type="text"
                                        value={q.description || ""}
                                        onChange={(e) =>
                                            updateQuestion(idx, "description", e.target.value)
                                        }
                                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        placeholder="Optional description or help text..."
                                    />

                                    {choiceTypes.includes(q.type) && (
                                        <div className="space-y-2">
                                            <label className="block text-xs text-slate-500">Options</label>
                                            {(q.options || []).map((opt, optIdx) => (
                                                <div key={optIdx} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={opt.label}
                                                        onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                                                        className="flex-1 h-8 px-3 rounded border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                        placeholder={`Option ${optIdx + 1}`}
                                                    />
                                                    <button
                                                        onClick={() => removeOption(idx, optIdx)}
                                                        className="p-1 text-slate-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addOption(idx)}
                                                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                                            >
                                                + Add option
                                            </button>
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
