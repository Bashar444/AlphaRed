"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Download,
    BarChart3,
    Users,
    Clock,
    CheckCircle,
    FileText,
    Loader2,
} from "lucide-react";

interface ResponseItem {
    id: string;
    respondentId: string;
    respondent?: { first_name?: string; last_name?: string; email?: string };
    status: string;
    qualityScore?: number;
    completedAt?: string;
    createdAt: string;
    answers?: { questionId: string; value: unknown }[];
}

interface Survey {
    id: string;
    title: string;
    status: string;
    questions?: { id: string; text: string; type: string }[];
}

export default function SurveyResponsesPage() {
    const params = useParams();
    const router = useRouter();
    const surveyId = params.id as string;

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [responses, setResponses] = useState<ResponseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [runningAnalysis, setRunningAnalysis] = useState(false);

    const load = useCallback(async () => {
        try {
            const [s, r] = await Promise.all([
                api.surveys.get(surveyId),
                api.responses.list(Number(surveyId)),
            ]);
            setSurvey(s);
            setResponses(Array.isArray(r) ? r : []);
        } catch {
            /* ignore */
        } finally {
            setLoading(false);
        }
    }, [surveyId]);

    useEffect(() => { load(); }, [load]);

    async function handleExport(format: string) {
        setExporting(true);
        try {
            await api.exports.generate(Number(surveyId), format);
            alert(`${format.toUpperCase()} export started. Check exports list.`);
        } catch {
            alert("Export failed");
        } finally {
            setExporting(false);
        }
    }

    async function handleRunAnalysis() {
        setRunningAnalysis(true);
        try {
            await api.analysis.run(Number(surveyId));
            alert("Analysis complete!");
        } catch {
            alert("Analysis failed");
        } finally {
            setRunningAnalysis(false);
        }
    }

    const completedCount = responses.filter((r) => r.status === "completed" || r.completedAt).length;
    const avgQuality = responses.length > 0
        ? (responses.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / responses.length).toFixed(1)
        : "—";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push(`/dashboard/surveys/${surveyId}`)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Responses</h1>
                        <p className="text-sm text-slate-500">{survey?.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleRunAnalysis} disabled={runningAnalysis}>
                        {runningAnalysis ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-1" />}
                        Run Analysis
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={exporting}>
                        <Download className="w-4 h-4 mr-1" /> Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport("xlsx")} disabled={exporting}>
                        <FileText className="w-4 h-4 mr-1" /> Export Excel
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Responses</p>
                            <p className="text-xl font-bold text-slate-900">{responses.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Completed</p>
                            <p className="text-xl font-bold text-slate-900">{completedCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">In Progress</p>
                            <p className="text-xl font-bold text-slate-900">{responses.length - completedCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Avg Quality</p>
                            <p className="text-xl font-bold text-slate-900">{avgQuality}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Response Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Responses</CardTitle>
                </CardHeader>
                <CardContent>
                    {responses.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">No responses yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Share your survey link to start collecting responses.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500">
                                        <th className="text-left px-4 py-3 font-medium">Respondent</th>
                                        <th className="text-left px-4 py-3 font-medium">Status</th>
                                        <th className="text-left px-4 py-3 font-medium">Quality</th>
                                        <th className="text-left px-4 py-3 font-medium">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {responses.map((r) => (
                                        <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <p className="text-slate-900 font-medium">
                                                    {r.respondent?.first_name
                                                        ? `${r.respondent.first_name} ${r.respondent.last_name || ""}`
                                                        : `Respondent #${r.respondentId?.slice(0, 8) || r.id.slice(0, 8)}`}
                                                </p>
                                                {r.respondent?.email && (
                                                    <p className="text-xs text-slate-400">{r.respondent.email}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={r.completedAt || r.status === "completed" ? "success" : "warning"}>
                                                    {r.completedAt || r.status === "completed" ? "Completed" : "In Progress"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.qualityScore !== undefined && r.qualityScore !== null ? (
                                                    <span className={`font-medium ${r.qualityScore >= 80 ? "text-emerald-600" : r.qualityScore >= 50 ? "text-amber-600" : "text-red-600"}`}>
                                                        {r.qualityScore}%
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {r.completedAt
                                                    ? new Date(r.completedAt).toLocaleDateString()
                                                    : new Date(r.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
