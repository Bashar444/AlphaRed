"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { team } from "@/lib/api";
import { Loader2, Users } from "lucide-react";

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    job_title: string;
    image: string;
    status: string;
    [key: string]: unknown;
}

export default function TeamPage() {
    const [data, setData] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        team.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Team Members</h1>
            </div>

            {data.length === 0 ? (
                <EmptyState title="No team members" icon={<Users className="w-6 h-6 text-slate-500" />} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {data.map((m) => (
                        <Card key={m.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 text-xl font-bold">
                                    {m.first_name?.[0]}{m.last_name?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{m.first_name} {m.last_name}</p>
                                    <p className="text-xs text-slate-500">{m.job_title || "Team Member"}</p>
                                    <p className="text-xs text-slate-400 mt-1">{m.email}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                    {m.status || "active"}
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
