<?php

namespace App\Controllers\Api;

/**
 * Leads CRUD + statuses + sources.
 */
class ApiLeads extends Api_base
{
    /**
     * GET /api/v1/leads
     */
    public function index()
    {
        $options = ['leads_only' => true];
        $status = $this->request->getGet('status');
        if ($status) $options['status'] = $status;
        $source = $this->request->getGet('source');
        if ($source) $options['source'] = $source;
        $owner_id = $this->request->getGet('owner_id');
        if ($owner_id) $options['owner_id'] = $owner_id;
        $limit = $this->request->getGet('limit');
        if ($limit) $options['limit'] = $limit;
        $skip = $this->request->getGet('skip');
        if ($skip) $options['skip'] = $skip;
        $search = $this->request->getGet('search');
        if ($search) $options['search_by'] = $search;

        $result = $this->Clients_model->get_details($options);
        if (is_array($result)) return $this->ok($result);
        return $this->ok($result->getResult());
    }

    /**
     * GET /api/v1/leads/:id
     */
    public function show($id = 0)
    {
        $row = $this->Clients_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/leads
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['is_lead'] = 1;
        $data['created_by'] = $this->api_user_id;
        $data['created_date'] = date('Y-m-d H:i:s');
        $id = $this->Clients_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/leads/:id
     */
    public function update($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $this->Clients_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/leads/:id
     */
    public function delete($id = 0)
    {
        $this->Clients_model->delete($id);
        return $this->ok(null, 'Deleted');
    }

    /**
     * GET /api/v1/leads/statuses
     */
    public function statuses()
    {
        $rows = $this->Lead_status_model->get_details()->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/leads/sources
     */
    public function sources()
    {
        $rows = $this->Lead_source_model->get_details()->getResult();
        return $this->ok($rows);
    }
}
