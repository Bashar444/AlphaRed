"use client";

import { useAuth } from "@/lib/auth-context";
import { Bell, Search } from "lucide-react";

export function Topbar({ title }: { title?: string }) {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200">
            <div className="flex items-center gap-4">
                {title && <h1 className="text-xl font-semibold text-slate-900">{title}</h1>}
            </div>

            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-2 w-64 text-sm bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500"></span>
                </button>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                    {user?.name?.[0]}
                </div>
            </div>
        </header>
    );
}
