<?php

namespace App\Controllers;

use App\ThirdParty\Razorpay\Razorpay;
use App\Libraries\Plan_limits;

/**
 * PrimoData subscription management — extends RISE billing with Razorpay.
 */
class Primo_subscriptions extends Security_Controller {

    private $razorpay;
    private $plan_limits;

    function __construct() {
        parent::__construct();
        $this->razorpay = new Razorpay();
        $this->plan_limits = new Plan_limits();
    }

    /**
     * Subscription plans page.
     */
    function index() {
        $config = config('PrimoData');
        $view_data["plans"] = $config->plans;
        $view_data["current_plan"] = $this->_get_user_plan();
        $view_data["page_title"] = app_lang("subscription_plans");
        return $this->template->rander("primo_subscriptions/index", $view_data);
    }

    /**
     * Initiate checkout — create Razorpay order.
     */
    function checkout($plan_key = '') {
        $config = config('PrimoData');
        if (!isset($config->plans[$plan_key])) {
            show_404();
        }

        $plan = $config->plans[$plan_key];
        $amount_paise = $plan['price_inr'] * 100;

        $result = $this->razorpay->create_order(
            $amount_paise,
            'INR',
            'primo_' . $plan_key . '_' . $this->login_user->id . '_' . time()
        );

        if (!$result['success']) {
            echo json_encode(array("success" => false, "message" => $result['error']));
            return;
        }

        echo json_encode(array(
            "success" => true,
            "order_id" => $result['data']['id'],
            "amount" => $amount_paise,
            "currency" => "INR",
            "key_id" => get_setting('razorpay_key_id'),
            "plan_key" => $plan_key,
            "plan_name" => $plan['name'],
            "user_email" => $this->login_user->email,
            "user_name" => $this->login_user->first_name . ' ' . $this->login_user->last_name,
        ));
    }

    /**
     * Verify payment after Razorpay checkout callback.
     */
    function verify_payment() {
        $order_id = $this->request->getPost('razorpay_order_id');
        $payment_id = $this->request->getPost('razorpay_payment_id');
        $signature = $this->request->getPost('razorpay_signature');
        $plan_key = $this->request->getPost('plan_key');

        if (!$order_id || !$payment_id || !$signature || !$plan_key) {
            echo json_encode(array("success" => false, "message" => "Invalid payment data."));
            return;
        }

        if (!$this->razorpay->verify_payment_signature($order_id, $payment_id, $signature)) {
            echo json_encode(array("success" => false, "message" => "Payment verification failed."));
            return;
        }

        // Activate subscription
        $config = config('PrimoData');
        $plan = $config->plans[$plan_key] ?? null;
        if (!$plan) {
            echo json_encode(array("success" => false, "message" => "Invalid plan."));
            return;
        }

        $sub_data = array(
            "user_id" => $this->login_user->id,
            "plan_key" => $plan_key,
            "plan_name" => $plan['name'],
            "amount_inr" => $plan['price_inr'],
            "razorpay_order_id" => $order_id,
            "razorpay_payment_id" => $payment_id,
            "status" => "active",
            "started_at" => date("Y-m-d H:i:s"),
            "expires_at" => date("Y-m-d H:i:s", strtotime("+1 month")),
        );

        $this->Primo_subscriptions_model->ci_save($sub_data);

        // Reset monthly usage counters
        $this->Primo_usage_logs_model->reset_monthly($this->login_user->id);

        echo json_encode(array(
            "success" => true,
            "message" => app_lang("subscription_activated"),
        ));
    }

    /**
     * Razorpay webhook handler.
     */
    function webhook() {
        $payload = file_get_contents('php://input');
        $signature = $this->request->getHeaderLine('X-Razorpay-Signature');

        if (!$this->razorpay->verify_webhook_signature($payload, $signature)) {
            http_response_code(400);
            echo 'Invalid signature';
            return;
        }

        $event = json_decode($payload, true);
        $event_type = $event['event'] ?? '';

        switch ($event_type) {
            case 'payment.captured':
                // Already handled in verify_payment
                break;
            case 'subscription.cancelled':
                $sub_id = $event['payload']['subscription']['entity']['id'] ?? '';
                if ($sub_id) {
                    // Mark subscription as cancelled
                    $this->_cancel_by_razorpay_id($sub_id);
                }
                break;
            case 'payment.failed':
                // Log failed payment
                log_message('warning', 'Razorpay payment failed: ' . $payload);
                break;
        }

        http_response_code(200);
        echo 'OK';
    }

    /**
     * Cancel subscription.
     */
    function cancel() {
        $current = $this->_get_user_subscription();
        if (!$current) {
            echo json_encode(array("success" => false, "message" => "No active subscription."));
            return;
        }

        $this->Primo_subscriptions_model->ci_save(array(
            "status" => "cancelled",
            "cancelled_at" => date("Y-m-d H:i:s"),
        ), $current->id);

        echo json_encode(array("success" => true, "message" => app_lang("subscription_cancelled")));
    }

    /**
     * Get current user's active plan key.
     */
    private function _get_user_plan() {
        $sub = $this->_get_user_subscription();
        return $sub ? $sub->plan_key : 'basic';
    }

    private function _get_user_subscription() {
        return $this->Primo_subscriptions_model->get_details(array(
            "user_id" => $this->login_user->id,
            "status" => "active",
        ))->getRow();
    }

    private function _cancel_by_razorpay_id($razorpay_sub_id) {
        // Find by razorpay ID and cancel
        $sub = $this->Primo_subscriptions_model->get_details(array(
            "razorpay_subscription_id" => $razorpay_sub_id,
        ))->getRow();
        if ($sub) {
            $this->Primo_subscriptions_model->ci_save(array(
                "status" => "cancelled",
                "cancelled_at" => date("Y-m-d H:i:s"),
            ), $sub->id);
        }
    }
}
