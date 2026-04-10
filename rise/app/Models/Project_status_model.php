<?php

namespace App\Models;

class Project_status_model extends Crud_model {

    protected $table = null;

    function __construct() {
        $this->table = 'project_status';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $project_status_table = $this->db->prefixTable('project_status');

        $where = "";
        $id = $this->_get_clean_value($options, "id");
        if ($id) {
            $where .= " AND $project_status_table.id=$id";
        }
        
        $sql = "SELECT $project_status_table.*
        FROM $project_status_table
        WHERE $project_status_table.deleted=0 $where";
        return $this->db->query($sql);
    }

}
