<?php

namespace App\Models;

class Primo_surveys_model extends Crud_model {

    protected $table = 'primo_surveys';

    function __construct() {
        $this->table = 'primo_surveys';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $surveys_table = $this->db->prefixTable('primo_surveys');
        $users_table = $this->db->prefixTable('users');

        $where = "";
        $id = isset($options["id"]) ? $options["id"] : "";
        $user_id = isset($options["user_id"]) ? $options["user_id"] : "";
        $status = isset($options["status"]) ? $options["status"] : "";

        if ($id) {
            $where .= " AND $surveys_table.id=$id";
        }
        if ($user_id) {
            $where .= " AND $surveys_table.user_id=$user_id";
        }
        if ($status) {
            $where .= " AND $surveys_table.status='$status'";
        }

        $sql = "SELECT $surveys_table.*, CONCAT($users_table.first_name, ' ', $users_table.last_name) AS owner_name
                FROM $surveys_table
                LEFT JOIN $users_table ON $users_table.id = $surveys_table.user_id
                WHERE $surveys_table.deleted=0 $where
                ORDER BY $surveys_table.id DESC";
        return $this->db->query($sql);
    }

    function get_survey_count($user_id) {
        $surveys_table = $this->db->prefixTable('primo_surveys');
        $sql = "SELECT COUNT(*) as total FROM $surveys_table WHERE user_id=? AND deleted=0";
        return $this->db->query($sql, array($user_id))->getRow()->total;
    }

    function update_collected_count($survey_id) {
        $surveys_table = $this->db->prefixTable('primo_surveys');
        $responses_table = $this->db->prefixTable('primo_responses');
        $sql = "UPDATE $surveys_table SET collected_count = (SELECT COUNT(*) FROM $responses_table WHERE survey_id=? AND status='completed' AND deleted=0) WHERE id=?";
        return $this->db->query($sql, array($survey_id, $survey_id));
    }
}
