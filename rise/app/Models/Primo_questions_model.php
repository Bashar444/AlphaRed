<?php

namespace App\Models;

class Primo_questions_model extends Crud_model {

    protected $table = 'primo_questions';

    function __construct() {
        $this->table = 'primo_questions';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $questions_table = $this->db->prefixTable('primo_questions');

        $where = "";
        $id = isset($options["id"]) ? $options["id"] : "";
        $survey_id = isset($options["survey_id"]) ? $options["survey_id"] : "";

        if ($id) {
            $where .= " AND $questions_table.id=$id";
        }
        if ($survey_id) {
            $where .= " AND $questions_table.survey_id=$survey_id";
        }

        $sql = "SELECT $questions_table.*
                FROM $questions_table
                WHERE $questions_table.deleted=0 $where
                ORDER BY $questions_table.sort ASC";
        return $this->db->query($sql);
    }

    function get_question_count($survey_id) {
        $questions_table = $this->db->prefixTable('primo_questions');
        $sql = "SELECT COUNT(*) as total FROM $questions_table WHERE survey_id=? AND deleted=0";
        return $this->db->query($sql, array($survey_id))->getRow()->total;
    }

    function get_max_sort($survey_id) {
        $questions_table = $this->db->prefixTable('primo_questions');
        $sql = "SELECT COALESCE(MAX(sort), 0) as max_sort FROM $questions_table WHERE survey_id=? AND deleted=0";
        return $this->db->query($sql, array($survey_id))->getRow()->max_sort;
    }

    function update_sort($data = array()) {
        $questions_table = $this->db->prefixTable('primo_questions');
        foreach ($data as $sort => $id) {
            $this->db->query("UPDATE $questions_table SET sort=? WHERE id=?", array($sort, $id));
        }
    }
}
