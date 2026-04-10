<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Rate limiter for PrimoData API endpoints.
 * Uses file-based cache for simplicity (can upgrade to Redis later).
 */
class Primo_rate_limiter implements FilterInterface {

    /**
     * Max requests per minute for API endpoints.
     */
    private $limits = array(
        'basic' => 30,
        'advanced' => 60,
        'enterprise' => 120,
    );

    public function before(RequestInterface $request, $arguments = null) {
        // Only apply to API-style endpoints
        $path = $request->getUri()->getPath();
        if (strpos($path, 'api/') === false && strpos($path, 'Api') === false) {
            return;
        }

        // Check for API key in header
        $api_key = $request->getHeaderLine('X-PrimoData-Key');
        if (!$api_key) {
            $api_key = $request->getGet('api_key') ?? '';
        }

        if (!$api_key) {
            $response = service('response');
            $response->setStatusCode(401);
            $response->setJSON(array('error' => 'API key required.'));
            return $response;
        }

        // Validate key
        $key_model = model('App\Models\Primo_api_keys_model');
        $key_record = $key_model->validate_key($api_key);

        if (!$key_record) {
            $response = service('response');
            $response->setStatusCode(403);
            $response->setJSON(array('error' => 'Invalid or revoked API key.'));
            return $response;
        }

        // Determine plan
        $sub_model = model('App\Models\Primo_subscriptions_model');
        $plan = $sub_model->get_user_plan($key_record->user_id);

        // Rate limit check
        $max_per_minute = $this->limits[$plan] ?? 30;
        $cache_key = 'rate_limit_' . $key_record->id . '_' . date('YmdHi');

        $cache = \Config\Services::cache();
        $current = $cache->get($cache_key) ?: 0;

        if ($current >= $max_per_minute) {
            $response = service('response');
            $response->setStatusCode(429);
            $response->setJSON(array(
                'error' => 'Rate limit exceeded.',
                'limit' => $max_per_minute,
                'retry_after' => 60 - intval(date('s')),
            ));
            $response->setHeader('X-RateLimit-Limit', (string)$max_per_minute);
            $response->setHeader('X-RateLimit-Remaining', '0');
            $response->setHeader('Retry-After', (string)(60 - intval(date('s'))));
            return $response;
        }

        $cache->save($cache_key, $current + 1, 120); // TTL 2 minutes

        // Add rate limit headers
        $request->setHeader('X-PrimoData-User', (string)$key_record->user_id);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {
        // Nothing needed
    }
}
