import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from './stripe.service';
import { RazorpayService } from './razorpay.service';
import { CreateCheckoutDto, VerifyRazorpayDto, RefundPaymentDto } from './dto';

@Injectable()
export class PaymentsService {
    constructor(
        private prisma: PrismaService,
        private stripeService: StripeService,
        private razorpayService: RazorpayService,
    ) { }

    /** Create a checkout / payment order */
    async createCheckout(userId: string, dto: CreateCheckoutDto) {
        // Get or create subscription
        let sub = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });

        const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
        if (!plan || !plan.isActive) throw new NotFoundException('Plan not found or inactive');

        if (plan.priceUsd === 0 && plan.priceInr === 0) {
            throw new BadRequestException('Free plans do not require payment. Use the subscribe endpoint.');
        }

        // Determine amount and currency
        const isInr = dto.gateway === 'razorpay';
        const baseAmount = isInr ? plan.priceInr : plan.priceUsd;
        const currency = isInr ? 'INR' : 'USD';
        const billingCycle = dto.billingCycle || 'MONTHLY';

        // Annual discount: 2 months free
        let amount = billingCycle === 'ANNUAL' ? baseAmount * 10 : baseAmount;

        // Apply discount code
        if (dto.discountCode) {
            const discount = await this.prisma.discountCode.findUnique({
                where: { code: dto.discountCode },
            });
            if (!discount || !discount.isActive) {
                throw new BadRequestException('Invalid discount code');
            }
            if (discount.maxUses && discount.usedCount >= discount.maxUses) {
                throw new BadRequestException('Discount code fully used');
            }
            if (discount.validUntil && discount.validUntil < new Date()) {
                throw new BadRequestException('Discount code expired');
            }
            amount = amount * (1 - discount.value / 100);

            await this.prisma.discountCode.update({
                where: { id: discount.id },
                data: { usedCount: { increment: 1 } },
            });
        }

        // Create or update subscription as PENDING
        if (!sub) {
            sub = await this.prisma.subscription.create({
                data: {
                    userId,
                    planId: dto.planId,
                    billingCycle: billingCycle as any,
                    status: 'PENDING_APPROVAL',
                    discountCode: dto.discountCode,
                },
                include: { plan: true },
            });
        } else {
            sub = await this.prisma.subscription.update({
                where: { userId },
                data: {
                    planId: dto.planId,
                    billingCycle: billingCycle as any,
                    status: 'PENDING_APPROVAL',
                    discountCode: dto.discountCode,
                },
                include: { plan: true },
            });
        }

        // Create invoice
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const tax = isInr ? amount * 0.18 : 0; // 18% GST for INR
        const totalAmount = amount + tax;

        const invoice = await this.prisma.invoice.create({
            data: {
                subscriptionId: sub.id,
                invoiceNumber,
                amount: totalAmount,
                tax,
                currency,
                status: 'PENDING',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        // Route to gateway
        if (dto.gateway === 'stripe') {
            const successUrl = dto.successUrl || 'https://primodata.io/payment/success';
            const cancelUrl = dto.cancelUrl || 'https://primodata.io/payment/cancel';

            const session = await this.stripeService.createCheckoutSession({
                userId,
                planId: dto.planId,
                billingCycle,
                invoiceId: invoice.id,
                amount: totalAmount,
                currency,
                successUrl,
                cancelUrl,
            });

            return {
                gateway: 'stripe',
                sessionId: session.sessionId,
                url: session.url,
                invoiceId: invoice.id,
                invoiceNumber,
                amount: totalAmount,
                currency,
            };
        } else {
            const order = await this.razorpayService.createOrder({
                userId,
                planId: dto.planId,
                invoiceId: invoice.id,
                amount: totalAmount,
                currency,
            });

            return {
                gateway: 'razorpay',
                orderId: order.orderId,
                amount: order.amount,
                currency: order.currency,
                keyId: order.keyId,
                invoiceId: invoice.id,
                invoiceNumber,
            };
        }
    }

    /** Verify Razorpay payment (called after frontend completes payment) */
    async verifyRazorpay(dto: VerifyRazorpayDto) {
        return this.razorpayService.verifyAndCapture(dto);
    }

    /** Refund a payment */
    async refund(dto: RefundPaymentDto) {
        const payment = await this.prisma.payment.findUnique({ where: { id: dto.paymentId } });
        if (!payment) throw new NotFoundException('Payment not found');

        if (payment.gateway === 'STRIPE') {
            return this.stripeService.refund(dto.paymentId, dto.amount);
        } else {
            return this.razorpayService.refund(dto.paymentId, dto.amount);
        }
    }

    /** Get user invoices */
    async getUserInvoices(userId: string) {
        const sub = await this.prisma.subscription.findUnique({ where: { userId } });
        if (!sub) return [];

        return this.prisma.invoice.findMany({
            where: { subscriptionId: sub.id },
            include: { payments: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** Get payment details */
    async getPayment(paymentId: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { invoice: { include: { subscription: { include: { plan: true } } } } },
        });
        if (!payment) throw new NotFoundException('Payment not found');
        return payment;
    }

    /** Admin: list all payments */
    async listPayments(page = 1, limit = 20, status?: string) {
        const skip = (page - 1) * limit;
        const where: any = {};
        if (status) where.status = status;

        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                include: {
                    invoice: {
                        include: {
                            subscription: {
                                include: {
                                    user: { select: { id: true, email: true, name: true } },
                                    plan: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.payment.count({ where }),
        ]);

        return {
            payments,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
}
