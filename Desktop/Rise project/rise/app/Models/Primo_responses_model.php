<?php

namespace App\Models;

class Primo_responses_model extends Crud_model {

    protected $table = 'primo_responses';

    function __construct() {
        $this->table = 'primo_responses';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $responses_table = $this->db->prefixTable('primo_responses');
        $respondents_table = $this->db->prefixTable('primo_respondents');
        $users_table = $this->db->prefixTable('users');

        $where = "";
        $id = get_array_value($options, "id");
        if ($id) {
            $where .= " AND $responses_table.id=$id";
        }

        $survey_id = get_array_value($options, "survey_id");
        if ($survey_id) {
            $where .= " AND $responses_table.survey_id=$survey_id";
        }

        $respondent_id = get_array_value($options, "respondent_id");
        if ($respondent_id) {
            $where .= " AND $responses_table.respondent_id=$respondent_id";
        }

        $status = get_array_value($options, "status");
        if ($status) {
            $where .= " AND $responses_table.status='$status'";
        }

        $min_quality = get_array_value($options, "min_quality");
        if ($min_quality) {
            $where .= " AND $responses_table.quality_score >= $min_quality";
        }

        $sql = "SELECT $responses_table.*, 
            $users_table.first_name, $users_table.last_name, $users_table.email
            FROM $responses_table
            LEFT JOIN $respondents_table ON $respondents_table.id = $responses_table.respondent_id
            LEFT JOIN $users_table ON $users_table.id = $respondents_table.user_id
            WHERE $responses_table.deleted=0 $where
            ORDER BY $responses_table.id DESC";

        return $this->db->query($sql);
    }

    function get_response_count($survey_id, $status = '') {
        $responses_table = $this->db->prefixTable('primo_responses');
        $where = " AND survey_id=$survey_id";
        if ($status) {
            $where .= " AND status='$status'";
        }
        $sql = "SELECT COUNT(id) as total FROM $responses_table WHERE deleted=0 $where";
        return $this->db->query($sql)->getRow()->total;
    }

    function get_quality_distribution($survey_id) {
        $responses_table = $this->db->prefixTable('primo_responses');
        $sql = "SELECT 
            COUNT(CASE WHEN quality_score >= 80 THEN 1 END) as high,
            COUNT(CASE WHEN quality_score >= 50 AND quality_score < 80 THEN 1 END) as medium,
            COUNT(CASE WHEN quality_score < 50 THEN 1 END) as low
            FROM $responses_table
            WHERE survey_id=? AND deleted=0 AND status='completed'";
        return $this->db->query($sql, array($survey_id))->getRow();
    }

    function get_avg_duration($survey_id) {
        $responses_table = $this->db->prefixTable('primo_responses');
        $sql = "SELECT AVG(duration_secs) as avg_duration FROM $responses_table 
                WHERE survey_id=? AND deleted=0 AND status='completed' AND duration_secs > 0";
        return $this->db->query($sql, array($survey_id))->getRow()->avg_duration;
    }
}
