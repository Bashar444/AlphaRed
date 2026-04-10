<?php

namespace App\Models;

class Primo_usage_logs_model extends Crud_model {

    protected $table = 'primo_usage_logs';

    function __construct() {
        $this->table = 'primo_usage_logs';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $table = $this->db->prefixTable('primo_usage_logs');

        $where = "";
        $id = get_array_value($options, "id");
        if ($id) {
            $where .= " AND $table.id=$id";
        }

        $user_id = get_array_value($options, "user_id");
        if ($user_id) {
            $where .= " AND $table.user_id=$user_id";
        }

        $sql = "SELECT * FROM $table WHERE $table.deleted=0 $where ORDER BY $table.id DESC";
        return $this->db->query($sql);
    }

    /**
     * Increment usage counter for the current month.
     *
     * @param int $user_id
     * @param string $metric e.g. 'surveys_created', 'responses_collected', 'exports_generated'
     * @param int $increment
     */
    function increment($user_id, $metric, $increment = 1) {
        $table = $this->db->prefixTable('primo_usage_logs');
        $period = date('Y-m');

        // Upsert: insert or update
        $sql = "INSERT INTO $table (user_id, metric, period, count, created_at)
                VALUES (?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE count = count + ?, updated_at = NOW()";
        $this->db->query($sql, array($user_id, $metric, $period, $increment, $increment));
    }

    /**
     * Get current month usage for a user + metric.
     */
    function get_usage($user_id, $metric) {
        $table = $this->db->prefixTable('primo_usage_logs');
        $period = date('Y-m');
        $sql = "SELECT count FROM $table WHERE user_id=? AND metric=? AND period=? AND deleted=0 LIMIT 1";
        $row = $this->db->query($sql, array($user_id, $metric, $period))->getRow();
        return $row ? intval($row->count) : 0;
    }

    /**
     * Reset all counters for a user (on plan renewal).
     */
    function reset_monthly($user_id) {
        $table = $this->db->prefixTable('primo_usage_logs');
        $period = date('Y-m');
        $sql = "UPDATE $table SET count=0, updated_at=NOW() WHERE user_id=? AND period=? AND deleted=0";
        $this->db->query($sql, array($user_id, $period));
    }

    /**
     * Get usage summary for admin dashboard.
     */
    function get_all_usage_summary($period = '') {
        $table = $this->db->prefixTable('primo_usage_logs');
        if (!$period) $period = date('Y-m');
        $sql = "SELECT metric, SUM(count) as total FROM $table WHERE period=? AND deleted=0 GROUP BY metric";
        return $this->db->query($sql, array($period))->getResult();
    }
}
