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

    /**
     * GET /api/v1/admin/dashboard/stats
     * Extended stats for the enhanced dashboard.
     */
    public function stats()
    {
        if ($g = $this->_guard()) return $g;

        $tUsers    = $this->db->prefixTable('users');
        $tProjects = $this->db->prefixTable('projects');
        $tTasks    = $this->db->prefixTable('tasks');
        $tInvoices = $this->db->prefixTable('invoices');
        $tExpenses = $this->db->prefixTable('expenses');
        $tTickets  = $this->db->prefixTable('tickets');
        $tClients  = $this->db->prefixTable('clients');
        $tSubs     = $this->db->prefixTable('primo_subscriptions');

        $staffCount   = (int) $this->db->query("SELECT COUNT(*) as c FROM $tUsers WHERE user_type='staff' AND deleted=0 AND status='active'")->getRow()->c;
        $clientCount  = (int) $this->db->query("SELECT COUNT(*) as c FROM $tClients WHERE deleted=0")->getRow()->c;
        $projectCount = (int) $this->db->query("SELECT COUNT(*) as c FROM $tProjects WHERE deleted=0")->getRow()->c;
        $taskCount    = (int) $this->db->query("SELECT COUNT(*) as c FROM $tTasks WHERE deleted=0")->getRow()->c;
        $openTickets  = (int) $this->db->query("SELECT COUNT(*) as c FROM $tTickets WHERE deleted=0 AND status NOT IN ('closed')")->getRow()->c;

        // Invoice totals
        $invoiceTotal = (float) $this->db->query("SELECT COALESCE(SUM(invoice_total),0) as t FROM $tInvoices WHERE deleted=0")->getRow()->t;
        $invoiceDue   = (float) $this->db->query("SELECT COALESCE(SUM(invoice_total - payment_received),0) as t FROM $tInvoices WHERE deleted=0 AND status NOT IN ('paid','cancelled')")->getRow()->t;

        // Expense total
        $expenseTotal = (float) $this->db->query("SELECT COALESCE(SUM(amount),0) as t FROM $tExpenses WHERE deleted=0")->getRow()->t;

        // Active subscriptions
        $activeSubs = (int) $this->db->query("SELECT COUNT(*) as c FROM $tSubs WHERE status='active' AND deleted=0")->getRow()->c;

        return $this->ok([
            'team_members'         => $staffCount,
            'clients'              => $clientCount,
            'projects'             => $projectCount,
            'tasks'                => $taskCount,
            'open_tickets'         => $openTickets,
            'invoice_total'        => $invoiceTotal,
            'invoice_due'          => $invoiceDue,
            'expense_total'        => $expenseTotal,
            'active_subscriptions' => $activeSubs,
        ]);
    }

    /**
     * GET /api/v1/admin/dashboard/charts?type=responses_timeline|revenue_trend|quality_distribution|task_status|expenses_by_category
     */
    public function charts()
    {
        if ($g = $this->_guard()) return $g;

        $type = $this->request->getGet('type') ?? 'responses_timeline';

        switch ($type) {
            case 'responses_timeline':
                return $this->_chart_responses_timeline();
            case 'revenue_trend':
                return $this->_chart_revenue_trend();
            case 'quality_distribution':
                return $this->_chart_quality_distribution();
            case 'task_status':
                return $this->_chart_task_status();
            case 'expenses_by_category':
                return $this->_chart_expenses_by_category();
            default:
                return $this->fail('Unknown chart type.');
        }
    }

    private function _chart_responses_timeline()
    {
        $t = $this->db->prefixTable('primo_responses');
        $rows = $this->db->query("SELECT DATE(created_at) as date, COUNT(*) as count FROM $t WHERE deleted=0 AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY date")->getResult();
        return $this->ok(array_map(fn($r) => ['date' => $r->date, 'count' => (int) $r->count], $rows));
    }

    private function _chart_revenue_trend()
    {
        $t = $this->db->prefixTable('primo_subscriptions');
        $rows = $this->db->query("SELECT DATE_FORMAT(created_at,'%Y-%m') as month, SUM(amount_inr) as total FROM $t WHERE deleted=0 AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) GROUP BY month ORDER BY month")->getResult();
        return $this->ok(array_map(fn($r) => ['month' => $r->month, 'total' => (float) $r->total], $rows));
    }

    private function _chart_quality_distribution()
    {
        $t = $this->db->prefixTable('primo_responses');
        $rows = $this->db->query("
            SELECT
                CASE
                    WHEN quality_score >= 90 THEN 'Excellent (90-100)'
                    WHEN quality_score >= 70 THEN 'Good (70-89)'
                    WHEN quality_score >= 50 THEN 'Fair (50-69)'
                    ELSE 'Poor (0-49)'
                END as bracket,
                COUNT(*) as count
            FROM $t WHERE deleted=0 AND quality_score IS NOT NULL
            GROUP BY bracket ORDER BY MIN(quality_score) DESC
        ")->getResult();
        return $this->ok(array_map(fn($r) => ['bracket' => $r->bracket, 'count' => (int) $r->count], $rows));
    }

    private function _chart_task_status()
    {
        $t = $this->db->prefixTable('tasks');
        $ts = $this->db->prefixTable('task_status');
        $rows = $this->db->query("SELECT s.title as status, COUNT(t.id) as count FROM $t t JOIN $ts s ON t.status_id=s.id WHERE t.deleted=0 GROUP BY s.title ORDER BY count DESC")->getResult();
        return $this->ok(array_map(fn($r) => ['status' => $r->status, 'count' => (int) $r->count], $rows));
    }

    private function _chart_expenses_by_category()
    {
        $t = $this->db->prefixTable('expenses');
        $tc = $this->db->prefixTable('expense_categories');
        $rows = $this->db->query("SELECT c.title as category, SUM(e.amount) as total FROM $t e JOIN $tc c ON e.category_id=c.id WHERE e.deleted=0 GROUP BY c.title ORDER BY total DESC LIMIT 10")->getResult();
        return $this->ok(array_map(fn($r) => ['category' => $r->category, 'total' => (float) $r->total], $rows));
    }

    /**
     * GET /api/v1/admin/dashboard/activity
     * Returns last 20 platform events.
     */
    public function activity()
    {
        if ($g = $this->_guard()) return $g;

        $tLog = $this->db->prefixTable('activity_logs');
        $tUsers = $this->db->prefixTable('users');

        // Try activity_logs table first, fall back to notifications
        $hasLogs = $this->db->tableExists('activity_logs');

        if ($hasLogs) {
            $rows = $this->db->query("SELECT l.id, l.action as type, l.log_type, l.description, u.first_name, u.last_name, l.created_at FROM {$tLog} l LEFT JOIN {$tUsers} u ON l.created_by=u.id ORDER BY l.created_at DESC LIMIT 20")->getResult();
        } else {
            // Fallback: use notifications table
            $tNotif = $this->db->prefixTable('notifications');
            $rows = $this->db->query("SELECT n.id, n.event as type, '' as log_type, n.description, u.first_name, u.last_name, n.created_at FROM {$tNotif} n LEFT JOIN {$tUsers} u ON n.from_user_id=u.id ORDER BY n.created_at DESC LIMIT 20")->getResult();
        }

        $list = array_map(fn($r) => [
            'id'          => (int) $r->id,
            'type'        => $r->type ?? 'general',
            'description' => $r->description ?? '',
            'user_name'   => trim(($r->first_name ?? '') . ' ' . ($r->last_name ?? '')),
            'created_at'  => $r->created_at,
        ], $rows);

        return $this->ok($list);
    }
}
