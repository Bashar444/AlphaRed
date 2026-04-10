<?php

namespace App\Libraries;

/**
 * Lightweight JWT helper — HS256 only, no third-party deps.
 */
class Jwt_helper
{
    private string $secret;
    private int $ttl; // seconds

    public function __construct()
    {
        $this->secret = getenv('JWT_SECRET') ?: (get_setting('jwt_secret') ?: 'primo-default-change-me');
        $this->ttl    = (int)(getenv('JWT_TTL') ?: 86400); // 24 h
    }

    /**
     * Create a signed JWT for a user.
     */
    public function encode(array $payload): string
    {
        $header = $this->base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));

        $payload['iat'] = time();
        $payload['exp'] = time() + $this->ttl;
        $body = $this->base64url(json_encode($payload));

        $signature = $this->base64url(
            hash_hmac('sha256', "$header.$body", $this->secret, true)
        );

        return "$header.$body.$signature";
    }

    /**
     * Decode and verify a JWT. Returns payload array or null on failure.
     */
    public function decode(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $body, $signature] = $parts;

        $expected = $this->base64url(
            hash_hmac('sha256', "$header.$body", $this->secret, true)
        );

        if (!hash_equals($expected, $signature)) {
            return null;
        }

        $payload = json_decode($this->base64urlDecode($body), true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    private function base64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64urlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
