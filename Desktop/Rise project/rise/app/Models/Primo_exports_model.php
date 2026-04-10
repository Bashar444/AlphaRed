<?php

namespace App\Models;

class Primo_exports_model extends Crud_model {

    protected $table = 'primo_exports';

    function __construct() {
        $this->table = 'primo_exports';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $table = $this->db->prefixTable('primo_exports');

        $where = "";
        $id = get_array_value($options, "id");
        if ($id) {
            $where .= " AND $table.id=$id";
        }

        $survey_id = get_array_value($options, "survey_id");
        if ($survey_id) {
            $where .= " AND $table.survey_id=$survey_id";
        }

        $sql = "SELECT * FROM $table WHERE $table.deleted=0 $where ORDER BY $table.id DESC";
        return $this->db->query($sql);
    }
}
