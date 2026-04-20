import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
    private rzp: Razorpay | null = null;
    private keyId: string = '';
    private keySecret: string = '';
    private webhookSecret: string = '';
    private cachedAt = 0;
    private readonly cacheTtlMs = 60_000;

    constructor(
        private config: ConfigService,
        private prisma: PrismaService,
    ) { }

    invalidateCache() {
        this.rzp = null;
        this.cachedAt = 0;
    }

    private async loadCreds(): Promise<boolean> {
        if (this.rzp && Date.now() - this.cachedAt < this.cacheTtlMs) return true;

        const rows = await this.prisma.appSetting.findMany({ where: { group: 'payment' } });
        const map: Record<string, unknown> = {};
        for (const r of rows) map[r.key] = r.value;

        const enabled = map.razorpay_enabled === undefined ? true : Boolean(map.razorpay_enabled);
        if (!enabled) {
            this.rzp = null;
            return false;
        }

        const key = (map.razorpay_key_id as string) || this.config.get<string>('RAZORPAY_KEY_ID') || '';
        const secret = (map.razorpay_key_secret as string) || this.config.get<string>('RAZORPAY_KEY_SECRET') || '';
        const webhook = (map.razorpay_webhook_secret as string) || this.config.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';

        if (!key || !secret) {
            this.rzp = null;
            return false;
        }

        if (!this.rzp || this.keyId !== key || this.keySecret !== secret) {
            this.rzp = new Razorpay({ key_id: key, key_secret: secret });
            this.keyId = key;
            this.keySecret = secret;
        }
        this.webhookSecret = webhook;
        this.cachedAt = Date.now();
        return true;
    }

    private async ensureConfigured(): Promise<Razorpay> {
        const ok = await this.loadCreds();
        if (!ok || !this.rzp) {
            throw new BadRequestException('Razorpay is not configured. Enable & set credentials in Admin → Payment Gateways.');
        }
        return this.rzp;
    }

    /** Create a Razorpay order for one-time payment */
    async createOrder(params: {
        userId: string;
        planId: string;
        invoiceId: string;
        amount: number;
        currency: string;
    }): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
        const rzp = await this.ensureConfigured();

        const order = await rzp.orders.create({
            amount: Math.round(params.amount * 100), // Razorpay uses paise
            currency: params.currency,
            receipt: params.invoiceId,
            notes: {
                invoiceId: params.invoiceId,
                planId: params.planId,
                userId: params.userId,
            },
        });

        // Record payment attempt
        await this.prisma.payment.create({
            data: {
                invoiceId: params.invoiceId,
                gateway: 'RAZORPAY',
                gatewayOrderId: order.id,
                amount: params.amount,
                currency: params.currency,
                status: 'INITIATED',
            },
        });

        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: this.keyId,
        };
    }

    /** Verify Razorpay payment signature (called from frontend after payment) */
    async verifyAndCapture(params: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }): Promise<{ success: boolean }> {
        await this.ensureConfigured();

        // Verify signature
        const body = params.razorpay_order_id + '|' + params.razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', this.keySecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== params.razorpay_signature) {
            throw new BadRequestException('Invalid Razorpay signature');
        }

        // Find the payment record
        const payment = await this.prisma.payment.findFirst({
            where: { gatewayOrderId: params.razorpay_order_id, gateway: 'RAZORPAY' },
            include: { invoice: { include: { subscription: true } } },
        });

        if (!payment) {
            throw new BadRequestException('Payment record not found');
        }

        // Update payment
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'PAID',
                gatewayPayId: params.razorpay_payment_id,
                method: 'razorpay',
            },
        });

        // Update invoice
        await this.prisma.invoice.update({
            where: { id: payment.invoiceId },
            data: {
                status: 'PAID',
                paidAt: new Date(),
                paymentMethod: 'razorpay',
                razorpayPayId: params.razorpay_payment_id,
            },
        });

        // Activate subscription
        const invoice = payment.invoice;
        const billingCycle = invoice.subscription.billingCycle;
        const periodDays = billingCycle === 'ANNUAL' ? 365 : 30;

        await this.prisma.subscription.update({
            where: { id: invoice.subscriptionId },
            data: {
                status: 'ACTIVE',
                razorpaySubId: params.razorpay_order_id,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000),
            },
        });

        return { success: true };
    }

    /** Handle Razorpay webhook event */
    async handleWebhook(body: any, signature: string): Promise<{ handled: boolean; event: string }> {
        await this.ensureConfigured();

        const webhookSecret = this.webhookSecret;
        if (!webhookSecret) throw new BadRequestException('Razorpay webhook secret not configured');

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(body))
            .digest('hex');

        if (expectedSignature !== signature) {
            throw new BadRequestException('Invalid Razorpay webhook signature');
        }

        const event = body.event as string;
        const payload = body.payload;

        switch (event) {
            case 'payment.captured':
                await this.handlePaymentCaptured(payload.payment?.entity);
                break;
            case 'payment.failed':
                await this.handlePaymentFailed(payload.payment?.entity);
                break;
            case 'refund.processed':
                await this.handleRefundProcessed(payload.refund?.entity, payload.payment?.entity);
                break;
            default:
                return { handled: false, event };
        }

        return { handled: true, event };
    }

    private async handlePaymentCaptured(payment: any) {
        if (!payment?.order_id) return;

        await this.prisma.payment.updateMany({
            where: { gatewayOrderId: payment.order_id, gateway: 'RAZORPAY' },
            data: {
                status: 'PAID',
                gatewayPayId: payment.id,
                method: payment.method || 'razorpay',
                gatewayResponse: payment,
            },
        });

        // Also update invoice
        const paymentRecord = await this.prisma.payment.findFirst({
            where: { gatewayOrderId: payment.order_id, gateway: 'RAZORPAY' },
        });
        if (paymentRecord) {
            await this.prisma.invoice.update({
                where: { id: paymentRecord.invoiceId },
                data: {
                    status: 'PAID',
                    paidAt: new Date(),
                    paymentMethod: payment.method || 'razorpay',
                    razorpayPayId: payment.id,
                },
            });
        }
    }

    private async handlePaymentFailed(payment: any) {
        if (!payment?.order_id) return;

        await this.prisma.payment.updateMany({
            where: { gatewayOrderId: payment.order_id, gateway: 'RAZORPAY' },
            data: {
                status: 'FAILED',
                failureReason: payment.error_description || 'Payment failed',
                gatewayResponse: payment,
            },
        });

        const paymentRecord = await this.prisma.payment.findFirst({
            where: { gatewayOrderId: payment.order_id, gateway: 'RAZORPAY' },
        });
        if (paymentRecord) {
            await this.prisma.invoice.update({
                where: { id: paymentRecord.invoiceId },
                data: { status: 'FAILED' },
            });
        }
    }

    private async handleRefundProcessed(refund: any, payment: any) {
        if (!payment?.id) return;

        await this.prisma.payment.updateMany({
            where: { gatewayPayId: payment.id, gateway: 'RAZORPAY' },
            data: {
                status: 'REFUNDED',
                refundId: refund?.id,
                refundedAmount: refund?.amount ? refund.amount / 100 : undefined,
                gatewayResponse: refund,
            },
        });
    }

    /** Initiate refund for a Razorpay payment */
    async refund(paymentId: string, amount?: number): Promise<any> {
        const rzp = await this.ensureConfigured();

        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment || payment.gateway !== 'RAZORPAY' || !payment.gatewayPayId) {
            throw new BadRequestException('Invalid Razorpay payment for refund');
        }

        const refundParams: any = {};
        if (amount) {
            refundParams.amount = Math.round(amount * 100);
        }

        const refund = await rzp.payments.refund(payment.gatewayPayId, refundParams);

        await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: amount ? 'PARTIALLY_REFUNDED' : 'REFUNDED',
                refundId: refund.id,
                refundedAmount: (refund.amount || 0) / 100,
            },
        });

        return refund;
    }
}
