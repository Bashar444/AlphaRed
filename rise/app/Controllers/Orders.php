<?php

namespace App\Controllers;

class Orders extends Security_Controller {

    function __construct() {
        parent::__construct();
        $this->init_permission_checker("order");
    }

    function index() {
        $this->check_access_to_store();

        $view_data["custom_field_headers"] = $this->Custom_fields_model->get_custom_field_headers_for_table("orders", $this->login_user->is_admin, $this->login_user->user_type);
        $view_data["custom_field_filters"] = $this->Custom_fields_model->get_custom_field_filters("orders", $this->login_user->is_admin, $this->login_user->user_type);

        if ($this->login_user->user_type === "staff") {
            $view_data['order_statuses'] = $this->Order_status_model->get_details()->getResult();
            return $this->template->rander("orders/index", $view_data);
        } else {
            //client view
            $view_data["client_info"] = $this->Clients_model->get_one($this->login_user->client_id);
            $view_data['client_id'] = $this->login_user->client_id;
            $view_data['page_type'] = "full";

            return $this->template->rander("clients/orders/client_portal", $view_data);
        }
    }

    /* list of orders, prepared for datatable  */

    function list_data() {
        $this->access_only_allowed_members();

        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("orders", $this->login_user->is_admin, $this->login_user->user_type);

        $options = array(
            "status_id" => $this->request->getPost("status_id"),
            "order_date" => $this->request->getPost("start_date"),
            "deadline" => $this->request->getPost("end_date"),
            "custom_fields" => $custom_fields,
            "custom_field_filter" => $this->prepare_custom_field_filter_values("orders", $this->login_user->is_admin, $this->login_user->user_type)
        );

        $list_data = $this->Orders_model->get_details($options)->getResult();
        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_row($data, $custom_fields);
        }

