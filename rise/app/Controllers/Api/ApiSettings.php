<?php

namespace App\Controllers\Api;

/**
 * Settings get/update (admin only).
 */
class ApiSettings extends Api_base
{
    /**
     * GET /api/v1/settings
     */
    public function index()
    {
        $this->_guard();
        $rows = $this->Settings_model->get_details()->getResult();
        $settings = [];
        foreach ($rows as $r) {
            $settings[$r->setting_name] = $r->setting_value;
        }
        return $this->ok($settings);
    }

    /**
     * GET /api/v1/settings/:key
     */
    public function show($key = '')
    {
        $this->_guard();
        $value = get_setting($key);
        return $this->ok(['key' => $key, 'value' => $value]);
    }

    /**
     * PUT /api/v1/settings/:key
     */
    public function update($key = '')
    {
        $this->_guard();
        $value = $this->request->getJsonVar('value');

        $t = $this->db->prefixTable('settings');
        $escaped_key = $this->db->escape($key);
        $escaped_val = $this->db->escape($value);

        $sql = "INSERT INTO {$t} (setting_name, setting_value) VALUES ({$escaped_key}, {$escaped_val})
                ON DUPLICATE KEY UPDATE setting_value={$escaped_val}";
        $this->db->query($sql);

        return $this->ok(null, 'Updated');
    }

    /**
     * PUT /api/v1/settings (batch update)
     * Body: { settings: { key: value, ... } }
     */
    public function batch_update()
    {
        $this->_guard();
        $settings = $this->request->getJsonVar('settings');
        if (!$settings || !is_array($settings)) return $this->fail('settings object required');

        $t = $this->db->prefixTable('settings');
        foreach ($settings as $key => $value) {
            $escaped_key = $this->db->escape($key);
            $escaped_val = $this->db->escape($value);
            $sql = "INSERT INTO {$t} (setting_name, setting_value) VALUES ({$escaped_key}, {$escaped_val})
                    ON DUPLICATE KEY UPDATE setting_value={$escaped_val}";
            $this->db->query($sql);
        }

        return $this->ok(null, 'Settings updated');
    }
}
