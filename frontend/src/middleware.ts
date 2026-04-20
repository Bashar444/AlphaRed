import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PASS = ["/maintenance", "/api", "/_next", "/favicon.ico", "/login"];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    if (PUBLIC_PASS.some((p) => pathname.startsWith(p))) return NextResponse.next();

    // Allow admins to bypass via cookie hint set after login
    if (req.cookies.get("admin-bypass")?.value === "1") return NextResponse.next();

    try {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        const res = await fetch(`${base}/public/site-config`, { next: { revalidate: 30 } });
        if (!res.ok) return NextResponse.next();
        const json = await res.json();
        const data = json?.data ?? json;
        if (data?.system?.maintenanceMode) {
            const url = req.nextUrl.clone();
            url.pathname = "/maintenance";
            return NextResponse.rewrite(url);
        }
    } catch {
        // On network failure, never block traffic
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
