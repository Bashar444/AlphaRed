<?php

namespace App\Libraries;

/**
 * Export engine — generates PDF, XLS, CSV, and ZIP exports.
 * Leverages RISE's existing TCPDF, PHPSpreadsheet, and nelexa-php-zip.
 */
class Export_engine {

    private $ci;

    function __construct() {
        $this->ci = &get_instance();
    }

    /**
     * Export survey data as CSV.
     *
     * @param int $survey_id
     * @param string $filepath Output file path
     * @return string File path
     */
    function export_csv($survey_id, $filepath = '') {
        $data = $this->_get_export_data($survey_id);
        if (empty($data['rows'])) return '';

        if (!$filepath) {
            $filepath = WRITEPATH . 'uploads/exports/survey_' . $survey_id . '_' . date('Ymd_His') . '.csv';
        }
        $dir = dirname($filepath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $fp = fopen($filepath, 'w');
        // BOM for UTF-8 Excel compatibility
        fwrite($fp, "\xEF\xBB\xBF");

        // Headers
        fputcsv($fp, $data['headers']);

        // Data rows
        foreach ($data['rows'] as $row) {
            fputcsv($fp, $row);
        }
        fclose($fp);

        return $filepath;
    }

    /**
     * Export survey data as XLS using PHPSpreadsheet.
     */
    function export_xls($survey_id, $filepath = '') {
        $data = $this->_get_export_data($survey_id);
        if (empty($data['rows'])) return '';

        if (!$filepath) {
            $filepath = WRITEPATH . 'uploads/exports/survey_' . $survey_id . '_' . date('Ymd_His') . '.xlsx';
        }
        $dir = dirname($filepath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // Use PHPSpreadsheet (available in RISE ThirdParty)
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Survey Data');

        // Write headers
        $col = 1;
        foreach ($data['headers'] as $header) {
            $sheet->setCellValueByColumnAndRow($col, 1, $header);
            $sheet->getStyleByColumnAndRow($col, 1)->getFont()->setBold(true);
            $col++;
        }

        // Write data
        $row_idx = 2;
        foreach ($data['rows'] as $row) {
            $col = 1;
            foreach ($row as $cell) {
                $sheet->setCellValueByColumnAndRow($col, $row_idx, $cell);
                $col++;
            }
            $row_idx++;
        }

        // Auto-size columns
        foreach (range(1, count($data['headers'])) as $colIdx) {
            $sheet->getColumnDimensionByColumn($colIdx)->setAutoSize(true);
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $writer->save($filepath);

        return $filepath;
    }

    /**
     * Export survey analysis report as PDF using TCPDF.
     */
    function export_pdf($survey_id, $analysis_data = array(), $filepath = '') {
        $survey = $this->ci->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();
        if (!$survey) return '';

        if (!$filepath) {
            $filepath = WRITEPATH . 'uploads/exports/survey_' . $survey_id . '_report_' . date('Ymd_His') . '.pdf';
        }
        $dir = dirname($filepath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        // Use TCPDF (available in RISE ThirdParty)
        $pdf = new \TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $pdf->SetCreator('PrimoData Analytics');
        $pdf->SetAuthor('PrimoData');
        $pdf->SetTitle($survey->title . ' — Analysis Report');
        $pdf->SetMargins(15, 20, 15);
        $pdf->SetAutoPageBreak(true, 20);
        $pdf->AddPage();

        // Title
        $pdf->SetFont('helvetica', 'B', 18);
        $pdf->Cell(0, 15, $survey->title, 0, 1, 'C');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell(0, 8, 'Analysis Report — Generated ' . date('F j, Y'), 0, 1, 'C');
        $pdf->Ln(5);

        // Survey Info
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'Survey Summary', 0, 1);
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell(0, 6, 'Status: ' . $survey->status, 0, 1);
        $pdf->Cell(0, 6, 'Total Responses: ' . $survey->collected_count . ' / ' . $survey->target_responses, 0, 1);
        $pdf->Cell(0, 6, 'Language: ' . $survey->language, 0, 1);
        $pdf->Ln(5);

        // Analysis results
        if (!empty($analysis_data)) {
            // Descriptive stats
            if (isset($analysis_data['descriptive'])) {
                $pdf->SetFont('helvetica', 'B', 12);
                $pdf->Cell(0, 8, 'Descriptive Statistics', 0, 1);
                $pdf->SetFont('helvetica', '', 9);
                foreach ($analysis_data['descriptive'] as $question => $stats) {
                    $pdf->Cell(0, 6, $question, 0, 1);
                    if (is_array($stats)) {
                        foreach ($stats as $key => $val) {
                            if (!is_array($val)) {
                                $pdf->Cell(40, 5, '  ' . ucfirst(str_replace('_', ' ', $key)) . ':', 0, 0);
                                $pdf->Cell(0, 5, $val, 0, 1);
                            }
                        }
                    }
                    $pdf->Ln(2);
                }
            }

            // AI Narrative
            if (isset($analysis_data['narrative'])) {
                $pdf->SetFont('helvetica', 'B', 12);
                $pdf->Cell(0, 10, 'AI-Generated Narrative', 0, 1);
                $pdf->SetFont('helvetica', '', 10);
                $pdf->MultiCell(0, 6, $analysis_data['narrative'], 0, 'L');
            }
        }

        $pdf->Output($filepath, 'F');
        return $filepath;
    }

    /**
     * Create ZIP archive containing CSV, XLS, and PDF.
     */
    function export_zip($survey_id, $analysis_data = array()) {
        $dir = WRITEPATH . 'uploads/exports/';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $zip_path = $dir . 'survey_' . $survey_id . '_full_' . date('Ymd_His') . '.zip';

        $csv_path = $this->export_csv($survey_id);
        $xls_path = $this->export_xls($survey_id);
        $pdf_path = $this->export_pdf($survey_id, $analysis_data);

        $zip = new \ZipArchive();
        if ($zip->open($zip_path, \ZipArchive::CREATE) === true) {
            if ($csv_path && file_exists($csv_path)) {
                $zip->addFile($csv_path, basename($csv_path));
            }
            if ($xls_path && file_exists($xls_path)) {
                $zip->addFile($xls_path, basename($xls_path));
            }
            if ($pdf_path && file_exists($pdf_path)) {
                $zip->addFile($pdf_path, basename($pdf_path));
            }
            $zip->close();
        }

        return $zip_path;
    }

    /**
     * Get structured export data from survey responses.
     */
    private function _get_export_data($survey_id) {
        $questions = $this->ci->Primo_questions_model->get_details(array("survey_id" => $survey_id))->getResult();
        $responses = $this->ci->Primo_responses_model->get_details(array(
            "survey_id" => $survey_id,
            "status" => "completed",
        ))->getResult();

        if (empty($questions) || empty($responses)) {
            return array('headers' => array(), 'rows' => array());
        }

        // Build headers
        $headers = array('Response ID', 'Respondent', 'Quality Score', 'Duration (s)', 'Completed At');
        foreach ($questions as $q) {
            $headers[] = $q->text;
        }

        // Build rows
        $rows = array();
        foreach ($responses as $response) {
            $answers = $this->ci->Primo_answers_model->get_details(array("response_id" => $response->id))->getResult();
            $answer_map = array();
            foreach ($answers as $a) {
                $val = json_decode($a->value, true);
                $answer_map[$a->question_id] = is_array($val) ? implode('; ', $val) : strval($val);
            }

            $row = array(
                $response->id,
                $response->first_name . ' ' . $response->last_name,
                $response->quality_score,
                $response->duration_secs,
                $response->completed_at,
            );
            foreach ($questions as $q) {
                $row[] = isset($answer_map[$q->id]) ? $answer_map[$q->id] : '';
            }
            $rows[] = $row;
        }

        return array('headers' => $headers, 'rows' => $rows);
    }
}
