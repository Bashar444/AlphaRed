"use client";

import SettingsForm from "@/components/admin/settings-form";
import { Search } from "lucide-react";

export default function SeoConfigPage() {
    return (
        <SettingsForm
            group="seo"
            title="SEO Configuration"
            description="Control how search engines and social platforms display your site."
            icon={<Search className="w-6 h-6" />}
            sections={[
                {
                    title: "Site Metadata",
                    fields: [
                        { key: "seo_title", label: "Default Page Title", type: "text", placeholder: "PrimoData — Survey & Analytics Platform" },
                        { key: "seo_title_template", label: "Title Template", type: "text", placeholder: "%s | PrimoData", helper: "Use %s as placeholder for the page title." },
                        { key: "seo_description", label: "Meta Description", type: "textarea", placeholder: "Run surveys, analyze responses, share datasets — all in one place." },
                        { key: "seo_keywords", label: "Keywords (comma-separated)", type: "text", placeholder: "surveys, analytics, research" },
                    ],
                },
                {
                    title: "Open Graph / Social",
                    description: "Used by Facebook, LinkedIn, Twitter, etc.",
                    fields: [
                        { key: "og_image", label: "Default OG Image", type: "image", helper: "Used by Facebook/LinkedIn/Twitter previews. Recommended size: 1200×630." },
                        { key: "og_site_name", label: "Site Name", type: "text", placeholder: "PrimoData" },
                        { key: "twitter_handle", label: "Twitter Handle", type: "text", placeholder: "@primodata" },
                    ],
                },
                {
                    title: "Crawling",
                    fields: [
                        { key: "seo_canonical_url", label: "Canonical URL", type: "url", placeholder: "https://primodata.com" },
                        { key: "seo_sitemap_enabled", label: "Generate sitemap.xml", type: "boolean", helper: "Expose /sitemap.xml automatically." },
                        { key: "seo_robots_index", label: "Allow search engines to index this site", type: "boolean" },
                        { key: "seo_robots_txt", label: "robots.txt overrides", type: "textarea", placeholder: "User-agent: *\nDisallow: /dashboard\nAllow: /" },
                        { key: "seo_google_verification", label: "Google Search Console verification", type: "text", placeholder: "google-site-verification=..." },
                        { key: "seo_bing_verification", label: "Bing Webmaster verification", type: "text" },
                    ],
                },
            ]}
        />
    );
}
