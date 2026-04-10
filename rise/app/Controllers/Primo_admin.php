<?php

namespace App\Controllers;

/**
 * Admin panel for PrimoData — respondents, datasets, revenue dashboard.
 * Accessible only to admin users.
 */
class Primo_admin extends Security_Controller {

    function __construct() {
        parent::__construct();
        // Only admins can access this
        if (!$this->login_user->is_admin) {
            redirect("forbidden");
        }
    }

    /**
     * Admin dashboard — revenue, usage, and key metrics.
     */
    function index() {
        // Revenue metrics
        $view_data["total_revenue"] = $this->_get_total_revenue();
        $view_data["mrr_by_tier"] = $this->_get_mrr_by_tier();
        $view_data["active_subscriptions"] = $this->_count_active_subscriptions();
        $view_data["total_respondents"] = $this->Primo_respondents_model->count_all();
        $view_data["total_surveys"] = $this->Primo_surveys_model->count_all();
        $view_data["total_responses"] = $this->Primo_responses_model->count_all();
        $view_data["usage_summary"] = $this->Primo_usage_logs_model->get_all_usage_summary();
        $view_data["page_title"] = app_lang("primo_admin_dashboard");
        return $this->template->rander("primo_admin/index", $view_data);
    }

    /**
     * Manage respondents.
     */
    function respondents() {
        $view_data["page_title"] = app_lang("manage_respondents");
        return $this->template->rander("primo_admin/respondents", $view_data);
    }

    /**
     * Respondents DataTable data.
     */
    function respondents_list_data() {
        $respondents = $this->Primo_respondents_model->get_details(array())->getResult();
        $list_data = array();
        foreach ($respondents as $r) {
            $demographics = json_decode($r->demographics, true) ?: array();
            $row = array();
            $row[] = $r->id;
            $row[] = esc($r->first_name . ' ' . $r->last_name);
            $row[] = $r->phone;
            $row[] = $demographics['age_group'] ?? '—';
            $row[] = $demographics['gender'] ?? '—';
            $row[] = $demographics['region'] ?? '—';
            $row[] = $r->verified ? '<span class="badge bg-success">Verified</span>' : '<span class="badge bg-warning">Pending</span>';
            $row[] = round($r->quality_score, 1);
            $row[] = format_to_relative_time($r->created_at);

            $actions = '<a href="' . get_uri("primo_admin/respondent_detail/$r->id") . '" class="btn btn-sm btn-default"><i class="fa fa-eye"></i></a>';
            if ($r->status === 'active') {
                $actions .= ' ' . js_anchor('<i class="fa fa-ban"></i>', array("class" => "btn btn-sm btn-danger", "data-action-url" => get_uri("primo_admin/suspend_respondent/$r->id"), "data-action" => "delete-confirmation"));
            }
            $row[] = $actions;
            $list_data[] = $row;
        }
        echo json_encode(array("data" => $list_data));
    }

    /**
     * View respondent detail.
     */
    function respondent_detail($id = 0) {
        $respondent = $this->Primo_respondents_model->get_details(array("id" => $id))->getRow();
        if (!$respondent) show_404();

        $responses = $this->Primo_responses_model->get_details(array("respondent_id" => $id))->getResult();
        $view_data["respondent"] = $respondent;
        $view_data["responses"] = $responses;
        $view_data["page_title"] = "Respondent #$id";
        return $this->template->rander("primo_admin/respondent_detail", $view_data);
    }

    /**
     * Suspend a respondent.
     */
    function suspend_respondent($id = 0) {
        $this->Primo_respondents_model->ci_save(array("status" => "suspended"), $id);
        echo json_encode(array("success" => true, "message" => "Respondent suspended."));
    }

    /**
     * Manage public datasets.
     */
    function datasets() {
        $view_data["page_title"] = app_lang("manage_datasets");
        return $this->template->rander("primo_admin/datasets", $view_data);
    }

    /**
     * Datasets DataTable data.
     */
    function datasets_list_data() {
        $datasets = $this->Primo_public_datasets_model->get_details(array())->getResult();
        $list_data = array();
        foreach ($datasets as $d) {
            $row = array();
            $row[] = $d->id;
            $row[] = esc($d->title);
            $row[] = $d->category;
            $row[] = $d->view_count;
            $row[] = $d->status;
            $row[] = format_to_relative_time($d->created_at);

            $actions = '';
            if ($d->status === 'published') {
                $actions .= js_anchor('<i class="fa fa-eye-slash"></i>', array("class" => "btn btn-sm btn-warning", "data-action-url" => get_uri("primo_admin/unpublish_dataset/$d->id"), "data-action" => "delete-confirmation"));
            } else {
                $actions .= js_anchor('<i class="fa fa-check"></i>', array("class" => "btn btn-sm btn-success", "data-action-url" => get_uri("primo_admin/publish_dataset/$d->id"), "data-action" => "delete-confirmation"));
            }
            $row[] = $actions;
            $list_data[] = $row;
        }
        echo json_encode(array("data" => $list_data));
    }

    function publish_dataset($id = 0) {
        $this->Primo_public_datasets_model->ci_save(array("status" => "published"), $id);
        echo json_encode(array("success" => true, "message" => "Dataset published."));
    }

    function unpublish_dataset($id = 0) {
        $this->Primo_public_datasets_model->ci_save(array("status" => "draft"), $id);
        echo json_encode(array("success" => true, "message" => "Dataset unpublished."));
    }

    /**
     * Revenue dashboard.
     */
    function revenue() {
        $view_data["total_revenue"] = $this->_get_total_revenue();
        $view_data["mrr_by_tier"] = $this->_get_mrr_by_tier();
        $view_data["monthly_revenue"] = $this->_get_monthly_revenue();
        $view_data["page_title"] = app_lang("revenue_dashboard");
        return $this->template->rander("primo_admin/revenue", $view_data);
    }

    // ── Private Helpers ──────────────────────

    private function _get_total_revenue() {
        $table = $this->db->prefixTable('primo_subscriptions');
        $sql = "SELECT COALESCE(SUM(amount_inr), 0) as total FROM $table WHERE status='active' AND deleted=0";
        return $this->db->query($sql)->getRow()->total;
    }

    private function _get_mrr_by_tier() {
        $table = $this->db->prefixTable('primo_subscriptions');
        $sql = "SELECT plan_key, COUNT(*) as count, SUM(amount_inr) as total FROM $table WHERE status='active' AND deleted=0 GROUP BY plan_key";
        return $this->db->query($sql)->getResult();
    }

    private function _count_active_subscriptions() {
        $table = $this->db->prefixTable('primo_subscriptions');
        $sql = "SELECT COUNT(*) as count FROM $table WHERE status='active' AND deleted=0";
        return $this->db->query($sql)->getRow()->count;
    }

    private function _get_monthly_revenue() {
        $table = $this->db->prefixTable('primo_subscriptions');
        $sql = "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount_inr) as total
                FROM $table WHERE deleted=0 GROUP BY month ORDER BY month DESC LIMIT 12";
        return $this->db->query($sql)->getResult();
    }
}
