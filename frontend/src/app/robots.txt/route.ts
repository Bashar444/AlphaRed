import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
    const url = apiBase.startsWith("http")
        ? `${apiBase}/public/robots.txt`
        : `https://alphared.vercel.app${apiBase}/public/robots.txt`;

    let body = "User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /api\n";
    try {
        const res = await fetch(url, { next: { revalidate: 600 } });
        if (res.ok) {
            const json = await res.json().catch(() => null);
            if (json && typeof json === "object" && "data" in json) {
                body = String((json as { data: string }).data);
            } else {
                body = await res.text();
            }
        }
    } catch {
        // fallback default
    }

    return new NextResponse(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
