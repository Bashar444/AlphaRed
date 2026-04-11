<?php

namespace App\Models;

class Primo_site_settings_model extends Crud_model {

    protected $table = 'primo_site_settings';

    function __construct() {
        $this->table = 'primo_site_settings';
        parent::__construct($this->table);
    }

    /**
     * Get a single setting value by key.
     */
    function get_setting($key) {
        $table = $this->db->prefixTable('primo_site_settings');
        $row = $this->db->query(
            "SELECT setting_value FROM {$table} WHERE setting_key = ?",
            [$key]
        )->getRow();

        return $row ? $row->setting_value : null;
    }

    /**
     * Set (upsert) a setting value by key.
     */
    function set_setting($key, $value) {
        $table = $this->db->prefixTable('primo_site_settings');
        $existing = $this->db->query(
            "SELECT id FROM {$table} WHERE setting_key = ?",
            [$key]
        )->getRow();

        if ($existing) {
            $this->db->query(
                "UPDATE {$table} SET setting_value = ?, updated_at = NOW() WHERE id = ?",
                [$value, $existing->id]
            );
            return $existing->id;
        } else {
            $this->db->query(
                "INSERT INTO {$table} (setting_key, setting_value, created_at) VALUES (?, ?, NOW())",
                [$key, $value]
            );
            return $this->db->insertID();
        }
    }

    function get_details($options = array()) {
        $table = $this->db->prefixTable('primo_site_settings');
        $where = "";
        $key = isset($options["setting_key"]) ? $options["setting_key"] : "";

        if ($key) {
            $where .= " AND setting_key = '" . $this->db->escapeString($key) . "'";
        }

        return $this->db->query("SELECT * FROM {$table} WHERE 1=1 {$where} ORDER BY id ASC");
    }
}
