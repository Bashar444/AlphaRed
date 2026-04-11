<?php

namespace App\Controllers\Api;

/**
 * Tasks CRUD + status management.
 */
class ApiTasks extends Api_base
{
    /**
     * GET /api/v1/tasks
     */
    public function index()
    {
        $options = [];
        $project_id = $this->request->getGet('project_id');
        if ($project_id) $options['project_id'] = $project_id;
        $status_id = $this->request->getGet('status_id');
        if ($status_id) $options['status_id'] = $status_id;
        $assigned_to = $this->request->getGet('assigned_to');
        if ($assigned_to) $options['assigned_to'] = $assigned_to;
        else $options['assigned_to'] = $this->api_user_id;

        $rows = $this->Tasks_model->get_details($options)->getResult();
        $list = array_map(fn($r) => [
            'id'           => (int) $r->id,
            'title'        => $r->title,
            'project_id'   => (int) ($r->project_id ?? 0),
            'project_title'=> $r->project_title ?? '',
            'assigned_to'  => (int) ($r->assigned_to ?? 0),
            'status_id'    => (int) ($r->status_id ?? 0),
            'status_title' => $r->status_title ?? '',
            'start_date'   => $r->start_date ?? '',
            'deadline'     => $r->deadline ?? '',
            'points'       => (int) ($r->points ?? 0),
            'sort'         => (int) ($r->sort ?? 0),
        ], $rows);

        return $this->ok($list);
    }

    /**
     * GET /api/v1/tasks/:id
     */
    public function show($id = 0)
    {
        $row = $this->Tasks_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/tasks
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['created_by'] = $this->api_user_id;
        $id = $this->Tasks_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/tasks/:id
     */
    public function update($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $this->Tasks_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/tasks/:id
     */
    public function delete($id = 0)
    {
        $this->Tasks_model->delete($id);
        return $this->ok(null, 'Deleted');
    }

    /**
     * POST /api/v1/tasks/:id/status
     * Body: { status_id }
     */
    public function change_status($id = 0)
    {
        $status_id = $this->request->getJsonVar('status_id');
        if (!$status_id) return $this->fail('status_id required');
        $this->Tasks_model->ci_save(['status_id' => $status_id], $id);
        return $this->ok(null, 'Status updated');
    }

    /**
     * GET /api/v1/tasks/statuses
     */
    public function statuses()
    {
        $rows = $this->Task_status_model->get_details()->getResult();
        return $this->ok($rows);
    }
}
