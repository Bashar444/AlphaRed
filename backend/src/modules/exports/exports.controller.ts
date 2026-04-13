import {
    Controller,
    Get,
    Post,
    Body,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { ExportsService } from './exports.service';
import { ExportRequestDto } from '../analysis/dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Exports')
@Controller('api/v1/exports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportsController {
    constructor(private readonly exportsService: ExportsService) { }

    @Post()
    @ApiOperation({ summary: 'Generate and download an export (CSV, XLS, PDF, JSON, ZIP)' })
    async createExport(
        @Body() dto: ExportRequestDto,
        @CurrentUser('sub') userId: string,
        @Res() res: Response,
    ) {
        const result = await this.exportsService.createExport(
            dto.surveyId,
            userId,
            dto.format,
            dto.reportId,
        );

        res.set({
            'Content-Type': result.mimeType,
            'Content-Disposition': `attachment; filename="${result.fileName}"`,
            'Content-Length': result.buffer.length,
        });

        res.send(result.buffer);
    }

    @Get()
    @ApiOperation({ summary: 'List my exports' })
    async getMyExports(@CurrentUser('sub') userId: string) {
        return this.exportsService.getUserExports(userId);
    }
}
