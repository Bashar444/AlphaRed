"use client";

import { useAuth } from "@/lib/auth-context";
import { Bell, Search, Shield, BarChart3, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export function Topbar({ title }: { title?: string }) {
    const { user } = useAuth();

    const isAdmin = user?.role === "SUPERADMIN" || user?.role === "MANAGER" || user?.is_admin;
    const isRespondent = user?.role === "RESPONDENT";

    const roleLabel = isAdmin ? "Admin" : isRespondent ? "Respondent" : "Researcher";
    const RoleIcon = isAdmin ? Shield : isRespondent ? ClipboardList : BarChart3;

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-6 bg-white border-b border-slate-200">
            <div className="flex items-center gap-4">
                {title && <h1 className="text-lg font-semibold text-slate-900">{title}</h1>}
                {/* Role indicator */}
                <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    isAdmin ? "bg-amber-50 text-amber-700" : isRespondent ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700"
                )}>
                    <RoleIcon className="w-3 h-3" />
                    {roleLabel}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-1.5 w-56 text-sm bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500"></span>
                </button>

                {/* Avatar */}
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold",
                    isAdmin ? "bg-gradient-to-br from-amber-500 to-orange-600" : isRespondent ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-violet-500 to-indigo-600"
                )}>
                    {user?.name?.[0]?.toUpperCase()}
                </div>
            </div>
        </header>
    );
}
