import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface SmtpConfig {
    host: string;
    port: number;
    encryption: 'tls' | 'ssl' | 'none';
    user: string;
    pass: string;
    fromEmail: string;
    fromName?: string;
    replyTo?: string;
}

@Injectable()
export class MailerService {
    private readonly logger = new Logger(MailerService.name);
    private cached: { transporter: Transporter; config: SmtpConfig; loadedAt: number } | null = null;
    private readonly cacheTtlMs = 60_000;

    constructor(private prisma: PrismaService, private configService: ConfigService) { }

    private async loadConfig(): Promise<SmtpConfig | null> {
        const rows = await this.prisma.appSetting.findMany({ where: { group: 'email' } });
        const map: Record<string, unknown> = {};
        for (const r of rows) map[r.key] = r.value;

        const host = String(map.smtp_host ?? '').trim();
        const portRaw = map.smtp_port;
        const fromEmail = String(map.smtp_from_email ?? '').trim();
        if (!host || !portRaw || !fromEmail) return null;

        const port = typeof portRaw === 'number' ? portRaw : Number(portRaw);
        const encryption = (String(map.smtp_encryption ?? 'tls').toLowerCase() as SmtpConfig['encryption']) || 'tls';

        return {
            host,
            port: Number.isFinite(port) ? port : 587,
            encryption,
            user: String(map.smtp_user ?? ''),
            pass: String(map.smtp_pass ?? ''),
            fromEmail,
            fromName: map.smtp_from_name ? String(map.smtp_from_name) : undefined,
            replyTo: map.smtp_reply_to ? String(map.smtp_reply_to) : undefined,
        };
    }

    private buildTransporter(cfg: SmtpConfig): Transporter {
        const secure = cfg.encryption === 'ssl' || cfg.port === 465;
        return nodemailer.createTransport({
            host: cfg.host,
            port: cfg.port,
            secure,
            auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
            requireTLS: cfg.encryption === 'tls',
            tls: cfg.encryption === 'none' ? { rejectUnauthorized: false } : undefined,
        });
    }

    /** Get a transporter, refreshing if config changed or TTL expired. */
    private async getTransporter(force = false): Promise<{ transporter: Transporter; config: SmtpConfig } | null> {
        if (!force && this.cached && Date.now() - this.cached.loadedAt < this.cacheTtlMs) {
            return { transporter: this.cached.transporter, config: this.cached.config };
        }
        const config = await this.loadConfig();
        if (!config) {
            this.cached = null;
            return null;
        }
        const transporter = this.buildTransporter(config);
        this.cached = { transporter, config, loadedAt: Date.now() };
        return { transporter, config };
    }

    /** Force the cache to refresh on next send (call after admin saves email settings). */
    invalidateCache() {
        this.cached = null;
    }

    isProduction() {
        return this.configService.get('NODE_ENV') === 'production';
    }

    /**
     * Send an email. Returns true if delivered, false if SMTP is not configured
     * (in non-production, we log the email and return false instead of throwing).
     */
    async send(opts: { to: string; subject: string; html: string; text?: string }): Promise<boolean> {
        const conn = await this.getTransporter();
        if (!conn) {
            if (!this.isProduction()) {
                this.logger.warn(
                    `[mailer] SMTP not configured — would send to ${opts.to} subject="${opts.subject}"`,
                );
                this.logger.debug(`[mailer] body:\n${opts.text ?? opts.html}`);
                return false;
            }
            throw new BadRequestException('Email is not configured. Configure SMTP in Admin → Email Configuration.');
        }
        const { transporter, config } = conn;
        const fromHeader = config.fromName ? `"${config.fromName}" <${config.fromEmail}>` : config.fromEmail;

        try {
            await transporter.sendMail({
                from: fromHeader,
                to: opts.to,
                replyTo: config.replyTo,
                subject: opts.subject,
                text: opts.text,
                html: opts.html,
            });
            return true;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'unknown error';
            this.logger.error(`[mailer] send failed: ${msg}`);
            // Refresh cache in case credentials changed during this send window
            this.invalidateCache();
            throw new BadRequestException(`Email send failed: ${msg}`);
        }
    }

    /** Send the SMTP configuration test email using the configured smtp_test_recipient. */
    async sendTest(): Promise<{ ok: boolean; sentTo?: string; message: string }> {
        const rows = await this.prisma.appSetting.findMany({
            where: { key: 'smtp_test_recipient' },
        });
        const recipient = rows[0]?.value as string | undefined;
        if (!recipient) {
            throw new BadRequestException('Set "Test Recipient Email" in the email configuration first.');
        }
        // Force fresh config load (admin just saved)
        this.invalidateCache();
        const ok = await this.send({
            to: recipient,
            subject: 'PrimoData SMTP test',
            html: `<p>Hello,</p>
<p>This is a test email from your PrimoData admin panel. If you received this, your SMTP configuration is working.</p>
<p style="color:#64748b;font-size:12px">Sent at ${new Date().toISOString()}</p>`,
            text: `PrimoData SMTP test — sent at ${new Date().toISOString()}.\nIf you received this, your SMTP configuration is working.`,
        });
        return {
            ok,
            sentTo: recipient,
            message: ok
                ? `Test email sent to ${recipient}.`
                : `SMTP not configured — saved settings are incomplete.`,
        };
    }

    // ── Templated emails ──

    async sendVerificationEmail(to: string, token: string): Promise<boolean> {
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const url = `${baseUrl.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}`;
        return this.send({
            to,
            subject: 'Verify your PrimoData email',
            html: `<p>Welcome to PrimoData!</p>
<p>Please verify your email address by clicking the link below:</p>
<p><a href="${url}" style="display:inline-block;padding:10px 18px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none">Verify email</a></p>
<p>Or paste this URL into your browser:<br><code>${url}</code></p>
<p style="color:#64748b;font-size:12px">This link expires in 24 hours.</p>`,
            text: `Verify your PrimoData email: ${url}\n(This link expires in 24 hours.)`,
        });
    }

    async sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
        const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const url = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
        return this.send({
            to,
            subject: 'Reset your PrimoData password',
            html: `<p>You requested a password reset for your PrimoData account.</p>
<p><a href="${url}" style="display:inline-block;padding:10px 18px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none">Reset password</a></p>
<p>Or paste this URL into your browser:<br><code>${url}</code></p>
<p style="color:#64748b;font-size:12px">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`,
            text: `Reset your PrimoData password: ${url}\n(This link expires in 1 hour.)`,
        });
    }
}
