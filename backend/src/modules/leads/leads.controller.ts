import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import {
    CreateLeadDto,
    UpdateLeadDto,
    AddLeadActivityDto,
    LeadQueryDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Leads')
@Controller('api/v1/leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    // ── Public lead capture (website contact form) ──
    @Post('capture')
    @ApiOperation({ summary: 'Public lead capture from website (no auth)' })
    async capture(@Body() dto: CreateLeadDto) {
        return this.leadsService.capture(dto);
    }

    // ── Authenticated CRM endpoints ──
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER', 'AGENT')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List leads with filters' })
    async findAll(@Query() query: LeadQueryDto) {
        return this.leadsService.findAll(query);
    }

    @Get('pipeline')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER', 'AGENT')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get pipeline summary (count per status)' })
    async pipeline() {
        return this.leadsService.getPipelineSummary();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER', 'AGENT')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get lead details with activities' })
    async findOne(@Param('id') id: string) {
        return this.leadsService.findById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER', 'AGENT')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a lead manually' })
    async create(@Body() dto: CreateLeadDto, @CurrentUser('sub') userId: string) {
        return this.leadsService.create(dto, userId);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER', 'AGENT')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a lead' })
    async update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
        return this.leadsService.update(id, dto);
    }

    @Patch(':id/assign')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Assign lead to a user' })
    async assign(
        @Param('id') id: string,
        @Body('assignedToId') assignedToId: string,
        @CurrentUser('sub') userId: string,
    ) {
        return this.leadsService.assign(id, assignedToId, userId);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER', 'AGENT')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change lead status (pipeline move)' })
    async changeStatus(
        @Param('id') id: string,
        @Body('status') status: string,
        @CurrentUser('sub') userId: string,
    ) {
        return this.leadsService.changeStatus(id, status, userId);
    }

    @Post(':id/activities')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER', 'AGENT')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add activity to a lead (call, email, note)' })
    async addActivity(
        @Param('id') id: string,
        @Body() dto: AddLeadActivityDto,
        @CurrentUser('sub') userId: string,
    ) {
        return this.leadsService.addActivity(id, dto, userId);
    }

    @Get(':id/activities')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER', 'AGENT')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get lead activity timeline' })
    async getActivities(@Param('id') id: string) {
        return this.leadsService.getActivities(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a lead (superadmin)' })
    async delete(@Param('id') id: string) {
        return this.leadsService.delete(id);
    }
}
