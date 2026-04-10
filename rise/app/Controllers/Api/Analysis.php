<?php

namespace App\Controllers\Api;

use App\Libraries\Descriptive_stats;
use App\Libraries\Inferential_stats;
use App\Libraries\Correlation;
use App\Libraries\Claude_api;
use App\Libraries\Plan_limits;

/**
 * Analysis endpoints — run analysis, get results, chart data.
 */
class Analysis extends Api_base
{
    private Plan_limits $plan_limits;

    public function __construct()
    {
        parent::__construct();
        $this->plan_limits = new Plan_limits();
        $this->plan_limits->set_user_plan('basic');
    }

    /**
     * GET /api/v1/surveys/:id/analysis
     */
    public function show($survey_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_details(['id' => $survey_id])->getRow();
        if (!$survey || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }

        $report = $this->Primo_analysis_reports_model->get_details(['survey_id' => $survey_id])->getRow();
        if (!$report) {
            return $this->ok(['report' => null, 'response_count' => $this->Primo_responses_model->get_response_count($survey_id, 'completed')]);
        }

        return $this->ok([
            'report'    => [
                'id'           => (int) $report->id,
                'status'       => $report->status,
                'results'      => json_decode($report->results, true),
                'ai_narrative' => $report->ai_narrative,
                'completed_at' => $report->completed_at,
            ],
            'response_count' => $this->Primo_responses_model->get_response_count($survey_id, 'completed'),
        ]);
    }

    /**
     * POST /api/v1/surveys/:id/analysis/run
     */
    public function run($survey_id = 0)
    {
        $survey = $this->Primo_surveys_model->get_details(['id' => $survey_id])->getRow();
        if (!$survey || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }

        $questions = $this->Primo_questions_model->get_details(['survey_id' => $survey_id])->getResult();
        $desc = new Descriptive_stats();
        $corr = new Correlation();

        $results = ['descriptive' => [], 'frequency' => [], 'cross_tabs' => []];

        foreach ($questions as $question) {
            $raw = $this->Primo_answers_model->get_answer_summary($survey_id, $question->id)->getResult();

            if (in_array($question->type, ['number', 'rating', 'scale'])) {
                $values = [];
                foreach ($raw as $a) {
                    $val = json_decode($a->value, true);
                    if (is_numeric($val)) {
                        for ($i = 0; $i < $a->count; $i++) $values[] = floatval($val);
                    }
                }
                if ($values) $results['descriptive'][$question->text] = $desc->summary($values);
            } else {
                $cat = [];
                foreach ($raw as $a) {
                    $val = json_decode($a->value, true);
                    $label = is_array($val) ? implode(', ', $val) : strval($val);
                    for ($i = 0; $i < $a->count; $i++) $cat[] = $label;
                }
                if ($cat) $results['frequency'][$question->text] = $desc->frequency($cat);
            }
        }

        // Correlations
        $numeric = [];
        foreach ($questions as $q) {
            if (in_array($q->type, ['number', 'rating', 'scale'])) {
                $all = $this->Primo_answers_model->get_details(['survey_id' => $survey_id, 'question_id' => $q->id])->getResult();
                $vals = [];
                foreach ($all as $a) {
                    $v = json_decode($a->value, true);
                    if (is_numeric($v)) $vals[$a->response_id] = floatval($v);
                }
                if ($vals) $numeric[$q->text] = $vals;
            }
        }

        if (count($numeric) >= 2) {
            $keys = array_keys($numeric);
            $common = null;
            foreach ($numeric as $vals) {
                $ids = array_keys($vals);
                $common = $common === null ? $ids : array_intersect($common, $ids);
            }
            if ($common && count($common) >= 3) {
                $aligned = [];
                foreach ($keys as $k) {
                    $arr = [];
                    foreach ($common as $rid) $arr[] = $numeric[$k][$rid];
                    $aligned[$k] = $arr;
                }
                $results['correlations'] = $corr->matrix($aligned);
            }
        }

        // AI narrative
        $narrative = '';
        if ($this->plan_limits->has_ai_narrative()) {
            $claude = new Claude_api();
            $ai = $claude->generate_narrative($results, $survey->title, $survey->language);
            if ($ai['success']) $narrative = $ai['narrative'];
        }

        // Save report
        $existing = $this->Primo_analysis_reports_model->get_details(['survey_id' => $survey_id])->getRow();
        $report_data = [
            'survey_id'    => $survey_id,
            'status'       => 'completed',
            'results'      => json_encode($results),
            'ai_narrative' => $narrative,
            'completed_at' => date('Y-m-d H:i:s'),
        ];
        $report_id = $this->Primo_analysis_reports_model->ci_save($report_data, $existing ? $existing->id : 0);

        return $this->ok([
            'report_id' => $report_id,
            'results'   => $results,
            'narrative' => $narrative,
        ], 'Analysis complete.');
    }

    /**
     * GET /api/v1/surveys/:sid/analysis/chart/:qid
     */
    public function chart($survey_id = 0, $question_id = 0)
    {
        $rows = $this->Primo_answers_model->get_answer_summary($survey_id, $question_id)->getResult();
        $labels = [];
        $values = [];
        foreach ($rows as $row) {
            $val = json_decode($row->value, true);
            $labels[] = is_array($val) ? implode(', ', $val) : strval($val);
            $values[] = (int) $row->count;
        }
        return $this->ok(['labels' => $labels, 'values' => $values]);
    }
}
