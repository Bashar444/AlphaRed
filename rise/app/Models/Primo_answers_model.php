<?php

namespace App\Models;

class Primo_answers_model extends Crud_model {

    protected $table = 'primo_answers';

    function __construct() {
        $this->table = 'primo_answers';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $answers_table = $this->db->prefixTable('primo_answers');
        $questions_table = $this->db->prefixTable('primo_questions');

        $where = "";
        $response_id = get_array_value($options, "response_id");
        if ($response_id) {
            $where .= " AND $answers_table.response_id=$response_id";
        }

        $question_id = get_array_value($options, "question_id");
        if ($question_id) {
            $where .= " AND $answers_table.question_id=$question_id";
        }

        $survey_id = get_array_value($options, "survey_id");
        if ($survey_id) {
            $where .= " AND $answers_table.survey_id=$survey_id";
        }

        $sql = "SELECT $answers_table.*, $questions_table.text as question_text, 
                $questions_table.type as question_type, $questions_table.options as question_options
            FROM $answers_table
            LEFT JOIN $questions_table ON $questions_table.id = $answers_table.question_id
            WHERE $answers_table.deleted=0 $where
            ORDER BY $questions_table.sort ASC";

        return $this->db->query($sql);
    }

    function get_answer_summary($survey_id, $question_id) {
        $answers_table = $this->db->prefixTable('primo_answers');
        $responses_table = $this->db->prefixTable('primo_responses');

        $sql = "SELECT $answers_table.value, COUNT(*) as count
            FROM $answers_table
            INNER JOIN $responses_table ON $responses_table.id = $answers_table.response_id
            WHERE $answers_table.survey_id=? AND $answers_table.question_id=?
                AND $answers_table.deleted=0 AND $responses_table.status='completed'
                AND $responses_table.deleted=0
            GROUP BY $answers_table.value
            ORDER BY count DESC";

        return $this->db->query($sql, array($survey_id, $question_id));
    }
}
