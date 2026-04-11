<?php

namespace App\Models;

class Primo_menus_model extends Crud_model {

    protected $table = 'primo_menus';

    function __construct() {
        $this->table = 'primo_menus';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $table = $this->db->prefixTable('primo_menus');

        $where = "";
        $id = isset($options["id"]) ? $options["id"] : "";
        $location = isset($options["location"]) ? $options["location"] : "";
        $status = isset($options["status"]) ? $options["status"] : "";

        if ($id) {
            $where .= " AND m.id = " . $this->db->escapeString($id);
        }
        if ($location) {
            $where .= " AND m.location = '" . $this->db->escapeString($location) . "'";
        }
        if ($status) {
            $where .= " AND m.status = '" . $this->db->escapeString($status) . "'";
        }

        $sql = "SELECT m.*
                FROM {$table} m
                WHERE m.deleted = 0 {$where}
                ORDER BY m.id ASC";

        return $this->db->query($sql);
    }
}
