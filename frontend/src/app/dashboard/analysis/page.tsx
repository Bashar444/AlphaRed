"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    Brain,
    Loader2,
    FileText,
} from "lucide-react";

interface Survey {
    id: string;
    title: string;
    status: string;
    _count?: { responses: number };
}

interface Report {
    id: string;
    results: unknown;
    aiNarrative: string;
    createdAt: string;
}

export default function AnalysisPage() {
    const searchParams = useSearchParams();
    const preselected = searchParams.get("survey");

    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(preselected || null);
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        api.surveys
            .list()
            .then((data) => setSurveys(Array.isArray(data) ? data as Survey[] : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedId) {
            loadReport(selectedId);
        }
    }, [selectedId]);

    async function loadReport(id: string) {
        try {
            const data = await api.analysis.show(Number(id));
            setReport(data?.report || data || null);
        } catch {
            setReport(null);
        }
    }

    async function runAnalysis() {
        if (!selectedId) return;
        setRunning(true);
        try {
            const data = await api.analysis.run(Number(selectedId));
            setReport(data?.report || data);
        } catch {
            // handle error
        } finally {
            setRunning(false);
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
                    <h1 className="text-2xl font-bold text-slate-900">Analysis</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Run statistical analysis and AI-powered insights
                    </p>
                </div>
            </div>

            {/* Survey selector */}
            <Card>
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Select Survey
                            </label>
                            <select
                                value={selectedId || ""}
                                onChange={(e) => setSelectedId(e.target.value || null)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                                <option value="">Choose a survey...</option>
                                {surveys.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.title} ({s._count?.responses || 0} responses)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="pt-6">
                            <Button onClick={runAnalysis} disabled={!selectedId || running}>
                                {running ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Brain className="w-4 h-4 mr-2" />
                                )}
                                {running ? "Running..." : "Run Analysis"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Report */}
            {report ? (
                <div className="space-y-6">
                    {/* AI Narrative */}
                    {report.aiNarrative ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-violet-600" />
                                    AI-Powered Narrative
                                    <Badge variant="info">Claude AI</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {report.aiNarrative}
                                </div>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Results */}
                    {report.results ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                                    Statistical Results
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs bg-slate-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono">
                                    {typeof report.results === "string"
                                        ? report.results
                                        : JSON.stringify(report.results, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            ) : selectedId ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            No analysis report yet
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Click &ldquo;Run Analysis&rdquo; to generate descriptive stats, correlations, and
                            AI narrative
                        </p>
                        <Button onClick={runAnalysis} disabled={running}>
                            {running ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Brain className="w-4 h-4 mr-2" />
                            )}
                            Run Analysis
                        </Button>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}
