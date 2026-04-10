<?php

namespace App\Models;

class Primo_public_datasets_model extends Crud_model {

    protected $table = 'primo_public_datasets';

    function __construct() {
        $this->table = 'primo_public_datasets';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $datasets_table = $this->db->prefixTable('primo_public_datasets');

        $where = "";
        $id = isset($options["id"]) ? $options["id"] : "";
        $category = isset($options["category"]) ? $options["category"] : "";
        $featured = isset($options["featured"]) ? $options["featured"] : "";
        $search = isset($options["search"]) ? $options["search"] : "";

        if ($id) {
            $where .= " AND $datasets_table.id=$id";
        }
        if ($category) {
            $where .= " AND $datasets_table.category=" . $this->db->escape($category);
        }
        if ($featured !== "") {
            $where .= " AND $datasets_table.featured=$featured";
        }
        if ($search) {
            $search = $this->db->escapeLikeString($search);
            $where .= " AND ($datasets_table.title LIKE '%$search%' OR $datasets_table.description LIKE '%$search%' OR $datasets_table.tags LIKE '%$search%')";
        }

        $sql = "SELECT $datasets_table.*
                FROM $datasets_table
                WHERE $datasets_table.deleted=0 $where
                ORDER BY $datasets_table.id DESC";
        return $this->db->query($sql);
    }

    function increment_view_count($id) {
        $datasets_table = $this->db->prefixTable('primo_public_datasets');
        $sql = "UPDATE $datasets_table SET view_count = view_count + 1 WHERE id=?";
        return $this->db->query($sql, array($id));
    }

    function get_categories() {
        $datasets_table = $this->db->prefixTable('primo_public_datasets');
        $sql = "SELECT DISTINCT category FROM $datasets_table WHERE deleted=0 AND category IS NOT NULL ORDER BY category ASC";
        return $this->db->query($sql);
    }
}
