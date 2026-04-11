"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Protects admin-only routes — redirects non-admin users to /dashboard.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user && !user.is_admin) {
            router.replace("/dashboard");
        }
    }, [user, loading, router]);

    if (loading || !user?.is_admin) return null;

    return <>{children}</>;
}
