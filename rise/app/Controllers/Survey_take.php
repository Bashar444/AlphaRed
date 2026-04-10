<?php

namespace App\Controllers;

class Survey_take extends App_Controller {

    function __construct() {
        parent::__construct();
    }

    /**
     * Public page where a respondent takes a survey.
     */
    function index($survey_id = 0) {
        $survey = $this->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();
        if (!$survey || $survey->status !== 'live') {
            return view("survey_take/unavailable");
        }

        // Check if survey has reached target
        if ($survey->collected_count >= $survey->target_responses) {
            return view("survey_take/closed");
        }

        $questions = $this->Primo_questions_model->get_details(array("survey_id" => $survey_id))->getResult();

        $view_data["survey"] = $survey;
        $view_data["questions"] = $questions;
        return view("survey_take/index", $view_data);
    }

    /**
     * Submit survey response.
     */
    function submit() {
        $survey_id = $this->request->getPost("survey_id");
        $respondent_id = $this->request->getPost("respondent_id");
        $start_time = $this->request->getPost("start_time");

        $survey = $this->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();
        if (!$survey || $survey->status !== 'live') {
            echo json_encode(array("success" => false, "message" => "Survey is not active."));
            return;
        }

        // Check for duplicate response
        $existing = $this->Primo_responses_model->get_details(array(
            "survey_id" => $survey_id,
            "respondent_id" => $respondent_id,
        ))->getRow();
        if ($existing) {
            echo json_encode(array("success" => false, "message" => "You have already responded to this survey."));
            return;
        }

        // Calculate duration
        $duration_secs = $start_time ? (time() - intval($start_time)) : 0;

        // Create response record
        $ip_hash = hash('sha256', $this->request->getIPAddress());
        $device_hash = hash('sha256', $this->request->getUserAgent()->getAgentString());

        $response_data = array(
            "survey_id" => $survey_id,
            "respondent_id" => $respondent_id ?: 0,
            "status" => "completed",
            "quality_score" => 0,
            "completed_at" => date("Y-m-d H:i:s"),
            "duration_secs" => $duration_secs,
            "ip_hash" => $ip_hash,
            "device_hash" => $device_hash,
        );
        $response_id = $this->Primo_responses_model->ci_save($response_data);

        if (!$response_id) {
            echo json_encode(array("success" => false, "message" => "Failed to save response."));
            return;
        }

        // Save individual answers
        $answers = $this->request->getPost("answers");
        if ($answers && is_array($answers)) {
            foreach ($answers as $question_id => $value) {
                $answer_data = array(
                    "response_id" => $response_id,
                    "question_id" => intval($question_id),
                    "survey_id" => $survey_id,
                    "value" => is_array($value) ? json_encode($value) : json_encode($value),
                );
                $this->Primo_answers_model->ci_save($answer_data);
            }
        }

        // Run quality scoring
        $scorer = new \App\Libraries\Quality_scorer();
        $quality = $scorer->score_response($response_id);

        // Update survey collected count
        $this->Primo_surveys_model->update_collected_count($survey_id);

        // Increment respondent's total surveys
        if ($respondent_id) {
            $this->Primo_respondents_model->increment_total_surveys($respondent_id);
        }

        // Auto-close if target reached
        $survey = $this->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();
        if ($survey->collected_count >= $survey->target_responses) {
            $this->Primo_surveys_model->ci_save(array("status" => "closed"), $survey_id);
        }

        echo json_encode(array(
            "success" => true,
            "message" => "Thank you for your response!",
            "quality_score" => $quality['score'],
        ));
    }
}
