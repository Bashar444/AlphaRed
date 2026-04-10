<?php

namespace App\Models;

class Primo_respondents_model extends Crud_model {

    protected $table = 'primo_respondents';

    function __construct() {
        $this->table = 'primo_respondents';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $respondents_table = $this->db->prefixTable('primo_respondents');
        $users_table = $this->db->prefixTable('users');

        $where = "";
        $id = get_array_value($options, "id");
        if ($id) {
            $where .= " AND $respondents_table.id=$id";
        }

        $user_id = get_array_value($options, "user_id");
        if ($user_id) {
            $where .= " AND $respondents_table.user_id=$user_id";
        }

        $kyc_status = get_array_value($options, "kyc_status");
        if ($kyc_status) {
            $where .= " AND $respondents_table.kyc_status='$kyc_status'";
        }

        $min_quality = get_array_value($options, "min_quality");
        if ($min_quality) {
            $where .= " AND $respondents_table.quality_score >= $min_quality";
        }

        $sql = "SELECT $respondents_table.*, $users_table.first_name, $users_table.last_name, $users_table.email, $users_table.phone
            FROM $respondents_table
            LEFT JOIN $users_table ON $users_table.id = $respondents_table.user_id
            WHERE $respondents_table.deleted=0 $where
            ORDER BY $respondents_table.id DESC";

        return $this->db->query($sql);
    }

    function get_by_user_id($user_id) {
        $respondents_table = $this->db->prefixTable('primo_respondents');
        $sql = "SELECT * FROM $respondents_table WHERE user_id=$user_id AND deleted=0 LIMIT 1";
        return $this->db->query($sql)->getRow();
    }

    function update_quality_score($id, $score) {
        $respondents_table = $this->db->prefixTable('primo_respondents');
        $sql = "UPDATE $respondents_table SET quality_score=? WHERE id=?";
        return $this->db->query($sql, array($score, $id));
    }

    function increment_total_surveys($id) {
        $respondents_table = $this->db->prefixTable('primo_respondents');
        $sql = "UPDATE $respondents_table SET total_surveys = total_surveys + 1 WHERE id=?";
        return $this->db->query($sql, array($id));
    }

    function increment_rejected_count($id) {
        $respondents_table = $this->db->prefixTable('primo_respondents');
        $sql = "UPDATE $respondents_table SET rejected_count = rejected_count + 1 WHERE id=?";
        return $this->db->query($sql, array($id));
    }

    function get_matching_respondents($filters = array()) {
        $respondents_table = $this->db->prefixTable('primo_respondents');
        $users_table = $this->db->prefixTable('users');

        $where = " AND $respondents_table.kyc_status='verified' AND $respondents_table.quality_score >= 60";

        // Parse demographic filters from JSON
        $age_min = get_array_value($filters, "age_min");
        $age_max = get_array_value($filters, "age_max");
        if ($age_min || $age_max) {
            if ($age_min) {
                $where .= " AND JSON_EXTRACT($respondents_table.demographics, '$.age') >= $age_min";
            }
            if ($age_max) {
                $where .= " AND JSON_EXTRACT($respondents_table.demographics, '$.age') <= $age_max";
            }
        }

        $gender = get_array_value($filters, "gender");
        if ($gender) {
            $where .= " AND JSON_EXTRACT($respondents_table.demographics, '$.gender') = '$gender'";
        }

        $region = get_array_value($filters, "region");
        if ($region) {
            $where .= " AND JSON_EXTRACT($respondents_table.demographics, '$.region') LIKE '%$region%'";
        }

        $sql = "SELECT $respondents_table.*, $users_table.first_name, $users_table.last_name, $users_table.email
            FROM $respondents_table
            LEFT JOIN $users_table ON $users_table.id = $respondents_table.user_id
            WHERE $respondents_table.deleted=0 $where
            ORDER BY $respondents_table.quality_score DESC";

        return $this->db->query($sql);
    }
}
