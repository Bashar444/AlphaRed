<?php

namespace App\Libraries;

class Quality_scorer {

    private $ci;
    private $config;

    function __construct() {
        $this->ci = &get_instance();
        $this->config = config('PrimoData');
    }

    /**
     * Score a single response for quality.
     *
     * @param int $response_id The response to score
     * @return array ['score' => float, 'flags' => array]
     */
    function score_response($response_id) {
        $response = $this->ci->Primo_responses_model->get_details(array("id" => $response_id))->getRow();
        if (!$response) {
            return array('score' => 0, 'flags' => array('response_not_found'));
        }

        $survey = $this->ci->Primo_surveys_model->get_details(array("id" => $response->survey_id))->getRow();
        $answers = $this->ci->Primo_answers_model->get_details(array("response_id" => $response_id))->getResult();
        $questions = $this->ci->Primo_questions_model->get_details(array("survey_id" => $response->survey_id))->getResult();

        $flags = array();
        $score = 100;
        $thresholds = $this->config->quality_thresholds;

        // 1. Duration check — too fast indicates low quality
        $min_duration = isset($thresholds['min_duration_seconds']) ? $thresholds['min_duration_seconds'] : 30;
        if ($response->duration_secs > 0 && $response->duration_secs < $min_duration) {
            $flags[] = 'too_fast';
            $score -= 30;
        }

        // 2. Duration check — way too long indicates distraction
        $max_duration = isset($thresholds['max_duration_seconds']) ? $thresholds['max_duration_seconds'] : 3600;
        if ($response->duration_secs > $max_duration) {
            $flags[] = 'too_slow';
            $score -= 10;
        }

        // 3. Completeness — check if all required questions are answered
        $required_count = 0;
        $answered_required = 0;
        $answered_question_ids = array();
        foreach ($answers as $answer) {
            $answered_question_ids[] = $answer->question_id;
        }
        foreach ($questions as $question) {
            if ($question->required) {
                $required_count++;
                if (in_array($question->id, $answered_question_ids)) {
                    $answered_required++;
                }
            }
        }
        if ($required_count > 0) {
            $completeness = ($answered_required / $required_count) * 100;
            if ($completeness < 100) {
                $flags[] = 'incomplete';
                $score -= round((100 - $completeness) * 0.5);
            }
        }

        // 4. Straightlining detection — same answer for all choice questions
        $choice_answers = array();
        foreach ($answers as $answer) {
            if (in_array($answer->question_type, array('single_choice', 'rating', 'scale'))) {
                $choice_answers[] = $answer->value;
            }
        }
        if (count($choice_answers) >= 3) {
            $unique = array_unique($choice_answers);
            if (count($unique) === 1) {
                $flags[] = 'straightlining';
                $score -= 25;
            }
        }

        // 5. Text quality — check open-ended answers for minimum length
        $min_text_length = isset($thresholds['min_text_length']) ? $thresholds['min_text_length'] : 10;
        foreach ($answers as $answer) {
            if ($answer->question_type === 'text' && $answer->question_options === null) {
                $text_val = json_decode($answer->value, true);
                $text = is_string($text_val) ? $text_val : (is_array($text_val) ? implode(' ', $text_val) : '');
                if (strlen(trim($text)) < $min_text_length) {
                    $flags[] = 'short_text_answer';
                    $score -= 10;
                    break;
                }
            }
        }

        $score = max(0, min(100, $score));

        // Update response with quality score and flags
        $this->ci->Primo_responses_model->ci_save(array(
            "quality_score" => $score,
            "quality_flags" => json_encode($flags),
        ), $response_id);

        return array('score' => $score, 'flags' => $flags);
    }

    /**
     * Score all completed responses for a survey.
     *
     * @param int $survey_id
     * @return array Summary stats
     */
    function score_survey_responses($survey_id) {
        $responses = $this->ci->Primo_responses_model->get_details(array(
            "survey_id" => $survey_id,
            "status" => "completed",
        ))->getResult();

        $scores = array();
        $flagged = 0;
        foreach ($responses as $response) {
            $result = $this->score_response($response->id);
            $scores[] = $result['score'];
            if (!empty($result['flags'])) {
                $flagged++;
            }
        }

        $total = count($scores);
        return array(
            'total' => $total,
            'avg_score' => $total > 0 ? round(array_sum($scores) / $total, 1) : 0,
            'min_score' => $total > 0 ? min($scores) : 0,
            'max_score' => $total > 0 ? max($scores) : 0,
            'flagged_count' => $flagged,
        );
    }

    /**
     * Check if a response meets minimum quality threshold for acceptance.
     *
     * @param float $score
     * @return bool
     */
    function passes_threshold($score) {
        $min = isset($this->config->quality_thresholds['min_overall_score'])
            ? $this->config->quality_thresholds['min_overall_score']
            : 50;
        return $score >= $min;
    }
}
