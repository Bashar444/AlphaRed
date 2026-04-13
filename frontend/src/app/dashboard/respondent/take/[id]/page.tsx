"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Loader2,
    Send,
    Star,
} from "lucide-react";

interface Option {
    label: string;
    value: string;
}

interface Question {
    id: string;
    type: string;
    text: string;
    description?: string;
    required: boolean;
    order: number;
    options?: Option[];
    validation?: Record<string, unknown>;
}

interface Survey {
    id: string;
    title: string;
    description: string;
    questions: Question[];
}

export default function TakeSurveyPage() {
    const params = useParams();
    const router = useRouter();
    const surveyId = params.id as string;

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [answers, setAnswers] = useState<Record<string, unknown>>({});
    const [currentIdx, setCurrentIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        api.respondent
            .startSurvey(surveyId)
            .then((data) => {
                const s = data?.survey || data;
                setSurvey(s);
            })
            .catch(() => {
                // fallback: fetch survey directly
                api.surveys.get(surveyId).then((s) => setSurvey(s)).catch(() => null);
            })
            .finally(() => setLoading(false));
    }, [surveyId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <p className="text-lg text-slate-600 mb-4">Survey not found or unavailable</p>
                <Button variant="outline" onClick={() => router.push("/dashboard/respondent/surveys")}>
                    Back to Surveys
                </Button>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank you!</h2>
                <p className="text-slate-600 mb-6">Your response has been submitted successfully.</p>
                <Button onClick={() => router.push("/dashboard/respondent/surveys")}>
                    Back to Surveys
                </Button>
            </div>
        );
    }

    const questions = [...(survey.questions || [])].sort((a, b) => a.order - b.order);
    const question = questions[currentIdx];
    const total = questions.length;
    const progress = total > 0 ? ((currentIdx + 1) / total) * 100 : 0;

    function setAnswer(qId: string, value: unknown) {
        setAnswers((prev) => ({ ...prev, [qId]: value }));
    }

    function canProceed(): boolean {
        if (!question) return false;
        if (!question.required) return true;
        const a = answers[question.id];
        if (a === undefined || a === null || a === "") return false;
        if (Array.isArray(a) && a.length === 0) return false;
        return true;
    }

    async function handleSubmit() {
        setSubmitting(true);
        try {
            const formatted = questions.map((q) => ({
                questionId: q.id,
                value: answers[q.id] ?? null,
            }));
            await api.respondent.submitResponse(surveyId, { answers: formatted });
            setSubmitted(true);
        } catch {
            alert("Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900">{survey.title}</h1>
                {survey.description && (
                    <p className="text-sm text-slate-500 mt-1">{survey.description}</p>
                )}
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                    <span>
                        Question {currentIdx + 1} of {total}
                    </span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-violet-600 transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            {question && (
                <Card className="shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <div className="flex items-start gap-2">
                                <Badge variant="default" className="mt-0.5 text-xs shrink-0">
                                    {question.type.replace(/_/g, " ")}
                                </Badge>
                                {question.required && (
                                    <span className="text-red-500 text-sm">*</span>
                                )}
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 mt-2">
                                {question.text}
                            </h2>
                            {question.description && (
                                <p className="text-sm text-slate-500 mt-1">
                                    {question.description}
                                </p>
                            )}
                        </div>

                        <QuestionInput
                            question={question}
                            value={answers[question.id]}
                            onChange={(v) => setAnswer(question.id, v)}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((i) => i - 1)}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>

                {currentIdx < total - 1 ? (
                    <Button
                        disabled={!canProceed()}
                        onClick={() => setCurrentIdx((i) => i + 1)}
                    >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        disabled={!canProceed() || submitting}
                        onClick={handleSubmit}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {submitting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 mr-2" />
                        )}
                        Submit
                    </Button>
                )}
            </div>
        </div>
    );
}

/* ========================== Question Input Renderer ========================== */

function QuestionInput({
    question,
    value,
    onChange,
}: {
    question: Question;
    value: unknown;
    onChange: (v: unknown) => void;
}) {
    const t = question.type;

    /* ---------- SHORT_TEXT ---------- */
    if (t === "SHORT_TEXT" || t === "EMAIL") {
        return (
            <input
                type={t === "EMAIL" ? "email" : "text"}
                value={(value as string) || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Your answer…"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
        );
    }

    /* ---------- LONG_TEXT ---------- */
    if (t === "LONG_TEXT") {
        return (
            <textarea
                value={(value as string) || ""}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                placeholder="Your answer…"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
            />
        );
    }

    /* ---------- NUMBER / SLIDER ---------- */
    if (t === "NUMBER" || t === "SLIDER") {
        return (
            <input
                type="number"
                value={(value as string) || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="0"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
        );
    }

    /* ---------- DATE ---------- */
    if (t === "DATE") {
        return (
            <input
                type="date"
                value={(value as string) || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
        );
    }

    /* ---------- YES_NO ---------- */
    if (t === "YES_NO") {
        return (
            <div className="flex gap-4">
                {["Yes", "No"].map((opt) => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt.toLowerCase())}
                        className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            value === opt.toLowerCase()
                                ? "border-violet-600 bg-violet-50 text-violet-700"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        );
    }

    /* ---------- SINGLE_CHOICE / DROPDOWN ---------- */
    if (t === "SINGLE_CHOICE" || t === "DROPDOWN") {
        const opts = question.options || [];

        if (t === "DROPDOWN") {
            return (
                <select
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                    <option value="">Select…</option>
                    {opts.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            );
        }

        return (
            <div className="space-y-2">
                {opts.map((o) => (
                    <button
                        key={o.value}
                        onClick={() => onChange(o.value)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-colors ${
                            value === o.value
                                ? "border-violet-600 bg-violet-50 text-violet-700 font-medium"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                    >
                        {o.label}
                    </button>
                ))}
            </div>
        );
    }

    /* ---------- MULTIPLE_CHOICE ---------- */
    if (t === "MULTIPLE_CHOICE") {
        const selected = Array.isArray(value) ? (value as string[]) : [];
        const opts = question.options || [];

        const toggle = (v: string) => {
            const next = selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v];
            onChange(next);
        };

        return (
            <div className="space-y-2">
                {opts.map((o) => {
                    const checked = selected.includes(o.value);
                    return (
                        <button
                            key={o.value}
                            onClick={() => toggle(o.value)}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm flex items-center gap-3 transition-colors ${
                                checked
                                    ? "border-violet-600 bg-violet-50 text-violet-700"
                                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                        >
                            <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                    checked
                                        ? "border-violet-600 bg-violet-600"
                                        : "border-slate-300"
                                }`}
                            >
                                {checked && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            {o.label}
                        </button>
                    );
                })}
            </div>
        );
    }

    /* ---------- RATING / NET_PROMOTER ---------- */
    if (t === "RATING" || t === "NET_PROMOTER") {
        const max = t === "NET_PROMOTER" ? 10 : 5;
        const current = typeof value === "number" ? value : 0;

        return (
            <div className="flex items-center gap-2 flex-wrap">
                {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                    <button
                        key={n}
                        onClick={() => onChange(n)}
                        className={`w-10 h-10 rounded-lg border-2 text-sm font-medium transition-colors flex items-center justify-center ${
                            n <= current
                                ? "border-violet-600 bg-violet-600 text-white"
                                : "border-slate-200 text-slate-600 hover:border-violet-300"
                        }`}
                    >
                        {t === "RATING" ? <Star className="w-4 h-4" /> : n}
                    </button>
                ))}
                {current > 0 && (
                    <span className="text-sm text-slate-500 ml-2">{current} / {max}</span>
                )}
            </div>
        );
    }

    /* ---------- LIKERT ---------- */
    if (t === "LIKERT") {
        const scale = [
            "Strongly Disagree",
            "Disagree",
            "Neutral",
            "Agree",
            "Strongly Agree",
        ];
        return (
            <div className="flex gap-2 flex-wrap">
                {scale.map((label, i) => (
                    <button
                        key={label}
                        onClick={() => onChange(i + 1)}
                        className={`px-3 py-2 rounded-lg border-2 text-xs font-medium transition-colors ${
                            value === i + 1
                                ? "border-violet-600 bg-violet-50 text-violet-700"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        );
    }

    /* ---------- RANKING ---------- */
    if (t === "RANKING") {
        const opts = question.options || [];
        const ranked = Array.isArray(value) ? (value as string[]) : [];

        const addToRank = (v: string) => {
            if (ranked.includes(v)) {
                onChange(ranked.filter((r) => r !== v));
            } else {
                onChange([...ranked, v]);
            }
        };

        return (
            <div className="space-y-2">
                <p className="text-xs text-slate-500">Click items in your preferred order</p>
                {opts.map((o) => {
                    const idx = ranked.indexOf(o.value);
                    return (
                        <button
                            key={o.value}
                            onClick={() => addToRank(o.value)}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm flex items-center gap-3 transition-colors ${
                                idx >= 0
                                    ? "border-violet-600 bg-violet-50 text-violet-700"
                                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                        >
                            <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">
                                {idx >= 0 ? idx + 1 : "—"}
                            </span>
                            {o.label}
                        </button>
                    );
                })}
            </div>
        );
    }

    /* ---------- MATRIX ---------- */
    if (t === "MATRIX") {
        const opts = question.options || [];
        const cols = ["1", "2", "3", "4", "5"];
        const current = (value as Record<string, string>) || {};

        const setCell = (row: string, col: string) => {
            onChange({ ...current, [row]: col });
        };

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="text-left py-2"></th>
                            {cols.map((c) => (
                                <th key={c} className="py-2 text-center text-slate-500">
                                    {c}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {opts.map((o) => (
                            <tr key={o.value} className="border-t border-slate-100">
                                <td className="py-2 pr-4 text-slate-700">{o.label}</td>
                                {cols.map((c) => (
                                    <td key={c} className="py-2 text-center">
                                        <button
                                            onClick={() => setCell(o.value, c)}
                                            className={`w-6 h-6 rounded-full border-2 ${
                                                current[o.value] === c
                                                    ? "border-violet-600 bg-violet-600"
                                                    : "border-slate-300 hover:border-violet-400"
                                            }`}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    /* ---------- IMAGE_CHOICE ---------- */
    if (t === "IMAGE_CHOICE") {
        const opts = question.options || [];
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {opts.map((o) => (
                    <button
                        key={o.value}
                        onClick={() => onChange(o.value)}
                        className={`p-3 rounded-lg border-2 text-center text-sm transition-colors ${
                            value === o.value
                                ? "border-violet-600 bg-violet-50"
                                : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                        {o.label}
                    </button>
                ))}
            </div>
        );
    }

    /* ---------- FILE_UPLOAD ---------- */
    if (t === "FILE_UPLOAD") {
        return (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <p className="text-sm text-slate-500">
                    File upload — coming soon
                </p>
            </div>
        );
    }

    /* ---------- Fallback ---------- */
    return (
        <input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your answer…"
            className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
    );
}
