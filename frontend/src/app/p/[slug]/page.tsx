import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/lib/site-config";

interface PublicPage {
    id: string;
    title: string;
    slug: string;
    content: unknown;
    metaTitle?: string | null;
    metaDesc?: string | null;
    published: boolean;
    updatedAt: string;
}

async function fetchPage(slug: string): Promise<PublicPage | null> {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    try {
        const res = await fetch(`${base}/public/pages/${encodeURIComponent(slug)}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return (json?.data ?? json) as PublicPage;
    } catch {
        return null;
    }
}

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
    const { slug } = await params;
    const page = await fetchPage(slug);
    if (!page) return { title: "Page not found" };
    return {
        title: page.metaTitle || page.title,
        description: page.metaDesc || undefined,
    };
}

/** Render structured (Json) content. Supports either a string (HTML) or an array of blocks. */
function ContentRenderer({ content }: { content: unknown }) {
    if (typeof content === "string") {
        return <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    if (Array.isArray(content)) {
        return (
            <div className="prose prose-slate max-w-none space-y-4">
                {content.map((block: { type?: string; text?: string; level?: number; html?: string }, i) => {
                    if (block.html) {
                        return <div key={i} dangerouslySetInnerHTML={{ __html: block.html }} />;
                    }
                    if (block.type === "heading") {
                        const lvl = Math.min(Math.max(block.level || 2, 1), 6);
                        const Tag = (`h${lvl}` as unknown) as keyof React.JSX.IntrinsicElements;
                        return <Tag key={i}>{block.text}</Tag>;
                    }
                    return <p key={i}>{block.text}</p>;
                })}
            </div>
        );
    }
    if (content && typeof content === "object" && "html" in (content as Record<string, unknown>)) {
        const html = String((content as Record<string, unknown>).html);
        return <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return (
        <pre className="text-xs bg-slate-50 p-3 rounded border border-slate-200 overflow-auto">
            {JSON.stringify(content, null, 2)}
        </pre>
    );
}

export default async function PublicCmsPage({ params }: RouteParams) {
    const { slug } = await params;
    const [page, cfg] = await Promise.all([fetchPage(slug), getSiteConfig()]);
    if (!page) notFound();

    return (
        <main className="min-h-screen bg-white">
            <header className="border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
                    {cfg.system.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cfg.system.logoUrl} alt={cfg.system.siteName} className="h-8" />
                    ) : (
                        <span className="text-lg font-bold text-slate-900">{cfg.system.siteName}</span>
                    )}
                </div>
            </header>
            <article className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-6">{page.title}</h1>
                <ContentRenderer content={page.content} />
            </article>
            <footer className="border-t border-slate-100 mt-16">
                <div className="max-w-4xl mx-auto px-6 py-6 text-xs text-slate-500">
                    © {new Date().getFullYear()} {cfg.system.siteName}. {cfg.system.tagline}
                </div>
            </footer>
        </main>
    );
}
