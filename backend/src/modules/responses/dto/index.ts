import { IsString, IsArray, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitResponseDto {
    @IsString()
    surveyId!: string;

    @IsString()
    respondentId!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerItemDto)
    answers!: AnswerItemDto[];

    @IsOptional()
    @IsNumber()
    durationSecs?: number;
}

export class AnswerItemDto {
    @IsString()
    questionId!: string;

    value!: unknown;
}
