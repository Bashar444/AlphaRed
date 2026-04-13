export declare class RegisterDto {
    email: string;
    name: string;
    password: string;
    organization?: string;
    phone?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
}
export declare class UpdateProfileDto {
    name?: string;
    avatarUrl?: string;
    organization?: string;
    designation?: string;
    phone?: string;
    country?: string;
    state?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
