<?php

namespace App\Controllers\Api;

/**
 * Todo CRUD + toggle.
 */
class ApiTodo extends Api_base
{
    /**
     * GET /api/v1/todo
     */
    public function index()
    {
        $options = ['user_id' => $this->api_user_id];
        $rows = $this->Todo_model->get_details($options)->getResult();
        return $this->ok($rows);
    }

    /**
     * POST /api/v1/todo
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['created_by'] = $this->api_user_id;
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['status'] = $data['status'] ?? 'to_do';
        $id = $this->Todo_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/todo/:id
     */
    public function update($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $this->Todo_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * POST /api/v1/todo/:id/toggle
     */
    public function toggle($id = 0)
    {
        $row = $this->Todo_model->get_one($id);
        if (!$row || !$row->id) return $this->notFound();
        $newStatus = ($row->status === 'done') ? 'to_do' : 'done';
        $this->Todo_model->ci_save(['status' => $newStatus], $id);
        return $this->ok(['status' => $newStatus]);
    }

    /**
     * DELETE /api/v1/todo/:id
     */
    public function delete($id = 0)
    {
        $this->Todo_model->delete($id);
        return $this->ok(null, 'Deleted');
    }
}
