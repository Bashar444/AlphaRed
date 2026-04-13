import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    UpsertSettingDto, UpdateModuleDto,
    CreatePageDto, UpdatePageDto,
    CreateEmailTemplateDto, UpdateEmailTemplateDto,
    CreateMenuDto, CreateMenuItemDto,
} from './dto';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    // ═══════════════════════════════════════════
    // APP SETTINGS
    // ═══════════════════════════════════════════

    async getSettings(group?: string) {
        const where: any = {};
        if (group) where.group = group;
        return this.prisma.appSetting.findMany({ where, orderBy: { key: 'asc' } });
    }

    async getSetting(key: string) {
        const setting = await this.prisma.appSetting.findUnique({ where: { key } });
        if (!setting) throw new NotFoundException(`Setting '${key}' not found`);
        return setting;
    }

    async upsertSetting(dto: UpsertSettingDto) {
        return this.prisma.appSetting.upsert({
            where: { key: dto.key },
            create: { key: dto.key, value: dto.value, group: dto.group, label: dto.label },
            update: { value: dto.value, group: dto.group, label: dto.label },
        });
    }

    async deleteSetting(key: string) {
        return this.prisma.appSetting.delete({ where: { key } });
    }

    // ═══════════════════════════════════════════
    // MODULE TOGGLES
    // ═══════════════════════════════════════════

    async listModules() {
        return this.prisma.module.findMany({ orderBy: { order: 'asc' } });
    }

    async updateModule(id: string, dto: UpdateModuleDto) {
        return this.prisma.module.update({ where: { id }, data: dto });
    }

    async seedDefaultModules() {
        const defaults = [
            { name: 'surveys', label: 'Surveys', order: 1, icon: 'clipboard-list' },
            { name: 'analytics', label: 'Analytics', order: 2, icon: 'chart-bar' },
            { name: 'respondents', label: 'Respondents', order: 3, icon: 'users' },
            { name: 'crm', label: 'CRM & Leads', order: 4, icon: 'user-group' },
            { name: 'exports', label: 'Exports', order: 5, icon: 'download' },
            { name: 'payments', label: 'Payments', order: 6, icon: 'credit-card' },
            { name: 'datasets', label: 'Public Datasets', order: 7, icon: 'database' },
            { name: 'settings', label: 'Settings', order: 8, icon: 'cog' },
        ];

        let created = 0;
        for (const mod of defaults) {
            const existing = await this.prisma.module.findUnique({ where: { name: mod.name } });
            if (!existing) {
                await this.prisma.module.create({ data: mod });
                created++;
            }
        }
        return { created, total: defaults.length };
    }

    // ═══════════════════════════════════════════
    // CMS PAGES
    // ═══════════════════════════════════════════

    async createPage(dto: CreatePageDto) {
        const existing = await this.prisma.page.findUnique({ where: { slug: dto.slug } });
        if (existing) throw new ConflictException('Page slug already exists');
        return this.prisma.page.create({ data: dto as any });
    }

    async listPages(published?: boolean) {
        const where: any = {};
        if (published !== undefined) where.published = published;
        return this.prisma.page.findMany({ where, orderBy: { createdAt: 'desc' } });
    }

    async getPage(slug: string) {
        const page = await this.prisma.page.findUnique({ where: { slug } });
        if (!page) throw new NotFoundException('Page not found');
        return page;
    }

    async updatePage(id: string, dto: UpdatePageDto) {
        return this.prisma.page.update({ where: { id }, data: dto as any });
    }

    async deletePage(id: string) {
        const page = await this.prisma.page.findUnique({ where: { id } });
        if (!page) throw new NotFoundException('Page not found');
        if (page.isSystem) throw new ConflictException('Cannot delete a system page');
        return this.prisma.page.delete({ where: { id } });
    }

    // ═══════════════════════════════════════════
    // EMAIL TEMPLATES
    // ═══════════════════════════════════════════

    async listEmailTemplates() {
        return this.prisma.emailTemplate.findMany({ orderBy: { name: 'asc' } });
    }

    async getEmailTemplate(name: string) {
        const tpl = await this.prisma.emailTemplate.findUnique({ where: { name } });
        if (!tpl) throw new NotFoundException('Email template not found');
        return tpl;
    }

    async createEmailTemplate(dto: CreateEmailTemplateDto) {
        return this.prisma.emailTemplate.create({ data: dto as any });
    }

    async updateEmailTemplate(id: string, dto: UpdateEmailTemplateDto) {
        return this.prisma.emailTemplate.update({ where: { id }, data: dto as any });
    }

    async deleteEmailTemplate(id: string) {
        const tpl = await this.prisma.emailTemplate.findUnique({ where: { id } });
        if (!tpl) throw new NotFoundException('Template not found');
        if (tpl.isSystem) throw new ConflictException('Cannot delete a system template');
        return this.prisma.emailTemplate.delete({ where: { id } });
    }

    // ═══════════════════════════════════════════
    // MENUS
    // ═══════════════════════════════════════════

    async listMenus() {
        return this.prisma.menu.findMany({
            include: { items: { orderBy: { order: 'asc' }, include: { children: { orderBy: { order: 'asc' } } } } },
        });
    }

    async createMenu(dto: CreateMenuDto) {
        return this.prisma.menu.create({ data: dto });
    }

    async addMenuItem(dto: CreateMenuItemDto) {
        return this.prisma.menuItem.create({ data: dto as any });
    }

    async removeMenuItem(id: string) {
        return this.prisma.menuItem.delete({ where: { id } });
    }

    // ═══════════════════════════════════════════
    // MEDIA FILES
    // ═══════════════════════════════════════════

    async listMedia(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [files, total] = await Promise.all([
            this.prisma.mediaFile.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
            this.prisma.mediaFile.count(),
        ]);
        return {
            files,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async createMediaRecord(data: {
        fileName: string;
        fileUrl: string;
        mimeType: string;
        sizeKb: number;
        altText?: string;
        uploadedBy: string;
    }) {
        return this.prisma.mediaFile.create({ data });
    }

    async deleteMedia(id: string) {
        return this.prisma.mediaFile.delete({ where: { id } });
    }
}
