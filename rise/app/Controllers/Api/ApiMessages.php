<?php

namespace App\Controllers\Api;

/**
 * Messages listing + send.
 */
class ApiMessages extends Api_base
{
    /**
     * GET /api/v1/messages
     */
    public function index()
    {
        $options = ['user_id' => $this->api_user_id];
        $rows = $this->Messages_model->get_details($options)->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/messages/:id
     */
    public function show($id = 0)
    {
        $row = $this->Messages_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/messages
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['from_user_id'] = $this->api_user_id;
        $data['created_at'] = date('Y-m-d H:i:s');
        $id = $this->Messages_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * DELETE /api/v1/messages/:id
     */
    public function delete($id = 0)
    {
        $this->Messages_model->delete($id);
        return $this->ok(null, 'Deleted');
    }
}
