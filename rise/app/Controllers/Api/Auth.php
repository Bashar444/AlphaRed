<?php

namespace App\Controllers\Api;

use App\Libraries\Jwt_helper;

/**
 * Authentication endpoints — login, register, me, refresh.
 * These routes are NOT behind Api_auth_filter.
 */
class Auth extends Api_base
{
    /**
     * POST /api/v1/auth/login
     * Body: { email, password }
     */
    public function login()
    {
        $email    = trim($this->request->getJSON(true)['email'] ?? '');
        $password = $this->request->getJSON(true)['password'] ?? '';

        if (!$email || !$password) {
            return $this->fail('Email and password are required.');
        }

        // Direct query by email — Users_model::get_details() does not support email filter
        $users_table = $this->Users_model->db->prefixTable('users');
        $user = $this->Users_model->db
            ->query("SELECT * FROM $users_table WHERE email=? AND deleted=0 LIMIT 1", [$email])
            ->getRow();

        if (!$user) {
            return $this->fail('Invalid credentials.', 401);
        }

        // RISE supports both bcrypt and legacy MD5 passwords from installer
        $password_ok = (strlen($user->password) === 60 && password_verify($password, $user->password))
                    || $user->password === md5($password);

        if (!$password_ok) {
            return $this->fail('Invalid credentials.', 401);
        }

        if (!empty($user->status) && $user->status !== 'active') {
            return $this->fail('Account is not active.', 403);
        }

        $jwt = new Jwt_helper();
        $token = $jwt->encode([
            'user_id'   => (int) $user->id,
            'is_admin'  => (bool) $user->is_admin,
            'user_type' => $user->user_type ?? 'staff',
        ]);

        return $this->ok([
            'token'     => $token,
            'user'      => $this->_user_dto($user),
        ], 'Login successful.');
    }

    /**
     * POST /api/v1/auth/register
     * Body: { first_name, last_name, email, password, user_type }
     */
    public function register()
    {
        $body = $this->request->getJSON(true) ?? [];

        $rules = [
            'first_name' => 'required',
            'last_name'  => 'required',
            'email'      => 'required|valid_email',
            'password'   => 'required|min_length[8]',
        ];

        if (!$this->validateData($body, $rules)) {
            return $this->fail(implode(' ', $this->validator->getErrors()));
        }

        // Check duplicate email — direct query (get_details doesn't support email filter)
        $users_table = $this->Users_model->db->prefixTable('users');
        $existing = $this->Users_model->db
            ->query("SELECT id FROM $users_table WHERE email=? AND deleted=0 LIMIT 1", [trim($body['email'])])
            ->getRow();
        if ($existing) {
            return $this->fail('Email already registered.');
        }

        $user_type = in_array($body['user_type'] ?? '', ['respondent', 'staff']) ? $body['user_type'] : 'staff';

        $user_data = [
            'first_name' => $body['first_name'],
            'last_name'  => $body['last_name'],
            'email'      => trim($body['email']),
            'password'   => password_hash($body['password'], PASSWORD_DEFAULT),
            'user_type'  => $user_type,
            'status'     => 'active',
            'created_at' => date('Y-m-d H:i:s'),
        ];

        $user_id = $this->Users_model->ci_save($user_data);
        if (!$user_id) {
            return $this->fail('Registration failed.');
        }

        // If respondent, create profile
        if ($user_type === 'respondent') {
            $demographics = [
                'age'    => $body['age'] ?? null,
                'gender' => $body['gender'] ?? null,
                'region' => $body['region'] ?? null,
            ];
            $this->Primo_respondents_model->ci_save([
                'user_id'      => $user_id,
                'kyc_status'   => 'pending',
                'quality_score' => 100,
                'total_surveys' => 0,
                'rejected_count' => 0,
                'demographics' => json_encode($demographics),
            ]);
        }

        $jwt = new Jwt_helper();
        $token = $jwt->encode([
            'user_id'   => $user_id,
            'is_admin'  => false,
            'user_type' => $user_type,
        ]);

        $user = $this->Users_model->get_one($user_id);

        return $this->created([
            'token' => $token,
            'user'  => $this->_user_dto($user),
        ], 'Registration successful.');
    }

    /**
     * GET /api/v1/auth/me  (requires auth)
     */
    public function me()
    {
        $user = $this->api_user();
        if (!$user || !$user->id) {
            return $this->fail('User not found.', 404);
        }
        return $this->ok($this->_user_dto($user));
    }

    private function _user_dto($user): array
    {
        return [
            'id'         => (int) $user->id,
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'email'      => $user->email,
            'user_type'  => $user->user_type ?? 'staff',
            'is_admin'   => (bool) ($user->is_admin ?? false),
            'image'      => $user->image ?? '',
            'status'     => $user->status,
        ];
    }
}
