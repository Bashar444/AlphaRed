<?php

namespace App\Controllers\Api;

/**
 * Timesheets CRUD.
 */
class ApiTimesheets extends Api_base
{
    /**
     * GET /api/v1/timesheets
     */
    public function index()
    {
        $options = [];
        $project_id = $this->request->getGet('project_id');
        if ($project_id) $options['project_id'] = $project_id;
        $user_id = $this->request->getGet('user_id');
        if ($user_id) $options['user_id'] = $user_id;
        else $options['user_id'] = $this->api_user_id;
        $start_date = $this->request->getGet('start_date');
        if ($start_date) $options['start_date'] = $start_date;
        $end_date = $this->request->getGet('end_date');
        if ($end_date) $options['end_date'] = $end_date;

        $rows = $this->Timesheets_model->get_details($options)->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/timesheets/:id
     */
    public function show($id = 0)
    {
        $row = $this->Timesheets_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/timesheets
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['user_id'] = $data['user_id'] ?? $this->api_user_id;
        $id = $this->Timesheets_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/timesheets/:id
     */
    public function update($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $this->Timesheets_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/timesheets/:id
     */
    public function delete($id = 0)
    {
        $this->Timesheets_model->delete($id);
        return $this->ok(null, 'Deleted');
    }
}
