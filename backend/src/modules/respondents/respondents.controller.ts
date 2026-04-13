import {
    Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RespondentsService } from './respondents.service';
import { CreateRespondentDto, UpdateRespondentDto, CreatePayoutDto, UpdatePayoutDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Respondents')
@Controller('api/v1/respondents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RespondentsController {
    constructor(private readonly service: RespondentsService) { }

    @Post()
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Create a respondent' })
    async create(@Body() dto: CreateRespondentDto) {
        return this.service.create(dto);
    }

    @Get()
    @Roles('SUPERADMIN', 'MANAGER', 'AGENT')
    @ApiOperation({ summary: 'List respondents' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'kycStatus', required: false })
    @ApiQuery({ name: 'country', required: false })
    @ApiQuery({ name: 'search', required: false })
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
        @Query('kycStatus') kycStatus?: string,
        @Query('country') country?: string,
        @Query('search') search?: string,
    ) {
        return this.service.findAll(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            { status, kycStatus, country, search },
        );
    }

    @Get('stats')
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Respondent statistics' })
    async getStats() {
        return this.service.getStats();
    }

    @Get(':id')
    @Roles('SUPERADMIN', 'MANAGER', 'AGENT')
    @ApiOperation({ summary: 'Get respondent details' })
    async findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Put(':id')
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Update a respondent' })
    async update(@Param('id') id: string, @Body() dto: UpdateRespondentDto) {
        return this.service.update(id, dto);
    }

    @Patch(':id/kyc')
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Update KYC status' })
    async updateKyc(
        @Param('id') id: string,
        @Body('kycStatus') kycStatus: string,
    ) {
        return this.service.updateKyc(id, kycStatus);
    }

    @Patch(':id/ban')
    @Roles('SUPERADMIN')
    @ApiOperation({ summary: 'Ban a respondent' })
    async ban(@Param('id') id: string) {
        return this.service.ban(id);
    }

    // ── Payouts ──

    @Post('payouts')
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Create a payout for a respondent' })
    async createPayout(@Body() dto: CreatePayoutDto) {
        return this.service.createPayout(dto);
    }

    @Get('payouts/list')
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'List all payouts' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    async listPayouts(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        return this.service.listPayouts(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            status,
        );
    }

    @Patch('payouts/:id')
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Update payout status' })
    async updatePayout(@Param('id') id: string, @Body() dto: UpdatePayoutDto) {
        return this.service.updatePayout(id, dto);
    }
}
