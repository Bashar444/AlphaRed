"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Bell, Search, Shield, BarChart3, ClipboardList, Layers, Menu, User, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const portalLinks = [
    { href: "/dashboard/admin", label: "Admin Portal", icon: Shield, color: "text-amber-600 bg-amber-50" },
    { href: "/dashboard", label: "Researcher Portal", icon: BarChart3, color: "text-violet-600 bg-violet-50" },
    { href: "/dashboard/respondent", label: "Respondent Portal", icon: ClipboardList, color: "text-emerald-600 bg-emerald-50" },
];

export function Topbar({ title, onMenuClick }: { title?: string; onMenuClick?: () => void }) {
    const { user, logout } = useAuth();
    const [portalOpen, setPortalOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const portalRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const isAdmin = user?.role === "SUPERADMIN" || user?.role === "MANAGER" || user?.is_admin;
    const isRespondent = user?.role === "RESPONDENT";

    const roleLabel = isAdmin ? "Admin" : isRespondent ? "Respondent" : "Researcher";
    const RoleIcon = isAdmin ? Shield : isRespondent ? ClipboardList : BarChart3;
    const profileHref = isRespondent ? "/dashboard/respondent/profile" : "/dashboard/profile";

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (portalRef.current && !portalRef.current.contains(e.target as Node)) setPortalOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-3 sm:px-6 bg-white border-b border-slate-200">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                )}
                {title && <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">{title}</h1>}
                {/* Role indicator */}
                <div className={cn(
                    "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    isAdmin ? "bg-amber-50 text-amber-700" : isRespondent ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700"
                )}>
                    <RoleIcon className="w-3 h-3" />
                    {roleLabel}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                {/* Portal Switcher (Admin only) */}
                {isAdmin && (
                    <div className="relative hidden sm:block" ref={portalRef}>
                        <button
                            onClick={() => setPortalOpen(!portalOpen)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            Switch Portal
                        </button>
                        {portalOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-50">
                                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Portals</p>
                                {portalLinks.map((p) => (
                                    <Link
                                        key={p.href}
                                        href={p.href}
                                        onClick={() => setPortalOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", p.color)}>
                                            <p.icon className="w-3.5 h-3.5" />
                                        </div>
                                        {p.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-1.5 w-40 lg:w-56 text-sm bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500"></span>
                </button>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2 rounded-full hover:bg-slate-100 p-1 transition-colors"
                        aria-label="Open profile menu"
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold",
                            isAdmin ? "bg-gradient-to-br from-amber-500 to-orange-600" : isRespondent ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-violet-500 to-indigo-600"
                        )}>
                            {user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                    </button>
                    {profileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-50">
                            <div className="px-4 py-2 border-b border-slate-100">
                                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <Link
                                href={profileHref}
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                <User className="w-4 h-4 text-slate-400" />
                                Profile Settings
                            </Link>
                            <Link
                                href={`${profileHref}#password`}
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                <Settings className="w-4 h-4 text-slate-400" />
                                Change Password
                            </Link>
                            <button
                                onClick={() => { setProfileOpen(false); logout(); }}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100 mt-1"
                            >
                                <LogOut className="w-4 h-4" />
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
