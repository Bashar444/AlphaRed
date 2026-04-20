import {
    Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, UploadedFile, UseInterceptors, Req, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { AdminService } from './admin.service';
import { MailerService } from '../mailer/mailer.service';
import {
    UpsertSettingDto, UpdateModuleDto,
    CreatePageDto, UpdatePageDto,
    CreateEmailTemplateDto, UpdateEmailTemplateDto,
    CreateMenuDto, CreateMenuItemDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin')
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly service: AdminService, private readonly mailer: MailerService) { }

    // ── Settings ──

    @Get('settings')
    @ApiOperation({ summary: 'List all settings' })
    @ApiQuery({ name: 'group', required: false })
    async getSettings(@Query('group') group?: string) {
        return this.service.getSettings(group);
    }

    @Get('settings/:key')
    @ApiOperation({ summary: 'Get a setting by key' })
    async getSetting(@Param('key') key: string) {
        return this.service.getSetting(key);
    }

    @Post('settings')
    @ApiOperation({ summary: 'Upsert a setting' })
    async upsertSetting(@Body() dto: UpsertSettingDto) {
        return this.service.upsertSetting(dto);
    }

    @Delete('settings/:key')
    @ApiOperation({ summary: 'Delete a setting' })
    async deleteSetting(@Param('key') key: string) {
        return this.service.deleteSetting(key);
    }

    @Post('email/test')
    @ApiOperation({ summary: 'Send a test email using current SMTP settings' })
    async sendTestEmail() {
        return this.mailer.sendTest();
    }

    // ── Module Toggles ──

    @Get('modules')
    @ApiOperation({ summary: 'List all modules' })
    async listModules() {
        return this.service.listModules();
    }

    @Patch('modules/:id')
    @ApiOperation({ summary: 'Update module (enable/disable, reorder)' })
    async updateModule(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
        return this.service.updateModule(id, dto);
    }

    @Post('modules/seed')
    @ApiOperation({ summary: 'Seed default modules' })
    async seedModules() {
        return this.service.seedDefaultModules();
    }

    // ── CMS Pages ──

    @Post('pages')
    @ApiOperation({ summary: 'Create a CMS page' })
    async createPage(@Body() dto: CreatePageDto) {
        return this.service.createPage(dto);
    }

    @Get('pages')
    @ApiOperation({ summary: 'List CMS pages' })
    @ApiQuery({ name: 'published', required: false })
    async listPages(@Query('published') published?: string) {
        return this.service.listPages(published === 'true' ? true : published === 'false' ? false : undefined);
    }

    @Get('pages/:slug')
    @ApiOperation({ summary: 'Get page by slug' })
    async getPage(@Param('slug') slug: string) {
        return this.service.getPage(slug);
    }

    @Put('pages/:id')
    @ApiOperation({ summary: 'Update a CMS page' })
    async updatePage(@Param('id') id: string, @Body() dto: UpdatePageDto) {
        return this.service.updatePage(id, dto);
    }

    @Delete('pages/:id')
    @ApiOperation({ summary: 'Delete a CMS page' })
    async deletePage(@Param('id') id: string) {
        return this.service.deletePage(id);
    }

    // ── Email Templates ──

    @Get('email-templates')
    @ApiOperation({ summary: 'List email templates' })
    async listEmailTemplates() {
        return this.service.listEmailTemplates();
    }

    @Get('email-templates/:name')
    @ApiOperation({ summary: 'Get email template by name' })
    async getEmailTemplate(@Param('name') name: string) {
        return this.service.getEmailTemplate(name);
    }

    @Post('email-templates')
    @ApiOperation({ summary: 'Create email template' })
    async createEmailTemplate(@Body() dto: CreateEmailTemplateDto) {
        return this.service.createEmailTemplate(dto);
    }

    @Put('email-templates/:id')
    @ApiOperation({ summary: 'Update email template' })
    async updateEmailTemplate(@Param('id') id: string, @Body() dto: UpdateEmailTemplateDto) {
        return this.service.updateEmailTemplate(id, dto);
    }

    @Delete('email-templates/:id')
    @ApiOperation({ summary: 'Delete email template' })
    async deleteEmailTemplate(@Param('id') id: string) {
        return this.service.deleteEmailTemplate(id);
    }

    // ── Menus ──

    @Get('menus')
    @ApiOperation({ summary: 'List all menus with items' })
    async listMenus() {
        return this.service.listMenus();
    }

    @Post('menus')
    @ApiOperation({ summary: 'Create a menu' })
    async createMenu(@Body() dto: CreateMenuDto) {
        return this.service.createMenu(dto);
    }

    @Post('menus/items')
    @ApiOperation({ summary: 'Add a menu item' })
    async addMenuItem(@Body() dto: CreateMenuItemDto) {
        return this.service.addMenuItem(dto);
    }

    @Delete('menus/items/:id')
    @ApiOperation({ summary: 'Remove a menu item' })
    async removeMenuItem(@Param('id') id: string) {
        return this.service.removeMenuItem(id);
    }

    // ── Media ──

    @Get('media')
    @ApiOperation({ summary: 'List media files' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async listMedia(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.service.listMedia(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        );
    }

    @Post('media')
    @ApiOperation({ summary: 'Register a media file (after upload to S3/storage)' })
    async createMedia(
        @Body() body: { fileName: string; fileUrl: string; mimeType: string; sizeKb: number; altText?: string },
        @CurrentUser('sub') userId: string,
    ) {
        return this.service.createMediaRecord({ ...body, uploadedBy: userId });
    }

    @Post('media/upload')
    @ApiOperation({ summary: 'Upload a file (logo, image, etc.) and register it' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: join(process.cwd(), 'uploads'),
                filename: (_req, file, cb) => {
                    const ext = extname(file.originalname || '').toLowerCase();
                    const id = randomBytes(12).toString('hex');
                    cb(null, `${id}${ext}`);
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
            fileFilter: (_req, file, cb) => {
                const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'];
                if (!allowed.includes(file.mimetype)) {
                    return cb(new BadRequestException('Only image files are allowed (png, jpg, gif, svg, webp, ico)'), false);
                }
                cb(null, true);
            },
        }),
    )
    async uploadMedia(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser('sub') userId: string,
    ) {
        if (!file) throw new BadRequestException('No file uploaded');
        // Return a relative URL so it works behind any proxy (Vercel rewrite, nginx, direct).
        const url = `/uploads/${file.filename}`;
        const sizeKb = Math.round(file.size / 1024);
        await this.service.createMediaRecord({
            fileName: file.originalname || file.filename,
            fileUrl: url,
            mimeType: file.mimetype,
            sizeKb,
            uploadedBy: userId,
        });
        return { url, fileName: file.filename, mimeType: file.mimetype, sizeKb };
    }

    @Delete('media/:id')
    @ApiOperation({ summary: 'Delete a media file record' })
    async deleteMedia(@Param('id') id: string) {
        return this.service.deleteMedia(id);
    }
}

// ── Public CMS endpoints (no auth) ──

@ApiTags('CMS')
@Controller('api/v1/cms')
export class CmsController {
    constructor(private readonly service: AdminService) { }

    @Get('pages/:slug')
    @ApiOperation({ summary: 'Get published page by slug (public)' })
    async getPage(@Param('slug') slug: string) {
        const page = await this.service.getPage(slug);
        if (!page.published) {
            throw new Error('Page not found');
        }
        return page;
    }

    @Get('menus')
    @ApiOperation({ summary: 'Get all menus (public)' })
    async getMenus() {
        return this.service.listMenus();
    }
}
