import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum, IsIn, Matches, ValidateIf } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @MinLength(8)
    password!: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    confirmPassword?: string;

    @IsOptional()
    @IsString()
    organization?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsIn(['USER', 'RESPONDENT'])
    accountType?: string;
}

export class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    refreshToken!: string;
}

export class ForgotPasswordDto {
    @IsEmail()
    email!: string;
}

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    token!: string;

    @IsString()
    @MinLength(8)
    password!: string;
}

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsString()
    organization?: string;

    @IsOptional()
    @IsString()
    designation?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    state?: string;
}

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    currentPassword!: string;

    @IsString()
    @MinLength(8)
    newPassword!: string;
}

export class VerifyEmailDto {
    @IsString()
    @IsNotEmpty()
    token!: string;
}
