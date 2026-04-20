import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

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

    /** Public-take: fetch an active anonymous-allowed survey with its questions. */
    async getPublicSurvey(id: string) {
        const survey = await this.prisma.survey.findUnique({
            where: { id },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        order: true,
                        type: true,
                        text: true,
                        description: true,
                        required: true,
                        options: true,
                        validation: true,
                        mediaUrl: true,
                    },
                },
            },
        });
        if (!survey) throw new NotFoundException('Survey not found');
        if (survey.status !== 'ACTIVE') {
            throw new BadRequestException('Survey is not currently accepting responses');
        }
        if (!survey.allowAnonymous) {
            throw new ForbiddenException('This survey requires sign-in to participate');
        }
        if (survey.endsAt && survey.endsAt < new Date()) {
            throw new BadRequestException('Survey has ended');
        }
        if (survey.startsAt && survey.startsAt > new Date()) {
            throw new BadRequestException('Survey has not started yet');
        }

        return {
            id: survey.id,
            title: survey.title,
            description: survey.description,
            welcomeMessage: survey.welcomeMessage,
            thankYouMessage: survey.thankYouMessage,
            estimatedMinutes: survey.estimatedMinutes,
            language: survey.language,
            progressBar: survey.progressBar,
            randomizeQuestions: survey.randomizeQuestions,
            questions: survey.questions,
        };
    }

    /** Public-take: submit anonymous response. */
    async submitPublicResponse(
        surveyId: string,
        body: { answers: Array<{ questionId: string; value: unknown }>; durationSecs?: number; email?: string; name?: string },
        ip: string,
        userAgent: string,
    ) {
        const survey = await this.prisma.survey.findUnique({
            where: { id: surveyId },
            include: { questions: { select: { id: true, required: true } } },
        });
        if (!survey) throw new NotFoundException('Survey not found');
        if (survey.status !== 'ACTIVE') {
            throw new BadRequestException('Survey is not accepting responses');
        }
        if (!survey.allowAnonymous) {
            throw new ForbiddenException('This survey requires sign-in');
        }
        if (!Array.isArray(body.answers) || body.answers.length === 0) {
            throw new BadRequestException('No answers submitted');
        }

        const validIds = new Set(survey.questions.map((q) => q.id));
        const answeredIds = new Set(body.answers.map((a) => a.questionId));
        const missingRequired = survey.questions.find((q) => q.required && !answeredIds.has(q.id));
        if (missingRequired) {
            throw new BadRequestException(`Required question not answered: ${missingRequired.id}`);
        }

        const ipHash = ip ? crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32) : undefined;

        // Throttle: same ipHash submitted in last hour for this survey
        if (ipHash) {
            const recent = await this.prisma.response.findFirst({
                where: {
                    surveyId,
                    ipHash,
                    createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
                },
            });
            if (recent) {
                throw new BadRequestException('You have already submitted a response recently');
            }
        }

        // Anonymous respondent: identify by ipHash-based pseudo-email
        const pseudoEmail = body.email && body.email.trim().length > 0
            ? body.email.trim().toLowerCase()
            : `anon-${ipHash || crypto.randomBytes(8).toString('hex')}@anonymous.primodata.local`;

        let respondent = await this.prisma.respondent.findFirst({ where: { email: pseudoEmail } });
        if (!respondent) {
            respondent = await this.prisma.respondent.create({
                data: {
                    email: pseudoEmail,
                    name: body.name?.trim() || pseudoEmail.split('@')[0],
                    status: 'ACTIVE',
                    kycStatus: 'PENDING',
                    demographics: {},
                },
            });
        }

        const response = await this.prisma.$transaction(async (tx) => {
            const resp = await tx.response.create({
                data: {
                    surveyId,
                    respondentId: respondent.id,
                    status: 'COMPLETED',
                    durationSecs: body.durationSecs,
                    ipHash,
                    userAgent: userAgent?.slice(0, 500),
                    completedAt: new Date(),
                    answers: {
                        create: body.answers
                            .filter((a) => validIds.has(a.questionId))
                            .map((a) => ({ questionId: a.questionId, value: a.value as any })),
                    },
                },
            });
            await tx.survey.update({
                where: { id: surveyId },
                data: { collectedCount: { increment: 1 }, validCount: { increment: 1 } },
            });
            await tx.respondent.update({
                where: { id: respondent.id },
                data: {
                    totalResponses: { increment: 1 },
                    acceptedCount: { increment: 1 },
                    lastActiveAt: new Date(),
                },
            });
            return resp;
        });

        return { responseId: response.id, status: 'COMPLETED', thankYouMessage: survey.thankYouMessage };
    }
}
