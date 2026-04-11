<?php

namespace App\Controllers\Api;

use App\Libraries\Plan_limits;

/**
 * Survey CRUD + builder + targeting + launch — REST endpoints.
 */
class Surveys extends Api_base
{
    private Plan_limits $plan_limits;

    public function __construct()
    {
        parent::__construct();
        $this->plan_limits = new Plan_limits();
        $this->plan_limits->set_user_plan('basic');
    }

    /**
     * GET /api/v1/surveys
     */
    public function index()
    {
        $rows = $this->Primo_surveys_model->get_details([
            'user_id' => $this->api_user_id,
        ])->getResult();

        $surveys = array_map(fn($s) => $this->_dto($s), $rows);
        return $this->ok($surveys);
    }

    /**
     * GET /api/v1/surveys/:id
     */
    public function show($id = 0)
    {
        $survey = $this->Primo_surveys_model->get_details(['id' => $id])->getRow();
        if (!$survey || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }
        return $this->ok($this->_dto($survey));
    }

    /**
     * POST /api/v1/surveys
     */
    public function create()
    {
        $body = $this->request->getJSON(true) ?? [];

        $count = $this->Primo_surveys_model->get_survey_count($this->api_user_id);
        if (!$this->plan_limits->can_create_survey($count)) {
            return $this->fail('Survey limit reached for your plan.', 403);
        }

        $data = [
            'title'            => $body['title'] ?? '',
            'description'      => $body['description'] ?? '',
            'target_responses' => (int) ($body['target_responses'] ?? 100),
            'language'         => $body['language'] ?? 'en',
            'user_id'          => $this->api_user_id,
            'created_by'       => $this->api_user_id,
            'status'           => 'draft',
        ];

        if (!$data['title']) {
            return $this->fail('Title is required.');
        }

        $id = $this->Primo_surveys_model->ci_save($data);
        $survey = $this->Primo_surveys_model->get_details(['id' => $id])->getRow();
        return $this->created($this->_dto($survey));
    }

    /**
     * PUT /api/v1/surveys/:id
     */
    public function update($id = 0)
    {
        $survey = $this->Primo_surveys_model->get_one($id);
        if (!$survey->id || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }

        $body = $this->request->getJSON(true) ?? [];
        $allowed = ['title', 'description', 'target_responses', 'language'];
        $data = array_intersect_key($body, array_flip($allowed));

        $this->Primo_surveys_model->ci_save($data, $id);
        $survey = $this->Primo_surveys_model->get_details(['id' => $id])->getRow();
        return $this->ok($this->_dto($survey));
    }

    /**
     * DELETE /api/v1/surveys/:id
     */
    public function delete($id = 0)
    {
        $survey = $this->Primo_surveys_model->get_one($id);
        if (!$survey->id || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }
        $this->Primo_surveys_model->delete_where_and_update($id, ['user_id' => $this->api_user_id]);
        return $this->ok(null, 'Survey deleted.');
    }

    // ── Questions ────────────────────────────

    /**
     * GET /api/v1/surveys/:id/questions
     */
    public function questions($survey_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_one($survey_id);
        if (!$survey->id || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }

        $rows = $this->Primo_questions_model->get_details(['survey_id' => $survey_id])->getResult();
        $questions = array_map(fn($q) => [
            'id'            => (int) $q->id,
            // Frontend field names
            'question_text' => $q->text,
            'question_type' => $q->type,
            'is_required'   => (int) $q->required,
            'sort_order'    => (int) $q->sort,
            'options'       => $q->options ? json_decode($q->options, true) : null,
            // Backend field names (for compatibility)
            'text'     => $q->text,
            'type'     => $q->type,
            'required' => (bool) $q->required,
            'sort'     => (int) $q->sort,
        ], $rows);

        return $this->ok($questions);
    }

    /**
     * POST /api/v1/surveys/:id/questions
     */
    public function add_question($survey_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_one($survey_id);
        if (!$survey->id || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }

        $count = $this->Primo_questions_model->get_question_count($survey_id);
        if (!$this->plan_limits->can_add_question($count)) {
            return $this->fail('Question limit reached.', 403);
        }

        $body = $this->request->getJSON(true) ?? [];
        // Accept both frontend naming (question_text) and backend naming (text)
        $data = [
            'survey_id' => $survey_id,
            'text'      => $body['question_text'] ?? $body['text'] ?? '',
            'type'      => $body['question_type'] ?? $body['type'] ?? 'text',
            'options'   => isset($body['options']) ? json_encode($body['options']) : null,
            'required'  => !empty($body['is_required'] ?? $body['required'] ?? 0) ? 1 : 0,
            'sort'      => !empty($body['sort_order']) ? (int)$body['sort_order'] : $this->Primo_questions_model->get_max_sort($survey_id) + 1,
        ];

        $qid = $this->Primo_questions_model->ci_save($data);
        return $this->created(['id' => $qid]);
    }

