<?php

namespace App\Models;

class Primo_api_keys_model extends Crud_model {

    protected $table = 'primo_api_keys';

    function __construct() {
        $this->table = 'primo_api_keys';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $table = $this->db->prefixTable('primo_api_keys');

        $where = "";
        $id = get_array_value($options, "id");
        if ($id) {
            $where .= " AND $table.id=$id";
        }

        $user_id = get_array_value($options, "user_id");
        if ($user_id) {
            $where .= " AND $table.user_id=$user_id";
        }

        $api_key = get_array_value($options, "api_key");
        if ($api_key) {
            $where .= " AND $table.api_key='" . addslashes($api_key) . "'";
        }

        $status = get_array_value($options, "status");
        if ($status) {
            $where .= " AND $table.status='$status'";
        }

        $sql = "SELECT * FROM $table WHERE $table.deleted=0 $where ORDER BY $table.id DESC";
        return $this->db->query($sql);
    }

    /**
     * Validate an API key and return associated user_id.
     */
    function validate_key($key) {
        $table = $this->db->prefixTable('primo_api_keys');
        $sql = "SELECT * FROM $table WHERE api_key=? AND status='active' AND deleted=0 LIMIT 1";
        $row = $this->db->query($sql, array($key))->getRow();

        if ($row) {
            // Update last used
            $this->db->query("UPDATE $table SET last_used_at=NOW(), request_count=request_count+1 WHERE id=?", array($row->id));
        }

        return $row;
    }
}
