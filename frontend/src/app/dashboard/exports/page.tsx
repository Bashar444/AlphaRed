"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Download,
    FileSpreadsheet,
    FileText,
    FileArchive,
    Loader2,
} from "lucide-react";

interface Survey {
    id: number;
    title: string;
    response_count: number;
}

interface ExportItem {
    id: number;
    format: string;
    file_url: string;
    created_at: string;
}

const formatIcons: Record<string, React.ReactNode> = {
    csv: <FileSpreadsheet className="w-5 h-5 text-emerald-600" />,
    xls: <FileSpreadsheet className="w-5 h-5 text-green-600" />,
    pdf: <FileText className="w-5 h-5 text-red-500" />,
    zip: <FileArchive className="w-5 h-5 text-amber-600" />,
};

const formats = [
    { value: "csv", label: "CSV" },
    { value: "xls", label: "Excel" },
    { value: "pdf", label: "PDF Report" },
    { value: "zip", label: "ZIP Bundle" },
];

export default function ExportsPage() {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [exports, setExports] = useState<ExportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);

    useEffect(() => {
        api.surveys
            .list()
            .then((data: Survey[]) => setSurveys(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedId) loadExports(selectedId);
    }, [selectedId]);

    async function loadExports(id: number) {
        try {
            const data = await api.exports_.list(id);
            setExports(data || []);
        } catch {
            setExports([]);
        }
    }

    async function generate(format: string) {
        if (!selectedId) return;
        setGenerating(format);
        try {
            const result = await api.exports_.generate(selectedId, format);
            if (result.download_url) {
                window.open(result.download_url, "_blank");
            }
            await loadExports(selectedId);
        } catch {
            // handle error
        } finally {
            setGenerating(null);
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
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Exports</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Download your survey data in multiple formats
                </p>
            </div>

            {/* Survey selector */}
            <Card>
                <CardContent className="p-5">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Select Survey
                    </label>
                    <select
                        value={selectedId || ""}
                        onChange={(e) => setSelectedId(Number(e.target.value) || null)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="">Choose a survey...</option>
                        {surveys.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.title} ({s.response_count || 0} responses)
                            </option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            {/* Export buttons */}
            {selectedId && (
                <div className="grid md:grid-cols-4 gap-4">
                    {formats.map((f) => (
                        <Card key={f.value} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5 text-center">
                                <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3">
                                    {formatIcons[f.value]}
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                                    {f.label}
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => generate(f.value)}
                                    disabled={generating === f.value}
                                    className="mt-3 w-full"
                                >
                                    {generating === f.value ? (
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4 mr-1" />
                                    )}
                                    Download
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Export history */}
            {selectedId && exports.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Export History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-slate-100">
                            {exports.map((exp) => (
                                <div
                                    key={exp.id}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        {formatIcons[exp.format]}
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {exp.format.toUpperCase()} Export
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(exp.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="success">Complete</Badge>
                                        {exp.file_url && (
                                            <a
                                                href={exp.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
