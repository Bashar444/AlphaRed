<?php

namespace App\Controllers\Api;

/**
 * Notes CRUD.
 */
class ApiNotes extends Api_base
{
    /**
     * GET /api/v1/notes
     */
    public function index()
    {
        $options = ['created_by' => $this->api_user_id];
        $project_id = $this->request->getGet('project_id');
        if ($project_id) $options['project_id'] = $project_id;

        $rows = $this->Notes_model->get_details($options)->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/notes/:id
     */
    public function show($id = 0)
    {
        $row = $this->Notes_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/notes
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['created_by'] = $this->api_user_id;
        $data['created_at'] = date('Y-m-d H:i:s');
        $id = $this->Notes_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/notes/:id
     */
    public function update($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $this->Notes_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/notes/:id
     */
    public function delete($id = 0)
    {
        $this->Notes_model->delete($id);
        return $this->ok(null, 'Deleted');
    }
}
