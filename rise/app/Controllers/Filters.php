<?php

namespace App\Controllers;

class Filters extends Security_Controller {

    function __construct() {
        parent::__construct();
    }

    function modal_form() {
        $id = $this->request->getPost('id');

        $filter_info = $this->_get_filter($id);
        $view_data["id"] = $this->request->getPost('id');
        $view_data["title"] = $filter_info ? get_array_value($filter_info, "title") : $this->request->getPost('title');
        $view_data["context"] = $filter_info ? get_array_value($filter_info, "context") : $this->request->getPost('context');
        $view_data["context_id"] = $this->request->getPost('context_id');
        $view_data["instance_id"] = $this->request->getPost('instance_id');
        $view_data["icon"] = $filter_info ? get_array_value($filter_info, "icon") : $this->request->getPost('icon');
        $view_data["bookmark"] = $filter_info ? get_array_value($filter_info, "bookmark") : $this->request->getPost('bookmark');
        $view_data["change_filter"] = $this->request->getPost('change_filter') ? 1 : "";

        return $this->template->view('filters/modal_form', $view_data);
    }

    function save() {
        $id = $this->request->getPost('id');

        $validation_array = array(
            "id" => "required",
            "context" => "required",
            "title" => "required"
        );

        $this->validate_submitted_data($validation_array);

        $context = $this->request->getPost('context');
        $context_id = $this->request->getPost('context_id');
        $title = $this->request->getPost('title');
        $bookmark = $this->request->getPost('bookmark');
        $icon = $this->request->getPost('icon');
        $filter_params = $this->request->getPost('filter_params');
        $change_filter = $this->request->getPost('change_filter');

        $filters = get_setting("user_" . $this->login_user->id . "_filters");
        if (!$filters) {
            $filters = "a:0:{}";
        }
        $filters = unserialize($filters);

        $filter_data = array(
            "context" => $context,
            "id" => $id,
            "title" => $title,
            "params" => json_decode($filter_params)
        );

        if ($context_id) {
            $filter_data["context"] = $filter_data["context"] . "_" . $context_id;
        }


        if ($bookmark != "_remove") {
            $filter_data["bookmark"] = $bookmark;
        }
        if ($icon != "_remove") {
            $filter_data["icon"] = $icon;
        }


        $is_existing_filter = $this->_get_filter($id);
        if ($is_existing_filter) {

            foreach ($filters as $key => $filter) {
                if (get_array_value($filter, 'id') == $id) {

                    $filter_data = $filter; //update only submited data and keep all others as is.

                    if ($context_id) {
                        $filter_data["context"] = $filter_data["context"] . "_" . $context_id;
                    }

                    $title ? $filter_data["title"] = $title : null;

                    if ($bookmark && $bookmark === "_remove") {
                        $filter_data["bookmark"] = "";
                    } else if ($bookmark) {
                        $filter_data["bookmark"] = $bookmark;
                    }

                    if ($icon && $icon === "_remove") {
                        $filter_data["icon"] = "";
                    } else if ($icon) {
                        $filter_data["icon"] = $icon;
                    }

                    if ($change_filter && $filter_params) { //don't change param all time.
                        $filter_data["params"] = json_decode($filter_params);
                    }

                    $filters[$key] = $filter_data;
                }
            }
        } else {
            $filters[] = $filter_data;
        }

        $this->_save_custom_filters($filters, $id);

        echo json_encode(array("success" => true, "filters" => $filters));
    }

    function _save_custom_filters($filters_array) {
        return $this->Settings_model->save_setting("user_" . $this->login_user->id . "_filters", serialize($filters_array), "user");
    }

    function manage_modal() {
        $view_data["context"] = $this->request->getPost('context');
        $view_data["context_id"] = $this->request->getPost('context_id') ? $this->request->getPost('context_id') : 0;
        $view_data["instance_id"] = $this->request->getPost('instance_id');
        return $this->template->view('filters/manage_modal', $view_data);
    }

    private function _get_custom_filters($context = "", $context_id = 0) {
        $custom_filters = get_setting("user_" . $this->login_user->id . "_filters");
        if (!$custom_filters) {
            $custom_filters = "a:0:{}";
        }
        $filters = unserialize($custom_filters);

        $context_with_id = "";
        if ($context_id != 0 && $context_id) {
            $context_with_id = $context . "_" . $context_id;
        }


        $result = $filters;
        if ($context) {
            $result = array();
            foreach ($filters as $filter) {
                $filter_context = get_array_value($filter, 'context');
                if ($filter_context == $context || $filter_context == $context_with_id) {
                    $result[] = $filter;
                }
            }
        }

        return $result;
    }

    private function _get_filter($id = "") {
        $custom_filters_array = $this->_get_custom_filters();

        foreach ($custom_filters_array as $element) {
            if (get_array_value($element, 'id') == $id) {
                return $element;
            }
        }
        return null;
    }

    function list_data($context = "", $context_id = 0) {
        $custom_filters_array = $this->_get_custom_filters($context, $context_id);

        $result = array();
        foreach ($custom_filters_array as $data) {
            $result[] = $this->_make_row($data, $context);
        }
        echo json_encode(array("data" => $result));
    }

    private function _make_row($data, $context) {
        $id = get_array_value($data, 'id');
        $option_links = js_anchor("<i data-feather='sliders' class='icon-16 mr10'></i>" . app_lang('change_filters'), array('title' => app_lang('change_filters'), "class" => "btn non-round-option-button js-change-filter-$context", "data-id" => $id))
                . modal_anchor(get_uri("filters/modal_form"), "<i data-feather='edit' class='icon-16'></i>", array("class" => "edit", "title" => app_lang('edit'), "data-post-id" => $id))
                . js_anchor("<i data-feather='x' class='icon-16'></i>", array('title' => app_lang('delete'), "class" => "delete", "data-id" => $id, "data-undo" => "0", "data-action-url" => get_uri("filters/delete"), "data-action" => "delete"));

        $bookmark_content = "";
        if (get_array_value($data, 'bookmark')) {
            $bookmark_content = "<i data-feather='check' class='icon-16'></i>";
        }

        $icon = get_array_value($data, 'icon');
        $bookmark_icon_content = $icon;
        if ($icon) {
            $bookmark_icon_content = "<i data-feather='" . $icon . "' class='icon-16'></i>";
        }



        return array(
            get_array_value($data, 'title'),
            $bookmark_content,
            $bookmark_icon_content,
            $option_links
        );
    }

    private function _remove_element_from_array(&$array, $id) {
        foreach ($array as $key => $element) {
            if ($element['id'] === $id) {
                unset($array[$key]);
                break;
            }
        }
    }

    function delete() {
        $this->validate_submitted_data(array(
            "id" => "required"
        ));

        $id = $this->request->getPost('id');

        $custom_filters_array = $this->_get_custom_filters();

        $this->_remove_element_from_array($custom_filters_array, $id);

        $this->_save_custom_filters($custom_filters_array);
        echo json_encode(array("success" => true, 'message' => app_lang('record_deleted')));
    }

    function view() {
        $this->validate_submitted_data(array(
            "id" => "required|numeric"
        ));

        $model_info = $this->Todo_model->get_details(array("id" => $this->request->getPost('id')))->getRow();

        $this->validate_access($model_info);

        $view_data['model_info'] = $model_info;
        return $this->template->view('todo/view', $view_data);
    }

}

/* End of file Filters.php */
/* Location: ./app/Controllers/Filters.php */