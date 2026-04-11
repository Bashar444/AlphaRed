<?php

namespace App\Controllers\Api;

/**
 * Roles CRUD (admin only).
 */
class ApiRoles extends Api_base
{
    /**
     * GET /api/v1/roles
     */
    public function index()
    {
        $this->_guard();
        $rows = $this->Roles_model->get_details()->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/roles/:id
     */
    public function show($id = 0)
    {
        $this->_guard();
        $row = $this->Roles_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/roles
     */
    public function create()
    {
        $this->_guard();
        $data = $this->request->getJSON(true) ?? [];
        $id = $this->Roles_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/roles/:id
     */
    public function update($id = 0)
    {
        $this->_guard();
        $data = $this->request->getJSON(true) ?? [];
        $this->Roles_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/roles/:id
     */
    public function delete($id = 0)
    {
        $this->_guard();
        $this->Roles_model->delete($id);
        return $this->ok(null, 'Deleted');
    }
}
