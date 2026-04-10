<?php

namespace App\Models;

class Ci_sessions_model extends Crud_model {

    protected $table = null;

    function __construct() {
        $this->table = 'ci_sessions';
        parent::__construct($this->table);
    }

    function delete_session_by_date($date) {
        $ci_sessions_table = $this->db->prefixTable("ci_sessions");

        $sql = "DELETE FROM $ci_sessions_table WHERE timestamp<='$date'";
        $this->db->query($sql);
    }

}
