"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { respondent as respondentApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ClipboardList,
    Clock,
    Play,
    Users,
    Building2,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface Survey {
    id: string;
    title: string;
    description: string | null;
    estimatedMinutes: number | null;
    status: string;
    launchedAt: string | null;
    endsAt: string | null;
    _count: { questions: number; responses: number };
    user: { name: string; organization: string | null };
}

export default function RespondentSurveysPage() {
    const router = useRouter();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setLoading(true);
        const params: Record<string, string> = { page: String(page), limit: "12" };
        if (search) params.search = search;

        respondentApi
            .availableSurveys(params)
            .then((data: unknown) => {
                const d = data as { surveys: Survey[]; pagination: { totalPages: number } };
                setSurveys(Array.isArray(d.surveys) ? d.surveys : []);
                setTotalPages(d.pagination?.totalPages ?? 1);
            })
            .catch(() => setSurveys([]))
            .finally(() => setLoading(false));
    }, [page, search]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Available Surveys</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Browse and take surveys from researchers
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search surveys..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
                    />
                </div>
            </div>

            {/* Survey Grid */}
            {surveys.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {surveys.map((survey) => (
                        <Card key={survey.id} className="hover:shadow-md transition-shadow group">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <ClipboardList className="w-5 h-5" />
                                    </div>
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Active
                                    </Badge>
                                </div>

                                <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">
                                    {survey.title}
                                </h3>

                                {survey.description && (
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                        {survey.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                                    {survey.estimatedMinutes && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            ~{survey.estimatedMinutes} min
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <ClipboardList className="w-3.5 h-3.5" />
                                        {survey._count.questions} questions
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5" />
                                        {survey._count.responses} responses
                                    </span>
                                </div>

                                {survey.user && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span>
                                            {survey.user.organization || survey.user.name}
                                        </span>
                                    </div>
                                )}

                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => router.push(`/dashboard/respondent/take/${survey.id}`)}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Take Survey
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-12 text-center">
                        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            No surveys available
                        </h3>
                        <p className="text-sm text-slate-500">
                            When researchers launch surveys, they will appear here for you to take
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-slate-600">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
