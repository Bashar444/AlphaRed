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
    ShoppingCart,
    StickyNote,
    Target,
    Ticket,
    Timer,
    User,
    Users,
    Wallet,
    Globe,
    Activity,
    TrendingUp,
    Bell,
} from "lucide-react";

/* ── Navigation definitions per role ─────────────────────── */

const researcherNav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/surveys", label: "My Surveys", icon: ClipboardList },
    { href: "/dashboard/analysis", label: "Analysis", icon: BarChart3 },
    { href: "/dashboard/exports", label: "Exports", icon: Download },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { href: "/dashboard/profile", label: "Profile", icon: User },
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

const adminPlatformNav = [
    { href: "/dashboard/admin", label: "Overview", icon: Activity },
    { href: "/dashboard/admin/users", label: "Users & Clients", icon: Users },
    { href: "/dashboard/admin/respondents", label: "Respondents", icon: User },
    { href: "/dashboard/admin/revenue", label: "Revenue", icon: TrendingUp },
];

const adminSurveyOpsNav = [
    { href: "/dashboard/surveys", label: "All Surveys", icon: ClipboardList },
    { href: "/dashboard/admin/datasets", label: "Datasets", icon: Database },
    { href: "/dashboard/analysis", label: "Analysis", icon: BarChart3 },
    { href: "/dashboard/exports", label: "Exports", icon: Download },
];

const adminSettingsNav = [
    { href: "/dashboard/admin/cms/pages", label: "CMS Pages", icon: FileText },
    { href: "/dashboard/admin/cms/menus", label: "Menus", icon: Globe },
    { href: "/dashboard/admin/audit-log", label: "Audit Log", icon: ScrollText },
    { href: "/dashboard/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/dashboard/admin/email-config", label: "Email Config", icon: MessageSquare },
    { href: "/dashboard/admin/seo-config", label: "SEO Config", icon: Globe },
    { href: "/dashboard/admin/payment-config", label: "Payment Gateways", icon: CreditCard },
    { href: "/dashboard/admin/system-settings", label: "System Settings", icon: Activity },
    { href: "/dashboard/admin/api-requests", label: "API Access Requests", icon: Key },
    { href: "/dashboard/profile", label: "My Profile", icon: User },
];

/* ── Theme definitions ──────────────────────────────────── */

interface SidebarTheme {
    bg: string;
    border: string;
    sectionLabel: string;
    itemDefault: string;
    itemHover: string;
    itemActive: string;
    itemActiveBg: string;
    logo: string;
    logoBg: string;
    userBorder: string;
    userBg: string;
    userText: string;
    userSubtext: string;
    logoutHover: string;
    roleBadge: string;
    roleBadgeBg: string;
}

const themes: Record<string, SidebarTheme> = {
    admin: {
        bg: "bg-slate-950",
        border: "border-slate-800",
        sectionLabel: "text-slate-500",
        itemDefault: "text-slate-400",
        itemHover: "hover:bg-slate-800 hover:text-white",
        itemActive: "text-amber-300",
        itemActiveBg: "bg-amber-500/10",
        logo: "text-white",
        logoBg: "bg-gradient-to-br from-amber-500 to-orange-600",
        userBorder: "border-slate-800",
        userBg: "bg-slate-800",
        userText: "text-white",
        userSubtext: "text-slate-500",
        logoutHover: "hover:text-red-400",
        roleBadge: "text-amber-400",
        roleBadgeBg: "bg-amber-500/10",
    },
    researcher: {
        bg: "bg-white",
        border: "border-slate-200",
        sectionLabel: "text-slate-400",
        itemDefault: "text-slate-600",
        itemHover: "hover:bg-violet-50 hover:text-violet-700",
        itemActive: "text-violet-700",
        itemActiveBg: "bg-violet-50",
        logo: "text-slate-900",
        logoBg: "bg-gradient-to-br from-violet-500 to-indigo-600",
        userBorder: "border-slate-200",
        userBg: "bg-violet-50",
        userText: "text-slate-900",
        userSubtext: "text-slate-500",
        logoutHover: "hover:text-red-500",
        roleBadge: "text-violet-600",
        roleBadgeBg: "bg-violet-50",
    },
    respondent: {
        bg: "bg-emerald-950",
        border: "border-emerald-900",
        sectionLabel: "text-emerald-600",
        itemDefault: "text-emerald-300/70",
        itemHover: "hover:bg-emerald-900 hover:text-white",
        itemActive: "text-white",
        itemActiveBg: "bg-emerald-700/30",
        logo: "text-white",
        logoBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
        userBorder: "border-emerald-900",
        userBg: "bg-emerald-900",
        userText: "text-white",
        userSubtext: "text-emerald-500",
        logoutHover: "hover:text-red-400",
        roleBadge: "text-emerald-400",
        roleBadgeBg: "bg-emerald-500/10",
    },
};

