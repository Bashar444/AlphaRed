"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { SectionRenderer } from "@/components/cms";
import { ArrowLeft } from "lucide-react";

interface PageData {
    id: number;
    title: string;
    slug: string;
    meta_title: string;
    meta_description: string;
    status: string;
    full_width: number;
}

interface SectionData {
    id: number;
    type: string;
    title: string;
    content: Record<string, unknown>;
    sort_order: number;
    status: string;
}

interface CmsPageResponse {
    page: PageData;
    sections: SectionData[];
}

interface CmsMenuItem {
    id: string;
    label: string;
    url: string;
    target: "_self" | "_blank";
    status: string;
}

interface FooterColumn {
    title: string;
    links: { label: string; url: string }[];
}

interface SocialLink {
    platform: string;
    url: string;
}

interface FooterConfig {
    columns: FooterColumn[];
    copyright: string;
    social_links: SocialLink[];
}

export default function CmsPublicPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [page, setPage] = useState<PageData | null>(null);
    const [sections, setSections] = useState<SectionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [menuItems, setMenuItems] = useState<CmsMenuItem[]>([]);
    const [footer, setFooter] = useState<FooterConfig | null>(null);

    useEffect(() => {
        api.publicCms.menus().then((data) => {
            if (Array.isArray(data))
                setMenuItems(data.filter((m: CmsMenuItem) => m.status === "active"));
        }).catch(() => { });
        api.publicCms.footer().then((data) => {
            if (data && typeof data === "object") setFooter(data as FooterConfig);
        }).catch(() => { });
    }, []);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        api.publicCms
            .page(slug)
            .then((data: CmsPageResponse) => {
                if (data?.page) {
                    setPage(data.page);
                    setSections(Array.isArray(data.sections) ? data.sections : []);
                } else {
                    setNotFound(true);
                }
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (notFound || !page) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
                    <p className="text-slate-500 mb-6">Page not found</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-violet-600 hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                            P
                        </div>
                        <span className="text-lg font-bold text-slate-900">
                            PrimoData
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
                        <Link href="/#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
                        {menuItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.url}
                                target={item.target}
                                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Sign in</Link>
                        <Link href="/register" className="h-9 px-4 inline-flex items-center rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Page title (if not full-width hero) */}
            {sections.length === 0 || sections[0]?.type !== "hero" ? (
                <header className="py-16 px-6 text-center border-b border-slate-100">
                    <h1 className="text-4xl font-bold text-slate-900">{page.title}</h1>
                </header>
            ) : null}

            {/* CMS Sections */}
            <main className={page.full_width ? "" : "max-w-7xl mx-auto"}>
                <SectionRenderer sections={sections} />
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    {footer && footer.columns.length > 0 && (
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            {footer.columns.map((col, i) => (
                                <div key={i}>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">{col.title}</h4>
                                    <ul className="space-y-2">
                                        {col.links.map((link, j) => (
                                            <li key={j}>
                                                <Link href={link.url} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">{link.label}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                    {footer && footer.social_links.length > 0 && (
                        <div className="flex items-center gap-4 mb-6">
                            {footer.social_links.map((s, i) => (
                                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-violet-600 capitalize transition-colors">{s.platform}</a>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">P</div>
                            <span className="text-sm font-semibold text-slate-900">PrimoData Analytics</span>
                        </div>
                        <p className="text-xs text-slate-500">{footer?.copyright || "© 2025 PrimoData Analytics. Built for Indian researchers."}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
