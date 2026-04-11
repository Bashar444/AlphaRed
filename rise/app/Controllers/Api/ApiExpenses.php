<?php

namespace App\Controllers\Api;

/**
 * Expenses CRUD + categories.
 */
class ApiExpenses extends Api_base
{
    /**
     * GET /api/v1/expenses
     */
    public function index()
    {
        $options = [];
        $project_id = $this->request->getGet('project_id');
        if ($project_id) $options['project_id'] = $project_id;
        $category_id = $this->request->getGet('category_id');
        if ($category_id) $options['category_id'] = $category_id;
        $user_id = $this->request->getGet('user_id');
        if ($user_id) $options['user_id'] = $user_id;

        $rows = $this->Expenses_model->get_details($options)->getResult();
        return $this->ok($rows);
    }

    /**
     * GET /api/v1/expenses/:id
     */
    public function show($id = 0)
    {
        $row = $this->Expenses_model->get_details(['id' => $id])->getRow();
        if (!$row) return $this->notFound();
        return $this->ok($row);
    }

    /**
     * POST /api/v1/expenses
     */
    public function create()
    {
        $data = $this->request->getJSON(true) ?? [];
        $data['created_by'] = $this->api_user_id;
        $data['created_date'] = date('Y-m-d');
        $id = $this->Expenses_model->ci_save($data);
        return $this->created(['id' => $id]);
    }

    /**
     * PUT /api/v1/expenses/:id
     */
    public function update($id = 0)
    {
        $data = $this->request->getJSON(true) ?? [];
        $this->Expenses_model->ci_save($data, $id);
        return $this->ok(null, 'Updated');
    }

    /**
     * DELETE /api/v1/expenses/:id
     */
    public function delete($id = 0)
    {
        $this->Expenses_model->delete($id);
        return $this->ok(null, 'Deleted');
    }

    /**
     * GET /api/v1/expenses/categories
     */
    public function categories()
    {
        $rows = $this->Expense_categories_model->get_details()->getResult();
        return $this->ok($rows);
    }
}
