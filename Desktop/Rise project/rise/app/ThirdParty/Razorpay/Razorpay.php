<?php

namespace App\ThirdParty\Razorpay;

/**
 * Razorpay API wrapper for INR billing.
 * Wraps Razorpay Subscriptions, Orders, and Payments API via cURL.
 */
class Razorpay {

    private $key_id;
    private $key_secret;
    private $base_url = 'https://api.razorpay.com/v1';

    function __construct($key_id = '', $key_secret = '') {
        if (!$key_id) {
            $key_id = get_setting('razorpay_key_id') ?: '';
            $key_secret = get_setting('razorpay_key_secret') ?: '';
        }
        $this->key_id = $key_id;
        $this->key_secret = $key_secret;
    }

    // ── Plans ──────────────────────────────────

    /**
     * Create a subscription plan.
     */
    function create_plan($data) {
        return $this->_post('/plans', $data);
    }

    function fetch_plan($plan_id) {
        return $this->_get("/plans/$plan_id");
    }

    function list_plans($params = array()) {
        return $this->_get('/plans', $params);
    }

    // ── Subscriptions ──────────────────────────

    /**
     * Create a new subscription.
     */
    function create_subscription($data) {
        return $this->_post('/subscriptions', $data);
    }

    function fetch_subscription($sub_id) {
        return $this->_get("/subscriptions/$sub_id");
    }

    function cancel_subscription($sub_id, $cancel_at_cycle_end = true) {
        return $this->_post("/subscriptions/$sub_id/cancel", array(
            'cancel_at_cycle_end' => $cancel_at_cycle_end ? 1 : 0,
        ));
    }

    function pause_subscription($sub_id) {
        return $this->_post("/subscriptions/$sub_id/pause", array());
    }

    function resume_subscription($sub_id) {
        return $this->_post("/subscriptions/$sub_id/resume", array());
    }

    // ── Orders ──────────────────────────────────

    function create_order($amount_paise, $currency = 'INR', $receipt = '', $notes = array()) {
        return $this->_post('/orders', array(
            'amount' => $amount_paise,
            'currency' => $currency,
            'receipt' => $receipt,
            'notes' => $notes,
        ));
    }

    function fetch_order($order_id) {
        return $this->_get("/orders/$order_id");
    }

    // ── Payments ────────────────────────────────

    function fetch_payment($payment_id) {
        return $this->_get("/payments/$payment_id");
    }

    function capture_payment($payment_id, $amount_paise) {
        return $this->_post("/payments/$payment_id/capture", array('amount' => $amount_paise));
    }

    // ── Webhook Signature Verification ──────────

    /**
     * Verify Razorpay webhook signature (HMAC SHA256).
     */
    function verify_webhook_signature($payload, $signature, $secret = '') {
        if (!$secret) {
            $secret = get_setting('razorpay_webhook_secret') ?: $this->key_secret;
        }
        $expected = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expected, $signature);
    }

    /**
     * Verify payment signature from checkout callback.
     */
    function verify_payment_signature($order_id, $payment_id, $signature) {
        $expected = hash_hmac('sha256', $order_id . '|' . $payment_id, $this->key_secret);
        return hash_equals($expected, $signature);
    }

    // ── HTTP Helpers ────────────────────────────

    private function _get($endpoint, $params = array()) {
        $url = $this->base_url . $endpoint;
        if ($params) {
            $url .= '?' . http_build_query($params);
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, array(
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD => $this->key_id . ':' . $this->key_secret,
            CURLOPT_HTTPHEADER => array('Content-Type: application/json'),
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
        ));

        return $this->_exec($ch);
    }

    private function _post($endpoint, $data = array()) {
        $ch = curl_init($this->base_url . $endpoint);
        curl_setopt_array($ch, array(
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_USERPWD => $this->key_id . ':' . $this->key_secret,
            CURLOPT_HTTPHEADER => array('Content-Type: application/json'),
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
        ));

        return $this->_exec($ch);
    }

    private function _exec($ch) {
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return array('success' => false, 'error' => "cURL: $error", 'http_code' => 0);
        }

        $decoded = json_decode($response, true);
        if ($http_code >= 200 && $http_code < 300) {
            return array('success' => true, 'data' => $decoded, 'http_code' => $http_code);
        }

        $err_msg = isset($decoded['error']['description']) ? $decoded['error']['description'] : "HTTP $http_code";
        return array('success' => false, 'error' => $err_msg, 'http_code' => $http_code);
    }
}
