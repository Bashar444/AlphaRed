<?php

namespace App\Libraries;

class Plan_limits {

    private $config;
    private $user_plan;

    function __construct() {
        $this->config = config('PrimoData');
    }

    function set_user_plan($plan_key) {
        $this->user_plan = isset($this->config->plans[$plan_key]) ? $this->config->plans[$plan_key] : $this->config->plans['basic'];
    }

    function get_plan($plan_key = '') {
        if ($plan_key) {
            return isset($this->config->plans[$plan_key]) ? $this->config->plans[$plan_key] : null;
        }
        return $this->user_plan;
    }

    function get_limit($key) {
        if (!$this->user_plan) {
            return 0;
        }
        return isset($this->user_plan[$key]) ? $this->user_plan[$key] : 0;
    }

    function can_create_survey($current_count) {
        $max = $this->get_limit('max_surveys');
        return $max === 0 || $current_count < $max; // 0 = unlimited
    }

    function can_collect_responses($current_count, $survey_target = 0) {
        $max = $this->get_limit('max_responses_per_survey');
        if ($max === 0) return true; // unlimited
        $limit = $survey_target > 0 ? min($max, $survey_target) : $max;
        return $current_count < $limit;
    }

    function can_add_question($current_count) {
        $max = $this->get_limit('max_questions_per_survey');
        return $max === 0 || $current_count < $max;
    }

    function can_export($format) {
        $formats = $this->get_limit('export_formats');
        return is_array($formats) && in_array($format, $formats);
    }

    function has_ai_narrative() {
        return (bool) $this->get_limit('ai_narrative');
    }

    function has_api_access() {
        return (bool) $this->get_limit('api_access');
    }

    function get_all_plans() {
        return $this->config->plans;
    }
}
