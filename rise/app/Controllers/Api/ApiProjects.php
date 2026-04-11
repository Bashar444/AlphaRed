<?php

namespace App\Controllers\Api;

/**
 * Projects CRUD + members + milestones.
 */
class ApiProjects extends Api_base
{
    /**
     * GET /api/v1/projects
     */
    public function index()
    {
        $options = ['user_id' => $this->api_user_id];
        $status_id = $this->request->getGet('status_id');
        if ($status_id) $options['status_id'] = $status_id;

        $rows = $this->Projects_model->get_details($options)->getResult();
        $list = array_map(fn($r) => [
            'id'            => (int) $r->id,
            'title'         => $r->title,
            'client_id'     => (int) ($r->client_id ?? 0),
            'company_name'  => $r->company_name ?? '',
            'start_date'    => $r->start_date ?? '',
            'deadline'      => $r->deadline ?? '',
            'status_id'     => (int) ($r->status_id ?? 0),
            'status_title'  => $r->status_title ?? '',
            'total_points'  => (int) ($r->total_points ?? 0),
            'completed_points' => (int) ($r->completed_points ?? 0),
            'created_date'  => $r->created_date ?? '',
        ], $rows);

        return $this->ok($list);
    }

    /**
     * GET /api/v1/projects/:id
     */
    public function show($id = 0)
    {
        $row = $this->Projects_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/projects
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['created_by'] = $this->api_user_id;
        $data['created_date'] = date('Y-m-d');
        $id = $this->Projects_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/projects/:id
     */
    public function update($id = 0)
    {
        $existing = $this->Projects_model->get_one($id);
        if (!$existing || !$existing->id) return $this->notFound();
        $data = $this->request->getJSON(true) ?? [];
        $this->Projects_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/projects/:id
     */
    public function delete($id = 0)
    {
        $this->Projects_model->delete($id);
        return $this->ok(null, 'Deleted');
    }

    /**
     * GET /api/v1/projects/:id/members
     */
    public function members($id = 0)
    {
        $rows = $this->Project_members_model->get_details(['project_id' => $id])->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/projects/:id/milestones
     */
    public function milestones($id = 0)
    {
        $rows = $this->Milestones_model->get_details(['project_id' => $id])->getResult();
        return $this->ok($rows);
    }
}
