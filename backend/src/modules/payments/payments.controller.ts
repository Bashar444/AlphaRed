import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Req,
    Headers,
    UseGuards,
    HttpCode,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { RazorpayService } from './razorpay.service';
import { CreateCheckoutDto, VerifyRazorpayDto, RefundPaymentDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// ═══════════════════════════════════════════
// AUTHENTICATED ENDPOINTS
// ═══════════════════════════════════════════

@ApiTags('Payments')
@Controller('api/v1/payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('checkout')
    @ApiOperation({ summary: 'Create a checkout session (Stripe or Razorpay order)' })
    async createCheckout(
        @CurrentUser('sub') userId: string,
        @Body() dto: CreateCheckoutDto,
    ) {
        return this.paymentsService.createCheckout(userId, dto);
    }

    @Post('razorpay/verify')
    @ApiOperation({ summary: 'Verify Razorpay payment signature (frontend callback)' })
    async verifyRazorpay(@Body() dto: VerifyRazorpayDto) {
        return this.paymentsService.verifyRazorpay(dto);
    }

    @Get('invoices')
    @ApiOperation({ summary: 'Get my invoices' })
    async getMyInvoices(@CurrentUser('sub') userId: string) {
        return this.paymentsService.getUserInvoices(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get payment details' })
    async getPayment(@Param('id') id: string) {
        return this.paymentsService.getPayment(id);
    }

    @Post('refund')
    @UseGuards(RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Refund a payment (admin only)' })
    async refund(@Body() dto: RefundPaymentDto) {
        return this.paymentsService.refund(dto);
    }

    @Get('admin/list')
    @UseGuards(RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'List all payments (admin)' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'status', required: false })
    async listAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        return this.paymentsService.listPayments(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
            status,
        );
    }
}

// ═══════════════════════════════════════════
// WEBHOOK ENDPOINTS (No auth — signature-verified)
// ═══════════════════════════════════════════

@ApiTags('Webhooks')
@Controller('api/v1/webhooks')
export class WebhooksController {
    constructor(
        private readonly stripeService: StripeService,
        private readonly razorpayService: RazorpayService,
    ) { }

    @Post('stripe')
    @HttpCode(200)
    @ApiOperation({ summary: 'Stripe webhook endpoint' })
    async stripeWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        const rawBody = req.rawBody;
        if (!rawBody) {
            return { error: 'Missing raw body' };
        }
        return this.stripeService.handleWebhookEvent(rawBody, signature);
    }

    @Post('razorpay')
    @HttpCode(200)
    @ApiOperation({ summary: 'Razorpay webhook endpoint' })
    async razorpayWebhook(
        @Body() body: any,
        @Headers('x-razorpay-signature') signature: string,
    ) {
        return this.razorpayService.handleWebhook(body, signature);
    }
}
