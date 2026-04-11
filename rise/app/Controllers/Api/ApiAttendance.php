<?php

namespace App\Controllers\Api;

/**
 * Attendance — clock in/out + status.
 */
class ApiAttendance extends Api_base
{
    /**
     * GET /api/v1/attendance
     */
    public function index()
    {
        $options = [];
        $user_id = $this->request->getGet('user_id');
        if ($user_id) $options['user_id'] = $user_id;
        else $options['user_id'] = $this->api_user_id;
        $start_date = $this->request->getGet('start_date');
        if ($start_date) $options['start_date'] = $start_date;
        $end_date = $this->request->getGet('end_date');
        if ($end_date) $options['end_date'] = $end_date;

        $rows = $this->Attendance_model->get_details($options)->getResult();
        return $this->ok($rows);
    }

    /**
     * POST /api/v1/attendance/clock-in
     */
    public function clock_in()
    {
        $data = [
            'user_id'  => $this->api_user_id,
            'in_time'  => date('Y-m-d H:i:s'),
            'status'   => 'incomplete',
        ];
        $note = $this->request->getJsonVar('note');
        if ($note) $data['note'] = $note;
        $id = $this->Attendance_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * POST /api/v1/attendance/clock-out
     */
    public function clock_out()
    {
        $t = $this->db->prefixTable('attendance');
        $uid = (int) $this->api_user_id;
        $sql = "SELECT id FROM {$t} WHERE user_id={$uid} AND status='incomplete' AND deleted=0 ORDER BY id DESC LIMIT 1";
        $row = $this->db->query($sql)->getRow();
        if (!$row) return $this->fail('No open clock-in found');
        $this->Attendance_model->ci_save([
            'out_time' => date('Y-m-d H:i:s'),
            'status'   => 'completed',
        ], $row->id);
        return $this->ok(null, 'Clocked out');
    }

    /**
     * GET /api/v1/attendance/status
     */
    public function status()
    {
        $t = $this->db->prefixTable('attendance');
        $uid = (int) $this->api_user_id;
        $sql = "SELECT * FROM {$t} WHERE user_id={$uid} AND status='incomplete' AND deleted=0 ORDER BY id DESC LIMIT 1";
        $row = $this->db->query($sql)->getRow();
        return $this->ok([
            'clocked_in' => $row ? true : false,
            'record'     => $row,
        ]);
    }
}
