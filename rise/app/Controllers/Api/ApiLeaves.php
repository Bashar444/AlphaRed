<?php

namespace App\Controllers\Api;

/**
 * Leave applications + approve/reject.
 */
class ApiLeaves extends Api_base
{
    /**
     * GET /api/v1/leaves
     */
    public function index()
    {
        $options = [];
        $applicant_id = $this->request->getGet('applicant_id');
        if ($applicant_id) $options['applicant_id'] = $applicant_id;
        else $options['applicant_id'] = $this->api_user_id;
        $status = $this->request->getGet('status');
        if ($status) $options['status'] = $status;

        $rows = $this->Leave_applications_model->get_details($options)->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/leaves/:id
     */
    public function show($id = 0)
    {
        $row = $this->Leave_applications_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/leaves
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['applicant_id'] = $this->api_user_id;
        $data['created_at'] = date('Y-m-d H:i:s');
        $data['status'] = 'pending';
        $id = $this->Leave_applications_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * POST /api/v1/leaves/:id/approve
     */
    public function approve($id = 0)
    {
        $this->_guard();
        $this->Leave_applications_model->ci_save([
            'status'      => 'approved',
            'checked_by'  => $this->api_user_id,
            'checked_at'  => date('Y-m-d H:i:s'),
        ], $id);
        return $this->ok(null, 'Approved');
    }

    /**
     * POST /api/v1/leaves/:id/reject
     */
    public function reject($id = 0)
    {
        $this->_guard();
        $this->Leave_applications_model->ci_save([
            'status'      => 'rejected',
            'checked_by'  => $this->api_user_id,
            'checked_at'  => date('Y-m-d H:i:s'),
        ], $id);
        return $this->ok(null, 'Rejected');
    }

    /**
     * GET /api/v1/leaves/types
     */
    public function types()
    {
        $rows = $this->Leave_types_model->get_details()->getResult();
        return $this->ok($rows);
    }
}
