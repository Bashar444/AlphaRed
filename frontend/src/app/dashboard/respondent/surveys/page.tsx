"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ClipboardList,
    Clock,
    Play,
    Loader2,
    CheckCircle2,
} from "lucide-react";

interface Invitation {
    id: string;
    surveyId: string;
    survey: {
        id: string;
        title: string;
        description: string;
        estimatedMinutes: number;
        status: string;
    };
    status: string;
    createdAt: string;
}

export default function RespondentSurveysPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const takeId = searchParams.get("take");

    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState<string | null>(null);

    useEffect(() => {
        api.respondent
            .invitations()
            .then((data) => setInvitations(Array.isArray(data) ? data : []))
            .catch(() => setInvitations([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (takeId && !loading) {
            router.push(`/dashboard/respondent/take/${takeId}`);
        }
    }, [takeId, loading, router]);

    async function handleAccept(inv: Invitation) {
        setAccepting(inv.id);
        try {
            await api.respondent.acceptInvitation(inv.id);
            router.push(`/dashboard/respondent/take/${inv.surveyId}`);
        } catch {
            setAccepting(null);
        }
    }

    const pending = invitations.filter((i) => i.status === "pending");
    const completed = invitations.filter((i) => i.status === "completed");

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
                <h1 className="text-2xl font-bold text-slate-900">Available Surveys</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Surveys you&apos;ve been invited to participate in
                </p>
            </div>

            {/* Pending */}
            {pending.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Pending ({pending.length})
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {pending.map((inv) => (
                            <Card key={inv.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                                            <ClipboardList className="w-5 h-5" />
                                        </div>
                                        <Badge variant="warning">Pending</Badge>
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                                        {inv.survey?.title || "Survey"}
                                    </h3>
                                    {inv.survey?.description && (
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                            {inv.survey.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            ~{inv.survey?.estimatedMinutes || 5} min
                                        </span>
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={() => handleAccept(inv)}
                                        disabled={accepting === inv.id}
                                    >
                                        {accepting === inv.id ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Play className="w-4 h-4 mr-2" />
                                        )}
                                        Start Survey
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Completed ({completed.length})
                    </h2>
                    <div className="space-y-2">
                        {completed.map((inv) => (
                            <Card key={inv.id}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {inv.survey?.title || "Survey"}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Completed
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="success">Done</Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {invitations.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            No surveys available
                        </h3>
                        <p className="text-sm text-slate-500">
                            When researchers invite you, their surveys will appear here
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
