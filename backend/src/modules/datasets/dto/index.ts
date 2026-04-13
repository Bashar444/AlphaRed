import {
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsArray,
    IsInt,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDatasetDto {
    @ApiProperty()
    @IsString()
    title!: string;

    @ApiProperty()
    @IsString()
    slug!: string;

    @ApiProperty()
    @IsString()
    category!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    subCategory?: string;

    @ApiProperty()
    @IsString()
    region!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    state?: string;

    @ApiProperty()
    @IsString()
    description!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    methodology?: string;

    @ApiProperty({ description: 'Chart data as JSON' })
    data!: any;

    @ApiPropertyOptional({ default: 'bar' })
    @IsOptional()
    @IsString()
    chartType?: string;

    @ApiProperty()
    @IsString()
    source!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sourceUrl?: string;

    @ApiProperty()
    @IsInt()
    @Min(1900)
    year!: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    tags?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    featured?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    published?: boolean;
}

export class UpdateDatasetDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    data?: any;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    chartType?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    source?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sourceUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    tags?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    featured?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    published?: boolean;
}

export class DatasetQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    region?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    year?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    featured?: string;
}
