import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DatasetsService } from './datasets.service';
import { CreateDatasetDto, UpdateDatasetDto, DatasetQueryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Public Datasets')
@Controller('api/v1/datasets')
export class DatasetsController {
    constructor(private readonly datasetsService: DatasetsService) { }

    // ── Public endpoints (Statista-like free data pages) ──

    @Get()
    @ApiOperation({ summary: 'List published datasets (public)' })
    async findAll(@Query() query: DatasetQueryDto) {
        return this.datasetsService.findAll(query);
    }

    @Get('categories')
    @ApiOperation({ summary: 'Get dataset categories (public)' })
    async getCategories() {
        return this.datasetsService.getCategories();
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Get a dataset by slug (public, increments views)' })
    async findBySlug(@Param('slug') slug: string) {
        return this.datasetsService.findBySlug(slug);
    }

    // ── Admin endpoints ──

    @Get('admin/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List all datasets including unpublished (admin)' })
    async adminFindAll() {
        return this.datasetsService.adminFindAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a dataset (admin)' })
    async create(@Body() dto: CreateDatasetDto) {
        return this.datasetsService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a dataset (admin)' })
    async update(@Param('id') id: string, @Body() dto: UpdateDatasetDto) {
        return this.datasetsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a dataset (superadmin)' })
    async delete(@Param('id') id: string) {
        return this.datasetsService.delete(id);
    }
}