    /**
     * PUT /api/v1/surveys/:sid/questions/:qid
     */
    public function update_question($survey_id = 0, $question_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_one($survey_id);
        if (!$survey->id || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }

        $body = $this->request->getJSON(true) ?? [];
        $data = [];
        // Accept both frontend naming and backend naming
        if (isset($body['question_text']) || isset($body['text'])) {
            $data['text'] = $body['question_text'] ?? $body['text'];
        }
        if (isset($body['question_type']) || isset($body['type'])) {
            $data['type'] = $body['question_type'] ?? $body['type'];
        }
        if (isset($body['is_required']) || isset($body['required'])) {
            $data['required'] = !empty($body['is_required'] ?? $body['required']) ? 1 : 0;
        }
        if (isset($body['sort_order']) || isset($body['sort'])) {
            $data['sort'] = (int)($body['sort_order'] ?? $body['sort']);
        }
        if (isset($body['options'])) {
            $data['options'] = json_encode($body['options']);
        }

        $this->Primo_questions_model->ci_save($data, $question_id);
        return $this->ok(null, 'Question updated.');
    }

    /**
     * DELETE /api/v1/surveys/:sid/questions/:qid
     */
    public function delete_question($survey_id = 0, $question_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_one($survey_id);
        if (!$survey->id || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }
        $this->Primo_questions_model->delete($question_id);
        return $this->ok(null, 'Question deleted.');
    }

    // ── Targeting ────────────────────────────

    /**
     * GET /api/v1/surveys/:id/targeting
     */
    public function targeting($survey_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_one($survey_id);
        if (!$survey->id || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }

        $targeting = $survey->targeting ? json_decode($survey->targeting, true) : [];
        $matcher = new \App\Libraries\Panel_matcher();
        $reach = $matcher->estimate_reach($targeting);

        return $this->ok([
            'targeting'       => $targeting,
            'estimated_reach' => $reach,
        ]);
    }

    /**
     * PUT /api/v1/surveys/:id/targeting
     */
    public function save_targeting($survey_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_one($survey_id);
        if (!$survey->id || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }

        $body = $this->request->getJSON(true) ?? [];
        $targeting = [
            'age_min' => $body['age_min'] ?? null,
            'age_max' => $body['age_max'] ?? null,
            'gender'  => $body['gender'] ?? 'any',
            'region'  => $body['region'] ?? null,
        ];

        $this->Primo_surveys_model->ci_save(['targeting' => json_encode($targeting)], $survey_id);

        $matcher = new \App\Libraries\Panel_matcher();
        $reach = $matcher->estimate_reach($targeting);

        return $this->ok(['targeting' => $targeting, 'estimated_reach' => $reach]);
    }

    // ── Launch ───────────────────────────────

    /**
     * POST /api/v1/surveys/:id/launch
     */
    public function launch($survey_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_one($survey_id);
        if (!$survey->id || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }
        if ($survey->status !== 'draft') {
            return $this->fail('Only draft surveys can be launched.');
        }

        $questions_count = $this->Primo_questions_model->get_question_count($survey_id);
        if ($questions_count < 1) {
            return $this->fail('Survey must have at least one question.');
        }

        $body = $this->request->getJSON(true) ?? [];
        $this->Primo_surveys_model->ci_save([
            'status'    => 'live',
            'starts_at' => $body['starts_at'] ?? date('Y-m-d H:i:s'),
            'ends_at'   => $body['ends_at'] ?? null,
        ], $survey_id);

        return $this->ok(null, 'Survey launched.');
    }

    // ── DTO ──────────────────────────────────

    private function _dto($s): array
    {
        return [
            'id'               => (int) $s->id,
            'title'            => $s->title,
            'description'      => $s->description ?? '',
            'status'           => $s->status,
            'target_responses' => (int) $s->target_responses,
            'collected_count'  => (int) ($s->collected_count ?? 0),
            'response_count'   => (int) ($s->collected_count ?? 0),   // alias for frontend
            'question_count'   => (int) $this->Primo_questions_model->get_question_count($s->id),
            'language'         => $s->language ?? 'en',
            'targeting'        => $s->targeting ? json_decode($s->targeting, true) : null,
            'created_at'       => $s->created_at,
        ];
    }
}
