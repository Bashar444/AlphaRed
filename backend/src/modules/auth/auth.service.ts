import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import {
    RegisterDto,
    LoginDto,
    UpdateProfileDto,
    ChangePasswordDto,
} from './dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private mailer: MailerService,
    ) { }

    async register(dto: RegisterDto) {
        if (dto.confirmPassword !== undefined && dto.confirmPassword !== dto.password) {
            throw new BadRequestException('Passwords do not match');
        }

        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                name: dto.name,
                passwordHash,
                organization: dto.organization,
                phone: dto.phone,
                role: dto.accountType === 'RESPONDENT' ? 'RESPONDENT' : 'USER',
                status: 'ACTIVE',
            },
        });

        // Fire-and-forget email verification token generation
        try {
            await this.createVerificationToken(user.email);
        } catch {
            /* non-fatal */
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                emailVerified: user.emailVerified,
            },
            ...tokens,
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Account is not active');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        const tokens = await this.generateTokens(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
                organization: user.organization,
            },
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || user.status !== 'ACTIVE') {
                throw new UnauthorizedException('Invalid refresh token');
            }
            return this.generateTokens(user.id, user.email, user.role);
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                phone: true,
                role: true,
                status: true,
                organization: true,
                designation: true,
                country: true,
                state: true,
                preferredLanguage: true,
                timezone: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const data: any = { ...dto };
        if (dto.email) {
            const normalized = dto.email.toLowerCase();
            const existing = await this.prisma.user.findUnique({ where: { email: normalized } });
            if (existing && existing.id !== userId) {
                throw new ConflictException('Email already in use');
            }
            data.email = normalized;
            // Email change → require re-verification
            data.emailVerified = null;
            try {
                await this.createVerificationToken(normalized);
            } catch { /* non-fatal */ }
        }

        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                phone: true,
                role: true,
                organization: true,
                designation: true,
                country: true,
                state: true,
                emailVerified: true,
            },
        });
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.passwordHash) {
            throw new BadRequestException('Cannot change password');
        }

        const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        const newHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });

        return { message: 'Password changed successfully' };
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return { message: 'If the email exists, a reset link has been sent' };
        }

        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
            },
        });

        // Send via configured SMTP (falls back to log in non-prod if SMTP missing)
        try {
            await this.mailer.sendPasswordResetEmail(user.email, token);
        } catch (err) {
            // Never leak SMTP failures to the caller (preserves enumeration protection)
            console.error('[auth] password reset email failed:', err instanceof Error ? err.message : err);
        }

        return { message: 'If the email exists, a reset link has been sent' };
    }

    async resetPassword(token: string, newPassword: string) {
        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: resetToken.userId },
                data: { passwordHash },
            }),
            this.prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() },
            }),
        ]);

        return { message: 'Password reset successfully' };
    }

    /**
     * Create an email verification token (24h expiry).
     * In production this should also send an email via SMTP/Resend.
     * For now we log it in development.
     */
    async createVerificationToken(email: string) {
        const normalized = email.toLowerCase();
        const token = uuidv4();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        // Remove any existing tokens for this identifier
        await this.prisma.verificationToken.deleteMany({ where: { identifier: normalized } });

        await this.prisma.verificationToken.create({
            data: { identifier: normalized, token, expires },
        });

        try {
            await this.mailer.sendVerificationEmail(normalized, token);
        } catch (err) {
            console.error('[auth] verification email failed:', err instanceof Error ? err.message : err);
        }

        return { message: 'Verification email sent' };
    }

    async resendVerification(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        if (user.emailVerified) {
            return { message: 'Email is already verified' };
        }
        return this.createVerificationToken(user.email);
    }

    async verifyEmail(token: string) {
        const record = await this.prisma.verificationToken.findUnique({ where: { token } });
        if (!record || record.expires < new Date()) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { email: record.identifier },
                data: { emailVerified: new Date() },
            }),
            this.prisma.verificationToken.delete({ where: { token } }),
        ]);

        return { message: 'Email verified successfully' };
    }

    private async generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRY') || '15m',
            } as any),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRY') || '7d',
            } as any),
        ]);

        return { accessToken, refreshToken };
    }
}
