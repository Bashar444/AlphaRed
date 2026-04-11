"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Protects Business/Team routes — only staff and admin users.
 * Client-type or researcher-only users are redirected to /dashboard.
 */
export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const isStaff = user?.user_type === "staff" || user?.is_admin;

    useEffect(() => {
        if (!loading && user && !isStaff) {
            router.replace("/dashboard");
        }
    }, [user, loading, isStaff, router]);

    if (loading || !isStaff) return null;

    return <>{children}</>;
}
