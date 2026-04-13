export declare class CreateSubscriptionDto {
    planId: string;
    billingCycle?: string;
    discountCode?: string;
}
export declare class ApproveSubscriptionDto {
    subscriptionId: string;
}
export declare class RejectSubscriptionDto {
    subscriptionId: string;
    reason?: string;
}
