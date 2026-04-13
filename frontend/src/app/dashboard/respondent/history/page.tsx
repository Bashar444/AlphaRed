"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface HistoryItem {
    id: string;
    surveyId: string;
    status: string;
    qualityScore: number | null;
    durationSecs: number | null;
    completedAt: string | null;
    createdAt: string;
    survey: { id: string; title: string };
}

export default function RespondentHistoryPage() {
    const [responses, setResponses] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.respondent
            .earnings()
            .then((data) => {
                const list = data?.responses || data || [];
                setResponses(Array.isArray(list) ? list : []);
            })
            .catch(() => setResponses([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">My Responses</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Your survey response history
                </p>
            </div>

            {responses.length > 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Survey</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Quality</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Duration</th>
                                        <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {responses.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-violet-500" />
                                                    <span className="font-medium text-slate-900">
                                                        {r.survey?.title || "Survey"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge
                                                    variant={
                                                        r.status === "COMPLETED"
                                                            ? "success"
                                                            : r.status === "REJECTED"
                                                                ? "danger"
                                                                : "default"
                                                    }
                                                >
                                                    {r.status.toLowerCase()}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                {r.qualityScore != null ? r.qualityScore.toFixed(1) : "—"}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                {r.durationSecs
                                                    ? `${Math.floor(r.durationSecs / 60)}m ${r.durationSecs % 60}s`
                                                    : "—"}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500">
                                                {r.completedAt
                                                    ? new Date(r.completedAt).toLocaleDateString()
                                                    : new Date(r.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-12 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            No responses yet
                        </h3>
                        <p className="text-sm text-slate-500">
                            Complete surveys to see your response history here
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
