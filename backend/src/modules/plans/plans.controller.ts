import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Plans')
@Controller('api/v1/plans')
export class PlansController {
    constructor(private readonly plansService: PlansService) { }

    @Get()
    @ApiOperation({ summary: 'List all active plans (public)' })
    @ApiQuery({ name: 'all', required: false, description: 'Include inactive plans (admin)' })
    async findAll(@Query('all') all?: string) {
        return this.plansService.findAll(all === 'true');
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Get plan by slug' })
    async findBySlug(@Param('slug') slug: string) {
        return this.plansService.findBySlug(slug);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new plan (superadmin)' })
    async create(@Body() dto: CreatePlanDto) {
        return this.plansService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a plan (superadmin)' })
    async update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
        return this.plansService.update(id, dto);
    }

    @Patch(':id/toggle')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toggle plan active/inactive' })
    async toggle(@Param('id') id: string) {
        return this.plansService.toggleActive(id);
    }
}
