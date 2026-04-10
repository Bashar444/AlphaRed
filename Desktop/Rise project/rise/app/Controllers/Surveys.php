<?php

namespace App\Controllers;

use App\Libraries\Plan_limits;

class Surveys extends Security_Controller {

    private $plan_limits;

    function __construct() {
        parent::__construct();
        $this->plan_limits = new Plan_limits();
        // TODO: set plan from user's active subscription
        $this->plan_limits->set_user_plan('basic');
    }

    function index() {
        $view_data["page_title"] = app_lang("surveys");
        return $this->template->rander("surveys/index", $view_data);
    }

    function list_data() {
        $list_data = $this->Primo_surveys_model->get_details(array(
            "user_id" => $this->login_user->id
        ))->getResult();

        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_row($data);
        }
        echo json_encode(array("data" => $result));
    }

    private function _make_row($data) {
        $status_class = "secondary";
        if ($data->status === "active") $status_class = "success";
        if ($data->status === "paused") $status_class = "warning";
        if ($data->status === "closed") $status_class = "danger";

        $row = array(
            $data->title,
            "<span class='badge bg-$status_class'>$data->status</span>",
            $data->collected_count . " / " . $data->target_responses,
            format_to_date($data->created_at, false),
            modal_anchor(get_uri("surveys/modal_form"), "<i data-feather='edit' class='icon-16'></i>", array("class" => "edit", "title" => app_lang('edit'), "data-post-id" => $data->id))
            . js_anchor("<i data-feather='trash-2' class='icon-16'></i>", array('title' => app_lang('delete'), "class" => "delete", "data-id" => $data->id, "data-action-url" => get_uri("surveys/delete"), "data-action" => "delete-confirmation"))
            . " " . anchor(get_uri("surveys/builder/" . $data->id), "<i data-feather='layers' class='icon-16'></i>", array("title" => "Builder"))
        );
        return $row;
    }

    function modal_form() {
        $view_data['model_info'] = $this->Primo_surveys_model->get_one($this->request->getPost('id'));
        return $this->template->rander("surveys/modal_form", $view_data);
    }

    function save() {
        $id = $this->request->getPost('id');

        $this->validate_submitted_data(array(
            "id" => "numeric",
            "title" => "required",
        ));

        // Check plan limit for new surveys
        if (!$id) {
            $count = $this->Primo_surveys_model->get_survey_count($this->login_user->id);
            if (!$this->plan_limits->can_create_survey($count)) {
                echo json_encode(array("success" => false, "message" => app_lang("survey_limit_reached")));
                return;
            }
        }

        $data = array(
            "title" => $this->request->getPost('title'),
            "description" => $this->request->getPost('description'),
            "target_responses" => $this->request->getPost('target_responses') ? (int)$this->request->getPost('target_responses') : 100,
            "language" => $this->request->getPost('language') ? $this->request->getPost('language') : 'en',
        );

        if (!$id) {
            $data["user_id"] = $this->login_user->id;
            $data["created_by"] = $this->login_user->id;
            $data["status"] = "draft";
        }

        $save_id = $this->Primo_surveys_model->ci_save($data, $id);
        if ($save_id) {
            echo json_encode(array("success" => true, "data" => $this->_row_data($save_id), "id" => $save_id, "message" => app_lang("record_saved")));
        } else {
            echo json_encode(array("success" => false, "message" => app_lang("error_occurred")));
        }
    }

    private function _row_data($id) {
        $options = array("id" => $id);
        $data = $this->Primo_surveys_model->get_details($options)->getRow();
        return $this->_make_row($data);
    }

    function delete() {
        $id = $this->request->getPost('id');
        if ($this->Primo_surveys_model->delete_where_and_update($id, array("user_id" => $this->login_user->id))) {
            echo json_encode(array("success" => true, "message" => app_lang("record_deleted")));
        } else {
            echo json_encode(array("success" => false, "message" => app_lang("record_cannot_be_deleted")));
        }
    }

    function builder($survey_id = 0) {
        if (!$survey_id) {
            show_404();
        }

        $survey = $this->Primo_surveys_model->get_one($survey_id);
        if (!$survey->id || $survey->user_id != $this->login_user->id) {
            show_404();
        }

        $view_data["survey_info"] = $survey;
        $view_data["page_title"] = $survey->title . " - Builder";
        return $this->template->rander("surveys/builder", $view_data);
    }

    function save_question() {
        $survey_id = $this->request->getPost('survey_id');
        $id = $this->request->getPost('id');

        $this->validate_submitted_data(array(
            "survey_id" => "required|numeric",
            "text" => "required",
            "type" => "required",
        ));

        // Verify survey ownership
        $survey = $this->Primo_surveys_model->get_one($survey_id);
        if (!$survey->id || $survey->user_id != $this->login_user->id) {
            echo json_encode(array("success" => false, "message" => app_lang("error_occurred")));
            return;
        }

        // Check question limit
        if (!$id) {
            $count = $this->Primo_questions_model->get_question_count($survey_id);
            if (!$this->plan_limits->can_add_question($count)) {
                echo json_encode(array("success" => false, "message" => app_lang("question_limit_reached")));
                return;
            }
        }

        $options = $this->request->getPost('options');
        $data = array(
            "survey_id" => $survey_id,
            "text" => $this->request->getPost('text'),
            "type" => $this->request->getPost('type'),
            "options" => $options ? json_encode($options) : null,
            "required" => $this->request->getPost('required') ? 1 : 0,
        );

        if (!$id) {
            $data["sort"] = $this->Primo_questions_model->get_max_sort($survey_id) + 1;
        }

        $save_id = $this->Primo_questions_model->ci_save($data, $id);
        if ($save_id) {
            echo json_encode(array("success" => true, "id" => $save_id, "message" => app_lang("record_saved")));
        } else {
            echo json_encode(array("success" => false, "message" => app_lang("error_occurred")));
        }
    }

    function delete_question() {
        $id = $this->request->getPost('id');
        if ($this->Primo_questions_model->delete($id)) {
            echo json_encode(array("success" => true, "message" => app_lang("record_deleted")));
        } else {
            echo json_encode(array("success" => false, "message" => app_lang("record_cannot_be_deleted")));
        }
    }

    function sort_questions() {
        $sort_values = $this->request->getPost('sort_values');
        if ($sort_values) {
            $this->Primo_questions_model->update_sort($sort_values);
        }
        echo json_encode(array("success" => true));
    }

    function get_questions_list($survey_id = 0) {
        $questions = $this->Primo_questions_model->get_details(array("survey_id" => $survey_id))->getResult();
        $view_data["questions"] = $questions;
        $view_data["survey_id"] = $survey_id;
        return $this->template->rander("surveys/questions_list", $view_data);
    }
}
