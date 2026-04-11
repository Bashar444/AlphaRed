"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Shield, Menu, FileText, Footprints } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const cmsPages = [
    {
        href: "/dashboard/admin/cms/menus",
        icon: Menu,
        title: "Header Menu",
        description: "Edit navigation links, ordering, and dropdown structure",
    },
    {
        href: "/dashboard/admin/cms/pages",
        icon: FileText,
        title: "Pages",
        description: "Create and manage content pages with drag-drop sections",
    },
    {
        href: "/dashboard/admin/cms/footer",
        icon: Footprints,
        title: "Footer",
        description: "Edit footer columns, links, social icons, and copyright",
    },
];

export default function CmsOverviewPage() {
    const { user } = useAuth();

    if (!user?.is_admin) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900">Access Denied</h2>
                    <p className="text-sm text-slate-500">Admin access required.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Content Management</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Manage your site&apos;s header menu, pages, and footer
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cmsPages.map((page) => (
                    <Link key={page.href} href={page.href}>
                        <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-slate-200 hover:border-violet-300">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                                    <page.icon className="w-6 h-6 text-violet-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    {page.title}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {page.description}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
