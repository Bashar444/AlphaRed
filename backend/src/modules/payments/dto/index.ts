import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCheckoutDto {
    @ApiProperty({ description: 'Plan ID to subscribe to' })
    @IsString()
    planId!: string;

    @ApiPropertyOptional({ enum: ['MONTHLY', 'ANNUAL'] })
    @IsOptional()
    @IsEnum(['MONTHLY', 'ANNUAL'])
    billingCycle?: string;

    @ApiProperty({ enum: ['stripe', 'razorpay'] })
    @IsEnum(['stripe', 'razorpay'])
    gateway!: 'stripe' | 'razorpay';

    @ApiPropertyOptional({ description: 'Discount code' })
    @IsOptional()
    @IsString()
    discountCode?: string;

    @ApiPropertyOptional({ description: 'Frontend success URL for Stripe' })
    @IsOptional()
    @IsString()
    successUrl?: string;

    @ApiPropertyOptional({ description: 'Frontend cancel URL for Stripe' })
    @IsOptional()
    @IsString()
    cancelUrl?: string;
}

export class VerifyRazorpayDto {
    @ApiProperty()
    @IsString()
    razorpay_order_id!: string;

    @ApiProperty()
    @IsString()
    razorpay_payment_id!: string;

    @ApiProperty()
    @IsString()
    razorpay_signature!: string;
}

export class RefundPaymentDto {
    @ApiProperty({ description: 'Payment ID to refund' })
    @IsString()
    paymentId!: string;

    @ApiPropertyOptional({ description: 'Partial refund amount (omit for full refund)' })
    @IsOptional()
    @IsNumber()
    amount?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    reason?: string;
}
