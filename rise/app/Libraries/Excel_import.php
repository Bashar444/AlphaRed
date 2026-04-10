<?php

namespace App\Libraries;

//limitation: Can be imported only one kind of data file from a controller. If need to import different data, consider to create new controllers. 
trait Excel_import {

    abstract public function download_sample_excel_file();

    abstract private function _get_controller_slag();

    abstract private function _get_custom_field_context();

    abstract private function _validate_excel_import_access();

    abstract private function _get_headers_for_import();

    abstract private function _init_required_data_before_starting_import();

    abstract private function _save_a_row_of_excel_data($row_data);

    private $custom_field_fatched = false;
    private $custom_fields_id_by_title = array();
    private $custom_fields_type_by_id = array();
    private $headers_with_custom_fields = array();
    private $default_headers = array();
    private $hader_config = array();

    protected function _prepare_custom_field_values_array($column_name, $value, &$custom_field_values_array) {
        $explode_header_key_value = explode("-", $column_name);
        $custom_field_id = get_array_value($explode_header_key_value, 1);

        //modify date value
        $custom_field_type = $this->_get_existing_custom_field_type($custom_field_id);
        if ($custom_field_type === "date") {
            $value = $this->_check_valid_date($value);
        }
        if ($custom_field_id && $value) {
            $custom_field_values_array[$custom_field_id] = $value;
        }
    }

    protected function _get_column_name($column_index) {
        return get_array_value($this->headers_with_custom_fields, $column_index);
    }

    function upload_excel_file() {
        $this->_validate_excel_import_access();
        upload_file_to_temp(true);
    }

    function import_modal_form() {
        $this->_validate_excel_import_access();
        $view_data["controller_slag"] = $this->_get_controller_slag();
        return $this->template->view("excel_import/import_modal_form", $view_data);
    }

