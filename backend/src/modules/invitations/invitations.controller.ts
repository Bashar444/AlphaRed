import {
    Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto, BulkInviteByFilterDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Invitations')
@Controller('api/v1/invitations')
export class InvitationsController {
    constructor(private readonly service: InvitationsService) { }

    // ── Authenticated endpoints ──

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER', 'AGENT')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send invitations to specific respondents' })
    async create(@Body() dto: CreateInvitationDto) {
        return this.service.createBatch(dto);
    }

    @Post('bulk-filter')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Bulk invite respondents matching filters' })
    async bulkInviteByFilter(@Body() dto: BulkInviteByFilterDto) {
        return this.service.bulkInviteByFilter(dto);
    }

    @Get('survey/:surveyId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List invitations for a survey' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    async listBySurvey(
        @Param('surveyId') surveyId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        return this.service.listBySurvey(
            surveyId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            status,
        );
    }

    @Get('survey/:surveyId/stats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Invitation stats for a survey' })
    async getStats(@Param('surveyId') surveyId: string) {
        return this.service.getStats(surveyId);
    }

    @Patch(':id/cancel')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel an invitation' })
    async cancel(@Param('id') id: string) {
        return this.service.cancel(id);
    }

    // ── Public endpoints (respondent token-based) ──

    @Get('open/:token')
    @ApiOperation({ summary: 'Track invitation open (public, token-based)' })
    async markOpened(@Param('token') token: string) {
        return this.service.markOpened(token);
    }

    @Post('complete/:token')
    @ApiOperation({ summary: 'Mark invitation completed (public, token-based)' })
    async markCompleted(@Param('token') token: string) {
        return this.service.markCompleted(token);
    }
}
