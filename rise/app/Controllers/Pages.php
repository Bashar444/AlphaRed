<?php

namespace App\Controllers;

class Pages extends Security_Controller {

    protected $Pages_model;

    function __construct() {
        parent::__construct();
        $this->access_only_admin_or_settings_admin();
        $this->Pages_model = model('App\Models\Pages_model');
    }

    function index() {
        return $this->template->rander("pages/index");
    }

    function modal_form() {
        $this->validate_submitted_data(array(
            "id" => "numeric"
        ));

        $view_data['model_info'] = $this->Pages_model->get_one($this->request->getPost('id'));

        return $this->template->view('pages/modal_form', $view_data);
    }

    function save() {

        $this->validate_submitted_data(array(
            "id" => "numeric"
        ));

        $id = $this->request->getPost('id');
        $slug = $this->request->getPost('slug');

        if ($this->Pages_model->is_slug_exists($slug, $id)) {
            echo json_encode(array("success" => false, 'message' => app_lang("page_url_cant_duplicate")));
            return false;
        }

        $data = array(
            "title" => $this->request->getPost('title'),
            "content" => decode_ajax_post_data($this->request->getPost('content')),
            "slug" => $slug,
            "status" => $this->request->getPost('status'),
            "internal_use_only" => is_null($this->request->getPost('internal_use_only')) ? 0 : $this->request->getPost('internal_use_only'),
            "visible_to_team_members_only" => is_null($this->request->getPost('visible_to_team_members_only')) ? 0 : $this->request->getPost('visible_to_team_members_only'),
            "visible_to_clients_only" => is_null($this->request->getPost('visible_to_clients_only')) ? 0 : $this->request->getPost('visible_to_clients_only'),
            "hide_topbar" => is_null($this->request->getPost('hide_topbar')) ? 0 : $this->request->getPost('hide_topbar'),
            "full_width" => is_null($this->request->getPost('full_width')) ? 0 : $this->request->getPost('full_width')
        );

        $save_id = $this->Pages_model->ci_save($data, $id);
        if ($save_id) {
            echo json_encode(array("success" => true, "data" => $this->_row_data($save_id), 'id' => $save_id, 'message' => app_lang('record_saved')));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    function delete() {

        $this->validate_submitted_data(array(
            "id" => "numeric"
        ));

        $id = $this->request->getPost('id');
        if ($this->request->getPost('undo')) {
            if ($this->Pages_model->delete($id, true)) {
                echo json_encode(array("success" => true, "data" => $this->_row_data($id), "message" => app_lang('record_undone')));
            } else {
                echo json_encode(array("success" => false, app_lang('error_occurred')));
            }
        } else {
            if ($this->Pages_model->delete($id)) {
                echo json_encode(array("success" => true, 'message' => app_lang('record_deleted')));
            } else {
                echo json_encode(array("success" => false, 'message' => app_lang('record_cannot_be_deleted')));
            }
        }
    }

    function list_data() {
        $list_data = $this->Pages_model->get_details()->getResult();
        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_row($data);
        }
        echo json_encode(array("data" => $result));
    }

    private function _row_data($id) {
        $options = array("id" => $id);
        $data = $this->Pages_model->get_details($options)->getRow();
        return $this->_make_row($data);
    }

    private function _make_row($data) {
        $options = modal_anchor(get_uri("pages/modal_form"), "<i data-feather='edit' class='icon-16'></i>", array("class" => "edit", "title" => app_lang('add_page'), "data-post-id" => $data->id, "data-modal-fullscreen" => 1));

        $options .= js_anchor("<i data-feather='x' class='icon-16'></i>", array('title' => app_lang('delete_page'), "class" => "delete", "data-id" => $data->id, "data-action-url" => get_uri("pages/delete"), "data-action" => "delete"));

    
        $status_class = "bg-success";
        if ($data->status === "inactive") {
            $status_class = "bg-danger";
        } 

        $status = "<span class='badge $status_class large'>" . app_lang($data->status) . "</span> ";

        
        
        $options_icons = "";
        
        if($data->hide_topbar){
             $options_icons .= "<span title='". app_lang('hide_topbar') ."'><i data-feather='square' class='icon-16 mr10'></i></span>";
        }
        
        if($data->full_width){
             $options_icons .= "<span title='". app_lang('full_width') ."'><i data-feather='maximize-2' style='transform: rotate(45deg)' class='icon-16 mr10'></i></span>";
        }
        
        if($data->internal_use_only){
             $options_icons .= "<span title='". app_lang('internal_use_only') ."'><i data-feather='lock' class='icon-16 mr10'></i></span>";
        }
        
        if($data->internal_use_only && $data->visible_to_team_members_only){
             $options_icons .= "<span title='". app_lang('visible_to_team_members_only') ."'><i data-feather='users' class='icon-16 mr10'></i></span>";
        }
        
        if($data->internal_use_only && $data->visible_to_clients_only){
             $options_icons .= "<span title='". app_lang('visible_to_clients_only') ."'><i data-feather='briefcase' class='icon-16 mr10'></i></span>";
        }
        
        
        
        return array($data->title,
            anchor(get_uri("about") . "/" . $data->slug, get_uri("about") . "/" . $data->slug, array("target" => "_blank")),
            $status,
            $options_icons,
            $options
        );
    }

}

/* End of file Pages.php */
/* Location: ./app/controllers/Pages.php */