<?php

namespace App\Controllers;

use App\Libraries\Paypal;
use App\Libraries\Paytm;
use Config\Services;

class Invoices extends Security_Controller {

    function __construct() {
        parent::__construct();
        $this->init_permission_checker("invoice");
    }

    /* load invoice list view */

    function index($tab = "") {
        $this->check_module_availability("module_invoice");

        $view_data["custom_field_headers"] = $this->Custom_fields_model->get_custom_field_headers_for_table("invoices", $this->login_user->is_admin, $this->login_user->user_type);
        $view_data["custom_field_filters"] = $this->Custom_fields_model->get_custom_field_filters("invoices", $this->login_user->is_admin, $this->login_user->user_type);

        $view_data["can_edit_invoices"] = $this->can_edit_invoices();

        $type_suggestions = array(
            array("id" => "", "text" => "- " . app_lang('type') . " -"),
            array("id" => "invoice", "text" => app_lang("invoice")),
            array("id" => "credit_note", "text" => app_lang("credit_note"))
        );
        $view_data['types_dropdown'] = json_encode($type_suggestions);

        if ($this->login_user->user_type === "staff") {
            if (!$this->can_view_invoices()) {
                app_redirect("forbidden");
            }

            $view_data["currencies_dropdown"] = $this->_get_currencies_dropdown();
            $view_data["conversion_rate"] = $this->get_conversion_rate_with_currency_symbol();

            $view_data['tab'] = clean_data($tab);

            return $this->template->rander("invoices/index", $view_data);
        } else {
            $view_data["client_info"] = $this->Clients_model->get_one($this->login_user->client_id);
            $view_data['client_id'] = $this->login_user->client_id;
            $view_data['page_type'] = "full";
            return $this->template->rander("clients/invoices/index", $view_data);
        }
    }

    //load the yearly view of invoice list 
    function yearly() {
        return $this->template->view("invoices/yearly_invoices");
    }

    //load the recurring view of invoice list 
    function recurring() {
        $view_data["currencies_dropdown"] = $this->_get_currencies_dropdown();
        $view_data["can_edit_invoices"] = $this->can_edit_invoices();
        return $this->template->view("invoices/recurring_invoices_list", $view_data);
    }

    //load the custom view of invoice list 
    function custom() {
        return $this->template->view("invoices/custom_invoices_list");
    }

    /* load new invoice modal */

    function modal_form() {
        $invoice_id = $this->request->getPost('id');
        $is_clone = $this->request->getPost('is_clone');

        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        if (!$this->is_invoice_editable($invoice_id, $is_clone)) {
            app_redirect("forbidden");
        }

        $this->validate_submitted_data(array(
            "id" => "numeric",
            "client_id" => "numeric",
            "project_id" => "numeric"
        ));

        $client_id = $this->request->getPost('client_id');
        $project_id = $this->request->getPost('project_id');
        $model_info = $this->Invoices_model->get_one($invoice_id);

        //check if estimate_id/order_id/proposal_id/contract_id posted. if found, generate related information
        $estimate_id = $this->request->getPost('estimate_id');
        $contract_id = $this->request->getPost('contract_id');
        $proposal_id = $this->request->getPost('proposal_id');
        $order_id = $this->request->getPost('order_id');
        $view_data['estimate_id'] = $estimate_id;
        $view_data['contract_id'] = $contract_id;
        $view_data['proposal_id'] = $proposal_id;
        $view_data['order_id'] = $order_id;

        if ($estimate_id || $order_id || $proposal_id || $contract_id) {
            $info = null;
            if ($estimate_id) {
                $info = $this->Estimates_model->get_one($estimate_id);
            } else if ($order_id) {
                $info = $this->Orders_model->get_one($order_id);
            } else if ($contract_id) {
                $info = $this->Contracts_model->get_one($contract_id);
            } else if ($proposal_id) {
                $info = $this->Proposals_model->get_one($proposal_id);
            }

            if ($info) {
                $now = get_my_local_time("Y-m-d");
                $model_info->bill_date = $now;
                $model_info->due_date = $now;
                $model_info->client_id = $info->client_id;
                $model_info->tax_id = $info->tax_id;
                $model_info->tax_id2 = $info->tax_id2;
                $model_info->discount_amount = $info->discount_amount;
                $model_info->discount_amount_type = $info->discount_amount_type;
                $model_info->discount_type = $info->discount_type;
            }
        }

        //here has a project id. now set the client from the project
        if ($project_id) {
            $client_id = $this->Projects_model->get_one($project_id)->client_id;
            $model_info->client_id = $client_id;
        }


        $project_client_id = $client_id;
        if ($model_info->client_id) {
            $project_client_id = $model_info->client_id;
        }

        $view_data['model_info'] = $model_info;

        //make the drodown lists
        $view_data['taxes_dropdown'] = array("" => "-") + $this->Taxes_model->get_dropdown_list(array("title"));
        $view_data['clients_dropdown'] = array("" => "-") + $this->Clients_model->get_dropdown_list(array("company_name"), "id", array("is_lead" => 0));
        $projects = $this->Projects_model->get_dropdown_list(array("title"), "id", array("client_id" => $project_client_id, "project_type" => "client_project"));
        $suggestion = array(array("id" => "", "text" => "-"));
        foreach ($projects as $key => $value) {
            $suggestion[] = array("id" => $key, "text" => $value);
        }
        $view_data['projects_suggestion'] = $suggestion;

        $view_data['client_id'] = $client_id;
        $view_data['project_id'] = $project_id;

        //prepare label suggestions
        $view_data['label_suggestions'] = $this->make_labels_dropdown("invoice", $model_info->labels);

        //clone invoice
        $view_data['is_clone'] = $is_clone;

        $view_data["custom_fields"] = $this->Custom_fields_model->get_combined_details("invoices", $model_info->id, $this->login_user->is_admin, $this->login_user->user_type)->getResult();

        $view_data['companies_dropdown'] = $this->_get_companies_dropdown();
        if (!$model_info->company_id) {
            $view_data['model_info']->company_id = get_default_company_id();
        }

        return $this->template->view('invoices/modal_form', $view_data);
    }

    function recurring_modal_form() {

        $invoice_id = $this->request->getPost('id');

        $this->validate_submitted_data(array(
            "id" => "required|numeric"
        ));

        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        $model_info = $this->Invoices_model->get_one($invoice_id);

        $view_data["model_info"] = $model_info;

        return $this->template->view('invoices/recurring_modal_form', $view_data);
    }

    /* prepare project dropdown based on this suggestion */

    function get_project_suggestion($client_id = 0) {
        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        $projects = $this->Projects_model->get_dropdown_list(array("title"), "id", array("client_id" => $client_id, "project_type" => "client_project"));
        $suggestion = array(array("id" => "", "text" => "-"));
        foreach ($projects as $key => $value) {
            $suggestion[] = array("id" => $key, "text" => $value);
        }
        echo json_encode($suggestion);
    }

    /* add or edit an invoice */

