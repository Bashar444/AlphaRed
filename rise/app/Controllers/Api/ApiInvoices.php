<?php

namespace App\Controllers\Api;

/**
 * Invoices CRUD + payments.
 */
class ApiInvoices extends Api_base
{
    /**
     * GET /api/v1/invoices
     */
    public function index()
    {
        $options = [];
        $client_id = $this->request->getGet('client_id');
        if ($client_id) $options['client_id'] = $client_id;
        $project_id = $this->request->getGet('project_id');
        if ($project_id) $options['project_id'] = $project_id;
        $status = $this->request->getGet('status');
        if ($status) $options['status'] = $status;

        $rows = $this->Invoices_model->get_details($options)->getResult();
        $list = array_map(fn($r) => [
            'id'              => (int) $r->id,
            'client_id'       => (int) ($r->client_id ?? 0),
            'company_name'    => $r->company_name ?? '',
            'project_title'   => $r->project_title ?? '',
            'invoice_total'   => (float) ($r->invoice_total ?? 0),
            'payment_received'=> (float) ($r->payment_received ?? 0),
            'due_date'        => $r->due_date ?? '',
            'status'          => $r->status ?? '',
            'currency_symbol' => $r->currency_symbol ?? '',
        ], $rows);

        return $this->ok($list);
    }

    /**
     * GET /api/v1/invoices/:id
     */
    public function show($id = 0)
    {
        $row = $this->Invoices_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        $row->items = $this->Invoice_items_model->get_details(['invoice_id' => $id])->getResult();
        $row->payments = $this->Invoice_payments_model->get_details(['invoice_id' => $id])->getResult();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/invoices
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['created_by'] = $this->api_user_id;
        $data['created_date'] = date('Y-m-d');
        $id = $this->Invoices_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/invoices/:id
     */
    public function update($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $this->Invoices_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/invoices/:id
     */
    public function delete($id = 0)
    {
        $this->Invoices_model->delete($id);
        return $this->ok(null, 'Deleted');
    }

    /**
     * GET /api/v1/invoices/:id/payments
     */
    public function payments($id = 0)
    {
        $rows = $this->Invoice_payments_model->get_details(['invoice_id' => $id])->getResult();
        return $this->ok($rows);
    }

    /**
     * POST /api/v1/invoices/:id/payments
     */
    public function add_payment($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['invoice_id'] = $id;
        $data['created_by'] = $this->api_user_id;
        $data['created_date'] = date('Y-m-d');
        $pid = $this->Invoice_payments_model->ci_save($data);
        return $this->created(['id' => $pid]);
    }
}
