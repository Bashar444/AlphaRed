<?php

namespace App\Models;

class Primo_subscriptions_model extends Crud_model {

    protected $table = 'primo_subscriptions';

    function __construct() {
        $this->table = 'primo_subscriptions';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $table = $this->db->prefixTable('primo_subscriptions');

        $where = "";
        $id = get_array_value($options, "id");
        if ($id) {
            $where .= " AND $table.id=$id";
        }

        $user_id = get_array_value($options, "user_id");
        if ($user_id) {
            $where .= " AND $table.user_id=$user_id";
        }

        $status = get_array_value($options, "status");
        if ($status) {
            $where .= " AND $table.status='$status'";
        }

        $razorpay_subscription_id = get_array_value($options, "razorpay_subscription_id");
        if ($razorpay_subscription_id) {
            $where .= " AND $table.razorpay_subscription_id='$razorpay_subscription_id'";
        }

        $sql = "SELECT * FROM $table WHERE $table.deleted=0 $where ORDER BY $table.id DESC LIMIT 1";
        return $this->db->query($sql);
    }

    /**
     * Get active plan key for a user.
     */
    function get_user_plan($user_id) {
        $table = $this->db->prefixTable('primo_subscriptions');
        $sql = "SELECT plan_key FROM $table WHERE user_id=? AND status='active' AND expires_at > NOW() AND deleted=0 ORDER BY id DESC LIMIT 1";
        $row = $this->db->query($sql, array($user_id))->getRow();
        return $row ? $row->plan_key : 'basic';
    }
}
