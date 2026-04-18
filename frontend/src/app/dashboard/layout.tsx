"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileSidebar, setMobileSidebar] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Close drawer on route change
    useEffect(() => {
        setMobileSidebar(false);
    }, [pathname]);

    // Redirect respondents away from researcher/admin routes
    useEffect(() => {
        if (!loading && user?.role === "RESPONDENT" && !pathname.startsWith("/dashboard/respondent")) {
            router.replace("/dashboard/respondent");
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen flex bg-slate-50">
            <Sidebar mobileOpen={mobileSidebar} onClose={() => setMobileSidebar(false)} />
            <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
                <Topbar onMenuClick={() => setMobileSidebar(true)} />
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">{children}</main>
            </div>
        </div>
    );
}
