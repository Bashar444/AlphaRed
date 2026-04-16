import {
    Controller,
    Get,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@Controller('api/v1/dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('admin')
    @UseGuards(RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Admin dashboard stats' })
    async adminStats() {
        return this.dashboardService.getAdminStats();
    }

    @Get('admin/activity')
    @UseGuards(RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Recent platform activity (admin)' })
    async recentActivity() {
        return this.dashboardService.getRecentActivity();
    }

    @Get('admin/charts')
    @UseGuards(RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Admin dashboard chart data' })
    @ApiQuery({ name: 'type', required: true, enum: ['responses_timeline', 'revenue_trend', 'quality_distribution', 'task_status', 'survey_status'] })
    async adminCharts(@Query('type') type: string) {
        return this.dashboardService.getChartData(type);
    }

    @Get('me')
    @ApiOperation({ summary: 'My dashboard stats (user)' })
    async myStats(@CurrentUser('sub') userId: string) {
        return this.dashboardService.getUserStats(userId);
    }
}
