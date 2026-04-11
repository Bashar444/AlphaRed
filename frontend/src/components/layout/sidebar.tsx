"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
    BarChart3,
    ClipboardList,
    Download,
    FileText,
    Key,
    LayoutDashboard,
    LogOut,
    Shield,
    Users,
    CreditCard,
    Database,
} from "lucide-react";

const mainNav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/surveys", label: "Surveys", icon: ClipboardList },
    { href: "/dashboard/analysis", label: "Analysis", icon: BarChart3 },
    { href: "/dashboard/exports", label: "Exports", icon: Download },
    { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
    { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
];

const adminNav = [
    { href: "/dashboard/admin", label: "Admin Home", icon: Shield },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/respondents", label: "Respondents", icon: Users },
    { href: "/dashboard/admin/datasets", label: "Datasets", icon: Database },
    { href: "/dashboard/admin/revenue", label: "Revenue", icon: BarChart3 },
    { href: "/dashboard/admin/cms", label: "CMS", icon: FileText },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className="flex flex-col w-64 min-h-screen bg-slate-950 text-white border-r border-slate-800">
            {/* Logo */}
            <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
                    P
                </div>
                <span className="text-lg font-semibold tracking-tight">PrimoData</span>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    Platform
                </p>
                {mainNav.map((item) => {
                    const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                active
                                    ? "bg-violet-600/20 text-violet-400"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    );
                })}

                {/* Admin section */}
                {user?.is_admin && (
                    <>
                        <div className="pt-4" />
                        <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                            Administration
                        </p>
                        {adminNav.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        active
                                            ? "bg-violet-600/20 text-violet-400"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* User footer */}
            <div className="border-t border-slate-800 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium">
                        {user?.first_name?.[0]}
                        {user?.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
