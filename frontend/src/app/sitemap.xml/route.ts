import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/site-config";

export const revalidate = 3600;

interface PublishedPage {
    slug: string;
    updatedAt: string;
}

export async function GET() {
    const cfg = await getSiteConfig();
    const base = (cfg.seo.canonicalUrl || "https://alphared.vercel.app").replace(/\/$/, "");

    let pages: PublishedPage[] = [];
    try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
        const res = await fetch(`${apiBase.startsWith("http") ? apiBase : `${base}${apiBase}`}/public/pages`, { next: { revalidate: 600 } });
        if (res.ok) {
            const json = await res.json();
            const data = json?.data ?? json;
            if (Array.isArray(data)) pages = data as PublishedPage[];
        }
    } catch {
        // ignore
    }

    const urls = [
        { loc: `${base}/`, lastmod: new Date().toISOString() },
        ...pages.map((p) => ({
            loc: `${base}/p/${p.slug}`,
            lastmod: new Date(p.updatedAt).toISOString(),
        })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n")}
</urlset>`;

    return new NextResponse(xml, {
        headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
}
