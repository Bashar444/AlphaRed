"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, type PublicSurvey, type PublicSurveyQuestion } from "@/lib/api";
import { CheckCircle2, AlertCircle, Loader2, ChevronLeft, ChevronRight, Send } from "lucide-react";

type AnswerMap = Record<string, unknown>;

function parseOptions(opts: unknown): string[] {
    if (Array.isArray(opts)) return opts.map(String);
    if (opts && typeof opts === "object") {
        const o = opts as { choices?: unknown[]; options?: unknown[] };
        if (Array.isArray(o.choices)) return o.choices.map(String);
        if (Array.isArray(o.options)) return o.options.map(String);
    }
    return [];
}

function QuestionRenderer({
    q,
    value,
    onChange,
}: { q: PublicSurveyQuestion; value: unknown; onChange: (v: unknown) => void }) {
    const opts = useMemo(() => parseOptions(q.options), [q.options]);

    switch (q.type) {
        case "SHORT_TEXT":
        case "EMAIL":
            return (
                <input
                    type={q.type === "EMAIL" ? "email" : "text"}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Your answer..."
                />
            );
        case "LONG_TEXT":
            return (
                <textarea
                    rows={5}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Your answer..."
                />
            );
        case "NUMBER":
            return (
                <input
                    type="number"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                    value={(value as number | string) ?? ""}
                    onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
                />
            );
        case "DATE":
            return (
                <input
                    type="date"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        case "SINGLE_CHOICE":
        case "DROPDOWN":
            return (
                <div className="space-y-2">
                    {opts.map((o) => (
                        <label key={o} className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${value === o ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:bg-slate-50"}`}>
                            <input
                                type="radio"
                                className="text-violet-600"
                                checked={value === o}
                                onChange={() => onChange(o)}
                            />
                            <span className="text-slate-700">{o}</span>
                        </label>
                    ))}
                </div>
            );
        case "MULTIPLE_CHOICE": {
            const arr = Array.isArray(value) ? (value as string[]) : [];
            return (
                <div className="space-y-2">
                    {opts.map((o) => {
                        const checked = arr.includes(o);
                        return (
                            <label key={o} className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${checked ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:bg-slate-50"}`}>
                                <input
                                    type="checkbox"
                                    className="text-violet-600"
                                    checked={checked}
                                    onChange={() => onChange(checked ? arr.filter((x) => x !== o) : [...arr, o])}
                                />
                                <span className="text-slate-700">{o}</span>
                            </label>
                        );
                    })}
                </div>
            );
        }
        case "RATING": {
            const n = (value as number) || 0;
            return (
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onChange(i)}
                            className={`w-12 h-12 rounded-lg border text-lg font-semibold transition-colors ${n >= i ? "bg-violet-600 text-white border-violet-600" : "border-slate-300 text-slate-500 hover:bg-slate-50"}`}
                        >{i}</button>
                    ))}
                </div>
            );
        }
        case "LIKERT": {
            const scale = opts.length > 0 ? opts : ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];
            return (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {scale.map((s, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => onChange(s)}
                            className={`px-3 py-3 rounded-lg border text-sm transition-colors ${value === s ? "bg-violet-600 text-white border-violet-600" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
                        >{s}</button>
                    ))}
                </div>
            );
        }
        case "NET_PROMOTER":
            return (
                <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: 11 }, (_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onChange(i)}
                            className={`w-10 h-10 rounded-lg border font-semibold text-sm transition-colors ${value === i ? "bg-violet-600 text-white border-violet-600" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                        >{i}</button>
                    ))}
                </div>
            );
        default:
            return (
                <input
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
                    value={(value as string) || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Your answer..."
                />
            );
    }
}

export default function PublicSurveyTakePage() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [survey, setSurvey] = useState<PublicSurvey | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stage, setStage] = useState<"welcome" | "questions" | "done">("welcome");
    const [stepIdx, setStepIdx] = useState(0);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [optionalEmail, setOptionalEmail] = useState("");
    const [optionalName, setOptionalName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [thankYou, setThankYou] = useState<string | null>(null);
    const [startedAt, setStartedAt] = useState<number>(0);

    useEffect(() => {
        if (!id) return;
        api.publicSurveys.get(id)
            .then((s) => setSurvey(s))
            .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load survey"))
            .finally(() => setLoading(false));
    }, [id]);

    function start() {
        setStage("questions");
        setStartedAt(Date.now());
    }

    const total = survey?.questions.length || 0;
    const current = survey?.questions[stepIdx];
    const progressPct = total ? Math.round(((stepIdx + 1) / total) * 100) : 0;

    function setAnswer(qid: string, v: unknown) {
        setAnswers((prev) => ({ ...prev, [qid]: v }));
    }

    function isAnswered(q: PublicSurveyQuestion | undefined): boolean {
        if (!q) return false;
        const v = answers[q.id];
        if (v === undefined || v === null || v === "") return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
    }

    function next() {
        if (current?.required && !isAnswered(current)) {
            alert("This question is required");
            return;
        }
        if (stepIdx < total - 1) setStepIdx(stepIdx + 1);
    }

    async function submit() {
        if (!survey) return;
        if (current?.required && !isAnswered(current)) {
            alert("This question is required");
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                answers: Object.entries(answers)
                    .filter(([, v]) => v !== undefined && v !== null && v !== "")
                    .map(([questionId, value]) => ({ questionId, value })),
                durationSecs: Math.round((Date.now() - startedAt) / 1000),
                email: optionalEmail.trim() || undefined,
                name: optionalName.trim() || undefined,
            };
            const result = await api.publicSurveys.submit(survey.id, payload);
            setThankYou(result.thankYouMessage || survey.thankYouMessage || "Thank you for your response!");
            setStage("done");
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Submission failed");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading survey...
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
                <div className="max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Survey unavailable</h1>
                    <p className="text-sm text-slate-600 mb-6">{error}</p>
                    <Link href="/" className="text-sm text-violet-600 hover:underline">Back to home</Link>
                </div>
            </main>
        );
    }

    if (!survey) return null;

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="max-w-2xl mx-auto px-6 py-12">
                {stage === "welcome" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <h1 className="text-3xl font-bold text-slate-900">{survey.title}</h1>
                        {survey.description && <p className="mt-3 text-slate-600">{survey.description}</p>}
                        {survey.welcomeMessage && (
                            <div className="mt-6 p-4 rounded-lg bg-violet-50 border border-violet-100 text-slate-700 text-sm whitespace-pre-wrap">
                                {survey.welcomeMessage}
                            </div>
                        )}
                        <div className="mt-6 flex items-center gap-4 text-sm text-slate-500">
                            <span>{survey.questions.length} question{survey.questions.length === 1 ? "" : "s"}</span>
                            <span>·</span>
                            <span>~{survey.estimatedMinutes} min</span>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input value={optionalName} onChange={(e) => setOptionalName(e.target.value)} placeholder="Your name (optional)" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm" />
                            <input value={optionalEmail} onChange={(e) => setOptionalEmail(e.target.value)} type="email" placeholder="Your email (optional)" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm" />
                        </div>

                        <button onClick={start} className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors shadow-md shadow-violet-200">
                            Start survey <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {stage === "questions" && current && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        {survey.progressBar && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                    <span>Question {stepIdx + 1} of {total}</span>
                                    <span>{progressPct}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-violet-600 transition-all" style={{ width: `${progressPct}%` }} />
                                </div>
                            </div>
                        )}

                        <h2 className="text-xl font-semibold text-slate-900">
                            {current.text}
                            {current.required && <span className="text-rose-500 ml-1">*</span>}
                        </h2>
                        {current.description && <p className="mt-1 text-sm text-slate-500">{current.description}</p>}

                        <div className="mt-6">
                            <QuestionRenderer q={current} value={answers[current.id]} onChange={(v) => setAnswer(current.id, v)} />
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <button
                                onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
                                disabled={stepIdx === 0}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                            {stepIdx < total - 1 ? (
                                <button onClick={next} className="inline-flex items-center gap-1.5 px-5 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700">
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button onClick={submit} disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-50">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {submitting ? "Submitting..." : "Submit"}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {stage === "done" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900">Thank you!</h1>
                        <p className="mt-3 text-slate-600 whitespace-pre-wrap">{thankYou}</p>
                        <Link href="/" className="mt-6 inline-block text-sm text-violet-600 hover:underline">Back to home</Link>
                    </div>
                )}
            </div>
        </main>
    );
}
