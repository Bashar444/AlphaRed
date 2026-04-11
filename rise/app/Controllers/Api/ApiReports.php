<?php

namespace App\Controllers\Api;

/**
 * Report aggregation endpoints (admin only).
 */
class ApiReports extends Api_base
{
    /**
     * GET /api/v1/reports/overview
     */
    public function overview()
    {
        $this->_guard();
        $db = $this->db;

        $projects   = $db->query("SELECT COUNT(*) as c FROM {$db->prefixTable('projects')} WHERE deleted=0")->getRow()->c;
        $tasks      = $db->query("SELECT COUNT(*) as c FROM {$db->prefixTable('tasks')} WHERE deleted=0")->getRow()->c;
        $invoices   = $db->query("SELECT COUNT(*) as c FROM {$db->prefixTable('invoices')} WHERE deleted=0")->getRow()->c;
        $clients    = $db->query("SELECT COUNT(*) as c FROM {$db->prefixTable('clients')} WHERE deleted=0 AND is_lead=0")->getRow()->c;
        $leads      = $db->query("SELECT COUNT(*) as c FROM {$db->prefixTable('clients')} WHERE deleted=0 AND is_lead=1")->getRow()->c;
        $tickets    = $db->query("SELECT COUNT(*) as c FROM {$db->prefixTable('tickets')} WHERE deleted=0")->getRow()->c;
        $team       = $db->query("SELECT COUNT(*) as c FROM {$db->prefixTable('users')} WHERE deleted=0 AND user_type='staff'")->getRow()->c;

        return $this->ok([
            'projects'  => (int) $projects,
            'tasks'     => (int) $tasks,
            'invoices'  => (int) $invoices,
            'clients'   => (int) $clients,
            'leads'     => (int) $leads,
            'tickets'   => (int) $tickets,
            'team'      => (int) $team,
        ]);
    }

    /**
     * GET /api/v1/reports/revenue
     */
    public function revenue()
    {
        $this->_guard();
        $db = $this->db;
        $year = $this->request->getGet('year') ?? date('Y');
        $year = (int) $year;

        $payments_t = $db->prefixTable('invoice_payments');
        $sql = "SELECT MONTH(payment_date) as month, SUM(amount) as total
                FROM {$payments_t}
                WHERE deleted=0 AND YEAR(payment_date)={$year}
                GROUP BY MONTH(payment_date)
                ORDER BY month";
        $rows = $db->query($sql)->getResult();

        $monthly = array_fill(1, 12, 0);
        foreach ($rows as $r) {
            $monthly[(int)$r->month] = (float) $r->total;
        }

        return $this->ok([
            'year'    => $year,
            'monthly' => $monthly,
            'total'   => array_sum($monthly),
        ]);
    }

    /**
     * GET /api/v1/reports/project-status
     */
    public function project_status()
    {
        $this->_guard();
        $info = $this->Projects_model->count_project_status();
        return $this->ok($info);
    }

    /**
     * GET /api/v1/reports/task-summary
     */
    public function task_summary()
    {
        $this->_guard();
        $db = $this->db;
        $tasks_t = $db->prefixTable('tasks');
        $status_t = $db->prefixTable('task_status');

        $sql = "SELECT s.id, s.title, COUNT(t.id) as count
                FROM {$status_t} s
                LEFT JOIN {$tasks_t} t ON t.status_id = s.id AND t.deleted=0
                WHERE s.deleted=0
                GROUP BY s.id, s.title
                ORDER BY s.sort ASC";
        $rows = $db->query($sql)->getResult();

        return $this->ok($rows);
    }
}
