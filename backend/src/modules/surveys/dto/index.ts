import {
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsArray,
    IsEnum,
    IsDateString,
    ValidateNested,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSurveyDto {
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    targetResponses?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    estimatedMinutes?: number;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    welcomeMessage?: string;

    @IsOptional()
    @IsString()
    thankYouMessage?: string;

    @IsOptional()
    @IsBoolean()
    progressBar?: boolean;

    @IsOptional()
    @IsBoolean()
    randomizeQuestions?: boolean;

    @IsOptional()
    @IsBoolean()
    allowAnonymous?: boolean;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsArray()
    tags?: string[];

    @IsOptional()
    @IsString()
    teamId?: string;
}

export class UpdateSurveyDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    targetResponses?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    estimatedMinutes?: number;

    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsString()
    welcomeMessage?: string;

    @IsOptional()
    @IsString()
    thankYouMessage?: string;

    @IsOptional()
    @IsBoolean()
    progressBar?: boolean;

    @IsOptional()
    @IsBoolean()
    randomizeQuestions?: boolean;

    @IsOptional()
    @IsBoolean()
    allowAnonymous?: boolean;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsArray()
    tags?: string[];

    @IsOptional()
    @IsDateString()
    startsAt?: string;

    @IsOptional()
    @IsDateString()
    endsAt?: string;
}

export class CreateQuestionDto {
    @IsString()
    type!: string;

    @IsString()
    text!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    required?: boolean;

    @IsOptional()
    options?: unknown;

    @IsOptional()
    validation?: unknown;

    @IsOptional()
    logic?: unknown;

    @IsOptional()
    @IsString()
    mediaUrl?: string;
}

export class UpdateQuestionsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionItemDto)
    questions!: QuestionItemDto[];
}

export class QuestionItemDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsNumber()
    order!: number;

    @IsString()
    type!: string;

    @IsString()
    text!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    required?: boolean;

    @IsOptional()
    options?: unknown;

    @IsOptional()
    validation?: unknown;

    @IsOptional()
    logic?: unknown;

    @IsOptional()
    @IsString()
    mediaUrl?: string;
}

export class LaunchSurveyDto {
    @IsOptional()
    @IsDateString()
    startsAt?: string;

    @IsOptional()
    @IsDateString()
    endsAt?: string;
}