    function save() {
        $id = $this->request->getPost('id');
        $is_clone = $this->request->getPost('is_clone');

        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        if (!$this->is_invoice_editable($id, $is_clone)) {
            app_redirect("forbidden");
        }

        $this->validate_submitted_data(array(
            "id" => "numeric",
            "invoice_client_id" => "required|numeric",
            "invoice_bill_date" => "required",
            "invoice_due_date" => "required"
        ));

        $client_id = $this->request->getPost('invoice_client_id');

        $target_path = get_setting("timeline_file_path");
        $files_data = move_files_from_temp_dir_to_permanent_dir($target_path, "invoice");
        $new_files = unserialize($files_data);

        $estimate_id = $this->request->getPost('estimate_id');

        $_invoice_data = array(
            "client_id" => $client_id,
            "project_id" => $this->request->getPost('invoice_project_id') ? $this->request->getPost('invoice_project_id') : 0,
            "bill_date" => $this->request->getPost('invoice_bill_date'),
            "due_date" => $this->request->getPost('invoice_due_date'),
            "tax_id" => $this->request->getPost('tax_id') ? $this->request->getPost('tax_id') : 0,
            "tax_id2" => $this->request->getPost('tax_id2') ? $this->request->getPost('tax_id2') : 0,
            "tax_id3" => $this->request->getPost('tax_id3') ? $this->request->getPost('tax_id3') : 0,
            "company_id" => $this->request->getPost('company_id') ? $this->request->getPost('company_id') : get_default_company_id(),
            "note" => $this->request->getPost('invoice_note'),
            "labels" => $this->request->getPost('labels'),
            "estimate_id" => $estimate_id ? $estimate_id : 0,
        );

        $invoice_data = array_merge($_invoice_data, $this->_get_recurring_data($id));

        if ($id) {
            $invoice_info = $this->Invoices_model->get_one($id);
            $timeline_file_path = get_setting("timeline_file_path");

            $new_files = update_saved_files($timeline_file_path, $invoice_info->files, $new_files);
        }

        $invoice_data["files"] = serialize($new_files);

        $contract_id = $this->request->getPost('contract_id');
        $proposal_id = $this->request->getPost('proposal_id');
        $order_id = $this->request->getPost('order_id');

        $main_invoice_id = "";
        if (($is_clone && $id) || $estimate_id || $order_id || $contract_id || $proposal_id) {
            if ($is_clone && $id) {
                $main_invoice_id = $id; //store main invoice id to get items later
                $id = ""; //one cloning invoice, save as new
            }

            // save discount when cloning and creating from estimate
            $invoice_data["discount_amount"] = $this->request->getPost('discount_amount') ? $this->request->getPost('discount_amount') : 0;
            $invoice_data["discount_amount_type"] = $this->request->getPost('discount_amount_type') ? $this->request->getPost('discount_amount_type') : "percentage";
            $invoice_data["discount_type"] = $this->request->getPost('discount_type') ? $this->request->getPost('discount_type') : "before_tax";

            $invoice_data["order_id"] = $order_id ? $order_id : 0;
        }

        $invoice_id = $this->Invoices_model->save_invoice_and_update_total($invoice_data, $id);
        if ($invoice_id) {

            if ($is_clone && $main_invoice_id) {
                //add invoice items

                save_custom_fields("invoices", $invoice_id, 1, "staff"); //we have to keep this regarding as an admin user because non-admin user also can acquire the access to clone a invoice

                $invoice_items = $this->Invoice_items_model->get_all_where(array("invoice_id" => $main_invoice_id, "deleted" => 0))->getResult();

                foreach ($invoice_items as $invoice_item) {
                    //prepare new invoice item data
                    $invoice_item_data = (array) $invoice_item;
                    unset($invoice_item_data["id"]);
                    $invoice_item_data['invoice_id'] = $invoice_id;

                    $invoice_item = $this->Invoice_items_model->ci_save($invoice_item_data);
                }
                $this->Invoices_model->update_invoice_total_meta($invoice_id);
            } else {
                save_custom_fields("invoices", $invoice_id, $this->login_user->is_admin, $this->login_user->user_type);
            }

            //submitted copy_items_from_estimate/copy_items_from_order/copy_items_from_proposal/copy_items_from_contract? copy all items from the associated one
            $copy_items_from_estimate = $this->request->getPost("copy_items_from_estimate");
            $copy_items_from_contract = $this->request->getPost("copy_items_from_contract");
            $copy_items_from_proposal = $this->request->getPost("copy_items_from_proposal");
            $copy_items_from_order = $this->request->getPost("copy_items_from_order");
            $this->_copy_related_items_to_invoice($copy_items_from_estimate, $copy_items_from_proposal, $copy_items_from_order, $copy_items_from_contract, $invoice_id);

            echo json_encode(array("success" => true, "data" => $this->_row_data($invoice_id), 'id' => $invoice_id, 'message' => app_lang('record_saved')));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    private function _get_recurring_data($invoice_id = 0) {
        $recurring = $this->request->getPost('recurring') ? 1 : 0;
        $bill_date = $this->request->getPost('invoice_bill_date');
        $repeat_every = $this->request->getPost('repeat_every');
        $repeat_type = $this->request->getPost('repeat_type');
        $no_of_cycles = $this->request->getPost('no_of_cycles');

        $invoice_data = array(
            "recurring" => $recurring,
            "repeat_every" => $repeat_every ? $repeat_every : 0,
            "repeat_type" => $repeat_type ? $repeat_type : NULL,
            "no_of_cycles" => $no_of_cycles ? $no_of_cycles : 0,
        );

        if (!$recurring) {
            return $invoice_data;
        }

        //set next recurring date for recurring invoices
        if ($invoice_id) {
            //update action

            $invoice_info = $this->Invoices_model->get_one($invoice_id);
            if (!$bill_date) {
                $bill_date = $invoice_info->bill_date;
                $invoice_data["bill_date"] = $bill_date;
            }



            if ($this->_has_difference_in_recurring_data($invoice_data, $invoice_info)) { //re-calculate the next recurring date, if any recurring fields has changed.
                $invoice_data['next_recurring_date'] = $this->_get_a_future_recurring_date($bill_date, $repeat_every, $repeat_type);
            }
        } else {
            //insert action
            $invoice_data['next_recurring_date'] = $this->_get_a_future_recurring_date($bill_date, $repeat_every, $repeat_type);
        }

        return $invoice_data;
    }

    private function _get_a_future_recurring_date($base_date, $repeat_every, $repeat_type) {
        //try up to 100 times to find a future recurring date. 
        //Ex. user selected a past bill date 01-01-2020. Repeat every 1 year. So, next recurring date will be 01-01-2021. That's also past. So, find a future date. 
        $next_recurring_date = $base_date;
        $today = get_today_date();

        $days_diff = get_date_difference_in_days($today, $base_date) + $repeat_every + 1; //max cycles could be. 

        for ($i = 1; $i <= $days_diff; $i++) {
            if ($next_recurring_date > $today) {
                continue;
            }
            $next_recurring_date = add_period_to_date($next_recurring_date, $repeat_every, $repeat_type);
        }
        return $next_recurring_date;
    }

    private function _has_difference_in_recurring_data($post_data, $existing_data) {
        $fields = array("recurring", "repeat_every", "repeat_type", "bill_date");
        $has_difference = false;
        foreach ($fields as $field) {
            $new_value = get_array_value($post_data, $field);
            if ($new_value != $existing_data->$field) {
                $has_difference = true;
            }
        }

        return $has_difference;
    }

    function save_recurring_info() {
        $id = $this->request->getPost('id');

        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        $this->validate_submitted_data(array(
            "id" => "required|numeric"
        ));

        $invoice_data = $this->_get_recurring_data($id);

        $invoice_id = $this->Invoices_model->ci_save($invoice_data, $id);
        if ($invoice_id) {
            echo json_encode(array("success" => true, "data" => $this->_row_data($invoice_id), 'id' => $invoice_id, 'message' => app_lang('record_saved')));
        }
    }

    private function _copy_related_items_to_invoice($copy_items_from_estimate, $copy_items_from_proposal, $copy_items_from_order, $copy_items_from_contract, $invoice_id) {
        if (!($copy_items_from_estimate || $copy_items_from_proposal || $copy_items_from_order || $copy_items_from_contract)) {
            return false;
        }

        $copy_items = null;
        if ($copy_items_from_estimate) {
            $copy_items = $this->Estimate_items_model->get_details(array("estimate_id" => $copy_items_from_estimate))->getResult();
        } else if ($copy_items_from_contract) {
            $copy_items = $this->Contract_items_model->get_details(array("contract_id" => $copy_items_from_contract))->getResult();
        } else if ($copy_items_from_proposal) {
            $copy_items = $this->Proposal_items_model->get_details(array("proposal_id" => $copy_items_from_proposal))->getResult();
        } else if ($copy_items_from_order) {
            $copy_items = $this->Order_items_model->get_details(array("order_id" => $copy_items_from_order))->getResult();
        }

        if (!$copy_items) {
            return false;
        }

        foreach ($copy_items as $data) {
            $invoice_item_data = array(
                "invoice_id" => $invoice_id,
                "title" => $data->title ? $data->title : "",
                "description" => $data->description ? $data->description : "",
                "quantity" => $data->quantity ? $data->quantity : 0,
                "unit_type" => $data->unit_type ? $data->unit_type : "",
                "rate" => $data->rate ? $data->rate : 0,
                "total" => $data->total ? $data->total : 0,
                "taxable" => 1
            );
            $this->Invoice_items_model->ci_save($invoice_item_data);
        }
        $this->Invoices_model->update_invoice_total_meta($invoice_id);
    }

    /* delete or undo an invoice */

    function delete() {
        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        $this->validate_submitted_data(array(
            "id" => "required|numeric"
        ));

        $id = $this->request->getPost('id');

        $invoice_info = $this->Invoices_model->get_one($id);

        if ($this->Invoices_model->delete($id)) {
            //delete the files
            $file_path = get_setting("timeline_file_path");
            if ($invoice_info->files) {
                $files = unserialize($invoice_info->files);

                foreach ($files as $file) {
                    delete_app_files($file_path, array($file));
                }
            }

            echo json_encode(array("success" => true, 'message' => app_lang('record_deleted')));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('record_cannot_be_deleted')));
        }
    }

