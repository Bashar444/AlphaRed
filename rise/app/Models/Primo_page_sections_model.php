<?php

namespace App\Models;

class Primo_page_sections_model extends Crud_model {

    protected $table = 'primo_page_sections';

    function __construct() {
        $this->table = 'primo_page_sections';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $table = $this->db->prefixTable('primo_page_sections');

        $where = "";
        $id = isset($options["id"]) ? $options["id"] : "";
        $page_id = isset($options["page_id"]) ? $options["page_id"] : "";

        if ($id) {
            $where .= " AND s.id = " . $this->db->escapeString($id);
        }
        if ($page_id) {
            $where .= " AND s.page_id = " . $this->db->escapeString($page_id);
        }

        $sql = "SELECT s.*
                FROM {$table} s
                WHERE s.deleted = 0 {$where}
                ORDER BY s.sort_order ASC";

        return $this->db->query($sql);
    }
}
