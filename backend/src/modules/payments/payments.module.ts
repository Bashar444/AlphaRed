import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import { RazorpayService } from './razorpay.service';
import { PaymentsController, WebhooksController } from './payments.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PaymentsController, WebhooksController],
    providers: [PaymentsService, StripeService, RazorpayService],
    exports: [PaymentsService, StripeService, RazorpayService],
})
export class PaymentsModule { }
