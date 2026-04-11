<?php

namespace App\Controllers\Api;

/**
 * Events CRUD.
 */
class ApiEvents extends Api_base
{
    /**
     * GET /api/v1/events
     */
    public function index()
    {
        $options = [];
        $start_date = $this->request->getGet('start_date');
        if ($start_date) $options['start_date'] = $start_date;
        $end_date = $this->request->getGet('end_date');
        if ($end_date) $options['end_date'] = $end_date;
        $user_id = $this->request->getGet('user_id');
        if ($user_id) $options['user_id'] = $user_id;
        else $options['user_id'] = $this->api_user_id;

        $rows = $this->Events_model->get_details($options)->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/events/:id
     */
    public function show($id = 0)
    {
        $row = $this->Events_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/events
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['created_by'] = $this->api_user_id;
        $id = $this->Events_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/events/:id
     */
    public function update($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $this->Events_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/events/:id
     */
    public function delete($id = 0)
    {
        $this->Events_model->delete($id);
        return $this->ok(null, 'Deleted');
    }
}
