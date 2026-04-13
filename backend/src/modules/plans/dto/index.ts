import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, Min } from 'class-validator';

export class CreatePlanDto {
    @IsString()
    name!: string;

    @IsString()
    slug!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0)
    priceInr!: number;

    @IsNumber()
    @Min(0)
    priceUsd!: number;

    @IsOptional()
    @IsString()
    billingCycle?: string;

    @IsNumber()
    @Min(0)
    maxSurveys!: number;

    @IsNumber()
    @Min(0)
    maxResponses!: number;

    @IsNumber()
    @Min(0)
    maxQuestions!: number;

    @IsNumber()
    @Min(0)
    maxTeamMembers!: number;

    @IsArray()
    features!: string[];

    @IsOptional()
    @IsString()
    supportLevel?: string;

    @IsOptional()
    @IsNumber()
    trialDays?: number;

    @IsOptional()
    @IsNumber()
    sortOrder?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;
}

export class UpdatePlanDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    priceInr?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    priceUsd?: number;

    @IsOptional()
    @IsNumber()
    maxSurveys?: number;

    @IsOptional()
    @IsNumber()
    maxResponses?: number;

    @IsOptional()
    @IsNumber()
    maxQuestions?: number;

    @IsOptional()
    @IsNumber()
    maxTeamMembers?: number;

    @IsOptional()
    @IsArray()
    features?: string[];

    @IsOptional()
    @IsString()
    supportLevel?: string;

    @IsOptional()
    @IsNumber()
    trialDays?: number;

    @IsOptional()
    @IsNumber()
    sortOrder?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;
}
