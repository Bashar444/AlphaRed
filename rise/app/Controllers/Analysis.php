<?php

namespace App\Controllers;

use App\Libraries\Descriptive_stats;
use App\Libraries\Inferential_stats;
use App\Libraries\Correlation;
use App\Libraries\Claude_api;
use App\Libraries\Plan_limits;

class Analysis extends Security_Controller {

    private $plan_limits;

    function __construct() {
        parent::__construct();
        $this->plan_limits = new Plan_limits();
        $this->plan_limits->set_user_plan('basic');
    }

    /**
     * Analysis dashboard for a survey.
     */
    function view($survey_id = 0) {
        $survey = $this->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();
        if (!$survey || $survey->user_id != $this->login_user->id) {
            show_404();
        }

        $questions = $this->Primo_questions_model->get_details(array("survey_id" => $survey_id))->getResult();
        $response_count = $this->Primo_responses_model->get_response_count($survey_id, 'completed');

        // Check for existing report
        $existing_report = $this->Primo_analysis_reports_model->get_details(array("survey_id" => $survey_id))->getRow();

        $view_data["survey"] = $survey;
        $view_data["questions"] = $questions;
        $view_data["response_count"] = $response_count;
        $view_data["existing_report"] = $existing_report;
        $view_data["page_title"] = $survey->title . " — Analysis";
        return $this->template->rander("analysis/index", $view_data);
    }

    /**
     * Run full analysis and store results.
     */
    function run($survey_id = 0) {
        $survey = $this->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();
        if (!$survey || $survey->user_id != $this->login_user->id) {
            echo json_encode(array("success" => false, "message" => "Access denied."));
            return;
        }

        $questions = $this->Primo_questions_model->get_details(array("survey_id" => $survey_id))->getResult();
        $desc = new Descriptive_stats();
        $inf = new Inferential_stats();
        $corr = new Correlation();

        $results = array(
            'descriptive' => array(),
            'frequency' => array(),
            'cross_tabs' => array(),
        );

        // Analyze each question
        foreach ($questions as $question) {
            $answers_result = $this->Primo_answers_model->get_answer_summary($survey_id, $question->id);
            $raw_answers = $answers_result->getResult();

            if (in_array($question->type, array('number', 'rating', 'scale'))) {
                // Numeric analysis
                $values = array();
                foreach ($raw_answers as $a) {
                    $val = json_decode($a->value, true);
                    if (is_numeric($val)) {
                        for ($i = 0; $i < $a->count; $i++) {
                            $values[] = floatval($val);
                        }
                    }
                }
                if (!empty($values)) {
                    $results['descriptive'][$question->text] = $desc->summary($values);
                }
            } else {
                // Categorical analysis — frequency distribution
                $cat_values = array();
                foreach ($raw_answers as $a) {
                    $val = json_decode($a->value, true);
                    $label = is_array($val) ? implode(', ', $val) : strval($val);
                    for ($i = 0; $i < $a->count; $i++) {
                        $cat_values[] = $label;
                    }
                }
                if (!empty($cat_values)) {
                    $results['frequency'][$question->text] = $desc->frequency($cat_values);
                }
            }
        }

        // Correlations between numeric questions
        $numeric_data = array();
        foreach ($questions as $question) {
            if (in_array($question->type, array('number', 'rating', 'scale'))) {
                $all_answers = $this->Primo_answers_model->get_details(array(
                    "survey_id" => $survey_id,
                    "question_id" => $question->id,
                ))->getResult();
                $values = array();
                foreach ($all_answers as $a) {
                    $val = json_decode($a->value, true);
                    if (is_numeric($val)) {
                        $values[$a->response_id] = floatval($val);
                    }
                }
                if (!empty($values)) {
                    $numeric_data[$question->text] = $values;
                }
            }
        }

        if (count($numeric_data) >= 2) {
            // Align data by response_id
            $keys = array_keys($numeric_data);
            $aligned = array();
            foreach ($keys as $k) {
                $aligned[$k] = array();
            }
            $common_ids = null;
            foreach ($numeric_data as $q => $vals) {
                $ids = array_keys($vals);
                $common_ids = $common_ids === null ? $ids : array_intersect($common_ids, $ids);
            }
            if ($common_ids && count($common_ids) >= 3) {
                $aligned_data = array();
                foreach ($keys as $k) {
                    $arr = array();
                    foreach ($common_ids as $rid) {
                        $arr[] = $numeric_data[$k][$rid];
                    }
                    $aligned_data[$k] = $arr;
                }
                $results['correlations'] = $corr->matrix($aligned_data);
            }
        }

        // Generate AI narrative if plan allows
        $narrative = '';
        if ($this->plan_limits->has_ai_narrative()) {
            $claude = new Claude_api();
            $ai_result = $claude->generate_narrative($results, $survey->title, $survey->language);
            if ($ai_result['success']) {
                $narrative = $ai_result['narrative'];
            }
        }

        // Save report
        $report_data = array(
            "survey_id" => $survey_id,
            "status" => "completed",
            "results" => json_encode($results),
            "ai_narrative" => $narrative,
            "completed_at" => date("Y-m-d H:i:s"),
        );

        // Check if existing report
        $existing = $this->Primo_analysis_reports_model->get_details(array("survey_id" => $survey_id))->getRow();
        $report_id = $this->Primo_analysis_reports_model->ci_save($report_data, $existing ? $existing->id : 0);

        echo json_encode(array(
            "success" => true,
            "message" => "Analysis complete.",
            "report_id" => $report_id,
            "data" => $results,
            "narrative" => $narrative,
        ));
    }

    /**
     * Get chart data for a specific question (AJAX).
     */
    function chart_data($survey_id = 0, $question_id = 0) {
        $answers = $this->Primo_answers_model->get_answer_summary($survey_id, $question_id);
        $rows = $answers->getResult();

        $labels = array();
        $values = array();
        foreach ($rows as $row) {
            $val = json_decode($row->value, true);
            $labels[] = is_array($val) ? implode(', ', $val) : strval($val);
            $values[] = intval($row->count);
        }

        echo json_encode(array(
            "success" => true,
            "labels" => $labels,
            "values" => $values,
        ));
    }
}
