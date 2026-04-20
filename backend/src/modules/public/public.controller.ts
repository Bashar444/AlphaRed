import { Controller, Get, Header, Param } from '@nestjs/common';
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
}
