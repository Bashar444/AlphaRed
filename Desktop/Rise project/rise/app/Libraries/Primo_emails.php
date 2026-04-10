<?php

namespace App\Libraries;

/**
 * PrimoData email notifications — uses RISE's notification engine.
 */
class Primo_emails {

    private $ci;

    function __construct() {
        $this->ci = &get_instance();
    }

    /**
     * Send "survey launched" notification to researcher.
     */
    function survey_launched($survey_id) {
        $survey = $this->ci->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();
        if (!$survey) return;

        $this->_send($survey->user_id, 'survey_launched', array(
            'SURVEY_TITLE' => $survey->title,
            'SURVEY_URL' => get_uri("surveys/view/$survey_id"),
            'TARGET_RESPONSES' => $survey->target_responses,
        ));
    }

    /**
     * Send "analysis ready" notification.
     */
    function analysis_ready($survey_id, $report_id) {
        $survey = $this->ci->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();
        if (!$survey) return;

        $this->_send($survey->user_id, 'analysis_ready', array(
            'SURVEY_TITLE' => $survey->title,
            'REPORT_URL' => get_uri("analysis/view/$survey_id"),
        ));
    }

    /**
     * Send "export ready" notification.
     */
    function export_ready($user_id, $survey_id, $export_format) {
        $survey = $this->ci->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();

        $this->_send($user_id, 'export_ready', array(
            'SURVEY_TITLE' => $survey ? $survey->title : 'Survey #' . $survey_id,
            'EXPORT_FORMAT' => strtoupper($export_format),
            'DOWNLOAD_URL' => get_uri("exports/download/$survey_id/$export_format"),
        ));
    }

    /**
     * Send "target reached" notification.
     */
    function target_reached($survey_id) {
        $survey = $this->ci->Primo_surveys_model->get_details(array("id" => $survey_id))->getRow();
        if (!$survey) return;

        $this->_send($survey->user_id, 'survey_target_reached', array(
            'SURVEY_TITLE' => $survey->title,
            'TOTAL_RESPONSES' => $survey->collected_count,
            'TARGET_RESPONSES' => $survey->target_responses,
            'ANALYSIS_URL' => get_uri("analysis/view/$survey_id"),
        ));
    }

    /**
     * Send subscription activated email.
     */
    function subscription_activated($user_id, $plan_name, $expires_at) {
        $this->_send($user_id, 'subscription_activated', array(
            'PLAN_NAME' => $plan_name,
            'EXPIRES_AT' => $expires_at,
        ));
    }

    /**
     * Send email via RISE's notification helper.
     */
    private function _send($user_id, $template_name, $variables = array()) {
        // Use RISE's send_notification helper if available
        if (function_exists('send_notification')) {
            send_notification(array(
                'user_id' => $user_id,
                'event' => 'primo_' . $template_name,
                'data' => $variables,
            ));
            return;
        }

        // Fallback: direct email via CI Email library
        $user = model('App\Models\Users_model')->get_one($user_id);
        if (!$user || !$user->email) return;

        $email = \Config\Services::email();
        $email->setFrom(get_setting('email_sent_from_address') ?: 'noreply@primodata.in', 'PrimoData');
        $email->setTo($user->email);

        $subject = str_replace('_', ' ', ucfirst($template_name));
        $email->setSubject('PrimoData: ' . $subject);

        $body = $this->_render_template($template_name, $variables);
        $email->setMessage($body);
        $email->setMailType('html');
        $email->send();
    }

    /**
     * Simple HTML template renderer.
     */
    private function _render_template($template_name, $variables) {
        $html = '<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">';
        $html .= '<h2 style="color:#4e73df;">PrimoData Analytics</h2><hr>';

        switch ($template_name) {
            case 'survey_launched':
                $html .= '<p>Your survey <strong>' . esc($variables['SURVEY_TITLE']) . '</strong> is now live!</p>';
                $html .= '<p>Target: ' . $variables['TARGET_RESPONSES'] . ' responses</p>';
                $html .= '<a href="' . $variables['SURVEY_URL'] . '" style="background:#4e73df;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">View Survey</a>';
                break;
            case 'analysis_ready':
                $html .= '<p>Analysis for <strong>' . esc($variables['SURVEY_TITLE']) . '</strong> is ready.</p>';
                $html .= '<a href="' . $variables['REPORT_URL'] . '" style="background:#1cc88a;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">View Report</a>';
                break;
            case 'export_ready':
                $html .= '<p>Your ' . $variables['EXPORT_FORMAT'] . ' export for <strong>' . esc($variables['SURVEY_TITLE']) . '</strong> is ready.</p>';
                $html .= '<a href="' . $variables['DOWNLOAD_URL'] . '" style="background:#36b9cc;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Download</a>';
                break;
            case 'survey_target_reached':
                $html .= '<p>Great news! <strong>' . esc($variables['SURVEY_TITLE']) . '</strong> has reached its target.</p>';
                $html .= '<p>' . $variables['TOTAL_RESPONSES'] . '/' . $variables['TARGET_RESPONSES'] . ' responses collected.</p>';
                $html .= '<a href="' . $variables['ANALYSIS_URL'] . '" style="background:#f6c23e;color:#333;padding:10px 20px;text-decoration:none;border-radius:4px;">Run Analysis</a>';
                break;
            case 'subscription_activated':
                $html .= '<p>Your <strong>' . esc($variables['PLAN_NAME']) . '</strong> plan is now active!</p>';
                $html .= '<p>Valid until: ' . $variables['EXPIRES_AT'] . '</p>';
                break;
        }

        $html .= '<hr><small style="color:#858796;">PrimoData Analytics — Hybrid Web Analytics SaaS</small>';
        $html .= '</div>';
        return $html;
    }
}
