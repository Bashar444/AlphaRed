import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLogQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    entity?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    action?: string;

    @ApiPropertyOptional({ description: 'ISO date (from)' })
    @IsOptional()
    @IsString()
    from?: string;

    @ApiPropertyOptional({ description: 'ISO date (to)' })
    @IsOptional()
    @IsString()
    to?: string;
}
