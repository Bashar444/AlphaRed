<?php

namespace App\Controllers\Api;

/**
 * Team members listing.
 */
class ApiTeam extends Api_base
{
    /**
     * GET /api/v1/team
     */
    public function index()
    {
        $options = [];
        $status = $this->request->getGet('status');
        if ($status) $options['status'] = $status;

        $rows = $this->Team_model->get_details($options)->getResult();
        $list = array_map(fn($r) => [
            'id'         => (int) $r->id,
            'first_name' => $r->first_name ?? '',
            'last_name'  => $r->last_name ?? '',
            'email'      => $r->email ?? '',
            'phone'      => $r->phone ?? '',
            'job_title'  => $r->job_title ?? '',
            'status'     => $r->status ?? '',
            'image'      => $r->image ?? '',
            'role_id'    => (int) ($r->role_id ?? 0),
        ], $rows);

        return $this->ok($list);
    }

    /**
     * GET /api/v1/team/:id
     */
    public function show($id = 0)
    {
        $row = $this->Team_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/team
     */
    public function create()
    {
        $this->_guard();
        $data = $this->request->getJSON(true) ?? [];
        $data['user_type'] = 'staff';
        $data['created_at'] = date('Y-m-d H:i:s');
        $id = $this->Team_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/team/:id
     */
    public function update($id = 0)
    {
        $this->_guard();
        $data = $this->request->getJSON(true) ?? [];
        $this->Team_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/team/:id
     */
    public function delete($id = 0)
    {
        $this->_guard();
        $this->Team_model->delete($id);
        return $this->ok(null, 'Deleted');
    }
}
