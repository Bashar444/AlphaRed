<?php

namespace App\Controllers\Api;

/**
 * Announcements CRUD.
 */
class ApiAnnouncements extends Api_base
{
    /**
     * GET /api/v1/announcements
     */
    public function index()
    {
        $rows = $this->Announcements_model->get_details()->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/announcements/:id
     */
    public function show($id = 0)
    {
        $row = $this->Announcements_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/announcements
     */
    public function create()
    {
        $this->_guard();
        $data = $this->request->getJSON(true) ?? [];
        $data['created_by'] = $this->api_user_id;
        $data['created_at'] = date('Y-m-d H:i:s');
        $id = $this->Announcements_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/announcements/:id
     */
    public function update($id = 0)
    {
        $this->_guard();
        $data = $this->request->getJSON(true) ?? [];
        $this->Announcements_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/announcements/:id
     */
    public function delete($id = 0)
    {
        $this->_guard();
        $this->Announcements_model->delete($id);
        return $this->ok(null, 'Deleted');
    }
}
