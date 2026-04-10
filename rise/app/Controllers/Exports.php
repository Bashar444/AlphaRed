<?php

namespace App\Controllers;

use App\Libraries\Export_engine;
use App\Libraries\Plan_limits;

class Exports extends Security_Controller {

    private $plan_limits;

    function __construct() {
        parent::__construct();
        $this->plan_limits = new Plan_limits();
        $this->plan_limits->set_user_plan('basic');
    }

    /**
     * Export survey data in the requested format.
     */
    function download($survey_id = 0, $format = 'csv') {
        $survey = $this->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();
        if (!$survey || $survey->user_id != $this->login_user->id) {
            show_404();
        }

        // Check plan allows this format
        $allowed = $this->plan_limits->allowed_export_formats();
        if (!in_array($format, $allowed)) {
            echo json_encode(array("success" => false, "message" => app_lang("export_format_not_available")));
            return;
        }

        $engine = new Export_engine();
        $filepath = '';

        switch ($format) {
            case 'csv':
                $filepath = $engine->export_csv($survey_id);
                $mime = 'text/csv';
                break;
            case 'xls':
                $filepath = $engine->export_xls($survey_id);
                $mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case 'pdf':
                // Get analysis data if available
                $report = $this->Primo_analysis_reports_model->get_details(array("survey_id" => $survey_id))->getRow();
                $analysis_data = $report ? json_decode($report->results, true) : array();
                if ($report && $report->ai_narrative) {
                    $analysis_data['narrative'] = $report->ai_narrative;
                }
                $filepath = $engine->export_pdf($survey_id, $analysis_data);
                $mime = 'application/pdf';
                break;
            case 'zip':
                $report = $this->Primo_analysis_reports_model->get_details(array("survey_id" => $survey_id))->getRow();
                $analysis_data = $report ? json_decode($report->results, true) : array();
                if ($report && $report->ai_narrative) {
                    $analysis_data['narrative'] = $report->ai_narrative;
                }
                $filepath = $engine->export_zip($survey_id, $analysis_data);
                $mime = 'application/zip';
                break;
            default:
                show_404();
                return;
        }

        if (!$filepath || !file_exists($filepath)) {
            echo json_encode(array("success" => false, "message" => "No data to export."));
            return;
        }

        // Record export
        $this->Primo_exports_model->ci_save(array(
            "survey_id" => $survey_id,
            "format" => $format,
            "file_path" => $filepath,
            "generated_by" => $this->login_user->id,
        ));

        // Stream download
        header('Content-Type: ' . $mime);
        header('Content-Disposition: attachment; filename="' . basename($filepath) . '"');
        header('Content-Length: ' . filesize($filepath));
        readfile($filepath);
        exit;
    }

    /**
     * List past exports for a survey (AJAX list_data).
     */
    function list_data($survey_id = 0) {
        $exports = $this->Primo_exports_model->get_details(array("survey_id" => $survey_id))->getResult();
        $list_data = array();
        foreach ($exports as $export) {
            $row = array();
            $row[] = $export->id;
            $row[] = strtoupper($export->format);
            $row[] = format_to_relative_time($export->created_at);
            $row[] = '<a href="' . get_uri("exports/redownload/" . $export->id) . '" class="btn btn-default btn-sm"><i class="fa fa-download"></i></a>';
            $list_data[] = $row;
        }
        echo json_encode(array("data" => $list_data));
    }

    /**
     * Re-download a previously generated export.
     */
    function redownload($export_id = 0) {
        $export = $this->Primo_exports_model->get_details(array("id" => $export_id))->getRow();
        if (!$export) show_404();

        // Verify ownership
        $survey = $this->Primo_surveys_model->get_details(array("id" => $export->survey_id))->getRow();
        if (!$survey || $survey->user_id != $this->login_user->id) show_404();

        if (!file_exists($export->file_path)) {
            echo json_encode(array("success" => false, "message" => "Export file no longer available."));
            return;
        }

        $mimes = array('csv' => 'text/csv', 'xls' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'pdf' => 'application/pdf', 'zip' => 'application/zip');
        $mime = isset($mimes[$export->format]) ? $mimes[$export->format] : 'application/octet-stream';

        header('Content-Type: ' . $mime);
        header('Content-Disposition: attachment; filename="' . basename($export->file_path) . '"');
        header('Content-Length: ' . filesize($export->file_path));
        readfile($export->file_path);
        exit;
    }
}
