import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { ResponsesService } from './responses.service';
import { SubmitResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import * as crypto from 'crypto';

@ApiTags('Responses')
@Controller('api/v1/responses')
export class ResponsesController {
    constructor(private readonly responsesService: ResponsesService) { }

    @Post('submit')
    @ApiOperation({ summary: 'Submit a survey response (public)' })
    async submit(@Body() dto: SubmitResponseDto, @Req() req: Request) {
        const ip = req.ip || req.socket.remoteAddress || '';
        const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
        const userAgent = req.headers['user-agent'] || '';
        return this.responsesService.submit(dto, ipHash, userAgent);
    }

    @Get('survey/:surveyId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List responses for a survey' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    async findBySurvey(
        @Param('surveyId') surveyId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        return this.responsesService.findBySurvey(surveyId, {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            status,
        });
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get response details' })
    async findById(@Param('id') id: string) {
        return this.responsesService.findById(id);
    }

    @Patch(':id/flag')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Flag a response' })
    async flag(@Param('id') id: string, @Body() body: { flags: unknown }) {
        return this.responsesService.flagResponse(id, body.flags);
    }

    @Patch(':id/reject')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reject a response' })
    async reject(@Param('id') id: string) {
        return this.responsesService.rejectResponse(id);
    }
}
