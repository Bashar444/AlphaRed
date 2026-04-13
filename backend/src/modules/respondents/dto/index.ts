import { IsString, IsOptional, IsEnum, IsNumber, IsObject, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRespondentDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phoneHash?: string;

    @ApiProperty({ description: 'Demographics JSON' })
    @IsObject()
    demographics!: Record<string, any>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    city?: string;
}

export class UpdateRespondentDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'])
    status?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(['PENDING', 'OTP_VERIFIED', 'FULL_VERIFIED', 'REJECTED', 'SUSPENDED'])
    kycStatus?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    qualityScore?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    demographics?: Record<string, any>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    state?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    city?: string;
}

export class CreatePayoutDto {
    @ApiProperty()
    @IsString()
    respondentId!: string;

    @ApiProperty()
    @IsNumber()
    amount!: number;

    @ApiProperty({ description: 'Payment method: upi, bank_transfer, etc.' })
    @IsString()
    method!: string;
}

export class UpdatePayoutDto {
    @ApiProperty({ enum: ['pending', 'processing', 'completed', 'failed'] })
    @IsEnum(['pending', 'processing', 'completed', 'failed'])
    status!: string;
}
