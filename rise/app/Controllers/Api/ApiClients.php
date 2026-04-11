<?php

namespace App\Controllers\Api;

/**
 * Clients CRUD + contacts.
 */
class ApiClients extends Api_base
{
    /**
     * GET /api/v1/clients
     */
    public function index()
    {
        $options = [];
        $group_id = $this->request->getGet('group_id');
        if ($group_id) $options['group_id'] = $group_id;
        $limit = $this->request->getGet('limit');
        if ($limit) $options['limit'] = $limit;
        $skip = $this->request->getGet('skip');
        if ($skip) $options['skip'] = $skip;
        $search = $this->request->getGet('search');
        if ($search) $options['search_by'] = $search;

        $result = $this->Clients_model->get_details($options);
        if (is_array($result)) {
            return $this->ok($result);
        }
        return $this->ok($result->getResult());
    }

    /**
     * GET /api/v1/clients/:id
     */
    public function show($id = 0)
    {
        $row = $this->Clients_model->get_details(['id' => $id]);
        if (is_array($row)) $row = $row['data'][0] ?? null;
        else $row = $row->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/clients
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['created_by'] = $this->api_user_id;
        $data['created_date'] = date('Y-m-d H:i:s');
        $id = $this->Clients_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/clients/:id
     */
    public function update($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $this->Clients_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/clients/:id
     */
    public function delete($id = 0)
    {
        $this->Clients_model->delete($id);
        return $this->ok(null, 'Deleted');
    }

    /**
     * GET /api/v1/clients/:id/contacts
     */
    public function contacts($id = 0)
    {
        $t = $this->db->prefixTable('users');
        $sql = "SELECT id, first_name, last_name, email, phone, job_title, is_primary_contact
                FROM {$t}
                WHERE deleted=0 AND client_id={$id}
                ORDER BY is_primary_contact DESC, first_name ASC";
        $rows = $this->db->query($sql)->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/clients/groups
     */
    public function groups()
    {
        $rows = $this->Client_groups_model->get_details()->getResult();
        return $this->ok($rows);
    }
}
