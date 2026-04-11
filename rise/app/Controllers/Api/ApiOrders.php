<?php

namespace App\Controllers\Api;

/**
 * Orders CRUD.
 */
class ApiOrders extends Api_base
{
    /**
     * GET /api/v1/orders
     */
    public function index()
    {
        $options = [];
        $client_id = $this->request->getGet('client_id');
        if ($client_id) $options['client_id'] = $client_id;
        $status_id = $this->request->getGet('status_id');
        if ($status_id) $options['status_id'] = $status_id;

        $rows = $this->Orders_model->get_details($options)->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/orders/:id
     */
    public function show($id = 0)
    {
        $row = $this->Orders_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        $row->items = $this->Order_items_model->get_details(['order_id' => $id])->getResult();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/orders
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['created_by'] = $this->api_user_id;
        $data['created_date'] = date('Y-m-d');
        $id = $this->Orders_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/orders/:id
     */
    public function update($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $this->Orders_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/orders/:id
     */
    public function delete($id = 0)
    {
        $this->Orders_model->delete($id);
        return $this->ok(null, 'Deleted');
    }

    /**
     * GET /api/v1/orders/statuses
     */
    public function statuses()
    {
        $rows = $this->Order_status_model->get_details()->getResult();
        return $this->ok($rows);
    }
}
