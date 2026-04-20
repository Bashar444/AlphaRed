import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateApiAccessRequestDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    reason!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    useCase!: string;
}

export class ReviewApiAccessRequestDto {
    @IsIn(['APPROVED', 'REJECTED'])
    status!: 'APPROVED' | 'REJECTED';

    @IsOptional()
    @IsString()
    adminNotes?: string;
}
