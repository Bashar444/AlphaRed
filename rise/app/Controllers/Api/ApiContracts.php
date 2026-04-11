<?php

namespace App\Controllers\Api;

/**
 * Contracts CRUD.
 */
class ApiContracts extends Api_base
{
    /**
     * GET /api/v1/contracts
     */
    public function index()
    {
        $options = [];
        $client_id = $this->request->getGet('client_id');
        if ($client_id) $options['client_id'] = $client_id;
        $status = $this->request->getGet('status');
        if ($status) $options['status'] = $status;

        $rows = $this->Contracts_model->get_details($options)->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/contracts/:id
     */
    public function show($id = 0)
    {
        $row = $this->Contracts_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/contracts
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['created_by'] = $this->api_user_id;
        $data['created_date'] = date('Y-m-d');
        $id = $this->Contracts_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/contracts/:id
     */
    public function update($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $this->Contracts_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/contracts/:id
     */
    public function delete($id = 0)
    {
        $this->Contracts_model->delete($id);
        return $this->ok(null, 'Deleted');
    }
}
