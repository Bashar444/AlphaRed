import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDatasetDto, UpdateDatasetDto, DatasetQueryDto } from './dto';

@Injectable()
export class DatasetsService {
    constructor(private prisma: PrismaService) { }

    /** Public — list published datasets with filters */
    async findAll(query: DatasetQueryDto) {
        const where: any = { published: true };

        if (query.category) where.category = query.category;
        if (query.region) where.region = query.region;
        if (query.country) where.country = query.country;
        if (query.year) where.year = parseInt(query.year, 10);
        if (query.featured === 'true') where.featured = true;
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.publicDataset.findMany({
            where,
            select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                subCategory: true,
                region: true,
                country: true,
                description: true,
                chartType: true,
                source: true,
                year: true,
                tags: true,
                featured: true,
                viewCount: true,
                createdAt: true,
            },
            orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        });
    }

    /** Public — get a single dataset by slug (increments view count) */
    async findBySlug(slug: string) {
        const dataset = await this.prisma.publicDataset.findUnique({ where: { slug } });
        if (!dataset || !dataset.published) throw new NotFoundException('Dataset not found');

        await this.prisma.publicDataset.update({
            where: { slug },
            data: { viewCount: { increment: 1 } },
        });

        return dataset;
    }

    /** Public — get list of categories */
    async getCategories() {
        const datasets = await this.prisma.publicDataset.findMany({
            where: { published: true },
            select: { category: true },
            distinct: ['category'],
            orderBy: { category: 'asc' },
        });
        return datasets.map((d) => d.category);
    }

    /** Admin — list all datasets including unpublished */
    async adminFindAll() {
        return this.prisma.publicDataset.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    /** Admin — create dataset */
    async create(dto: CreateDatasetDto) {
        const existing = await this.prisma.publicDataset.findUnique({ where: { slug: dto.slug } });
        if (existing) throw new ConflictException('Dataset slug already exists');

        return this.prisma.publicDataset.create({
            data: dto as any,
        });
    }

    /** Admin — update dataset */
    async update(id: string, dto: UpdateDatasetDto) {
        const dataset = await this.prisma.publicDataset.findUnique({ where: { id } });
        if (!dataset) throw new NotFoundException('Dataset not found');

        return this.prisma.publicDataset.update({
            where: { id },
            data: dto as any,
        });
    }

    /** Admin — delete dataset */
    async delete(id: string) {
        const dataset = await this.prisma.publicDataset.findUnique({ where: { id } });
        if (!dataset) throw new NotFoundException('Dataset not found');

        return this.prisma.publicDataset.delete({ where: { id } });
    }
}