    function validate_import_file() {
        $this->_validate_excel_import_access();
        $file_name = $this->request->getPost("file_name");
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        if (!is_valid_file_to_upload($file_name)) {
            echo json_encode(array("success" => false, 'message' => app_lang('invalid_file_type')));
            exit();
        }

        if ($file_ext == "xlsx") {
            echo json_encode(array("success" => true));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('please_upload_a_excel_file') . " (.xlsx)"));
        }
    }

    function validate_import_file_data($check_on_submit = false) {
        $this->_validate_excel_import_access();
        $table_data = "";
        $error_message = "";
        $headers = array();
        $got_error_header = false; //we've to check the valid headers first, and a single header at a time
        $got_error_table_data = false;

        $excel_file_data = $this->_get_excel_file_data();
        $this->_prepare_default_headers_array();
        $this->_prepare_custom_fields_array();

        $table_data .= '<table class="table table-responsive table-bordered table-hover" style="width: 100%; color: #444;">';

        $table_data_header_array = array();
        $table_data_body_array = array();

        foreach ($excel_file_data as $row_index => $row_fields) {
            if ($row_index == 0) {
                $headers = $this->_get_headers_fields_and_errors($row_fields);
                $this->_validate_headers($headers, $got_error_header, $table_data_header_array);
            } else if (!array_filter($row_fields)) {
                continue;
            } else { //validate row data
                $this->_validate_rows($headers, $row_fields, $row_index, $got_error_header, $table_data_body_array, $got_error_table_data);
            }
        }

        //return false if any error found on submitting file
        if ($check_on_submit) {
            return ($got_error_header || $got_error_table_data) ? false : true;
        }

        //add error header if there is any error in table body
        if ($got_error_table_data) {
            array_push($table_data_header_array, array("has_error_text" => true, "value" => app_lang("error")));
        }

        //add headers to table
        $table_data .= "<tr>";
        foreach ($table_data_header_array as $table_data_header) {
            $error_class = get_array_value($table_data_header, "has_error_class") ? "error" : "";
            $error_text = get_array_value($table_data_header, "has_error_text") ? "text-danger" : "";
            $value = get_array_value($table_data_header, "value");
            $table_data .= "<th class='$error_class $error_text'>" . $value . "</th>";
        }
        $table_data .= "</tr>";

        //add body data to table
        foreach ($table_data_body_array as $table_data_body_row) {

            $table_data .= "<tr>";
            $error_text = "";

            foreach ($table_data_body_row as $table_data_body_row_data) {
                $error_class = get_array_value($table_data_body_row_data, "has_error_class") ? "error" : "";
                $error_text = get_array_value($table_data_body_row_data, "has_error_text") ? "text-danger" : "";
                $value = get_array_value($table_data_body_row_data, "value");
                $table_data .= "<td class='$error_class $error_text'>" . $value . "</td>";
            }

            if ($got_error_table_data && !$error_text) {
                $table_data .= "<td></td>";
            }

            $table_data .= "</tr>";
        }

        //add error message for header
        if ($error_message) {
            $total_columns = count($table_data_header_array);
            $table_data .= "<tr><td class='text-danger' colspan='$total_columns'><i data-feather='alert-triangle' class='icon-16'></i> " . $error_message . "</td></tr>";
        }

        $table_data .= "</table>";

        echo json_encode(array("success" => true, 'table_data' => $table_data, 'got_error' => ($got_error_header || $got_error_table_data) ? true : false));
    }

    function save_from_excel_file() {
        if (!$this->validate_import_file_data(true)) {
            echo json_encode(array('success' => false, 'message' => app_lang('error_occurred')));
        }

        $excel_file_data = $this->_get_excel_file_data();
        $this->_prepare_default_headers_array();
        $this->_prepare_custom_fields_array();
        $this->_init_required_data_before_starting_import();

        foreach ($excel_file_data as $row_index => $row_data) { //rows
            if ($row_index === 0) { //first line is headers, modify this for custom fields and continue for the next loop
                $this->headers_with_custom_fields = $this->_get_headers_with_custom_fields($row_data);
                continue;
            }

            $this->_save_a_row_of_excel_data($row_data);
        }

        delete_file_from_directory(get_setting("temp_file_path") . $this->request->getPost("file_name")); //delete temp file

        echo json_encode(array('success' => true, 'message' => app_lang("record_saved")));
    }

    private function _prepare_default_headers_array() {
        $default_headers = array();
        $header_config = array();
        $headers = $this->_get_headers_for_import();
        foreach ($headers as $header) {
            $column = get_array_value($header, "name");
            array_push($default_headers, $column);
            $header_config[$column] = $header;
        }
        $this->default_headers = $default_headers;
        $this->hader_config = $header_config;
    }

    private function _prepare_custom_fields_array() {
        if ($this->custom_field_fatched) {
            return false;
        }
        $custom_fields_id_by_title = array();
        $custom_fields_type_by_id = array();
        $fields = $this->Custom_fields_model->get_fields_of_a_context($this->_get_custom_field_context())->getResult();
        foreach ($fields as $field) {
            $custom_fields_id_by_title[strtolower($field->title)] = $field->id;
            $custom_fields_type_by_id[$field->id] = $field->field_type;
        }
        $this->custom_fields_id_by_title = $custom_fields_id_by_title;
        $this->custom_fields_type_by_id = $custom_fields_type_by_id;
    }

    private function _get_excel_file_data() {
        $file_name = $this->request->getPost("file_name");

        require_once(APPPATH . "ThirdParty/PHPOffice-PhpSpreadsheet/vendor/autoload.php");

        $temp_file_path = get_setting("temp_file_path");
        $excel_file = \PhpOffice\PhpSpreadsheet\IOFactory::load($temp_file_path . $file_name);
        return $excel_file->getActiveSheet()->toArray();
    }

    private function _validate_headers($headers, &$got_error_header, &$table_data_header_array) {
        foreach ($headers as $row_data) {
            $has_error_class = false;
            if (get_array_value($row_data, "has_error") && !$got_error_header) {
                $has_error_class = true;
                $got_error_header = true;

                if (get_array_value($row_data, "custom_field")) {
                    $error_message = app_lang("no_such_custom_field_found");
                } else {
                    $error_message = sprintf(app_lang("import_client_error_header"), app_lang(get_array_value($row_data, "key_value")));
                }
            }

            array_push($table_data_header_array, array("has_error_class" => $has_error_class, "value" => get_array_value($row_data, "value")));
        }
    }

    private function _validate_rows($headers, $row_fields, $row_index, $got_error_header, &$table_data_body_array, &$got_error_table_data) {
        $result_fields = array();
        $error_message_on_this_row = "<ol class='pl15'>";
        $has_error_in_this_row = false;
        foreach ($row_fields as $key => $value) {
            $has_error_class = false;

            //don't validate row data if there is any error in header. 
            if (!$got_error_header) {
                $error_message = $this->_validate_row_data_and_get_error_message($key, $value, $row_fields, $headers);
                if ($error_message) {
                    $has_error_class = true;
                    $error_message_on_this_row .= "<li>" . $error_message . "</li>";
                    $got_error_table_data = true;
                    $has_error_in_this_row = true;
                }
            }

            if (count($headers) > $key) {
                $result_fields[] = array("has_error_class" => $has_error_class, "value" => $value);
            }
        }
        $error_message_on_this_row .= "</ol>";

        //error messages for this row
        if ($has_error_in_this_row) {
            $result_fields[] = array("has_error_text" => true, "value" => $error_message_on_this_row);
        }
        $table_data_body_array[$row_index] = $result_fields;
    }

    private function _save_custom_fields($related_to_id, $custom_field_values_array) {
        if (!$custom_field_values_array) {
            return false;
        }
        $context = $this->_get_custom_field_context();
        foreach ($custom_field_values_array as $custom_field_id => $custom_field_value) {
            $field_value_data = array(
                "related_to_type" => $context,
                "related_to_id" => $related_to_id,
                "custom_field_id" => $custom_field_id,
                "value" => $custom_field_value
            );

            $data = clean_data($field_value_data);

            $this->Custom_field_values_model->ci_save($data);
        }
    }

    private function _get_headers_with_custom_fields($headers_row) {
        $headers = $this->default_headers;
        foreach ($headers_row as $index => $header) {
            if (!((count($headers) - 1) < $index)) { //skip default headers
                continue;
            }

            //so, it's a custom field
            //check if there is any custom field existing with the title
            //add id like cf-3
            $existing_id = $this->_get_existing_custom_field_id($header);
            if ($existing_id) {
                array_push($headers, "cf-$existing_id");
            }
        }

        return $headers;
    }

    private function _get_existing_custom_field_id($title = "") {
        $_title = trim($title, " ");

        if (!$_title) {
            return false;
        }

        return get_array_value($this->custom_fields_id_by_title, strtolower($_title));
    }

    private function _get_existing_custom_field_type($id) {
        if (!$id) {
            return false;
        }

        return get_array_value($this->custom_fields_type_by_id, $id);
    }

    private function _get_headers_fields_and_errors($headers_row = array()) {
        //check if all headers are correct and on the right position
        $final_headers = array();
        foreach ($headers_row as $key => $header) {
            if (!$header) {
                continue;
            }

            $key_value = str_replace(' ', '_', strtolower(trim($header, " ")));
            $header_on_this_position = get_array_value($this->default_headers, $key);
            $header_array = array("key_value" => $header_on_this_position, "value" => $header);

            if ($header_on_this_position == $key_value) {
                //the header looks ok 
                //The required headers should be on the correct positions and the rest headers will be treated as custom fields
            } else if (((count($this->default_headers) - 1) < $key) && $key_value) { //custom fields headers
                $existing_id = $this->_get_existing_custom_field_id($header);
                if ($existing_id) {
                    $header_array["custom_field_id"] = $existing_id;
                } else {
                    $header_array["has_error"] = true;
                    $header_array["custom_field"] = true;
                }
            } else { //invalid header, flag as red
                $header_array["has_error"] = true;
            }

            if ($key_value) {
                array_push($final_headers, $header_array);
            }
        }

        return $final_headers;
    }

    private function _get_header_config($name) {
        if ($name) {
            return get_array_value($this->hader_config, $name);
        }
    }

    private function _validate_row_data_and_get_error_message($column_index, $value, $row_data, $headers = array()) {

        $field_name = get_array_value($this->default_headers, $column_index);

        $field_config = $this->_get_header_config($field_name);

        //check requird field
        if ($field_config && get_array_value($field_config, "required") && !$value) {
            $required_message = get_array_value($field_config, "required_message");
            return $required_message ? $required_message : app_lang("field_required");
        }

        if ($field_config && get_array_value($field_config, "custom_validation")) {
            $custom_validation_result = get_array_value($field_config, "custom_validation")($value, $row_data);
            if ($custom_validation_result && get_array_value($custom_validation_result, "error")) {
                return get_array_value($custom_validation_result, "error");
            }
        }

        //there has no date field on default import fields
        //check on custom fields
        if (((count($this->default_headers) - 1) < $column_index) && $value) {
            $header_info = get_array_value($headers, $column_index);
            $custom_field_type = $this->_get_existing_custom_field_type(get_array_value($header_info, "custom_field_id"));
            if ($custom_field_type === "date" && !$this->_check_valid_date($value)) {
                return app_lang("import_date_error_message");
            }
        }
    }
}
