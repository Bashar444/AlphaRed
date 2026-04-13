import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

// Use require for Stripe to avoid nodenext module resolution issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const StripeLib = require('stripe');

@Injectable()
export class StripeService {
    private stripe: any;

    constructor(
        private config: ConfigService,
        private prisma: PrismaService,
    ) {
        const key = this.config.get<string>('STRIPE_SECRET_KEY');
        if (!key) {
            this.stripe = null;
        } else {
            this.stripe = new StripeLib(key);
        }
    }

    private ensureConfigured() {
        if (!this.stripe) {
            throw new BadRequestException('Stripe is not configured. Set STRIPE_SECRET_KEY.');
        }
    }

    /** Create or retrieve a Stripe customer for the user */
    async getOrCreateCustomer(userId: string): Promise<string> {
        this.ensureConfigured();

        const sub = await this.prisma.subscription.findUnique({ where: { userId } });
        if (sub?.stripeCustomerId) return sub.stripeCustomerId;

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const customer = await this.stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: { userId },
        });

        // Store on subscription if it exists
        if (sub) {
            await this.prisma.subscription.update({
                where: { userId },
                data: { stripeCustomerId: customer.id },
            });
        }

        return customer.id;
    }

    /** Create a Stripe Checkout Session for one-time or subscription payment */
    async createCheckoutSession(params: {
        userId: string;
        planId: string;
        billingCycle: string;
        invoiceId: string;
        amount: number;
        currency: string;
        successUrl: string;
        cancelUrl: string;
    }): Promise<{ sessionId: string; url: string }> {
        this.ensureConfigured();

        const customerId = await this.getOrCreateCustomer(params.userId);

        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: params.currency.toLowerCase(),
                        product_data: {
                            name: `PrimoData Subscription`,
                            description: `${params.billingCycle} plan`,
                        },
                        unit_amount: Math.round(params.amount * 100), // Stripe uses smallest currency unit
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                invoiceId: params.invoiceId,
                planId: params.planId,
                userId: params.userId,
            },
            success_url: params.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: params.cancelUrl,
        });

        // Record payment attempt
        await this.prisma.payment.create({
            data: {
                invoiceId: params.invoiceId,
                gateway: 'STRIPE',
                gatewayOrderId: session.id,
                amount: params.amount,
                currency: params.currency,
                status: 'INITIATED',
            },
        });

        return { sessionId: session.id, url: session.url! };
    }

    /** Handle Stripe webhook event */
    async handleWebhookEvent(payload: Buffer, signature: string): Promise<{ handled: boolean; event: string }> {
        this.ensureConfigured();

        const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) throw new BadRequestException('Stripe webhook secret not configured');

        let event: any;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch {
            throw new BadRequestException('Invalid Stripe webhook signature');
        }

        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutComplete(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;
            case 'charge.refunded':
                await this.handleRefund(event.data.object);
                break;
            default:
                return { handled: false, event: event.type };
        }

        return { handled: true, event: event.type };
    }

    private async handleCheckoutComplete(session: any) {
        const invoiceId = session.metadata?.invoiceId;
        if (!invoiceId) return;

        const paymentIntentId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        // Update payment record
        await this.prisma.payment.updateMany({
            where: { gatewayOrderId: session.id, gateway: 'STRIPE' },
            data: {
                status: 'PAID',
                gatewayPayId: paymentIntentId || undefined,
                gatewayResponse: session as any,
            },
        });

        // Update invoice
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status: 'PAID',
                paidAt: new Date(),
                paymentMethod: 'stripe',
                stripePayId: paymentIntentId || undefined,
            },
        });

        // Activate subscription
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { subscription: true },
        });
        if (invoice) {
            const billingCycle = invoice.subscription.billingCycle;
            const periodDays = billingCycle === 'ANNUAL' ? 365 : 30;
            await this.prisma.subscription.update({
                where: { id: invoice.subscriptionId },
                data: {
                    status: 'ACTIVE',
                    stripeSubId: session.id,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000),
                },
            });
        }
    }

    private async handlePaymentFailed(paymentIntent: any) {
        const invoiceId = paymentIntent.metadata?.invoiceId;
        if (!invoiceId) return;

        await this.prisma.payment.updateMany({
            where: { gatewayPayId: paymentIntent.id, gateway: 'STRIPE' },
            data: {
                status: 'FAILED',
                failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
                gatewayResponse: paymentIntent as any,
            },
        });

        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'FAILED' },
        });
    }

    private async handleRefund(charge: any) {
        if (!charge.payment_intent) return;
        const piId = typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent.id;

        await this.prisma.payment.updateMany({
            where: { gatewayPayId: piId, gateway: 'STRIPE' },
            data: {
                status: charge.amount_refunded === charge.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
                refundedAmount: charge.amount_refunded / 100,
                gatewayResponse: charge as any,
            },
        });
    }

    /** Initiate a refund for a Stripe payment */
    async refund(paymentId: string, amount?: number): Promise<any> {
        this.ensureConfigured();

        const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
        if (!payment || payment.gateway !== 'STRIPE' || !payment.gatewayPayId) {
            throw new BadRequestException('Invalid Stripe payment for refund');
        }

        const refundParams: any = {
            payment_intent: payment.gatewayPayId,
        };
        if (amount) {
            refundParams.amount = Math.round(amount * 100);
        }

        const refund = await this.stripe.refunds.create(refundParams);

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
