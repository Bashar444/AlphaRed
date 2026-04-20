import { cache } from "react";

export interface SiteConfig {
    system: {
        siteName: string;
        tagline: string;
        logoUrl: string;
        faviconUrl: string;
        primaryColor: string;
        theme: "light" | "dark" | "system" | string;
        timezone: string;
        dateFormat: string;
        timeFormat: string;
        language: string;
        maintenanceMode: boolean;
        maintenanceMessage: string;
        signupEnabled: boolean;
        supportUrl: string;
    };
    seo: {
        title: string;
        titleTemplate: string;
        description: string;
        keywords: string;
        ogImage: string;
        ogSiteName: string;
        twitterHandle: string;
        canonicalUrl: string;
        sitemapEnabled: boolean;
        robotsIndex: boolean;
        robotsTxt: string;
        googleVerification: string;
        bingVerification: string;
    };
    payment?: {
        defaultGateway: string;
        currency: string;
        gateways: {
            stripe: { enabled: boolean; publishableKey: string };
            razorpay: { enabled: boolean; keyId: string };
            payu: { enabled: boolean };
            paypal: { enabled: boolean; clientId: string; mode: "sandbox" | "live" };
        };
    };
}

const FALLBACK: SiteConfig = {
    system: {
        siteName: "PrimoData",
        tagline: "Survey & Analytics Platform",
        logoUrl: "",
        faviconUrl: "",
        primaryColor: "#7C3AED",
        theme: "light",
        timezone: "UTC",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "24h",
        language: "en",
        maintenanceMode: false,
        maintenanceMessage: "",
        signupEnabled: true,
        supportUrl: "",
    },
    seo: {
        title: "PrimoData",
        titleTemplate: "%s | PrimoData",
        description: "Enterprise survey analytics powered by AI.",
        keywords: "",
        ogImage: "",
        ogSiteName: "PrimoData",
        twitterHandle: "",
        canonicalUrl: "",
        sitemapEnabled: true,
        robotsIndex: true,
        robotsTxt: "",
        googleVerification: "",
        bingVerification: "",
    },
};

/**
 * Fetch the public site config from the backend.
 * Cached per-request via React.cache, with ISR (revalidate every 60s).
 */
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    try {
        const res = await fetch(`${base}/public/site-config`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return FALLBACK;
        const json = await res.json();
        const data = (json?.data ?? json) as SiteConfig;
        return {
            system: { ...FALLBACK.system, ...(data?.system || {}) },
            seo: { ...FALLBACK.seo, ...(data?.seo || {}) },
        };
    } catch {
        return FALLBACK;
    }
});
