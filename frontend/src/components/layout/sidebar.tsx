"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
    BarChart3,
    Briefcase,
    Building2,
    Calendar,
    CalendarOff,
    CheckSquare,
    ClipboardList,
    Clock,
    CreditCard,
    Database,
    DollarSign,
    Download,
    FileCheck,
    FileSpreadsheet,
    FileText,
    Key,
    LayoutDashboard,
    ListTodo,
    LogOut,
    Megaphone,
    MessageSquare,
    ScrollText,
    Shield,
    ShoppingCart,
    StickyNote,
    Target,
    Ticket,
    Timer,
    User,
    Users,
    Wallet,
} from "lucide-react";

const mainNav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/surveys", label: "Surveys", icon: ClipboardList },
    { href: "/dashboard/analysis", label: "Analysis", icon: BarChart3 },
    { href: "/dashboard/exports", label: "Exports", icon: Download },
    { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
    { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
];

const respondentNav = [
    { href: "/dashboard/respondent", label: "Home", icon: LayoutDashboard },
    { href: "/dashboard/respondent/surveys", label: "Available Surveys", icon: ClipboardList },
    { href: "/dashboard/respondent/history", label: "My Responses", icon: FileText },
    { href: "/dashboard/respondent/earnings", label: "Earnings", icon: Wallet },
    { href: "/dashboard/respondent/payouts", label: "Payouts", icon: DollarSign },
    { href: "/dashboard/respondent/profile", label: "My Profile", icon: User },
];

const businessNav = [
    { href: "/dashboard/projects", label: "Projects", icon: Briefcase },
    { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
    { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
    { href: "/dashboard/clients", label: "Clients", icon: Building2 },
    { href: "/dashboard/leads", label: "Leads", icon: Target },
    { href: "/dashboard/expenses", label: "Expenses", icon: DollarSign },
    { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
    { href: "/dashboard/events", label: "Events", icon: Calendar },
    { href: "/dashboard/estimates", label: "Estimates", icon: FileSpreadsheet },
    { href: "/dashboard/contracts", label: "Contracts", icon: ScrollText },
    { href: "/dashboard/proposals", label: "Proposals", icon: FileCheck },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
];

const teamNav = [
    { href: "/dashboard/team", label: "Team", icon: Users },
    { href: "/dashboard/attendance", label: "Attendance", icon: Clock },
    { href: "/dashboard/timesheets", label: "Timesheets", icon: Timer },
    { href: "/dashboard/leaves", label: "Leaves", icon: CalendarOff },
];

const toolsNav = [
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
    { href: "/dashboard/notes", label: "Notes", icon: StickyNote },
    { href: "/dashboard/todo", label: "To-Do", icon: CheckSquare },
];

const adminNav = [
    { href: "/dashboard/admin", label: "Admin Home", icon: Shield },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/respondents", label: "Respondents", icon: Users },
    { href: "/dashboard/admin/datasets", label: "Datasets", icon: Database },
    { href: "/dashboard/admin/revenue", label: "Revenue", icon: BarChart3 },
    { href: "/dashboard/admin/cms", label: "CMS", icon: FileText },
];

function NavSection({ label, items, pathname }: { label: string; items: typeof mainNav; pathname: string }) {
    return (
        <>
            <div className="pt-4" />
            <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                {label}
            </p>
            {items.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"));
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
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const isStaff = user?.role === 'SUPERADMIN' || user?.role === 'MANAGER' || user?.role === 'AGENT' || user?.is_admin;
    const isRespondent = user?.role === 'RESPONDENT';

    return (
        <aside className="flex flex-col w-64 min-h-screen bg-slate-950 text-white border-r border-slate-800">
            {/* Logo */}
            <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
                    P
                </div>
                <span className="text-lg font-semibold tracking-tight">PrimoData</span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {isRespondent ? (
                    /* ── Respondent sidebar ── */
                    <>
                        <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                            Respondent Panel
                        </p>
                        {respondentNav.map((item) => {
                            const active = pathname === item.href || (item.href !== "/dashboard/respondent" && pathname?.startsWith(item.href));
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
                ) : (
                    /* ── Researcher / Admin sidebar ── */
                    <>
                        <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                            Platform
                        </p>
                        {mainNav.map((item) => {
                            const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"));
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

                        {isStaff && <NavSection label="Business" items={businessNav} pathname={pathname} />}
                        {isStaff && <NavSection label="Team" items={teamNav} pathname={pathname} />}
                        <NavSection label="Tools" items={toolsNav} pathname={pathname} />
                        {user?.is_admin && <NavSection label="Administration" items={adminNav} pathname={pathname} />}
                    </>
                )}
            </nav>

            {/* User footer */}
            <div className="border-t border-slate-800 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium">
                        {user?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user?.name}
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
