<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class PrimoData extends BaseConfig {

    // Plan tier definitions — feature gating
    public $plans = array(
        'basic' => array(
            'name' => 'Basic',
            'price_inr' => 499,
            'max_surveys' => 5,
            'max_responses_per_survey' => 100,
            'max_questions_per_survey' => 20,
            'export_formats' => array('csv'),
            'ai_narrative' => false,
            'api_access' => false,
            'team_members' => 1,
            'targeting_presets' => 2,
        ),
        'advanced' => array(
            'name' => 'Advanced',
            'price_inr' => 1499,
            'max_surveys' => 25,
            'max_responses_per_survey' => 500,
            'max_questions_per_survey' => 50,
            'export_formats' => array('csv', 'xls', 'pdf'),
            'ai_narrative' => true,
            'api_access' => false,
            'team_members' => 3,
            'targeting_presets' => 10,
        ),
        'enterprise' => array(
            'name' => 'Enterprise',
            'price_inr' => 4999,
            'max_surveys' => 0, // unlimited
            'max_responses_per_survey' => 0, // unlimited
            'max_questions_per_survey' => 0, // unlimited
            'export_formats' => array('csv', 'xls', 'pdf', 'zip'),
            'ai_narrative' => true,
            'api_access' => true,
            'team_members' => 0, // unlimited
            'targeting_presets' => 0, // unlimited
        ),
    );

    // Respondent quality thresholds
    public $quality = array(
        'min_completion_time_pct' => 30, // min 30% of estimated time
        'max_straight_line_pct' => 70,   // max 70% same answer in matrix
        'min_open_text_chars' => 10,     // min chars for open-text answers
        'min_quality_score' => 60,       // below this, response is flagged
    );

    // Survey status transitions
    public $allowed_transitions = array(
        'draft' => array('active'),
        'active' => array('paused', 'closed'),
        'paused' => array('active', 'closed'),
        'closed' => array('archived'),
        'archived' => array(),
    );

    // Claude AI configuration
    public $claude_api_key = ''; // Set via .env or Settings
    public $claude_model = 'claude-sonnet-4-20250514';

    // Quality thresholds used by Quality_scorer library
    public $quality_thresholds = array(
        'min_duration_seconds' => 30,
        'max_duration_seconds' => 3600,
        'min_text_length' => 10,
        'min_overall_score' => 50,
    );
}
