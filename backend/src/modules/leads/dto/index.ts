import {
    IsString,
    IsOptional,
    IsEmail,
    IsEnum,
    IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LeadStatusEnum {
    NEW = 'NEW',
    CONTACTED = 'CONTACTED',
    QUALIFIED = 'QUALIFIED',
    PROPOSAL_SENT = 'PROPOSAL_SENT',
    NEGOTIATION = 'NEGOTIATION',
    CONVERTED = 'CONVERTED',
    LOST = 'LOST',
}

export class CreateLeadDto {
    @ApiProperty()
    @IsString()
    name!: string;

    @ApiProperty()
    @IsEmail()
    email!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    organization?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    planInterest?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    message?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    source?: string;
}

export class UpdateLeadDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    organization?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    planInterest?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    message?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(LeadStatusEnum)
    status?: LeadStatusEnum;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    assignedToId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    followUpAt?: string;
}

export class AddLeadActivityDto {
    @ApiProperty({ description: 'Activity type: call, email, meeting, note, status_change' })
    @IsString()
    type!: string;

    @ApiProperty()
    @IsString()
    note!: string;
}

export class LeadQueryDto {
    @ApiPropertyOptional({ enum: LeadStatusEnum })
    @IsOptional()
    @IsEnum(LeadStatusEnum)
    status?: LeadStatusEnum;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    assignedToId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    source?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}
