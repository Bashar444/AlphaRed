import { Controller, Get, Header, Param, Post, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicService } from './public.service';

@ApiTags('Public')
@Controller('api/v1/public')
export class PublicController {
    constructor(private readonly service: PublicService) { }

    @Get('site-config')
    @ApiOperation({ summary: 'Public site + SEO configuration (no auth)' })
    async getSiteConfig() {
        return this.service.getSiteConfig();
    }

    @Get('pages')
    @ApiOperation({ summary: 'List published CMS pages' })
    async listPages() {
        return this.service.listPublishedPages();
    }

    @Get('pages/:slug')
    @ApiOperation({ summary: 'Get a published CMS page by slug' })
    async getPage(@Param('slug') slug: string) {
        return this.service.getPublicPage(slug);
    }

    @Get('robots.txt')
    @Header('Content-Type', 'text/plain; charset=utf-8')
    async getRobotsTxt() {
        return this.service.getRobotsTxt();
    }

    @Get('surveys/:id')
    @ApiOperation({ summary: 'Fetch a public (anonymous-allowed) survey for taking' })
    async getSurvey(@Param('id') id: string) {
        return this.service.getPublicSurvey(id);
    }

    @Post('surveys/:id/responses')
    @ApiOperation({ summary: 'Submit anonymous response to a public survey' })
    async submitResponse(
        @Param('id') id: string,
        @Body() body: { answers: Array<{ questionId: string; value: unknown }>; durationSecs?: number; email?: string; name?: string },
        @Req() req: Request,
    ) {
        const ip = ((req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '').split(',')[0].trim();
        const ua = (req.headers['user-agent'] as string) || '';
        return this.service.submitPublicResponse(id, body, ip, ua);
    }
}
