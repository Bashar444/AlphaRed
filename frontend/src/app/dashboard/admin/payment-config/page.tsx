"use client";

import SettingsForm from "@/components/admin/settings-form";
import { CreditCard } from "lucide-react";

export default function PaymentConfigPage() {
    return (
        <SettingsForm
            group="payment"
            title="Payment Gateways"
            description="Enable and configure payment providers. Multiple gateways can be active; users will see them on checkout."
            icon={<CreditCard className="w-6 h-6" />}
            sections={[
                {
                    title: "Default Gateway",
                    fields: [
                        {
                            key: "payment_default_gateway",
                            label: "Preferred Gateway",
                            type: "select",
                            options: [
                                { value: "razorpay", label: "Razorpay (India)" },
                                { value: "stripe", label: "Stripe" },
                                { value: "payu", label: "PayU" },
                                { value: "paypal", label: "PayPal" },
                            ],
                        },
                        {
                            key: "payment_currency",
                            label: "Default Currency",
                            type: "select",
                            options: [
                                { value: "INR", label: "INR — Indian Rupee" },
                                { value: "USD", label: "USD — US Dollar" },
                                { value: "EUR", label: "EUR — Euro" },
                                { value: "GBP", label: "GBP — British Pound" },
                            ],
                        },
                    ],
                },
                {
                    title: "Razorpay",
                    fields: [
                        { key: "razorpay_enabled", label: "Enable Razorpay", type: "boolean" },
                        { key: "razorpay_key_id", label: "Key ID", type: "text", placeholder: "rzp_live_..." },
                        { key: "razorpay_key_secret", label: "Key Secret", type: "password" },
                        { key: "razorpay_webhook_secret", label: "Webhook Secret", type: "password" },
                    ],
                },
                {
                    title: "Stripe",
                    fields: [
                        { key: "stripe_enabled", label: "Enable Stripe", type: "boolean" },
                        { key: "stripe_publishable_key", label: "Publishable Key", type: "text", placeholder: "pk_live_..." },
                        { key: "stripe_secret_key", label: "Secret Key", type: "password", placeholder: "sk_live_..." },
                        { key: "stripe_webhook_secret", label: "Webhook Secret", type: "password" },
                    ],
                },
                {
                    title: "PayU",
                    fields: [
                        { key: "payu_enabled", label: "Enable PayU", type: "boolean" },
                        { key: "payu_merchant_key", label: "Merchant Key", type: "text" },
                        { key: "payu_merchant_salt", label: "Merchant Salt", type: "password" },
                    ],
                },
                {
                    title: "PayPal",
                    fields: [
                        { key: "paypal_enabled", label: "Enable PayPal", type: "boolean" },
                        { key: "paypal_client_id", label: "Client ID", type: "text" },
                        { key: "paypal_client_secret", label: "Client Secret", type: "password" },
                        {
                            key: "paypal_mode",
                            label: "Mode",
                            type: "select",
                            options: [
                                { value: "sandbox", label: "Sandbox (testing)" },
                                { value: "live", label: "Live (production)" },
                            ],
                        },
                    ],
                },
            ]}
        />
    );
}
