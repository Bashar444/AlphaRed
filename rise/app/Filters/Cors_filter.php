<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * CORS filter — allows the Next.js frontend to call the CI4 API.
 */
class Cors_filter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $response = service('response');

        $allowed = getenv('CORS_ALLOWED_ORIGIN') ?: 'http://localhost:3000';

        $response->setHeader('Access-Control-Allow-Origin', $allowed);
        $response->setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
        $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->setHeader('Access-Control-Max-Age', '86400');

        // Handle preflight
        if ($request->getMethod() === 'options') {
            $response->setStatusCode(204);
            $response->send();
            exit;
        }

        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        $allowed = getenv('CORS_ALLOWED_ORIGIN') ?: 'http://localhost:3000';

        $response->setHeader('Access-Control-Allow-Origin', $allowed);
        $response->setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
        $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

        return $response;
    }
}
