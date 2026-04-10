<?php

namespace App\Controllers\Api;

/**
 * Survey responses — view, quality scoring.
 */
class Responses extends Api_base
{
    /**
     * GET /api/v1/surveys/:id/responses
     */
    public function index($survey_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_details(['id' => $survey_id])->getRow();
        if (!$survey || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }

        $rows = $this->Primo_responses_model->get_details(['survey_id' => $survey_id])->getResult();
        $list = array_map(fn($r) => [
            'id'            => (int) $r->id,
            'respondent'    => trim(($r->first_name ?? '') . ' ' . ($r->last_name ?? '')),
            'status'        => $r->status,
            'quality_score' => (float) $r->quality_score,
            'duration_secs' => (int) ($r->duration_secs ?? 0),
            'completed_at'  => $r->completed_at,
        ], $rows);

        return $this->ok($list);
    }

    /**
     * GET /api/v1/responses/:id
     */
    public function show($response_id = 0)
    {
        $response = $this->Primo_responses_model->get_details(['id' => $response_id])->getRow();
        if (!$response) return $this->notFound();

        $survey = $this->Primo_surveys_model->get_details(['id' => $response->survey_id])->getRow();
        if (!$survey || (int) $survey->user_id !== $this->api_user_id) {
            return $this->forbidden();
        }

        $answers = $this->Primo_answers_model->get_details(['response_id' => $response_id])->getResult();
        $answer_list = array_map(fn($a) => [
            'question_id' => (int) $a->question_id,
            'value'       => json_decode($a->value, true),
        ], $answers);

        return $this->ok([
            'id'            => (int) $response->id,
            'status'        => $response->status,
            'quality_score' => (float) $response->quality_score,
            'duration_secs' => (int) ($response->duration_secs ?? 0),
            'completed_at'  => $response->completed_at,
            'answers'       => $answer_list,
        ]);
    }

    /**
     * GET /api/v1/surveys/:id/responses/quality
     */
    public function quality($survey_id = 0)
    {
        $distribution = $this->Primo_responses_model->get_quality_distribution($survey_id);
        $avg_duration = $this->Primo_responses_model->get_avg_duration($survey_id);
        $total = $this->Primo_responses_model->get_response_count($survey_id, 'completed');

        return $this->ok([
            'total_completed' => $total,
            'quality_high'    => $distribution->high ?? 0,
            'quality_medium'  => $distribution->medium ?? 0,
            'quality_low'     => $distribution->low ?? 0,
            'avg_duration'    => round($avg_duration),
        ]);
    }

    /**
     * POST /api/v1/surveys/:id/responses/score-all
     */
    public function score_all($survey_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_details(['id' => $survey_id])->getRow();
        if (!$survey || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }

        $scorer = new \App\Libraries\Quality_scorer();
        $summary = $scorer->score_survey_responses($survey_id);
        return $this->ok($summary, 'Scoring complete.');
    }
}
