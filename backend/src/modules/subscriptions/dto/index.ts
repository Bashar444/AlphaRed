import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateSubscriptionDto {
    @IsString()
    planId!: string;

    @IsOptional()
    @IsString()
    billingCycle?: string;

    @IsOptional()
    @IsString()
    discountCode?: string;
}

export class ApproveSubscriptionDto {
    @IsString()
    subscriptionId!: string;
}

export class RejectSubscriptionDto {
    @IsString()
    subscriptionId!: string;

    @IsOptional()
    @IsString()
    reason?: string;
}
