<?php

namespace App\Controllers\Api;

use App\Controllers\App_Controller;

/**
 * Base controller for all API endpoints.
 * Returns JSON only — no template rendering.
 */
class Api_base extends App_Controller
{
    protected int $api_user_id = 0;
    protected bool $api_is_admin = false;
    protected string $api_user_type = 'staff';

    public function __construct()
    {
        parent::__construct();
        $request = request();
        $this->api_user_id  = $request->user_id ?? 0;
        $this->api_is_admin = $request->is_admin ?? false;
        $this->api_user_type = $request->user_type ?? 'staff';
    }

    protected function ok($data = [], string $message = 'OK')
    {
        return $this->response
            ->setStatusCode(200)
            ->setJSON(['success' => true, 'message' => $message, 'data' => $data]);
    }

    protected function created($data = [], string $message = 'Created')
    {
        return $this->response
            ->setStatusCode(201)
            ->setJSON(['success' => true, 'message' => $message, 'data' => $data]);
    }

    protected function fail(string $message = 'Bad request', int $code = 400)
    {
        return $this->response
            ->setStatusCode($code)
            ->setJSON(['success' => false, 'message' => $message]);
    }

    protected function forbidden(string $message = 'Access denied')
    {
        return $this->fail($message, 403);
    }

    protected function notFound(string $message = 'Not found')
    {
        return $this->fail($message, 404);
    }

    /**
     * Admin guard — halts execution with 403 if the user is not admin.
     * Called as $this->_guard(); at the top of admin-only methods.
     */
    protected function _guard(): void
    {
        if (!$this->api_is_admin) {
            $this->response
                ->setStatusCode(403)
                ->setJSON(['success' => false, 'message' => 'Access denied'])
                ->send();
            exit;
        }
    }

    /**
     * Admin guard — halts execution with 403 if the user is not admin.
     * Called as $this->_guard(); at the top of admin-only methods.
     */
    protected function _guard(): void
    {
        if (!$this->api_is_admin) {
            $this->response
                ->setStatusCode(403)
                ->setJSON(['success' => false, 'message' => 'Access denied'])
                ->send();
            exit;
        }
    }

    /**
     * Get the authenticated user model row.
     */
    protected function api_user()
    {
        return $this->Users_model->get_one($this->api_user_id);
    }
}
