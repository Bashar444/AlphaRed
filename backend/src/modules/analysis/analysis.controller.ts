import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AnalysisService } from './analysis.service';
import { TriggerAnalysisDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Analysis')
@Controller('api/v1/analysis')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalysisController {
    constructor(
        private readonly analysisService: AnalysisService,
        @InjectQueue('analysis') private readonly analysisQueue: Queue,
    ) { }

    @Post('trigger')
    @ApiOperation({ summary: 'Trigger survey analysis (queued via BullMQ)' })
    async trigger(
        @Body() dto: TriggerAnalysisDto,
        @CurrentUser('sub') userId: string,
    ) {
        const job = await this.analysisQueue.add('run-analysis', {
            surveyId: dto.surveyId,
            triggeredBy: userId,
        });

        return {
            message: 'Analysis queued',
            jobId: job.id,
            surveyId: dto.surveyId,
        };
    }

    @Post('trigger-sync')
    @ApiOperation({ summary: 'Run analysis synchronously (for small surveys)' })
    async triggerSync(
        @Body() dto: TriggerAnalysisDto,
        @CurrentUser('sub') userId: string,
    ) {
        return this.analysisService.runAnalysis(dto.surveyId, userId);
    }

    @Get('survey/:surveyId')
    @ApiOperation({ summary: 'Get all analysis reports for a survey' })
    async getReports(@Param('surveyId') surveyId: string) {
        return this.analysisService.getReports(surveyId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single analysis report' })
    async getReport(@Param('id') id: string) {
        return this.analysisService.getReport(id);
    }
}
