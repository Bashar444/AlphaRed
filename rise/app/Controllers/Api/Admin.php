<?php

namespace App\Controllers\Api;

/**
 * Admin-only endpoints — dashboard, respondent mgmt, datasets, revenue.
 */
class Admin extends Api_base
{
    public function __construct()
    {
        parent::__construct();
    }

    private function _guard()
    {
        if (!$this->api_is_admin) {
            return $this->forbidden('Admin access required.');
        }
        return null;
    }

    /**
     * GET /api/v1/admin/dashboard
     */
    public function dashboard()
    {
        if ($g = $this->_guard()) return $g;

        $table_subs = $this->db->prefixTable('primo_subscriptions');
        $total_rev = $this->db->query("SELECT COALESCE(SUM(amount_inr),0) as total FROM $table_subs WHERE status='active' AND deleted=0")->getRow()->total;
        $active_subs = $this->db->query("SELECT COUNT(*) as c FROM $table_subs WHERE status='active' AND deleted=0")->getRow()->c;

        $mrr_rows = $this->db->query("SELECT plan_key, COUNT(*) as count, SUM(amount_inr) as total FROM $table_subs WHERE status='active' AND deleted=0 GROUP BY plan_key")->getResult();
        $mrr = array_map(fn($r) => ['plan' => $r->plan_key, 'count' => (int) $r->count, 'total' => (float) $r->total], $mrr_rows);

        return $this->ok([
            'total_revenue'        => (float) $total_rev,
            'active_subscriptions' => (int) $active_subs,
            'mrr_by_tier'          => $mrr,
            'total_respondents'    => $this->Primo_respondents_model->count_all(),
            'total_surveys'        => $this->Primo_surveys_model->count_all(),
            'total_responses'      => $this->Primo_responses_model->count_all(),
        ]);
    }

    /**
     * GET /api/v1/admin/respondents
     */
    public function respondents()
    {
        if ($g = $this->_guard()) return $g;

        $rows = $this->Primo_respondents_model->get_details([])->getResult();
        $list = array_map(fn($r) => [
            'id'            => (int) $r->id,
            'name'          => trim(($r->first_name ?? '') . ' ' . ($r->last_name ?? '')),
            'phone'         => $r->phone ?? '',
            'demographics'  => json_decode($r->demographics ?? '{}', true),
            'verified'      => (bool) ($r->verified ?? false),
            'quality_score' => (float) $r->quality_score,
            'status'        => $r->status ?? 'active',
            'created_at'    => $r->created_at,
        ], $rows);

        return $this->ok($list);
    }

    /**
     * POST /api/v1/admin/respondents/:id/suspend
     */
    public function suspend_respondent($id = 0)
    {
        if ($g = $this->_guard()) return $g;
        $this->Primo_respondents_model->ci_save(['status' => 'suspended'], $id);
        return $this->ok(null, 'Respondent suspended.');
    }

    /**
     * GET /api/v1/admin/datasets
     */
    public function datasets()
    {
        if ($g = $this->_guard()) return $g;

        $rows = $this->Primo_public_datasets_model->get_details([])->getResult();
        $list = array_map(fn($d) => [
            'id'         => (int) $d->id,
            'title'      => $d->title,
            'category'   => $d->category,
            'view_count' => (int) $d->view_count,
            'status'     => $d->status,
            'created_at' => $d->created_at,
        ], $rows);

        return $this->ok($list);
    }

    /**
     * POST /api/v1/admin/datasets/:id/publish
     */
    public function publish_dataset($id = 0)
    {
        if ($g = $this->_guard()) return $g;
        $this->Primo_public_datasets_model->ci_save(['status' => 'published'], $id);
        return $this->ok(null, 'Dataset published.');
    }

    /**
     * POST /api/v1/admin/datasets/:id/unpublish
     */
    public function unpublish_dataset($id = 0)
    {
        if ($g = $this->_guard()) return $g;
        $this->Primo_public_datasets_model->ci_save(['status' => 'draft'], $id);
        return $this->ok(null, 'Dataset unpublished.');
    }

    /**
     * GET /api/v1/admin/revenue
     */
    public function revenue()
    {
        if ($g = $this->_guard()) return $g;

        $table = $this->db->prefixTable('primo_subscriptions');
        $monthly = $this->db->query("SELECT DATE_FORMAT(created_at,'%Y-%m') as month, SUM(amount_inr) as total FROM $table WHERE deleted=0 GROUP BY month ORDER BY month DESC LIMIT 12")->getResult();

        return $this->ok([
            'monthly_revenue' => array_map(fn($r) => ['month' => $r->month, 'total' => (float) $r->total], $monthly),
        ]);
    }
}
