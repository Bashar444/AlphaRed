import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    trend?: { value: string; positive: boolean };
    className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
                    {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                    {trend && (
                        <p
                            className={cn(
                                "text-xs font-medium",
                                trend.positive ? "text-emerald-600" : "text-red-500"
                            )}
                        >
                            {trend.positive ? "↑" : "↓"} {trend.value}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
