<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use App\Libraries\Jwt_helper;

/**
 * JWT authentication filter for API routes.
 */
class Api_auth_filter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $auth = $request->getHeaderLine('Authorization');

        if (!$auth || !str_starts_with($auth, 'Bearer ')) {
            return service('response')
                ->setStatusCode(401)
                ->setJSON(['success' => false, 'message' => 'Missing or invalid Authorization header.']);
        }

        $token = substr($auth, 7);
        $jwt   = new Jwt_helper();
        $payload = $jwt->decode($token);

        if (!$payload || !isset($payload['user_id'])) {
            return service('response')
                ->setStatusCode(401)
                ->setJSON(['success' => false, 'message' => 'Invalid or expired token.']);
        }

        // Attach user info to the request so controllers can access it
        $request->user_id  = (int) $payload['user_id'];
        $request->is_admin = !empty($payload['is_admin']);
        $request->user_type = $payload['user_type'] ?? 'staff';

        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        return $response;
    }
}