/* ── Reusable nav section renderer ──────────────────────── */

function NavSection({
    label,
    items,
    pathname,
    theme,
}: {
    label: string;
    items: typeof researcherNav;
    pathname: string;
    theme: SidebarTheme;
}) {
    return (
        <>
            <div className="pt-5" />
            <p className={cn("px-3 text-[10px] font-semibold uppercase tracking-widest mb-2", theme.sectionLabel)}>
                {label}
            </p>
            {items.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/dashboard/respondent" && pathname?.startsWith(item.href + "/"));
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                            active
                                ? cn(theme.itemActiveBg, theme.itemActive)
                                : cn(theme.itemDefault, theme.itemHover)
                        )}
                    >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {item.label}
                    </Link>
                );
            })}
        </>
    );
}

/* ── Main Sidebar ───────────────────────────────────────── */

export function Sidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void } = {}) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const isAdmin = user?.role === "SUPERADMIN" || user?.role === "MANAGER" || user?.is_admin;
    const isRespondent = user?.role === "RESPONDENT";
    const isStaff = isAdmin || user?.role === "AGENT";

    // Determine theme
    const themeKey = isAdmin ? "admin" : isRespondent ? "respondent" : "researcher";
    const theme = themes[themeKey];

    const roleLabel = isAdmin ? "Admin" : isRespondent ? "Respondent" : "Researcher";

    return (
        <>
            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    aria-hidden
                />
            )}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 flex flex-col w-64 min-h-screen border-r transform transition-transform duration-300",
                    theme.bg,
                    theme.border,
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className={cn("flex items-center gap-3 px-5 py-4 border-b", theme.border)}>
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-lg", theme.logoBg)}>
                        P
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className={cn("text-base font-bold tracking-tight", theme.logo)}>PrimoData</span>
                        <span className={cn("block text-[10px] font-medium uppercase tracking-wider", theme.roleBadge)}>
                            {roleLabel} Portal
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                    {isAdmin ? (
                        /* ── Admin Sidebar ── */
                        <>
                            <NavSection label="Platform" items={adminPlatformNav} pathname={pathname} theme={theme} />
                            <NavSection label="Survey Operations" items={adminSurveyOpsNav} pathname={pathname} theme={theme} />
                            <NavSection label="Business" items={businessNav} pathname={pathname} theme={theme} />
                            <NavSection label="Team" items={teamNav} pathname={pathname} theme={theme} />
                            <NavSection label="Tools" items={toolsNav} pathname={pathname} theme={theme} />
                            <NavSection label="Settings" items={adminSettingsNav} pathname={pathname} theme={theme} />
                        </>
                    ) : isRespondent ? (
                        /* ── Respondent Sidebar ── */
                        <>
                            <NavSection label="My Panel" items={respondentNav} pathname={pathname} theme={theme} />
                        </>
                    ) : (
                        /* ── Researcher Sidebar ── */
                        <>
                            <NavSection label="Research" items={researcherNav} pathname={pathname} theme={theme} />
                            {isStaff && <NavSection label="Business" items={businessNav} pathname={pathname} theme={theme} />}
                            {isStaff && <NavSection label="Team" items={teamNav} pathname={pathname} theme={theme} />}
                            <NavSection label="Tools" items={toolsNav} pathname={pathname} theme={theme} />
                        </>
                    )}
                </nav>

                {/* User footer */}
                <div className={cn("border-t px-4 py-3", theme.border)}>
                    <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold", theme.userBg, theme.userText)}>
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium truncate", theme.userText)}>
                                {user?.name}
                            </p>
                            <p className={cn("text-xs truncate", theme.userSubtext)}>{user?.email}</p>
                        </div>
                        <Link
                            href={isRespondent ? "/dashboard/respondent/profile" : "/dashboard/profile"}
                            className={cn("text-slate-500 transition-colors hover:text-violet-600", theme.itemHover)}
                            title="Profile Settings"
                        >
                            <User className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={logout}
                            className={cn("text-slate-500 transition-colors", theme.logoutHover)}
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
