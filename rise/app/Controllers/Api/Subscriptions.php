<?php

namespace App\Controllers\Api;

use App\ThirdParty\Razorpay\Razorpay;
use App\Libraries\Plan_limits;

/**
 * Subscription & billing endpoints.
 */
class Subscriptions extends Api_base
{
    private Razorpay $razorpay;

    public function __construct()
    {
        parent::__construct();
        $this->razorpay = new Razorpay();
    }

    /**
     * GET /api/v1/subscriptions/plans
     */
    public function plans()
    {
        $config = config('PrimoData');
        return $this->ok($config->plans);
    }

    /**
     * GET /api/v1/subscriptions/current
     */
    public function current()
    {
        $sub = $this->Primo_subscriptions_model->get_details([
            'user_id' => $this->api_user_id,
            'status'  => 'active',
        ])->getRow();

        if (!$sub) {
            return $this->ok(['plan_key' => 'basic', 'subscription' => null]);
        }

        return $this->ok([
            'plan_key'     => $sub->plan_key,
            'subscription' => [
                'id'         => (int) $sub->id,
                'plan_name'  => $sub->plan_name,
                'amount_inr' => (float) $sub->amount_inr,
                'status'     => $sub->status,
                'started_at' => $sub->started_at,
                'expires_at' => $sub->expires_at,
            ],
        ]);
    }

    /**
     * POST /api/v1/subscriptions/checkout
     * Body: { plan_key }
     */
    public function checkout()
    {
        $body = $this->request->getJSON(true) ?? [];
        $plan_key = $body['plan_key'] ?? '';

        $config = config('PrimoData');
        if (!isset($config->plans[$plan_key])) {
            return $this->fail('Invalid plan.');
        }

        $plan = $config->plans[$plan_key];
        $amount = $plan['price_inr'] * 100;

        $result = $this->razorpay->create_order(
            $amount, 'INR',
            'primo_' . $plan_key . '_' . $this->api_user_id . '_' . time()
        );

        if (!$result['success']) {
            return $this->fail($result['error']);
        }

        $user = $this->api_user();

        return $this->ok([
            'order_id'   => $result['data']['id'],
            'amount'     => $amount,
            'currency'   => 'INR',
            'key_id'     => get_setting('razorpay_key_id'),
            'plan_key'   => $plan_key,
            'plan_name'  => $plan['name'],
            'user_email' => $user->email,
            'user_name'  => $user->first_name . ' ' . $user->last_name,
        ]);
    }

    /**
     * POST /api/v1/subscriptions/verify
     */
    public function verify()
    {
        $body = $this->request->getJSON(true) ?? [];

        $order_id   = $body['razorpay_order_id'] ?? '';
        $payment_id = $body['razorpay_payment_id'] ?? '';
        $signature  = $body['razorpay_signature'] ?? '';
        $plan_key   = $body['plan_key'] ?? '';

        if (!$order_id || !$payment_id || !$signature || !$plan_key) {
            return $this->fail('Missing payment data.');
        }

        if (!$this->razorpay->verify_payment_signature($order_id, $payment_id, $signature)) {
            return $this->fail('Payment verification failed.');
        }

        $config = config('PrimoData');
        $plan = $config->plans[$plan_key] ?? null;
        if (!$plan) return $this->fail('Invalid plan.');

        $this->Primo_subscriptions_model->ci_save([
            'user_id'             => $this->api_user_id,
            'plan_key'            => $plan_key,
            'plan_name'           => $plan['name'],
            'amount_inr'          => $plan['price_inr'],
            'razorpay_order_id'   => $order_id,
            'razorpay_payment_id' => $payment_id,
            'status'              => 'active',
            'started_at'          => date('Y-m-d H:i:s'),
            'expires_at'          => date('Y-m-d H:i:s', strtotime('+1 month')),
        ]);

        $this->Primo_usage_logs_model->reset_monthly($this->api_user_id);

        return $this->ok(null, 'Subscription activated.');
    }

    /**
     * POST /api/v1/subscriptions/cancel
     */
    public function cancel()
    {
        $sub = $this->Primo_subscriptions_model->get_details([
            'user_id' => $this->api_user_id,
            'status'  => 'active',
        ])->getRow();

        if (!$sub) return $this->fail('No active subscription.');

        $this->Primo_subscriptions_model->ci_save([
            'status'       => 'cancelled',
            'cancelled_at' => date('Y-m-d H:i:s'),
        ], $sub->id);

        return $this->ok(null, 'Subscription cancelled.');
    }
}
