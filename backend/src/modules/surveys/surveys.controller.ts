import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import {
    CreateSurveyDto,
    UpdateSurveyDto,
    UpdateQuestionsDto,
    LaunchSurveyDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Surveys')
@ApiBearerAuth()
@Controller('api/v1/surveys')
@UseGuards(JwtAuthGuard)
export class SurveysController {
    constructor(private readonly surveysService: SurveysService) { }

    @Get('available')
    @UseGuards(RolesGuard)
    @Roles('RESPONDENT')
    @ApiOperation({ summary: 'List active surveys available for respondents' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    async findAvailable(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.surveysService.findActiveForRespondents({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            search,
        });
    }

    @Get('available/:id')
    @UseGuards(RolesGuard)
    @Roles('RESPONDENT')
    @ApiOperation({ summary: 'Get survey details for respondent to take' })
    async findAvailableById(@Param('id') id: string) {
        return this.surveysService.findActiveById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new survey' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateSurveyDto,
    ) {
        return this.surveysService.create(userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List my surveys' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'search', required: false })
    async findAll(
        @CurrentUser('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
    ) {
        return this.surveysService.findAllByUser(userId, {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            status,
            search,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get survey by ID' })
    async findById(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
    ) {
        return this.surveysService.findById(id, userId);
    }

    @Get(':id/stats')
    @ApiOperation({ summary: 'Get survey statistics' })
    async getStats(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
    ) {
        return this.surveysService.getStats(id, userId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update survey details' })
    async update(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
        @Body() dto: UpdateSurveyDto,
    ) {
        return this.surveysService.update(id, userId, dto);
    }

    @Put(':id/questions')
    @ApiOperation({ summary: 'Bulk update survey questions' })
    async updateQuestions(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
        @Body() dto: UpdateQuestionsDto,
    ) {
        return this.surveysService.updateQuestions(id, userId, dto.questions);
    }

    @Post(':id/launch')
    @ApiOperation({ summary: 'Launch a survey' })
    async launch(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
        @Body() dto: LaunchSurveyDto,
    ) {
        return this.surveysService.launch(id, userId, dto.startsAt, dto.endsAt);
    }

    @Patch(':id/pause')
    @ApiOperation({ summary: 'Pause a survey' })
    async pause(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
    ) {
        return this.surveysService.pause(id, userId);
    }

    @Patch(':id/complete')
    @ApiOperation({ summary: 'Complete a survey' })
    async complete(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
    ) {
        return this.surveysService.complete(id, userId);
    }

    @Patch(':id/archive')
    @ApiOperation({ summary: 'Archive a survey' })
    async archive(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
    ) {
        return this.surveysService.archive(id, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a draft survey' })
    async delete(
        @CurrentUser('id') userId: string,
        @Param('id') id: string,
    ) {
        return this.surveysService.delete(id, userId);
    }
}
