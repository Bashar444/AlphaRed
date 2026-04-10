<?php

namespace App\Controllers\Api;

use App\Libraries\Export_engine;
use App\Libraries\Plan_limits;

/**
 * Export endpoints — download survey data in various formats.
 */
class Exports extends Api_base
{
    private Plan_limits $plan_limits;

    public function __construct()
    {
        parent::__construct();
        $this->plan_limits = new Plan_limits();
        $this->plan_limits->set_user_plan('basic');
    }

    /**
     * GET /api/v1/surveys/:id/exports
     */
    public function index($survey_id = 0)
    {
        $exports = $this->Primo_exports_model->get_details(['survey_id' => $survey_id])->getResult();
        $list = array_map(fn($e) => [
            'id'         => (int) $e->id,
            'format'     => $e->format,
            'created_at' => $e->created_at,
        ], $exports);
        return $this->ok($list);
    }

    /**
     * POST /api/v1/surveys/:id/exports/:format
     * format = csv | xls | pdf | zip
     */
    public function generate($survey_id = 0, $format = 'csv')
    {
        $survey = $this->Primo_surveys_model->get_details(['id' => $survey_id])->getRow();
        if (!$survey || (int) $survey->user_id !== $this->api_user_id) {
            return $this->notFound();
        }

        $allowed = $this->plan_limits->allowed_export_formats();
        if (!in_array($format, $allowed)) {
            return $this->fail('Export format not available on your plan.', 403);
        }

        $engine = new Export_engine();
        $filepath = '';
        switch ($format) {
            case 'csv': $filepath = $engine->export_csv($survey_id); break;
            case 'xls': $filepath = $engine->export_xls($survey_id); break;
            case 'pdf':
                $report = $this->Primo_analysis_reports_model->get_details(['survey_id' => $survey_id])->getRow();
                $analysis = $report ? json_decode($report->results, true) : [];
                if ($report && $report->ai_narrative) $analysis['narrative'] = $report->ai_narrative;
                $filepath = $engine->export_pdf($survey_id, $analysis);
                break;
            case 'zip':
                $report = $this->Primo_analysis_reports_model->get_details(['survey_id' => $survey_id])->getRow();
                $analysis = $report ? json_decode($report->results, true) : [];
                if ($report && $report->ai_narrative) $analysis['narrative'] = $report->ai_narrative;
                $filepath = $engine->export_zip($survey_id, $analysis);
                break;
            default:
                return $this->fail('Unknown format.');
        }

        if (!$filepath || !file_exists($filepath)) {
            return $this->fail('No data to export.');
        }

        $this->Primo_exports_model->ci_save([
            'survey_id'    => $survey_id,
            'format'       => $format,
            'file_path'    => $filepath,
            'generated_by' => $this->api_user_id,
        ]);

        // Return a download URL instead of streaming (for SPA consumption)
        $filename = basename($filepath);
        return $this->ok([
            'download_url' => base_url("api/v1/exports/download/$filename"),
            'filename'     => $filename,
            'format'       => $format,
        ], 'Export generated.');
    }
}
