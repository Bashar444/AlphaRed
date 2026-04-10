<?php

namespace App\Controllers\Api;

/**
 * Public endpoints — no auth required.
 * Free stats portal + survey taking.
 */
class PublicApi extends Api_base
{
    // ── Free Stats Portal ────────────────────

    /**
     * GET /api/v1/public/datasets
     */
    public function datasets()
    {
        $search   = $this->request->getGet('q');
        $category = $this->request->getGet('category');

        $options = [];
        if ($search)   $options['search']   = $search;
        if ($category) $options['category'] = $category;

        $rows = $this->Primo_public_datasets_model->get_details($options)->getResult();
        $list = array_map(fn($d) => [
            'id'         => (int) $d->id,
            'title'      => $d->title,
            'category'   => $d->category,
            'view_count' => (int) $d->view_count,
        ], $rows);

        return $this->ok($list);
    }

    /**
     * GET /api/v1/public/datasets/:id
     */
    public function dataset($id = 0)
    {
        $d = $this->Primo_public_datasets_model->get_details(['id' => $id])->getRow();
        if (!$d) return $this->notFound();

        $this->Primo_public_datasets_model->increment_view_count($id);

        return $this->ok([
            'id'          => (int) $d->id,
            'title'       => $d->title,
            'description' => $d->description ?? '',
            'category'    => $d->category,
            'data'        => json_decode($d->data ?? '{}', true),
            'view_count'  => (int) $d->view_count,
        ]);
    }

    /**
     * GET /api/v1/public/datasets/categories
     */
    public function categories()
    {
        $rows = $this->Primo_public_datasets_model->get_categories()->getResult();
        return $this->ok(array_map(fn($r) => $r->category, $rows));
    }

    // ── Survey Taking ────────────────────────

    /**
     * GET /api/v1/public/surveys/:id
     * Public survey page for respondents.
     */
    public function survey($survey_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_details(['id' => $survey_id])->getRow();
        if (!$survey || $survey->status !== 'live') {
            return $this->fail('Survey is not available.', 404);
        }

        if ((int) $survey->collected_count >= (int) $survey->target_responses) {
            return $this->fail('Survey has reached its target.', 410);
        }

        $questions = $this->Primo_questions_model->get_details(['survey_id' => $survey_id])->getResult();
        $q_list = array_map(fn($q) => [
            'id'       => (int) $q->id,
            'text'     => $q->text,
            'type'     => $q->type,
            'options'  => $q->options ? json_decode($q->options, true) : null,
            'required' => (bool) $q->required,
            'sort'     => (int) $q->sort,
        ], $questions);

        return $this->ok([
            'id'          => (int) $survey->id,
            'title'       => $survey->title,
            'description' => $survey->description ?? '',
            'language'    => $survey->language ?? 'en',
            'questions'   => $q_list,
        ]);
    }

    /**
     * POST /api/v1/public/surveys/:id/submit
     */
    public function submit_survey($survey_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_details(['id' => $survey_id])->getRow();
        if (!$survey || $survey->status !== 'live') {
            return $this->fail('Survey is not active.');
        }

        $body = $this->request->getJSON(true) ?? [];
        $respondent_id = $body['respondent_id'] ?? 0;
        $start_time    = $body['start_time'] ?? 0;
        $answers       = $body['answers'] ?? [];

        // Duplicate check
        if ($respondent_id) {
            $existing = $this->Primo_responses_model->get_details([
                'survey_id'     => $survey_id,
                'respondent_id' => $respondent_id,
            ])->getRow();
            if ($existing) {
                return $this->fail('Already responded to this survey.');
            }
        }

        $duration = $start_time ? (time() - (int) $start_time) : 0;
        $ip_hash     = hash('sha256', $this->request->getIPAddress());
        $device_hash = hash('sha256', $this->request->getUserAgent()->getAgentString());

        $response_id = $this->Primo_responses_model->ci_save([
            'survey_id'     => $survey_id,
            'respondent_id' => $respondent_id ?: 0,
            'status'        => 'completed',
            'quality_score' => 0,
            'completed_at'  => date('Y-m-d H:i:s'),
            'duration_secs' => $duration,
            'ip_hash'       => $ip_hash,
            'device_hash'   => $device_hash,
        ]);

        if (!$response_id) {
            return $this->fail('Failed to save response.');
        }

        if (is_array($answers)) {
            foreach ($answers as $qid => $value) {
                $this->Primo_answers_model->ci_save([
                    'response_id' => $response_id,
                    'question_id' => (int) $qid,
                    'survey_id'   => $survey_id,
                    'value'       => json_encode($value),
                ]);
            }
        }

        $scorer = new \App\Libraries\Quality_scorer();
        $quality = $scorer->score_response($response_id);

        $this->Primo_surveys_model->update_collected_count($survey_id);
        if ($respondent_id) {
            $this->Primo_respondents_model->increment_total_surveys($respondent_id);
        }

        // Auto-close
        $survey = $this->Primo_surveys_model->get_details(['id' => $survey_id])->getRow();
        if ((int) $survey->collected_count >= (int) $survey->target_responses) {
            $this->Primo_surveys_model->ci_save(['status' => 'closed'], $survey_id);
        }

        return $this->created([
            'response_id'   => $response_id,
            'quality_score' => $quality['score'] ?? 0,
        ], 'Thank you for your response!');
    }
}
