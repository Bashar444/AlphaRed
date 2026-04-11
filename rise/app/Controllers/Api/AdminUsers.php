<?php

namespace App\Controllers\Api;

/**
 * Admin Users Management — unified view of all user types.
 */
class AdminUsers extends Api_base
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
     * GET /api/v1/admin/users
     * Query: ?type=researcher|respondent|staff|client
     *        &subscription=active|expired|cancelled|none
     *        &status=active|suspended
     *        &search=<name or email>
     *        &page=1&per_page=25
     *        &sort=name|email|created_at
     *        &order=asc|desc
     */
    public function index()
    {
        if ($g = $this->_guard()) return $g;

        $tUsers = $this->db->prefixTable('users');
        $tSubs  = $this->db->prefixTable('primo_subscriptions');
        $tResp  = $this->db->prefixTable('primo_respondents');

        $type   = $this->request->getGet('type') ?? '';
        $subFilter = $this->request->getGet('subscription') ?? '';
        $status = $this->request->getGet('status') ?? '';
        $search = $this->request->getGet('search') ?? '';
        $page   = max(1, (int) ($this->request->getGet('page') ?? 1));
        $perPage = min(100, max(1, (int) ($this->request->getGet('per_page') ?? 25)));
        $sort   = $this->request->getGet('sort') ?? 'created_at';
        $order  = strtoupper($this->request->getGet('order') ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';

        $allowedSort = ['name', 'email', 'created_at', 'last_online'];
        if (!in_array($sort, $allowedSort)) $sort = 'created_at';
        $sortCol = $sort === 'name' ? 'first_name' : $sort;

        // Build base query for hdr_users (staff + researchers + clients)
        $where = ["u.deleted = 0"];
        $params = [];

        if ($type === 'staff') {
            $where[] = "u.user_type = 'staff'";
        } elseif ($type === 'client') {
            $where[] = "u.user_type = 'client'";
        } elseif ($type === 'researcher') {
            $where[] = "u.user_type = 'staff'"; // researchers are staff-type in RISE
        } elseif ($type === 'respondent') {
            // Handled separately from primo_respondents
        }

        if ($status === 'active') {
            $where[] = "u.status = 'active'";
        } elseif ($status === 'suspended') {
            $where[] = "u.status = 'inactive'";
        }

        if ($search) {
            $where[] = "(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $whereStr = implode(' AND ', $where);

        // Count totals for summary (unfiltered)
        $totalStaff   = (int) $this->db->query("SELECT COUNT(*) as c FROM $tUsers WHERE user_type='staff' AND deleted=0")->getRow()->c;
        $totalClients = (int) $this->db->query("SELECT COUNT(*) as c FROM $tUsers WHERE user_type='client' AND deleted=0")->getRow()->c;
        $totalResp    = (int) $this->db->query("SELECT COUNT(*) as c FROM $tResp WHERE deleted=0")->getRow()->c;
        $totalSubs    = (int) $this->db->query("SELECT COUNT(*) as c FROM $tSubs WHERE status='active' AND deleted=0")->getRow()->c;
        $totalSuspended = (int) $this->db->query("SELECT COUNT(*) as c FROM $tUsers WHERE status='inactive' AND deleted=0")->getRow()->c;

        // Build paginated query
        if ($type === 'respondent') {
            // Query primo_respondents table
            $rwhere = ["r.deleted = 0"];
            $rparams = [];
            if ($status === 'suspended') $rwhere[] = "r.status = 'suspended'";
            elseif ($status === 'active') $rwhere[] = "r.status = 'active'";
            if ($search) {
                $rwhere[] = "(r.first_name LIKE ? OR r.last_name LIKE ? OR r.phone LIKE ?)";
                $rparams[] = "%{$search}%";
                $rparams[] = "%{$search}%";
                $rparams[] = "%{$search}%";
            }
            $rwhereStr = implode(' AND ', $rwhere);
            $countQ = $this->db->query("SELECT COUNT(*) as c FROM $tResp r WHERE $rwhereStr", $rparams)->getRow()->c;
            $total = (int) $countQ;
            $offset = ($page - 1) * $perPage;
            $rows = $this->db->query("SELECT r.id, r.first_name, r.last_name, '' as email, r.phone, 'respondent' as user_type, r.status, r.created_at, r.quality_score as last_online FROM $tResp r WHERE $rwhereStr ORDER BY r.$sortCol $order LIMIT $perPage OFFSET $offset", $rparams)->getResult();
        } else {
            $countQ = $this->db->query("SELECT COUNT(*) as c FROM $tUsers u WHERE $whereStr", $params)->getRow()->c;
            $total = (int) $countQ;
            $offset = ($page - 1) * $perPage;
            $rows = $this->db->query("SELECT u.id, u.first_name, u.last_name, u.email, '' as phone, u.user_type, u.status, u.created_at, u.last_online FROM $tUsers u WHERE $whereStr ORDER BY u.$sortCol $order LIMIT $perPage OFFSET $offset", $params)->getResult();
        }

        $users = array_map(fn($r) => [
            'id'         => (int) $r->id,
            'first_name' => $r->first_name ?? '',
            'last_name'  => $r->last_name ?? '',
            'email'      => $r->email ?? '',
            'phone'      => $r->phone ?? '',
            'user_type'  => $r->user_type ?? 'staff',
            'status'     => $r->status ?? 'active',
            'created_at' => $r->created_at,
            'last_online' => $r->last_online ?? '',
        ], $rows);

        return $this->ok([
            'users' => $users,
            'pagination' => [
                'total'    => $total,
                'page'     => $page,
                'per_page' => $perPage,
                'pages'    => (int) ceil($total / $perPage),
            ],
            'summary' => [
                'total'       => $totalStaff + $totalClients + $totalResp,
                'staff'       => $totalStaff,
                'clients'     => $totalClients,
                'respondents' => $totalResp,
                'subscribed'  => $totalSubs,
                'suspended'   => $totalSuspended,
            ],
        ]);
    }

    /**
     * GET /api/v1/admin/users/:id
     */
    public function show($id = 0)
    {
        if ($g = $this->_guard()) return $g;

        $user = $this->Users_model->get_one($id);
        if (!$user || !$user->id) {
            return $this->notFound('User not found.');
        }

        return $this->ok([
            'id'         => (int) $user->id,
            'first_name' => $user->first_name ?? '',
            'last_name'  => $user->last_name ?? '',
            'email'      => $user->email ?? '',
            'user_type'  => $user->user_type ?? 'staff',
            'status'     => $user->status ?? 'active',
            'is_admin'   => (bool) ($user->is_admin ?? false),
            'job_title'  => $user->job_title ?? '',
            'phone'      => $user->phone ?? '',
            'created_at' => $user->created_at ?? '',
            'last_online' => $user->last_online ?? '',
        ]);
    }

    /**
     * POST /api/v1/admin/users/:id/suspend
     */
    public function suspend($id = 0)
    {
        if ($g = $this->_guard()) return $g;
        $this->Users_model->ci_save(['status' => 'inactive'], $id);
        return $this->ok(null, 'User suspended.');
    }

    /**
     * POST /api/v1/admin/users/:id/activate
     */
    public function activate($id = 0)
    {
        if ($g = $this->_guard()) return $g;
        $this->Users_model->ci_save(['status' => 'active'], $id);
        return $this->ok(null, 'User activated.');
    }
}