    /* list of invoices, prepared for datatable  */

    function list_data() {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }

        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("invoices", $this->login_user->is_admin, $this->login_user->user_type);

        $options = array(
            "type" => $this->request->getPost("type"),
            "status" => $this->request->getPost("status"),
            "start_date" => $this->request->getPost("start_date"),
            "end_date" => $this->request->getPost("end_date"),
            "currency" => $this->request->getPost("currency"),
            "custom_fields" => $custom_fields,
            "custom_field_filter" => $this->prepare_custom_field_filter_values("invoices", $this->login_user->is_admin, $this->login_user->user_type)
        );

        $list_data = $this->Invoices_model->get_details($options)->getResult();
        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_row($data, $custom_fields);
        }

        echo json_encode(array("data" => $result));
    }

    /* list of invoice of a specific client, prepared for datatable  */

    function invoice_list_data_of_client($client_id) {
        if (!$this->can_view_invoices($client_id)) {
            app_redirect("forbidden");
        }

        validate_numeric_value($client_id);
        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("invoices", $this->login_user->is_admin, $this->login_user->user_type);

        $options = array(
            "client_id" => $client_id,
            "status" => $this->request->getPost("status"),
            "type" => $this->request->getPost("type"),
            "start_date" => $this->request->getPost("start_date"),
            "end_date" => $this->request->getPost("end_date"),
            "custom_fields" => $custom_fields,
            "custom_field_filter" => $this->prepare_custom_field_filter_values("invoices", $this->login_user->is_admin, $this->login_user->user_type)
        );

        //don't show draft invoices to client
        if ($this->login_user->user_type == "client") {
            $options["exclude_draft"] = true;
        }


        $list_data = $this->Invoices_model->get_details($options)->getResult();
        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_row($data, $custom_fields);
        }
        echo json_encode(array("data" => $result));
    }

    /* list of invoice of a specific subscription, prepared for datatable  */

    function invoice_list_data_of_subscription($subscription_id, $client_id = 0) {
        if (!$this->can_view_invoices($client_id)) {
            app_redirect("forbidden");
        }

        if (!$subscription_id) {
            show_404();
        }

        validate_numeric_value($subscription_id);
        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("invoices", $this->login_user->is_admin, $this->login_user->user_type);

        $options = array(
            "subscription_id" => $subscription_id,
            "status" => $this->request->getPost("status"),
            "custom_fields" => $custom_fields,
            "custom_field_filter" => $this->prepare_custom_field_filter_values("invoices", $this->login_user->is_admin, $this->login_user->user_type)
        );

        $list_data = $this->Invoices_model->get_details($options)->getResult();
        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_row($data, $custom_fields);
        }
        echo json_encode(array("data" => $result));
    }

    /* list of invoice of a specific project, prepared for datatable  */

    function invoice_list_data_of_project($project_id, $client_id = 0) {
        if (!$this->can_view_invoices($client_id)) {
            app_redirect("forbidden");
        }

        validate_numeric_value($project_id);
        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("invoices", $this->login_user->is_admin, $this->login_user->user_type);

        $options = array(
            "project_id" => $project_id,
            "status" => $this->request->getPost("status"),
            "custom_fields" => $custom_fields,
            "custom_field_filter" => $this->prepare_custom_field_filter_values("invoices", $this->login_user->is_admin, $this->login_user->user_type)
        );

        //don't show draft invoices to client
        if ($this->login_user->user_type == "client") {
            $options["exclude_draft"] = true;
        }

        $list_data = $this->Invoices_model->get_details($options)->getResult();
        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_row($data, $custom_fields);
        }
        echo json_encode(array("data" => $result));
    }

    /* show sub invoices tab  */

    function sub_invoices($recurring_invoice_id) {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }
        validate_numeric_value($recurring_invoice_id);
        $view_data["recurring_invoice_id"] = $recurring_invoice_id;
        return $this->template->view("invoices/sub_invoices", $view_data);
    }

    /* list of sub invoices of a recurring invoice, prepared for datatable  */

    function sub_invoices_list_data($recurring_invoice_id) {
        validate_numeric_value($recurring_invoice_id);
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }

        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("invoices", $this->login_user->is_admin, $this->login_user->user_type);

        $options = array(
            "status" => $this->request->getPost("status"),
            "start_date" => $this->request->getPost("start_date"),
            "end_date" => $this->request->getPost("end_date"),
            "custom_fields" => $custom_fields,
            "recurring_invoice_id" => $recurring_invoice_id
        );

        $list_data = $this->Invoices_model->get_details($options)->getResult();

        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_row($data, $custom_fields);
        }

        echo json_encode(array("data" => $result));
    }

    /* return a row of invoice list table */

    private function _row_data($id) {
        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("invoices", $this->login_user->is_admin, $this->login_user->user_type);

        $options = array("id" => $id, "custom_fields" => $custom_fields);
        $data = $this->Invoices_model->get_details($options)->getRow();
        return $this->_make_row($data, $custom_fields);
    }

    /* prepare a row of invoice list table */

    private function _make_row($data, $custom_fields) {
        $invoice_url = "";
        $main_invoice_url = "";
        $credit_note_url = "";

        if ($this->login_user->user_type == "staff") {
            $link_class = "";
            if ($data->main_invoice_id) {
                $main_invoice_url = anchor(get_uri("invoices/view/" . $data->main_invoice_id), "<i data-feather='file-text' class='icon-18'></i>", array("title" => app_lang("main_invoice"), "class" => "ml10"));
                $link_class = "text-danger";
            } else if ($data->credit_note_id) {
                $credit_note_url = anchor(get_uri("invoices/view/" . $data->credit_note_id), "<i data-feather='file-minus' class='icon-18'></i>", array("title" => app_lang("credit_note"), "class" => "ml10"));
            }

            $invoice_url = anchor(get_uri("invoices/view/" . $data->id), get_invoice_id($data->id), array("class" => $link_class)) . $main_invoice_url . $credit_note_url;
        } else {
            $link_class = "";
            if ($data->main_invoice_id) {
                $main_invoice_url = anchor(get_uri("invoices/preview/" . $data->main_invoice_id), "<i data-feather='file-text' class='icon-18'></i>", array("title" => app_lang("main_invoice"), "class" => "ml10"));
                $link_class = "text-danger";
            } else if ($data->credit_note_id) {
                $credit_note_url = anchor(get_uri("invoices/preview/" . $data->credit_note_id), "<i data-feather='file-minus' class='icon-18'></i>", array("title" => app_lang("credit_note"), "class" => "ml10"));
            }

            $invoice_url = anchor(get_uri("invoices/preview/" . $data->id), get_invoice_id($data->id), array("class" => $link_class)) . $main_invoice_url . $credit_note_url;
        }

        $status = "-";
        if ($data->type == "invoice") {
            $status = $this->_get_invoice_status_label($data);
        }

        $invoice_labels = " " . make_labels_view_data($data->labels_list, true, true);

        if ($data->main_invoice_id) {
            $due = to_currency(0, $data->currency_symbol);
            $due_date = "-";
        } else {
            $due = to_currency($data->invoice_value - $data->payment_received, $data->currency_symbol);
            $due_date = format_to_date($data->due_date, false);
        }

        if ($data->credit_note_id) {
            if ($data->payment_received) {
                $due = to_currency(($data->payment_received) * (-1), $data->currency_symbol);
            } else {
                $due = to_currency(0, $data->currency_symbol);
            }
        }

        $row_data = array(
            $data->id,
            $invoice_url,
            anchor(get_uri("clients/view/" . $data->client_id), $data->company_name),
            $data->project_title ? anchor(get_uri("projects/view/" . $data->project_id), $data->project_title) : "-",
            $data->bill_date,
            format_to_date($data->bill_date, false),
            $data->due_date,
            $due_date,
            to_currency($data->invoice_value, $data->currency_symbol),
            to_currency($data->payment_received, $data->currency_symbol),
            $due,
            $status . $invoice_labels
        );

        foreach ($custom_fields as $field) {
            $cf_id = "cfv_" . $field->id;
            $row_data[] = $this->template->view("custom_fields/output_" . $field->field_type, array("value" => $data->$cf_id));
        }

        if ($data->status == "credited") {
            $row_data[] = "<span class='p15 inline-block'></span>";
        } else {
            $row_data[] = $this->_make_options_dropdown($data);
        }

        return $row_data;
    }

    //prepare options dropdown for invoices list
    private function _make_options_dropdown($data) {
        $edit = '';

        $edit_url = "invoices/modal_form";
        if (get_setting("enable_invoice_lock_state") && !$this->is_invoice_editable($data)) {
            $edit_url = "invoices/recurring_modal_form";
        }

        $edit = '<li role="presentation">' . modal_anchor(get_uri($edit_url), "<i data-feather='edit' class='icon-16'></i> " . app_lang('edit'), array("title" => app_lang('edit_invoice'), "data-post-id" => $data->id, "class" => "dropdown-item")) . '</li>';

        $delete = '<li role="presentation">' . js_anchor("<i data-feather='x' class='icon-16'></i>" . app_lang('delete'), array('title' => app_lang('delete_invoice'), "class" => "delete dropdown-item", "data-id" => $data->id, "data-action-url" => get_uri("invoices/delete"), "data-action" => "delete-confirmation")) . '</li>';

        $add_payment = '<li role="presentation">' . modal_anchor(get_uri("invoice_payments/payment_modal_form"), "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_payment'), array("title" => app_lang('add_payment'), "data-post-invoice_id" => $data->id, "class" => "dropdown-item")) . '</li>';

        return '
                <span class="dropdown inline-block">
                    <button class="btn btn-default dropdown-toggle caret mt0 mb0" type="button" data-bs-toggle="dropdown" aria-expanded="true" data-bs-display="static">
                        <i data-feather="tool" class="icon-16"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" role="menu">' . $edit . $delete . $add_payment . '</ul>
                </span>';
    }

    //prepare invoice status label 
    private function _get_invoice_status_label($data, $return_html = true) {
        return get_invoice_status_label($data, $return_html);
    }

    // list of recurring invoices, prepared for datatable
    function recurring_list_data() {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }


        $options = array(
            "recurring" => 1,
            "next_recurring_start_date" => $this->request->getPost("next_recurring_start_date"),
            "next_recurring_end_date" => $this->request->getPost("next_recurring_end_date"),
            "currency" => $this->request->getPost("currency")
        );

        $list_data = $this->Invoices_model->get_details($options)->getResult();
        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_recurring_row($data);
        }

        echo json_encode(array("data" => $result));
    }

    /* prepare a row of recurring invoice list table */

    private function _make_recurring_row($data) {

        $invoice_url = anchor(get_uri("invoices/view/" . $data->id), get_invoice_id($data->id));

        $cycles = $data->no_of_cycles_completed . "/" . $data->no_of_cycles;
        if (!$data->no_of_cycles) { //if not no of cycles, so it's infinity
            $cycles = $data->no_of_cycles_completed . "/&#8734;";
        }

        $status = "active";
        $invoice_status_class = "bg-success";
        $cycle_class = "";

        //don't show next recurring if recurring is completed
        $next_recurring = format_to_date($data->next_recurring_date, false);

        //show red color if any recurring date is past
        if ($data->next_recurring_date < get_today_date()) {
            $next_recurring = "<span class='text-danger'>" . $next_recurring . "</span>";
        }


        $next_recurring_date = $data->next_recurring_date;
        if ($data->no_of_cycles_completed > 0 && $data->no_of_cycles_completed == $data->no_of_cycles) {
            $next_recurring = "-";
            $next_recurring_date = 0;
            $status = "stopped";
            $invoice_status_class = "bg-danger";
            $cycle_class = "text-danger";
        }

        $repeat_type_list = array("days" => 1, "weeks" => 7, "months" => 30, "years" => 365);
        $repeat_every = $data->repeat_every * get_array_value($repeat_type_list, $data->repeat_type);

        return array(
            $data->id,
            $invoice_url,
            anchor(get_uri("clients/view/" . $data->client_id), $data->company_name),
            $data->project_title ? anchor(get_uri("projects/view/" . $data->project_id), $data->project_title) : "-",
            $next_recurring_date,
            $next_recurring,
            $repeat_every,
            $data->repeat_every . " " . app_lang("interval_" . $data->repeat_type),
            "<span class='$cycle_class'>" . $cycles . "</span>",
            "<span class='badge $invoice_status_class large'>" . app_lang($status) . "</span>",
            to_currency($data->invoice_value, $data->currency_symbol),
            $this->_make_options_dropdown($data)
        );
    }

    /* load invoice details view */

    function view($invoice_id = 0) {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }

        if ($invoice_id) {
            validate_numeric_value($invoice_id);
            $view_data = get_invoice_making_data($invoice_id);

            if ($view_data) {
                $view_data['invoice_status'] = $this->_get_invoice_status_label($view_data["invoice_info"], false);
                $view_data["can_edit_invoices"] = $this->can_edit_invoices();
                $view_data["is_invoice_editable"] = $this->is_invoice_editable($invoice_id);
                return $this->template->rander("invoices/view", $view_data);
            } else {
                show_404();
            }
        }
    }

    /* invoice total section */

    private function _get_invoice_total_view($invoice_id = 0) {
        $view_data["invoice_total_summary"] = $this->Invoices_model->get_invoice_total_summary($invoice_id);
        $view_data["invoice_id"] = $invoice_id;
        $can_edit_invoices = false;
        if ($this->can_edit_invoices() && $this->is_invoice_editable($invoice_id)) {
            $can_edit_invoices = true;
        }
        $view_data["can_edit_invoices"] = $can_edit_invoices;
        return $this->template->view('invoices/invoice_total_section', $view_data);
    }

    /* load item modal */

    function item_modal_form() {
        $invoice_id = $this->request->getPost('invoice_id');

        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        if (!$this->is_invoice_editable($invoice_id)) {
            app_redirect("forbidden");
        }

        $this->validate_submitted_data(array(
            "id" => "numeric"
        ));

        $view_data['model_info'] = $this->Invoice_items_model->get_one($this->request->getPost('id'));
        if (!$invoice_id) {
            $invoice_id = $view_data['model_info']->invoice_id;
        }
        $view_data['invoice_id'] = $invoice_id;
        return $this->template->view('invoices/item_modal_form', $view_data);
    }

    /* add or edit an invoice item */

    function save_item() {
        $this->validate_submitted_data(array(
            "id" => "numeric",
            "invoice_id" => "required|numeric"
        ));

        $invoice_id = $this->request->getPost('invoice_id');

        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        if (!$this->is_invoice_editable($invoice_id)) {
            app_redirect("forbidden");
        }

        $id = $this->request->getPost('id');
        $rate = unformat_currency($this->request->getPost('invoice_item_rate'));
        $quantity = unformat_currency($this->request->getPost('invoice_item_quantity'));
        $invoice_item_title = $this->request->getPost('invoice_item_title');
        $item_id = 0;

        if (!$id) {
            //on adding item for the first time, get the id to store
            $item_id = $this->request->getPost('item_id');
        }

        //check if the add_new_item flag is on, if so, add the item to libary. 
        $add_new_item_to_library = $this->request->getPost('add_new_item_to_library');
        if ($add_new_item_to_library) {
            $library_item_data = array(
                "title" => $invoice_item_title,
                "description" => $this->request->getPost('invoice_item_description'),
                "unit_type" => $this->request->getPost('invoice_unit_type'),
                "rate" => unformat_currency($this->request->getPost('invoice_item_rate')),
                "taxable" => $this->request->getPost('taxable') ? $this->request->getPost('taxable') : ""
            );
            $item_id = $this->Items_model->ci_save($library_item_data);
        }

        $invoice_item_data = array(
            "invoice_id" => $invoice_id,
            "title" => $this->request->getPost('invoice_item_title'),
            "description" => $this->request->getPost('invoice_item_description'),
            "quantity" => $quantity,
            "unit_type" => $this->request->getPost('invoice_unit_type'),
            "rate" => unformat_currency($this->request->getPost('invoice_item_rate')),
            "total" => $rate * $quantity,
            "taxable" => $this->request->getPost('taxable') ? $this->request->getPost('taxable') : ""
        );

        if ($item_id) {
            $invoice_item_data["item_id"] = $item_id;
        }

        $invoice_item_id = $this->Invoice_items_model->save_item_and_update_invoice($invoice_item_data, $id, $invoice_id);
        if ($invoice_item_id) {
            $options = array("id" => $invoice_item_id);
            $item_info = $this->Invoice_items_model->get_details($options)->getRow();
            echo json_encode(array("success" => true, "invoice_id" => $item_info->invoice_id, "data" => $this->_make_item_row($item_info, true), "invoice_total_view" => $this->_get_invoice_total_view($item_info->invoice_id), 'id' => $invoice_item_id, 'message' => app_lang('record_saved')));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    /* delete or undo an invoice item */

    function delete_item() {
        $this->validate_submitted_data(array(
            "id" => "required|numeric"
        ));

        $id = $this->request->getPost('id');
        $item_info = $this->Invoice_items_model->get_one($id);

        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        if (!$this->is_invoice_editable($item_info->invoice_id)) {
            app_redirect("forbidden");
        }

        if ($this->request->getPost('undo')) {
            if ($this->Invoice_items_model->delete_item_and_update_invoice($id, true)) {
                $options = array("id" => $id);
                $item_info = $this->Invoice_items_model->get_details($options)->getRow();
                echo json_encode(array("success" => true, "invoice_id" => $item_info->invoice_id, "data" => $this->_make_item_row($item_info, true), "invoice_total_view" => $this->_get_invoice_total_view($item_info->invoice_id), "message" => app_lang('record_undone')));
            } else {
                echo json_encode(array("success" => false, app_lang('error_occurred')));
            }
        } else {
            if ($this->Invoice_items_model->delete_item_and_update_invoice($id)) {
                $item_info = $this->Invoice_items_model->get_one($id);
                echo json_encode(array("success" => true, "invoice_id" => $item_info->invoice_id, "invoice_total_view" => $this->_get_invoice_total_view($item_info->invoice_id), 'message' => app_lang('record_deleted')));
            } else {
                echo json_encode(array("success" => false, 'message' => app_lang('record_cannot_be_deleted')));
            }
        }
    }

    /* list of invoice items, prepared for datatable  */

    function item_list_data($invoice_id = 0) {
        validate_numeric_value($invoice_id);

        if (!($invoice_id && $this->can_view_invoices())) {
            app_redirect("forbidden");
        }

        $list_data = $this->Invoice_items_model->get_details(array("invoice_id" => $invoice_id))->getResult();

        $is_ediable = false;
        if ($this->can_edit_invoices() && $this->is_invoice_editable($invoice_id)) {
            $is_ediable = true;
        }

        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_item_row($data, $is_ediable);
        }
        echo json_encode(array("data" => $result));
    }

    /* prepare a row of invoice item list table */

    private function _make_item_row($data, $is_ediable) {
        $move_icon = "";
        $desc_style = "";
        if ($is_ediable) {
            $move_icon = "<div class='float-start move-icon'><i data-feather='menu' class='icon-16'></i></div>";
            $desc_style = "style='margin-left:25px'";
        }
        $item = "<div class='item-row strong mb5' data-id='$data->id'>$move_icon $data->title</div>";
        if ($data->description) {
            $item .= "<span class='text-wrap' $desc_style>" . nl2br($data->description) . "</span>";
        }
        $type = $data->unit_type ? $data->unit_type : "";

        $taxable = app_lang("no");
        if ($data->taxable) {
            $taxable = app_lang("yes");
        }

        return array(
            $data->sort,
            $item,
            to_decimal_format($data->quantity) . " " . $type,
            to_currency($data->rate, $data->currency_symbol),
            $taxable,
            to_currency($data->total, $data->currency_symbol),
            modal_anchor(get_uri("invoices/item_modal_form"), "<i data-feather='edit' class='icon-16'></i>", array("class" => "edit", "title" => app_lang('edit_invoice'), "data-post-id" => $data->id, "data-post-invoice_id" => $data->invoice_id))
            . js_anchor("<i data-feather='x' class='icon-16'></i>", array('title' => app_lang('delete'), "class" => "delete", "data-id" => $data->id, "data-action-url" => get_uri("invoices/delete_item"), "data-action" => "delete"))
        );
    }

    //update the sort value for the item
    function update_item_sort_values($id = 0) {
        validate_numeric_value($id);
        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        $sort_values = $this->request->getPost("sort_values");
        if ($sort_values) {

            //extract the values from the comma separated string
            $sort_array = explode(",", $sort_values);

            //update the value in db
            foreach ($sort_array as $value) {
                $sort_item = explode("-", $value); //extract id and sort value

                $id = get_array_value($sort_item, 0);
                $sort = get_array_value($sort_item, 1);

                $data = array("sort" => $sort);
                $this->Invoice_items_model->ci_save($data, $id);
            }
        }
    }

    /* prepare suggestion of invoice item */

    function get_invoice_item_suggestion() {
        $key = $this->request->getPost("q");
        $suggestion = array();

        $items = $this->Invoice_items_model->get_item_suggestion($key);

        foreach ($items as $item) {
            $suggestion[] = array("id" => $item->id, "text" => $item->title);
        }

        $suggestion[] = array("id" => "+", "text" => "+ " . app_lang("create_new_item"));

        echo json_encode($suggestion);
    }

    function get_invoice_item_info_suggestion() {
        $item = $this->Invoice_items_model->get_item_info_suggestion(array("item_id" => $this->request->getPost("item_id")));
        if ($item) {
            $item->rate = $item->rate ? to_decimal_format($item->rate) : "";
            echo json_encode(array("success" => true, "item_info" => $item));
        } else {
            echo json_encode(array("success" => false));
        }
    }

    //view html is accessable to client only.
    function preview($invoice_id = 0, $show_close_preview = false) {
        if ($invoice_id) {
            validate_numeric_value($invoice_id);
            $view_data = get_invoice_making_data($invoice_id);

            $this->_check_invoice_access_permission($view_data);

            $view_data['invoice_preview'] = prepare_invoice_pdf($view_data, "html");

            //show a back button
            $view_data['show_close_preview'] = $show_close_preview && $this->login_user->user_type === "staff" ? true : false;

            $view_data['invoice_id'] = $invoice_id;
            $view_data['payment_methods'] = $this->Payment_methods_model->get_available_online_payment_methods();

            $paytm = new Paytm();
            $view_data['paytm_url'] = $paytm->get_paytm_url();

            return $this->template->rander("invoices/invoice_preview", $view_data);
        } else {
            show_404();
        }
    }

    //print invoice
    function print_invoice($invoice_id = 0) {
        if ($invoice_id) {
            validate_numeric_value($invoice_id);
            $view_data = get_invoice_making_data($invoice_id);

            $this->_check_invoice_access_permission($view_data);

            $view_data['invoice_preview'] = prepare_invoice_pdf($view_data, "html");

            echo json_encode(array("success" => true, "print_view" => $this->template->view("invoices/print_invoice", $view_data)));
        } else {
            echo json_encode(array("success" => false, app_lang('error_occurred')));
        }
    }

    function download_pdf($invoice_id = 0, $mode = "download", $user_language = "") {
        if ($invoice_id) {
            validate_numeric_value($invoice_id);
            $invoice_data = get_invoice_making_data($invoice_id);
            $this->_check_invoice_access_permission($invoice_data);

            if ($user_language) {
                $language = Services::language();

                $active_locale = $language->getLocale();

                if ($user_language && $user_language !== $active_locale) {
                    $language->setLocale($user_language);
                }

                prepare_invoice_pdf($invoice_data, $mode);

                if ($user_language && $user_language !== $active_locale) {
                    // Reset to active locale
                    $language->setLocale($active_locale);
                }
            } else {
                prepare_invoice_pdf($invoice_data, $mode);
            }
        } else {
            show_404();
        }
    }

    private function _check_invoice_access_permission($invoice_data) {
        //check for valid invoice
        if (!$invoice_data) {
            show_404();
        }

        //check for security
        $invoice_info = get_array_value($invoice_data, "invoice_info");
        if ($this->login_user->user_type == "client") {
            if ($this->login_user->client_id != $invoice_info->client_id) {
                app_redirect("forbidden");
            }
        } else {
            if (!$this->can_view_invoices()) {
                app_redirect("forbidden");
            }
        }
    }

    function send_invoice_modal_form($invoice_id) {
        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        if ($invoice_id) {
            validate_numeric_value($invoice_id);
            $options = array("id" => $invoice_id);
            $invoice_info = $this->Invoices_model->get_details($options)->getRow();
            $view_data['invoice_info'] = $invoice_info;

            $contacts_options = array("user_type" => "client", "client_id" => $invoice_info->client_id);
            $contacts = $this->Users_model->get_details($contacts_options)->getResult();

            $primary_contact_info = "";
            $contacts_dropdown = array();
            foreach ($contacts as $contact) {
                if ($contact->is_primary_contact) {
                    $primary_contact_info = $contact;
                    $contacts_dropdown[$contact->id] = $contact->first_name . " " . $contact->last_name . " (" . app_lang("primary_contact") . ")";
                }
            }

            $cc_contacts_dropdown = array();

            foreach ($contacts as $contact) {
                if (!$contact->is_primary_contact) {
                    $contacts_dropdown[$contact->id] = $contact->first_name . " " . $contact->last_name;
                }

                $cc_contacts_dropdown[] = array("id" => $contact->id, "text" => $contact->first_name . " " . $contact->last_name);
            }

            $view_data['contacts_dropdown'] = $contacts_dropdown;
            $view_data['cc_contacts_dropdown'] = $cc_contacts_dropdown;

            $template_data = $this->get_send_invoice_template($invoice_id, 0, "", $invoice_info, $primary_contact_info);
            $view_data['message'] = get_array_value($template_data, "message");
            $view_data['subject'] = get_array_value($template_data, "subject");
            $view_data['user_language'] = get_array_value($template_data, "user_language");

            return $this->template->view('invoices/send_invoice_modal_form', $view_data);
        } else {
            show_404();
        }
    }

    function get_send_invoice_template($invoice_id = 0, $contact_id = 0, $return_type = "", $invoice_info = "", $contact_info = "") {
        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        validate_numeric_value($invoice_id);
        validate_numeric_value($contact_id);

        if (!$invoice_info) {
            $options = array("id" => $invoice_id);
            $invoice_info = $this->Invoices_model->get_details($options)->getRow();
        }

        if (!$contact_info) {
            $contact_info = $this->Users_model->get_one($contact_id);
        }

        $contact_language = $contact_info->language;

        if ($invoice_info->main_invoice_id) {
            $email_template = $this->Email_templates_model->get_final_template("send_credit_note", true);

            $parser_data["CREDIT_NOTE_FULL_ID"] = get_invoice_id($invoice_info->id);
            $parser_data["CREDIT_NOTE_ID"] = $invoice_info->id;
            $parser_data["INVOICE_ID"] = $invoice_info->main_invoice_id;
            $parser_data["CREDIT_NOTE_URL"] = get_uri("invoices/preview/" . $invoice_info->id);
            $parser_data["INVOICE_FULL_ID"] = get_invoice_id($invoice_info->main_invoice_id);
        } else {
            $email_template = $this->Email_templates_model->get_final_template("send_invoice", true);

            $invoice_total_summary = $this->Invoices_model->get_invoice_total_summary($invoice_id);

            $parser_data["INVOICE_FULL_ID"] = get_invoice_id($invoice_info->id);
            $parser_data["INVOICE_ID"] = $invoice_info->id;
            $parser_data["BALANCE_DUE"] = to_currency($invoice_total_summary->balance_due, $invoice_total_summary->currency_symbol);
            $parser_data["DUE_DATE"] = format_to_date($invoice_info->due_date, false);
            $parser_data["INVOICE_URL"] = get_uri("invoices/preview/" . $invoice_info->id);
        }

        $parser_data["CONTACT_FIRST_NAME"] = $contact_info->first_name;
        $parser_data["CONTACT_LAST_NAME"] = $contact_info->last_name;
        $parser_data["PROJECT_TITLE"] = $invoice_info->project_title;
        $parser_data["SIGNATURE"] = get_array_value($email_template, "signature_$contact_language") ? get_array_value($email_template, "signature_$contact_language") : get_array_value($email_template, "signature_default");
        $parser_data["LOGO_URL"] = get_logo_url();
        $parser_data["RECIPIENTS_EMAIL_ADDRESS"] = $contact_info->email;

        $parser = \Config\Services::parser();

        $message = get_array_value($email_template, "message_$contact_language") ? get_array_value($email_template, "message_$contact_language") : get_array_value($email_template, "message_default");
        $subject = get_array_value($email_template, "subject_$contact_language") ? get_array_value($email_template, "subject_$contact_language") : get_array_value($email_template, "subject_default");

        //add public pay invoice url 
        if (get_setting("client_can_pay_invoice_without_login") && strpos($message, "PUBLIC_PAY_INVOICE_URL")) {
            $verification_data = array(
                "type" => "invoice_payment",
                "code" => make_random_string(),
                "params" => serialize(array(
                    "invoice_id" => $invoice_id,
                    "client_id" => $contact_info->client_id,
                    "contact_id" => $contact_info->id
                ))
            );

            $save_id = $this->Verification_model->ci_save($verification_data);

            $verification_info = $this->Verification_model->get_one($save_id);

            $parser_data["PUBLIC_PAY_INVOICE_URL"] = get_uri("pay_invoice/index/" . $verification_info->code);
        }

        $message = $parser->setData($parser_data)->renderString($message);
        $subject = $parser->setData($parser_data)->renderString($subject);
        $message = htmlspecialchars_decode($message);
        $subject = htmlspecialchars_decode($subject);

        if ($return_type == "json") {
            echo json_encode(array("success" => true, "message_view" => $message, "user_language" => $contact_language));
        } else {
            return array(
                "message" => $message,
                "subject" => $subject,
                "user_language" => $contact_language
            );
        }
    }

    function send_invoice() {
        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        $this->validate_submitted_data(array(
            "id" => "required|numeric"
        ));

        $invoice_id = $this->request->getPost('id');

        $contact_id = $this->request->getPost('contact_id');

        $cc_array = array();
        $cc = $this->request->getPost('invoice_cc');

        if ($cc) {
            $cc = explode(',', $cc);

            foreach ($cc as $cc_value) {
                if (is_numeric($cc_value)) {
                    //selected a client contact
                    array_push($cc_array, $this->Users_model->get_one($cc_value)->email);
                } else {
                    //inputted an email address
                    array_push($cc_array, $cc_value);
                }
            }
        }

        $custom_bcc = $this->request->getPost('invoice_bcc');
        $subject = $this->request->getPost('subject');
        $message = decode_ajax_post_data($this->request->getPost('message'));

        $contact = $this->Users_model->get_one($contact_id);

        $invoice_data = get_invoice_making_data($invoice_id);

        //send pdf user language wise
        $language = Services::language();
        $user_language = $this->request->getPost('user_language');

        $active_locale = $language->getLocale();

        if ($user_language && $user_language !== $active_locale) {
            $language->setLocale($user_language);
        }

        $attachement_url = prepare_invoice_pdf($invoice_data, "send_email");

        if ($user_language && $user_language !== $active_locale) {
            // Reset to active locale
            $language->setLocale($active_locale);
        }

        $default_bcc = get_setting('send_bcc_to'); //get default settings
        $bcc_emails = "";

        if ($default_bcc && $custom_bcc) {
            $bcc_emails = $default_bcc . "," . $custom_bcc;
        } else if ($default_bcc) {
            $bcc_emails = $default_bcc;
        } else if ($custom_bcc) {
            $bcc_emails = $custom_bcc;
        }

        //add uploaded files
        $target_path = get_setting("timeline_file_path");
        $files_data = move_files_from_temp_dir_to_permanent_dir($target_path, "invoice");
        $attachments = prepare_attachment_of_files(get_setting("timeline_file_path"), $files_data);

        //add invoice pdf
        array_unshift($attachments, array("file_path" => $attachement_url));

        if (send_app_mail($contact->email, $subject, $message, array("attachments" => $attachments, "cc" => $cc_array, "bcc" => $bcc_emails))) {
            // change email status
            // invoice status won't change if status is credited
            if (get_array_value($invoice_data, "invoice_info")->status == "credited") {
                $status_data = array("last_email_sent_date" => get_my_local_time());
            } else {
                $status_data = array("status" => "not_paid", "last_email_sent_date" => get_my_local_time());
            }

            if ($this->Invoices_model->ci_save($status_data, $invoice_id)) {
                echo json_encode(array('success' => true, 'message' => app_lang("invoice_sent_message"), "invoice_id" => $invoice_id));
            }

            // delete the temp invoice
            if (file_exists($attachement_url)) {
                unlink($attachement_url);
            }

            //delete attachments
            if ($files_data) {
                $files = unserialize($files_data);
                foreach ($files as $file) {
                    delete_app_files($target_path, array($file));
                }
            }
        } else {
            echo json_encode(array('success' => false, 'message' => app_lang('error_occurred')));
        }
    }

    function get_invoice_status_bar($invoice_id = 0) {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }

        validate_numeric_value($invoice_id);
        $view_data["invoice_info"] = $this->Invoices_model->get_details(array("id" => $invoice_id))->getRow();
        $view_data['invoice_status_label'] = $this->_get_invoice_status_label($view_data["invoice_info"]);
        return $this->template->view('invoices/invoice_status_bar', $view_data);
    }

    function update_invoice_status($invoice_id = 0, $status = "") {
        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        validate_numeric_value($invoice_id);
        if ($invoice_id && $status) {
            //change the draft status of the invoice
            $this->Invoices_model->update_invoice_status($invoice_id, $status);

            //save extra information for cancellation
            if ($status == "cancelled") {
                $data = array(
                    "cancelled_at" => get_current_utc_time(),
                    "cancelled_by" => $this->login_user->id
                );

                $this->Invoices_model->ci_save($data, $invoice_id);
            }

            echo json_encode(array("success" => true, 'message' => app_lang('record_saved')));
        }

        return "";
    }

    /* load discount modal */

    function discount_modal_form() {
        $this->validate_submitted_data(array(
            "invoice_id" => "required|numeric"
        ));

        $invoice_id = $this->request->getPost('invoice_id');

        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        if (!$this->is_invoice_editable($invoice_id)) {
            app_redirect("forbidden");
        }

        $view_data['model_info'] = $this->Invoices_model->get_one($invoice_id);

        return $this->template->view('invoices/discount_modal_form', $view_data);
    }

    /* save discount */

    function save_discount() {
        $this->validate_submitted_data(array(
            "invoice_id" => "required|numeric",
            "discount_type" => "required",
            "discount_amount" => "numeric",
            "discount_amount_type" => "required"
        ));

        $invoice_id = $this->request->getPost('invoice_id');

        $discount_type = $this->request->getPost('discount_type');
        $discount_amount_type = $this->request->getPost('discount_amount_type');

        if ($discount_type == "before_tax" && $discount_amount_type == "fixed_amount") {
            echo json_encode(array("success" => false, 'message' => app_lang('fixed_amount_discount_before_tax_error_message')));
            return false;
        }

        if (!($this->can_edit_invoices() && $this->is_invoice_editable($invoice_id))) {
            app_redirect("forbidden");
        }

        $data = array(
            "discount_type" => $discount_type,
            "discount_amount" => $this->request->getPost('discount_amount'),
            "discount_amount_type" => $discount_amount_type
        );

        $data = clean_data($data);

        $save_data = $this->Invoices_model->save_invoice_and_update_total($data, $invoice_id);
        if ($save_data) {
            echo json_encode(array("success" => true, "invoice_total_view" => $this->_get_invoice_total_view($invoice_id), 'message' => app_lang('record_saved'), "invoice_id" => $invoice_id));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    function load_statistics_of_selected_currency($currency = "", $currency_symbol = "") {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }

        if ($currency) {
            $statistics = invoice_statistics_widget(array("currency" => $currency, "currency_symbol" => $currency_symbol));

            if ($statistics) {
                echo json_encode(array("success" => true, "statistics" => $statistics));
            } else {
                echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
            }
        }
    }

    /* upload a file */

    function upload_file() {
        upload_file_to_temp();
    }

    /* check valid file for invoices */

    function validate_invoices_file() {
        return validate_post_file($this->request->getPost("file_name"));
    }

    function file_preview($id = "", $key = "") {
        if ($id) {
            validate_numeric_value($id);
            $invoice_info = $this->Invoices_model->get_one($id);
            $files = unserialize($invoice_info->files);
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

            return $this->template->view("invoices/file_preview", $view_data);
        } else {
            show_404();
        }
    }

    function load_invoice_overview_statistics_of_selected_currency($currency = "", $currency_symbol = "") {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }

        if ($currency) {
            $statistics = invoice_overview_widget(array("currency" => $currency, "currency_symbol" => $currency_symbol));

            if ($statistics) {
                echo json_encode(array("success" => true, "statistics" => $statistics));
            } else {
                echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
            }
        }
    }

    //load invoice details section
    function details($invoice_id) {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }

        if ($invoice_id) {
            validate_numeric_value($invoice_id);
            $view_data = get_invoice_making_data($invoice_id);

            if ($view_data) {
                $can_edit_invoices = false;
                if ($this->can_edit_invoices() && $this->is_invoice_editable($invoice_id)) {
                    $can_edit_invoices = true;
                }
                $view_data["can_edit_invoices"] = $can_edit_invoices;

                return $this->template->view("invoices/details", $view_data);
            } else {
                show_404();
            }
        }
    }

    //load invoice payments section
    function payments($invoice_id) {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }

        if ($invoice_id) {
            validate_numeric_value($invoice_id);
            $view_data["invoice_id"] = $invoice_id;
            $view_data["can_edit_invoices"] = $this->can_edit_invoices();

            return $this->template->view("invoices/payments/index", $view_data);
        } else {
            show_404();
        }
    }

    /* load tasks tab  */

    function tasks($invoice_id) {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }

        //it'll be based on the context permission
        $can_edit_invoices = $this->can_edit_invoices();
        $view_data['can_create_tasks'] = $can_edit_invoices;

        $view_data["custom_field_headers_of_task"] = $this->Custom_fields_model->get_custom_field_headers_for_table("tasks", $this->login_user->is_admin, $this->login_user->user_type);

        $view_data["invoice_id"] = $invoice_id;
        return $this->template->view("invoices/tasks/index", $view_data);
    }

    /* list of invoice of a specific order, prepared for datatable  */

    function invoice_list_data_of_order($order_id, $client_id = 0) {
        if (!$this->can_view_invoices($client_id)) {
            app_redirect("forbidden");
        }

        validate_numeric_value($order_id);
        validate_numeric_value($client_id);
        $custom_fields = $this->Custom_fields_model->get_available_fields_for_table("invoices", $this->login_user->is_admin, $this->login_user->user_type);

        $options = array(
            "order_id" => $order_id,
            "status" => $this->request->getPost("status"),
            "custom_fields" => $custom_fields,
            "custom_field_filter" => $this->prepare_custom_field_filter_values("invoices", $this->login_user->is_admin, $this->login_user->user_type)
        );

        //don't show draft invoices to order
        if ($this->login_user->user_type == "client") {
            $options["exclude_draft"] = true;
        }


        $list_data = $this->Invoices_model->get_details($options)->getResult();
        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_row($data, $custom_fields);
        }
        echo json_encode(array("data" => $result));
    }

    function create_credit_note_modal_form($invoice_id) {
        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        if (!$invoice_id) {
            show_404();
        }

        validate_numeric_value($invoice_id);
        $view_data["invoice_id"] = $invoice_id;

        return $this->template->view('invoices/create_credit_note_modal_form', $view_data);
    }

    function create_credit_note() {
        if (!$this->can_edit_invoices()) {
            app_redirect("forbidden");
        }

        $invoice_id = $this->request->getPost('invoice_id');
        $invoice_info = $this->Invoices_model->get_one($invoice_id);

        $note = $this->request->getPost('invoice_note');

        $now = get_current_utc_time();

        $credit_note_data = array(
            "type" => "credit_note",
            "client_id" => $invoice_info->client_id,
            "project_id" => $invoice_info->project_id,
            "bill_date" => $now,
            "due_date" => $now,
            "note" => $note,
            "status" => "credited",
            "tax_id" => $invoice_info->tax_id,
            "tax_id2" => $invoice_info->tax_id2,
            "tax_id3" => $invoice_info->tax_id3,
            "discount_amount" => $invoice_info->discount_amount,
            "discount_amount_type" => $invoice_info->discount_amount_type,
            "discount_type" => $invoice_info->discount_type,
            "company_id" => $invoice_info->company_id,
            "main_invoice_id" => $invoice_id,
            "invoice_total" => $invoice_info->invoice_total * -1,
            "invoice_subtotal" => $invoice_info->invoice_subtotal * -1,
            "discount_total" => $invoice_info->discount_total * -1,
            "tax" => $invoice_info->tax * -1,
            "tax2" => $invoice_info->tax2 * -1,
            "tax3" => $invoice_info->tax3 * -1
        );

        //create credit note
        $new_invoice_id = $this->Invoices_model->ci_save($credit_note_data);

        if ($new_invoice_id) {
            //save credited status for main invoice
            $invoice_data = array("status" => "credited");
            $this->Invoices_model->ci_save($invoice_data, $invoice_id);

            //create invoice items
            $items = $this->Invoice_items_model->get_details(array("invoice_id" => $invoice_id))->getResult();
            foreach ($items as $item) {
                //create invoice items for new invoice
                $new_invoice_item_data = array(
                    "title" => $item->title,
                    "description" => $item->description,
                    "quantity" => $item->quantity,
                    "unit_type" => $item->unit_type,
                    "rate" => $item->rate,
                    "taxable" => $item->taxable,
                    "total" => ($item->total) * (-1),
                    "invoice_id" => $new_invoice_id,
                );
                $this->Invoice_items_model->ci_save($new_invoice_item_data);
            }

            echo json_encode(array("success" => true, 'id' => $new_invoice_id, 'message' => app_lang('record_saved')));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    function invoices_summary() {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }
        $view_data["currencies_dropdown"] = $this->_get_currencies_dropdown(false);
        return $this->template->rander("invoices/reports/invoices_summary", $view_data);
    }

    function monthly_invoices_summary() {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }
        $view_data["currencies_dropdown"] = $this->_get_currencies_dropdown(false);
        return $this->template->view("invoices/reports/monthly_invoices_summary", $view_data);
    }

    function custom_invoices_summary() {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }
        $view_data["currencies_dropdown"] = $this->_get_currencies_dropdown(false);
        return $this->template->view("invoices/reports/custom_invoices_summary", $view_data);
    }

    function invoices_summary_list_data() {
        if (!$this->can_view_invoices()) {
            app_redirect("forbidden");
        }


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
        $due = ignor_minor_value($data->invoice_total - $data->payment_received);

        $row_data = array(
            anchor(get_uri("clients/view/" . $data->client_id), $data->client_name),
            $data->invoice_count,
            to_currency($data->invoice_total, $currency_symbol),
            to_currency($data->discount_total, $currency_symbol),
            to_currency($data->tax_total, $currency_symbol),
            to_currency($data->tax2_total, $currency_symbol),
            to_currency($data->tax3_total, $currency_symbol),
            to_currency($data->payment_received, $currency_symbol),
            to_currency($due, $currency_symbol)
        );

        return $row_data;
    }

}

/* End of file invoices.php */
/* Location: ./app/controllers/invoices.php */