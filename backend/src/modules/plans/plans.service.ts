import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from './dto';

@Injectable()
export class PlansService {
    constructor(private prisma: PrismaService) { }

    async findAll(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        return this.prisma.plan.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });
    }

    async findBySlug(slug: string) {
        const plan = await this.prisma.plan.findUnique({ where: { slug } });
        if (!plan) throw new NotFoundException('Plan not found');
        return plan;
    }

    async findById(id: string) {
        const plan = await this.prisma.plan.findUnique({ where: { id } });
        if (!plan) throw new NotFoundException('Plan not found');
        return plan;
    }

    async create(dto: CreatePlanDto) {
        const existing = await this.prisma.plan.findUnique({ where: { slug: dto.slug } });
        if (existing) throw new ConflictException('Plan slug already exists');

        return this.prisma.plan.create({ data: dto as any });
    }

    async update(id: string, dto: UpdatePlanDto) {
        await this.findById(id);
        return this.prisma.plan.update({ where: { id }, data: dto });
    }

    async toggleActive(id: string) {
        const plan = await this.findById(id);
        return this.prisma.plan.update({
            where: { id },
            data: { isActive: !plan.isActive },
        });
    }
}
