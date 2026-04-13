import { IsString, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── App Settings ──

export class UpsertSettingDto {
    @ApiProperty()
    @IsString()
    key!: string;

    @ApiProperty()
    value!: any;

    @ApiProperty()
    @IsString()
    group!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    label?: string;
}

// ── Modules ──

export class UpdateModuleDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isEnabled?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    order?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    icon?: string;
}

// ── Pages CMS ──

export class CreatePageDto {
    @ApiProperty()
    @IsString()
    title!: string;

    @ApiProperty()
    @IsString()
    slug!: string;

    @ApiProperty()
    @IsObject()
    content!: Record<string, any>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    metaTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    metaDesc?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    published?: boolean;
}

export class UpdatePageDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    content?: Record<string, any>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    metaTitle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    metaDesc?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    published?: boolean;
}

// ── Email Templates ──

export class CreateEmailTemplateDto {
    @ApiProperty()
    @IsString()
    name!: string;

    @ApiProperty()
    @IsString()
    subject!: string;

    @ApiProperty()
    @IsString()
    body!: string;

    @ApiPropertyOptional()
    @IsOptional()
    variables?: any;
}

export class UpdateEmailTemplateDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    subject?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    body?: string;

    @ApiPropertyOptional()
    @IsOptional()
    variables?: any;
}

// ── Menus ──

export class CreateMenuDto {
    @ApiProperty()
    @IsString()
    name!: string;

    @ApiProperty()
    @IsString()
    location!: string;
}

export class CreateMenuItemDto {
    @ApiProperty()
    @IsString()
    menuId!: string;

    @ApiProperty()
    @IsString()
    label!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    url?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    pageId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    order?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    parentId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    target?: string;
}
