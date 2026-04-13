import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TriggerAnalysisDto {
    @ApiProperty({ description: 'Survey ID to analyze' })
    @IsString()
    surveyId!: string;
}

export class ExportRequestDto {
    @ApiProperty({ description: 'Survey ID' })
    @IsString()
    surveyId!: string;

    @ApiPropertyOptional({ description: 'Analysis report ID (optional)' })
    @IsOptional()
    @IsString()
    reportId?: string;

    @ApiProperty({ enum: ['PDF', 'XLS', 'CSV', 'ZIP', 'JSON'] })
    @IsString()
    format!: string;
}
