import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PublicService {
    constructor(private prisma: PrismaService) { }

    /** Build the public site config object exposed to unauthenticated callers. */
    async getSiteConfig() {
        const rows = await this.prisma.appSetting.findMany({
            where: { group: { in: ['system', 'seo', 'payment'] } },
        });
        const map: Record<string, unknown> = {};
        for (const r of rows) map[r.key] = r.value;

        return {
            system: {
                siteName: (map.system_site_name as string) || 'PrimoData',
                tagline: (map.system_tagline as string) || '',
                logoUrl: (map.system_logo_url as string) || '',
                faviconUrl: (map.system_favicon_url as string) || '',
                primaryColor: (map.system_primary_color as string) || '#7C3AED',
                theme: (map.system_theme as string) || 'light',
                timezone: (map.system_timezone as string) || 'UTC',
                dateFormat: (map.system_date_format as string) || 'YYYY-MM-DD',
                timeFormat: (map.system_time_format as string) || '24h',
                language: (map.system_default_language as string) || 'en',
                maintenanceMode: Boolean(map.system_maintenance_mode),
                maintenanceMessage: (map.system_maintenance_message as string) || '',
                signupEnabled: map.system_signup_enabled === undefined ? true : Boolean(map.system_signup_enabled),
                supportUrl: (map.system_support_url as string) || '',
            },
            seo: {
                title: (map.seo_title as string) || 'PrimoData',
                titleTemplate: (map.seo_title_template as string) || '%s | PrimoData',
                description: (map.seo_description as string) || '',
                keywords: (map.seo_keywords as string) || '',
                ogImage: (map.og_image as string) || '',
                ogSiteName: (map.og_site_name as string) || (map.system_site_name as string) || 'PrimoData',
                twitterHandle: (map.twitter_handle as string) || '',
                canonicalUrl: (map.seo_canonical_url as string) || '',
                sitemapEnabled: map.seo_sitemap_enabled === undefined ? true : Boolean(map.seo_sitemap_enabled),
                robotsIndex: map.seo_robots_index === undefined ? true : Boolean(map.seo_robots_index),
                robotsTxt: (map.seo_robots_txt as string) || '',
                googleVerification: (map.seo_google_verification as string) || '',
                bingVerification: (map.seo_bing_verification as string) || '',
            },
            payment: {
                defaultGateway: (map.payment_default_gateway as string) || 'stripe',
                currency: (map.payment_currency as string) || 'USD',
                gateways: {
                    stripe: {
                        enabled: map.stripe_enabled === undefined ? false : Boolean(map.stripe_enabled),
                        publishableKey: (map.stripe_publishable_key as string) || '',
                    },
                    razorpay: {
                        enabled: map.razorpay_enabled === undefined ? false : Boolean(map.razorpay_enabled),
                        keyId: (map.razorpay_key_id as string) || '',
                    },
                    payu: {
                        enabled: map.payu_enabled === undefined ? false : Boolean(map.payu_enabled),
                    },
                    paypal: {
                        enabled: map.paypal_enabled === undefined ? false : Boolean(map.paypal_enabled),
                        clientId: (map.paypal_client_id as string) || '',
                        mode: ((map.paypal_mode as string) || 'sandbox') as 'sandbox' | 'live',
                    },
                },
            },
        };
    }

    async getPublicPage(slug: string) {
        const page = await this.prisma.page.findUnique({ where: { slug } });
        if (!page || !page.published) {
            throw new NotFoundException('Page not found');
        }
        return page;
    }

    async listPublishedPages() {
        return this.prisma.page.findMany({
            where: { published: true },
            select: { slug: true, title: true, metaDesc: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
        });
    }

    /** Generate robots.txt from settings (or sensible default). */
    async getRobotsTxt(): Promise<string> {
        const cfg = await this.getSiteConfig();
        if (cfg.seo.robotsTxt && cfg.seo.robotsTxt.trim().length > 0) {
            return cfg.seo.robotsTxt;
        }
        const lines = ['User-agent: *'];
        if (cfg.seo.robotsIndex) {
            lines.push('Allow: /');
            lines.push('Disallow: /dashboard');
            lines.push('Disallow: /api');
        } else {
            lines.push('Disallow: /');
        }
        if (cfg.seo.canonicalUrl && cfg.seo.sitemapEnabled) {
            lines.push(`Sitemap: ${cfg.seo.canonicalUrl.replace(/\/$/, '')}/sitemap.xml`);
        }
        return lines.join('\n');
    }
}
