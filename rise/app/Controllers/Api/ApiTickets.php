<?php

namespace App\Controllers\Api;

/**
 * Tickets CRUD + comments.
 */
class ApiTickets extends Api_base
{
    /**
     * GET /api/v1/tickets
     */
    public function index()
    {
        $options = [];
        $client_id = $this->request->getGet('client_id');
        if ($client_id) $options['client_id'] = $client_id;
        $assigned_to = $this->request->getGet('assigned_to');
        if ($assigned_to) $options['assigned_to'] = $assigned_to;
        $status = $this->request->getGet('status');
        if ($status) $options['status'] = $status;

        $rows = $this->Tickets_model->get_details($options)->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/tickets/:id
     */
    public function show($id = 0)
    {
        $row = $this->Tickets_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/tickets
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['created_by'] = $this->api_user_id;
        $data['created_date'] = date('Y-m-d H:i:s');
        $id = $this->Tickets_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/tickets/:id
     */
    public function update($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $this->Tickets_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/tickets/:id
     */
    public function delete($id = 0)
    {
        $this->Tickets_model->delete($id);
        return $this->ok(null, 'Deleted');
    }

    /**
     * GET /api/v1/tickets/:id/comments
     */
    public function comments($id = 0)
    {
        $rows = $this->Ticket_comments_model->get_details(['ticket_id' => $id])->getResult();
        return $this->ok($rows);
    }

    /**
     * POST /api/v1/tickets/:id/comments
     */
    public function add_comment($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['ticket_id'] = $id;
        $data['created_by'] = $this->api_user_id;
        $data['created_at'] = date('Y-m-d H:i:s');
        $cid = $this->Ticket_comments_model->ci_save($data);
        return $this->created(['id' => $cid]);
    }

    /**
     * GET /api/v1/tickets/types
     */
    public function types()
    {
        $rows = $this->Ticket_types_model->get_details()->getResult();
        return $this->ok($rows);
    }
}
