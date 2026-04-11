<?php

namespace App\Controllers\Api;

class ApiKeys extends Api_base
{
    /**
     * List current user's API keys.
     * GET /api/v1/api-keys
     */
    public function index()
    {
        $uid   = $this->api_user_id;
        $table = $this->db->prefixTable('primo_api_keys');
        $rows  = $this->db->query(
            "SELECT id, name, status, request_count, last_used_at, expires_at, created_at
             FROM {$table}
             WHERE user_id = ? AND deleted = 0
             ORDER BY created_at DESC",
            [$uid]
        )->getResultArray();

        return $this->ok($rows);
    }

    /**
     * Generate a new API key.
     * POST /api/v1/api-keys  { name, expires_at? }
     */
    public function create()
    {
        $uid  = $this->api_user_id;
        $name = trim($this->request->getJsonVar('name') ?? '');
        if (!$name) {
            return $this->fail('Name is required');
        }

        // Generate a random key and store the hash
        $rawKey  = bin2hex(random_bytes(32)); // 64-char hex key
        $keyHash = hash('sha256', $rawKey);

        $expiresAt = $this->request->getJsonVar('expires_at');

        $table = $this->db->prefixTable('primo_api_keys');
        $this->db->query(
            "INSERT INTO {$table} (user_id, name, key_hash, status, expires_at, created_at)
             VALUES (?, ?, ?, 'active', ?, NOW())",
            [$uid, $name, $keyHash, $expiresAt ?: null]
        );

        $id = $this->db->insertID();

        return $this->created([
            'id'      => $id,
            'name'    => $name,
            'api_key' => $rawKey, // Only shown once
            'status'  => 'active',
            'message' => 'Save this key now — it cannot be retrieved again.',
        ]);
    }

    /**
     * Revoke an API key.
     * POST /api/v1/api-keys/:id/revoke
     */
    public function revoke($id = 0)
    {
        $uid   = $this->api_user_id;
        $table = $this->db->prefixTable('primo_api_keys');

        // Verify ownership
        $key = $this->db->query(
            "SELECT id FROM {$table} WHERE id = ? AND user_id = ? AND deleted = 0",
            [$id, $uid]
        )->getRowArray();

        if (!$key) {
            return $this->notFound();
        }

        $this->db->query(
            "UPDATE {$table} SET status = 'revoked', revoked_at = NOW() WHERE id = ?",
            [$id]
        );

        return $this->ok(null, 'API key revoked');
    }

    /**
     * Delete an API key (soft delete).
     * DELETE /api/v1/api-keys/:id
     */
    public function delete($id = 0)
    {
        $uid   = $this->api_user_id;
        $table = $this->db->prefixTable('primo_api_keys');

        $key = $this->db->query(
            "SELECT id FROM {$table} WHERE id = ? AND user_id = ? AND deleted = 0",
            [$id, $uid]
        )->getRowArray();

        if (!$key) {
            return $this->notFound();
        }

        $this->db->query("UPDATE {$table} SET deleted = 1 WHERE id = ?", [$id]);

        return $this->ok(null, 'API key deleted');
    }
}
