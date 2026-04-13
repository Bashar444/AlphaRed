import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvitationDto {
    @ApiProperty()
    @IsString()
    surveyId!: string;

    @ApiProperty({ type: [String], description: 'Array of respondent IDs to invite' })
    @IsArray()
    @IsString({ each: true })
    respondentIds!: string[];
}

export class BulkInviteByFilterDto {
    @ApiProperty()
    @IsString()
    surveyId!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional({ description: 'Minimum quality score' })
    @IsOptional()
    minQualityScore?: number;

    @ApiPropertyOptional({ description: 'Max number to invite' })
    @IsOptional()
    maxCount?: number;
}