        echo json_encode(array("data" => $result));
    }

    /* prepare a row of order list table */

    private function _make_row($data, $custom_fields) {
        $order_url = "";
        if ($this->login_user->user_type == "staff") {
            $order_url = anchor(get_uri("orders/view/" . $data->id), get_order_id($data->id));
        } else {
            //for client
            $order_url = anchor(get_uri("store/order_preview/" . $data->id), get_order_id($data->id));
        }

        $client = anchor(get_uri("clients/view/" . $data->client_id), $data->company_name);

        $invoice_links = "";

        if ($data->invoices) {
            $invoices = explode(',', $data->invoices);
            foreach ($invoices as $invoice) {
                if (!$invoice) {
                    continue;
                }

                if ($invoice_links) {
                    $invoice_links .= ", ";
                }

                if ($this->login_user->user_type == "staff") {
                    $invoice_links .= anchor(get_uri("invoices/view/" . $invoice), get_invoice_id($invoice));
                } else {
                    $invoice_links .= anchor(get_uri("invoices/preview/" . $invoice), get_invoice_id($invoice));
                }
            }
        }

        $invoice_links = $invoice_links ? $invoice_links : "-";

        $row_data = array(
            $data->id,
            $order_url,
            $client,
            $invoice_links,
            $data->order_date,
            format_to_date($data->order_date, false),
            to_currency($data->order_value)
        );

        if ($this->login_user->user_type == "staff") {
            $row_data[] = js_anchor($data->order_status_title, array("style" => "background-color: $data->order_status_color", "class" => "badge", "data-id" => $data->id, "data-value" => $data->status_id, "data-act" => "update-order-status"));
        } else {
            $row_data[] = "<span style='background-color: $data->order_status_color;' class='badge'>$data->order_status_title</span>";
        }

        foreach ($custom_fields as $field) {
            $cf_id = "cfv_" . $field->id;
            $row_data[] = $this->template->view("custom_fields/output_" . $field->field_type, array("value" => $data->$cf_id));
        }

        $row_data[] = modal_anchor(get_uri("orders/modal_form"), "<i data-feather='edit' class='icon-16'></i>", array("class" => "edit", "title" => app_lang('edit_order'), "data-post-id" => $data->id))
                . js_anchor("<i data-feather='x' class='icon-16'></i>", array('title' => app_lang('delete_order'), "class" => "delete", "data-id" => $data->id, "data-action-url" => get_uri("orders/delete"), "data-action" => "delete"));

        return $row_data;
    }

    //load the yearly view of order list
    function yearly() {
        return $this->template->view("orders/yearly_orders");
    }

    //load the custom view of order list
    function custom() {
        return $this->template->view("orders/custom_orders");
    }

    /* load new order modal */

    function modal_form() {
        $this->access_only_allowed_members();

        $this->validate_submitted_data(array(
            "id" => "numeric",
            "client_id" => "numeric"
        ));

        $client_id = $this->request->getPost('client_id');
        $view_data['model_info'] = $this->Orders_model->get_one($this->request->getPost('id'));

        //make the drodown lists
        $view_data['taxes_dropdown'] = array("" => "-") + $this->Taxes_model->get_dropdown_list(array("title"));
        $view_data['clients_dropdown'] = $this->_get_clients_dropdown();

        $view_data['order_statuses'] = $this->Order_status_model->get_details()->getResult();

        $view_data['client_id'] = $client_id;

        $view_data["custom_fields"] = $this->Custom_fields_model->get_combined_details("orders", $view_data['model_info']->id, $this->login_user->is_admin, $this->login_user->user_type)->getResult();

        $view_data['companies_dropdown'] = $this->_get_companies_dropdown();
        if (!$view_data['model_info']->company_id) {
            $view_data['model_info']->company_id = get_default_company_id();
        }

        return $this->template->view('orders/modal_form', $view_data);
    }

    /* add, edit or clone an order */

    function save() {
        $this->access_only_allowed_members();

        $this->validate_submitted_data(array(
            "id" => "numeric",
            "order_client_id" => "required|numeric",
            "order_date" => "required",
            "status_id" => "required"
        ));

        $client_id = $this->request->getPost('order_client_id');
        $id = $this->request->getPost('id');

        $target_path = get_setting("timeline_file_path");
        $files_data = move_files_from_temp_dir_to_permanent_dir($target_path, "order");
        $new_files = unserialize($files_data);

        $order_data = array(
            "client_id" => $client_id,
            "order_date" => $this->request->getPost('order_date'),
            "tax_id" => $this->request->getPost('tax_id') ? $this->request->getPost('tax_id') : 0,
            "tax_id2" => $this->request->getPost('tax_id2') ? $this->request->getPost('tax_id2') : 0,
            "company_id" => $this->request->getPost('company_id') ? $this->request->getPost('company_id') : get_default_company_id(),
            "note" => $this->request->getPost('order_note'),
            "status_id" => $this->request->getPost('status_id')
        );

        //check if the status has been changed,
        //if so, send notification
        $order_info = $this->Orders_model->get_one($id);
        if ($order_info->status_id !== $this->request->getPost('status_id')) {
            log_notification("order_status_updated", array("order_id" => $id));
        }

        //is editing? update the files if required
        if ($id) {
            $timeline_file_path = get_setting("timeline_file_path");
            $new_files = update_saved_files($timeline_file_path, $order_info->files, $new_files);
        }

        $order_data["files"] = serialize($new_files);

        $order_id = $this->Orders_model->ci_save($order_data, $id);
        if ($order_id) {
            save_custom_fields("orders", $order_id, $this->login_user->is_admin, $this->login_user->user_type);

            echo json_encode(array("success" => true, "data" => $this->_row_data($order_id), 'id' => $order_id, 'message' => app_lang('record_saved')));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    /* delete or undo an order */

    function delete() {
        $this->access_only_allowed_members();

        $this->validate_submitted_data(array(
            "id" => "required|numeric"
        ));

        $id = $this->request->getPost('id');
        if ($this->request->getPost('undo')) {
            if ($this->Orders_model->delete($id, true)) {
                echo json_encode(array("success" => true, "data" => $this->_row_data($id), "message" => app_lang('record_undone')));
            } else {
                echo json_encode(array("success" => false, app_lang('error_occurred')));
            }
        } else {
            if ($this->Orders_model->delete($id)) {
                echo json_encode(array("success" => true, 'message' => app_lang('record_deleted')));
            } else {
                echo json_encode(array("success" => false, 'message' => app_lang('record_cannot_be_deleted')));
            }
        }
    }

    /* load order details view */

    function view($order_id = 0) {
        $this->access_only_allowed_members();

        if ($order_id) {
            validate_numeric_value($order_id);

            $view_data = get_order_making_data($order_id);

            if ($view_data) {
                $access_info = $this->get_access_info("invoice");
                $view_data["show_invoice_option"] = (get_setting("module_invoice") && $access_info->access_type == "all") ? true : false;

                $access_info = $this->get_access_info("estimate");
                $view_data["show_estimate_option"] = (get_setting("module_estimate") && $access_info->access_type == "all") ? true : false;

                $view_data["can_create_projects"] = $this->can_create_projects();

                $view_data["order_id"] = $order_id;

                $view_data['order_statuses'] = $this->Order_status_model->get_details()->getResult();

                $view_data["can_view_invoices"] = (get_setting("module_invoice") && $this->can_view_invoices()) ? true : false;

                return $this->template->rander("orders/view", $view_data);
            } else {
                show_404();
            }
        }
    }

    private function check_access_to_this_order($order_data) {
        //check for valid order
        if (!$order_data) {
            show_404();
        }

        //check for security
        $order_info = get_array_value($order_data, "order_info");
        if ($this->login_user->user_type == "client") {
            if ($this->login_user->client_id != $order_info->client_id) {
                app_redirect("forbidden");
            }
        }
    }

    function download_pdf($order_id = 0, $mode = "download") {
        if ($order_id) {
            validate_numeric_value($order_id);
            $order_data = get_order_making_data($order_id);
            $this->check_access_to_store();
            $this->check_access_to_this_order($order_data);

            if (@ob_get_length())
                @ob_clean();
            //so, we have a valid order data. Prepare the view.

            prepare_order_pdf($order_data, $mode);
        } else {
            show_404();
        }
    }

    /* prepare suggestion of order item */

    function get_order_item_suggestion() {
        $key = $this->request->getPost("q");
        $suggestion = array();

        $items = $this->Invoice_items_model->get_item_suggestion($key, $this->login_user->user_type);

        foreach ($items as $item) {
            $suggestion[] = array("id" => $item->id, "text" => $item->title);
        }

        if ($this->login_user->user_type === "staff") {
            $suggestion[] = array("id" => "+", "text" => "+ " . app_lang("create_new_item"));
        }

        echo json_encode($suggestion);
    }

    function get_order_item_info_suggestion() {
        $item = $this->Invoice_items_model->get_item_info_suggestion(array("item_id" => $this->request->getPost("item_id"), "user_type" => $this->login_user->user_type));
        if ($item) {
            $item->rate = $item->rate ? to_decimal_format($item->rate) : "";
            echo json_encode(array("success" => true, "item_info" => $item));
        } else {
            echo json_encode(array("success" => false));
        }
    }

    function save_order_status($id = 0) {
        validate_numeric_value($id);
        $this->access_only_allowed_members();
        if (!$id) {
            show_404();
        }

        $data = array(
            "status_id" => $this->request->getPost('value')
        );

        $save_id = $this->Orders_model->ci_save($data, $id);

        if ($save_id) {
            log_notification("order_status_updated", array("order_id" => $id));
            $order_info = $this->Orders_model->get_details(array("id" => $id))->getRow();
            echo json_encode(array("success" => true, "data" => $this->_row_data($save_id), 'id' => $save_id, "message" => app_lang('record_saved'), "order_status_color" => $order_info->order_status_color));
        } else {
            echo json_encode(array("success" => false, app_lang('error_occurred')));
        }
    }

    /* return a row of order list table */

    private function _row_data($id) {
        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("orders", $this->login_user->is_admin, $this->login_user->user_type);

        $options = array("id" => $id, "custom_fields" => $custom_fields);
        $data = $this->Orders_model->get_details($options)->getRow();
        return $this->_make_row($data, $custom_fields);
    }

    /* load discount modal */

    function discount_modal_form() {
        $this->access_only_allowed_members();

        $this->validate_submitted_data(array(
            "order_id" => "required|numeric"
        ));

        $order_id = $this->request->getPost('order_id');

        $view_data['model_info'] = $this->Orders_model->get_one($order_id);

        return $this->template->view('orders/discount_modal_form', $view_data);
    }

    /* save discount */

    function save_discount() {
        $this->access_only_allowed_members();

        $this->validate_submitted_data(array(
            "order_id" => "required|numeric",
            "discount_type" => "required",
            "discount_amount" => "numeric",
            "discount_amount_type" => "required"
        ));

        $order_id = $this->request->getPost('order_id');

        $data = array(
            "discount_type" => $this->request->getPost('discount_type'),
            "discount_amount" => $this->request->getPost('discount_amount'),
            "discount_amount_type" => $this->request->getPost('discount_amount_type')
        );

        $data = clean_data($data);

        $save_data = $this->Orders_model->ci_save($data, $order_id);
        if ($save_data) {
            echo json_encode(array("success" => true, "order_total_view" => $this->_get_order_total_view($order_id), 'message' => app_lang('record_saved'), "order_id" => $order_id));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    /* list of order items, prepared for datatable  */

    function item_list_data($order_id = 0) {
        validate_numeric_value($order_id);
        $this->access_only_allowed_members();

        $list_data = $this->Order_items_model->get_details(array("order_id" => $order_id))->getResult();
        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_order_item_row($data);
        }
        echo json_encode(array("data" => $result));
    }

    /* list of order of a specific client, prepared for datatable  */

    function order_list_data_of_client($client_id) {
        validate_numeric_value($client_id);
        $this->check_access_to_store();

        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("orders", $this->login_user->is_admin, $this->login_user->user_type);

        $options = array("client_id" => $client_id, "custom_fields" => $custom_fields, "custom_field_filter" => $this->prepare_custom_field_filter_values("orders", $this->login_user->is_admin, $this->login_user->user_type));

        $list_data = $this->Orders_model->get_details($options)->getResult();
        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_row($data, $custom_fields);
        }
        echo json_encode(array("data" => $result));
    }

    /* upload a file */

    function upload_file() {
        upload_file_to_temp();
    }

    /* check valid file for orders */

    function validate_orders_file() {
        return validate_post_file($this->request->getPost("file_name"));
    }

    function file_preview($id = "", $key = "") {
        if ($id) {
            validate_numeric_value($id);
            $order_info = $this->Orders_model->get_one($id);
            $files = unserialize($order_info->files);
            $file = get_array_value($files, $key);

            $file_name = get_array_value($file, "file_name");
            $file_id = get_array_value($file, "file_id");
            $service_type = get_array_value($file, "service_type");

            $view_data["file_url"] = get_source_url_of_file($file, get_setting("timeline_file_path"));
            $view_data["is_image_file"] = is_image_file($file_name);
            $view_data["is_iframe_preview_available"] = is_iframe_preview_available($file_name);
            $view_data["is_google_preview_available"] = is_google_preview_available($file_name);
            $view_data["is_viewable_video_file"] = is_viewable_video_file($file_name);
            $view_data["is_google_drive_file"] = ($file_id && $service_type == "google") ? true : false;
            $view_data["is_iframe_preview_available"] = is_iframe_preview_available($file_name);

            return $this->template->view("orders/file_preview", $view_data);
        } else {
            show_404();
        }
    }

    /* load order details view */

    function details($order_id = 0) {
        $this->access_only_allowed_members();

        if ($order_id) {
            validate_numeric_value($order_id);

            $view_data = get_order_making_data($order_id);
            $view_data["order_id"] = $order_id;

            return $this->template->view("orders/details", $view_data);
        } else {
            show_404();
        }
    }

    /* load tasks tab  */

    function tasks($order_id) {
        $this->access_only_allowed_members();

        $view_data["order_id"] = $order_id;
        $view_data["custom_field_headers_of_task"] = $this->Custom_fields_model->get_custom_field_headers_for_table("tasks", $this->login_user->is_admin, $this->login_user->user_type);

        return $this->template->view("orders/tasks/index", $view_data);
    }

    private function _get_clients_dropdown() {
        $clients_dropdown = array("" => "-");
        $clients = $this->Clients_model->get_dropdown_list(array("company_name"), "id", array("is_lead" => 0));
        foreach ($clients as $key => $value) {
            $clients_dropdown[$key] = $value;
        }
        return $clients_dropdown;
    }

    /* show invoices tab  */

    function invoices($order_id) {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }

        validate_numeric_value($order_id);
        $view_data["order_id"] = $order_id;
        $view_data["order_info"] = $this->Orders_model->get_details(array("id" => $order_id))->getRow();

        $view_data["custom_field_headers"] = $this->Custom_fields_model->get_custom_field_headers_for_table("orders", $this->login_user->is_admin, $this->login_user->user_type);
        $view_data["custom_field_filters"] = $this->Custom_fields_model->get_custom_field_filters("orders", $this->login_user->is_admin, $this->login_user->user_type);

        return $this->template->view("orders/order_invoice_lists", $view_data);
    }

    /* show invoice payment lists tab  */

    function invoice_payment_list($order_id) {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }

        validate_numeric_value($order_id);
        $view_data["order_id"] = $order_id;
        $view_data["order_info"] = $this->Orders_model->get_details(array("id" => $order_id))->getRow();

        return $this->template->view("orders/order_invoice_payment_list", $view_data);
    }

    function orders_summary() {
        app_redirect("forbidden");
        $this->access_only_allowed_members();

        $view_data["currencies_dropdown"] = $this->_get_currencies_dropdown(false);
        return $this->template->rander("orders/reports/orders_summary", $view_data);
    }

    function monthly_orders_summary() {
        app_redirect("forbidden");
        $this->access_only_allowed_members();

        $view_data["currencies_dropdown"] = $this->_get_currencies_dropdown(false);
        return $this->template->view("orders/reports/monthly_orders_summary", $view_data);
    }

    function custom_orders_summary() {
        app_redirect("forbidden");
        $this->access_only_allowed_members();

        $view_data["currencies_dropdown"] = $this->_get_currencies_dropdown(false);
        return $this->template->view("orders/reports/custom_orders_summary", $view_data);
    }

    function orders_summary_list_data() {
        app_redirect("forbidden");
        $this->access_only_allowed_members();

        $options = array(
            "currency" => $this->request->getPost("currency"),
            "start_date" => $this->request->getPost("start_date"),
            "end_date" => $this->request->getPost("end_date"),
        );

        $list_data = $this->Invoices_model->get_invoices_summary($options)->getResult();

        $default_currency_symbol = get_setting("currency_symbol");

        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_summary_row($data, $default_currency_symbol);
        }

        echo json_encode(array("data" => $result));
    }

    private function _make_summary_row($data, $default_currency_symbol) {

        $currency_symbol = $data->currency_symbol ? $data->currency_symbol : $default_currency_symbol;

        $row_data = array(
            anchor(get_uri("clients/view/" . $data->client_id), $data->client_name),
            $data->invoice_count,
            to_currency($data->invoice_total, $currency_symbol),
            to_currency($data->discount_total, $currency_symbol),
            to_currency($data->tax_total, $currency_symbol),
            to_currency($data->tax2_total, $currency_symbol)
        );

        return $row_data;
    }

    /* order total section */

    private function _get_order_total_view($order_id = 0) {
        if ($order_id) {
            $view_data["order_total_summary"] = $this->Orders_model->get_order_total_summary($order_id);
            $view_data["order_id"] = $order_id;
            return $this->template->view('orders/order_total_section', $view_data);
        }
    }

}

/* End of file orders.php */
/* Location: ./app/controllers/orders.php */