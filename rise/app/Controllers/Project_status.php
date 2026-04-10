<?php

namespace App\Controllers;

class Project_status extends Security_Controller {

    function __construct() {
        parent::__construct();
        $this->access_only_admin_or_settings_admin();
    }

    function index() {
        return $this->template->view("project_status/index");
    }

    function modal_form() {

        $this->validate_submitted_data(array(
            "id" => "numeric"
        ));

        $view_data['model_info'] = $this->Project_status_model->get_one($this->request->getPost('id'));
        return $this->template->view('project_status/modal_form', $view_data);
    }

    function save() {
        $this->validate_submitted_data(array(
            "id" => "numeric"
        ));

        $id = $this->request->getPost('id');
        $data = array(
            "icon" => $this->request->getPost('icon'),
            "title" => $this->request->getPost('title'),
            "title_language_key" => $this->request->getPost('title_language_key')
        );

        $save_id = $this->Project_status_model->ci_save($data, $id);
        if ($save_id) {
            echo json_encode(array("success" => true, "data" => $this->_row_data($save_id), 'id' => $save_id, 'message' => app_lang('record_saved')));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    function delete() {
        $this->validate_submitted_data(array(
            "id" => "required|numeric"
        ));

        $id = $this->request->getPost('id');

        $info = $this->Project_status_model->get_one($id);
        if ($info && $info->key_name) {
            app_redirect("forbidden");
        }

        if ($this->request->getPost('undo')) {
            if ($this->Project_status_model->delete($id, true)) {
                echo json_encode(array("success" => true, "data" => $this->_row_data($id), "message" => app_lang('record_undone')));
            } else {
                echo json_encode(array("success" => false, app_lang('error_occurred')));
            }
        } else {
            if ($this->Project_status_model->delete($id)) {
                echo json_encode(array("success" => true, 'message' => app_lang('record_deleted')));
            } else {
                echo json_encode(array("success" => false, 'message' => app_lang('record_cannot_be_deleted')));
            }
        }
    }

    function list_data() {
        $list_data = $this->Project_status_model->get_details()->getResult();
        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_row($data);
        }
        echo json_encode(array("data" => $result));
    }

    private function _row_data($id) {
        $options = array("id" => $id);
        $data = $this->Project_status_model->get_details($options)->getRow();
        return $this->_make_row($data);
    }

    private function _make_row($data) {

        $delete = "";
        $edit = modal_anchor(get_uri("project_status/modal_form"), "<i data-feather='edit' class='icon-16'></i>", array("class" => "edit", "title" => app_lang('edit_project_status'), "data-post-id" => $data->id));

        if (!$data->key_name) {
            $delete = js_anchor("<i data-feather='x' class='icon-16'></i>", array('title' => app_lang('delete_project_status'), "class" => "delete", "data-id" => $data->id, "data-action-url" => get_uri("project_status/delete"), "data-action" => "delete"));
        }

        return array(
            $data->id,
            "<span data-id='$data->id'><i data-feather='$data->icon' class='icon-14'></i></span> <span class='ml5'>$data->title</span>",
            $edit . $delete
        );
    }
}

/* End of file project_status.php */
/* Location: ./app/controllers/project_status.php */