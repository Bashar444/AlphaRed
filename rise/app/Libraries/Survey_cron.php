<?php

namespace App\Libraries;

class Survey_cron {

    private $ci;

    function __construct() {
        $this->ci = &get_instance();
    }

    /**
     * Auto-close surveys that have reached their target response count
     * or passed their end date.
     */
    function auto_close_surveys() {
        $surveys_table = $this->ci->db->prefixTable('primo_surveys');

        // Close surveys that have reached target
        $sql_target = "UPDATE $surveys_table 
                SET status = 'closed' 
                WHERE status = 'live' 
                AND collected_count >= target_responses 
                AND deleted = 0";
        $this->ci->db->query($sql_target);
        $closed_target = $this->ci->db->affectedRows();

        // Close surveys past end date
        $sql_expired = "UPDATE $surveys_table 
                SET status = 'closed' 
                WHERE status = 'live' 
                AND ends_at IS NOT NULL 
                AND ends_at < NOW() 
                AND deleted = 0";
        $this->ci->db->query($sql_expired);
        $closed_expired = $this->ci->db->affectedRows();

        log_message('info', "Survey cron: auto-closed $closed_target (target reached) + $closed_expired (expired)");

        return array(
            'closed_target' => $closed_target,
            'closed_expired' => $closed_expired,
        );
    }

    /**
     * Auto-launch surveys whose starts_at has arrived.
     */
    function auto_launch_surveys() {
        $surveys_table = $this->ci->db->prefixTable('primo_surveys');

        $sql = "UPDATE $surveys_table 
                SET status = 'live' 
                WHERE status = 'draft' 
                AND starts_at IS NOT NULL 
                AND starts_at <= NOW() 
                AND deleted = 0";
        $this->ci->db->query($sql);
        $launched = $this->ci->db->affectedRows();

        log_message('info', "Survey cron: auto-launched $launched surveys");

        return array('launched' => $launched);
    }

    /**
     * Recalculate quality scores for respondents based on their response history.
     */
    function update_respondent_quality() {
        $respondents_table = $this->ci->db->prefixTable('primo_respondents');
        $responses_table = $this->ci->db->prefixTable('primo_responses');

        $sql = "UPDATE $respondents_table r
                SET r.quality_score = (
                    SELECT COALESCE(AVG(resp.quality_score), 100)
                    FROM $responses_table resp
                    WHERE resp.respondent_id = r.id
                    AND resp.status = 'completed'
                    AND resp.deleted = 0
                )
                WHERE r.deleted = 0 AND r.kyc_status = 'verified'";
        $this->ci->db->query($sql);
        $updated = $this->ci->db->affectedRows();

        log_message('info', "Survey cron: updated quality for $updated respondents");

        return array('updated' => $updated);
    }

    /**
     * Run all cron tasks. Called from RISE's existing cron system.
     */
    function run_all() {
        $results = array();
        $results['auto_close'] = $this->auto_close_surveys();
        $results['auto_launch'] = $this->auto_launch_surveys();
        $results['quality_update'] = $this->update_respondent_quality();
        return $results;
    }
}
