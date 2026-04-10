<?php

namespace App\Controllers;

class Survey_responses extends Security_Controller {

    function __construct() {
        parent::__construct();
    }

    /**
     * View responses for a survey — researcher view.
     */
    function index($survey_id = 0) {
        $survey_info = $this->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();
        if (!$survey_info || $survey_info->user_id != $this->login_user->id) {
            show_404();
        }

        $view_data["survey_info"] = $survey_info;
        $view_data["page_title"] = $survey_info->title . " — Responses";
        return $this->template->rander("survey_responses/index", $view_data);
    }

    /**
     * DataTable AJAX source for responses.
     */
    function list_data($survey_id = 0) {
        $list_data = $this->Primo_responses_model->get_details(array(
            "survey_id" => $survey_id,
        ))->getResult();

        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_row($data);
        }
        echo json_encode(array("data" => $result));
    }

    private function _make_row($data) {
        $status_class = "secondary";
        switch ($data->status) {
            case "completed": $status_class = "success"; break;
            case "in_progress": $status_class = "warning"; break;
            case "rejected": $status_class = "danger"; break;
        }

        $quality_class = "success";
        if ($data->quality_score < 50) {
            $quality_class = "danger";
        } elseif ($data->quality_score < 80) {
            $quality_class = "warning";
        }

        return array(
            $data->first_name . " " . $data->last_name,
            "<span class='badge bg-$status_class'>" . str_replace('_', ' ', $data->status) . "</span>",
            "<span class='badge bg-$quality_class'>" . $data->quality_score . "</span>",
            $data->duration_secs ? gmdate("H:i:s", $data->duration_secs) : "—",
            $data->completed_at ?: "—",
            modal_anchor(get_uri("survey_responses/view/" . $data->id), "<i data-feather='eye' class='icon-16'></i>", array("class" => "edit", "title" => "View Response")),
        );
    }

    /**
     * View individual response detail.
     */
    function view($response_id = 0) {
        $response = $this->Primo_responses_model->get_details(array("id" => $response_id))->getRow();
        if (!$response) {
            show_404();
        }

        // Verify researcher owns the survey
        $survey = $this->Primo_surveys_model->get_details(array("id" => $response->survey_id))->getRow();
        if (!$survey || $survey->user_id != $this->login_user->id) {
            show_404();
        }

        $answers = $this->Primo_answers_model->get_details(array("response_id" => $response_id))->getResult();

        $view_data["response"] = $response;
        $view_data["survey"] = $survey;
        $view_data["answers"] = $answers;
        return view("survey_responses/view", $view_data);
    }

    /**
     * Run quality scoring for all responses in a survey.
     */
    function score_all($survey_id = 0) {
        $survey = $this->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();
        if (!$survey || $survey->user_id != $this->login_user->id) {
            echo json_encode(array("success" => false, "message" => "Access denied."));
            return;
        }

        $scorer = new \App\Libraries\Quality_scorer();
        $summary = $scorer->score_survey_responses($survey_id);

        echo json_encode(array("success" => true, "data" => $summary));
    }

    /**
     * Quality dashboard widget data.
     */
    function quality_stats($survey_id = 0) {
        $distribution = $this->Primo_responses_model->get_quality_distribution($survey_id);
        $avg_duration = $this->Primo_responses_model->get_avg_duration($survey_id);
        $total = $this->Primo_responses_model->get_response_count($survey_id, 'completed');

        echo json_encode(array(
            "success" => true,
            "data" => array(
                "total_completed" => $total,
                "quality_high" => $distribution->high,
                "quality_medium" => $distribution->medium,
                "quality_low" => $distribution->low,
                "avg_duration_secs" => round($avg_duration),
            ),
        ));
    }
}
