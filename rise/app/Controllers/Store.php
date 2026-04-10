<?php

namespace App\Controllers;

use App\Libraries\Paypal;
use App\Libraries\Paytm;

class Store extends Security_Controller {

    function __construct() {
        parent::__construct(false);

        if (isset($this->login_user->id)) {
            $this->init_permission_checker("order");
        }
    }

    function index($offset = 0, $limit = 20, $category_id = 0, $search = "") {
        validate_numeric_value($offset);
        validate_numeric_value($limit);
        validate_numeric_value($category_id);
        $this->check_access_to_store();

        $options = array("login_user_id" => (isset($this->login_user->id) ? $this->login_user->id : 0), "created_by_hash" => $this->get_cookie_hash());

        $item_search = $this->request->getPost("item_search");
        if ($item_search) {
            $search = $this->request->getPost("search");
            $category_id = $this->request->getPost("category_id") ? $this->request->getPost("category_id") : 0;
        }

        if ($search) {
            $options["search"] = $search;
        }

        if ($category_id) {
            $options["category_id"] = $category_id;
        }

        if (!isset($this->login_user->id) || $this->login_user->user_type == "client") {
            $options["show_in_client_portal"] = 1; //show all items on admin side only
        }

        //get all rows
        $all_items = $this->Items_model->get_details($options)->resultID->num_rows;

        $options["offset"] = $offset;
        $options["limit"] = $limit;

        $view_data["items"] = $this->Items_model->get_details($options)->getResult();
        $view_data["result_remaining"] = $all_items - $limit - $offset;
        $view_data["next_page_offset"] = $offset + $limit;

        $view_data["search"] = clean_data($search);
        $view_data["category_id"] = $category_id;

        if (isset($this->login_user->client_id)) {
            $view_data["client_info"] = $this->Clients_model->get_one($this->login_user->client_id);
        }

        $view_data['categories_dropdown'] = $this->_get_categories_dropdown();

        $view_data["cart_items_count"] = count($this->Order_items_model->get_details(array("created_by" => (isset($this->login_user->id) ? $this->login_user->id : 0), "created_by_hash" => $this->get_cookie_hash(), "processing" => true))->getResult());

        if (!isset($this->login_user->id)) {
            $view_data['topbar'] = "includes/public/topbar";
            $view_data['left_menu'] = false;
        }

        if ($offset) { //load more view
            return $this->template->view("items/items_grid_data", $view_data);
        } else if ($item_search) { //search suggestions view
            echo json_encode(array("success" => true, "data" => $this->template->view("items/items_grid_data", $view_data)));
        } else { //default view
            return $this->template->rander("items/grid_view", $view_data);
        }
    }

    //get categories dropdown
    private function _get_categories_dropdown() {
        $categories = $this->Item_categories_model->get_all_where(array("deleted" => 0), 0, 0, "title")->getResult();

        $categories_dropdown = array(array("id" => "", "text" => "- " . app_lang("category") . " -"));
        foreach ($categories as $category) {
            $categories_dropdown[] = array("id" => $category->id, "text" => $category->title);
        }

        return json_encode($categories_dropdown);
    }

    private function get_cookie_hash() {
        helper('cookie');
        $cookie_hash_of_store = get_cookie("cookie_hash_of_store");
        if (!$cookie_hash_of_store) {
            $cookie_hash_of_store = make_random_string();
            set_cookie("cookie_hash_of_store", $cookie_hash_of_store);
        }

        return $cookie_hash_of_store;
    }

    function item_view() {
        $this->validate_submitted_data(array(
            "id" => "required|numeric"
        ));

        $model_info = $this->Items_model->get_details(array("id" => $this->request->getPost('id'), "login_user_id" => (isset($this->login_user->id) ? $this->login_user->id : 0), "created_by_hash" => $this->get_cookie_hash()))->getRow();
       
        if (!get_setting("visitors_can_see_store_before_login") && $this->login_user->user_type == "client" && !$model_info->show_in_client_portal) {
            show_404();
        }

        $view_data['model_info'] = $model_info;

        if (isset($this->login_user->client_id)) {
            $view_data["client_info"] = $this->Clients_model->get_one($this->login_user->client_id);
        }

        return $this->template->view('items/view', $view_data);
    }

    protected function check_access_to_this_item($item_info) {
        if (!isset($this->login_user->id) || $this->login_user->user_type == "client") {
            //check if the item has the availability to show on client portal
            if (!$item_info->show_in_client_portal) {
                app_redirect("forbidden");
            }
        }
    }

    function add_item_to_cart() {
        $this->check_access_to_store();

        $this->validate_submitted_data(array(
            "id" => "required|numeric"
        ));

        $id = $this->request->getPost("id");
        $item_info = $this->Items_model->get_one($id);
        $this->check_access_to_this_item($item_info);

        $order_item_data = array(
            "title" => $item_info->title,
            "quantity" => 1, //add 1 item first time
            "unit_type" => $item_info->unit_type,
            "rate" => $item_info->rate,
            "total" => $item_info->rate, //since the quantity is 1
            "created_by_hash" => $this->get_cookie_hash(),
            "item_id" => $id
        );

        $save_id = $this->Order_items_model->ci_save($order_item_data);

        if ($save_id) {
            echo json_encode(array("success" => true, 'message' => app_lang('record_saved')));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    function count_cart_items() {
        $this->check_access_to_store();

        $cart_items_count = count($this->Order_items_model->get_details(array("created_by" => (isset($this->login_user->id) ? $this->login_user->id : 0), "created_by_hash" => $this->get_cookie_hash(), "processing" => true))->getResult());

        if ($cart_items_count) {
            echo json_encode(array("success" => true, "cart_items_count" => $cart_items_count));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('no_record_found')));
        }
    }

    function load_cart_items() {
        $this->check_access_to_store();

        $view_data = get_order_making_data(0, $this->get_cookie_hash());

        $options = array("created_by" => (isset($this->login_user->id) ? $this->login_user->id : 0), "created_by_hash" => $this->get_cookie_hash(), "processing" => true);
        $view_data["items"] = $this->Order_items_model->get_details($options)->getResult();

        if (isset($this->login_user->client_id)) {
            $view_data["client_info"] = $this->Clients_model->get_one($this->login_user->client_id);
        }

        return $this->template->view("items/cart/cart_items_list", $view_data);
    }

    protected function check_access_to_this_order_item($order_item_info) {
        if ($order_item_info->id) {
            //item created
            if (!$order_item_info->order_id) {
                //on processing order, check if the item is created by the login user
                if (!(
                        (isset($this->login_user->id) && $order_item_info->created_by === $this->login_user->id) || $order_item_info->created_by_hash === $this->get_cookie_hash())
                ) {
                    app_redirect("forbidden");
                }
            } else {
                //order created, now only allowed members can access
                if ($this->login_user->user_type == "client") {
                    app_redirect("forbidden");
                }
            }
        } else if ($this->login_user->user_type !== "staff") {
            //item isn't created, only allowed member can access
            app_redirect("forbidden");
        }
    }

    function delete_cart_item() {
        $this->check_access_to_store();
        $this->validate_submitted_data(array(
            "id" => "required"
        ));

        $order_item_id = $this->request->getPost("id");
        $order_item_info = $this->Order_items_model->get_one($order_item_id);
        $this->check_access_to_this_order_item($order_item_info);

        if ($this->Order_items_model->delete($order_item_id)) {
            echo json_encode(array("success" => true, 'message' => app_lang('record_deleted'), "cart_total_view" => $this->_get_cart_total_view()));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('record_cannot_be_deleted')));
        }
    }

    function change_cart_item_quantity($type = "") {
        $this->check_access_to_store();

        if ($type == "input") {
            $this->validate_submitted_data(array(
                "id" => "required"
            ));
        } else {
            $this->validate_submitted_data(array(
                "id" => "required",
                "action" => "required"
            ));
        }

        $id = $this->request->getPost("id");
        $action = $this->request->getPost("action");

        $item_info = $this->Order_items_model->get_one($id);
        $this->check_access_to_this_order_item($item_info);

        if (!$item_info->id) {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
            exit();
        }

        if ($type == "input") {
            $quantity = $this->request->getPost("item_quantity");
        } else {
            $quantity = $item_info->quantity;
            if ($action == "plus") {
                //plus quantity
                $quantity = $quantity + 1;
            } else if ($action == "minus" && $quantity > 1) {
                //minus quantity
                //shouldn't be less than one
                $quantity = $quantity - 1;
            }
        }

        $data = array(
            "quantity" => $quantity,
            "total" => $item_info->rate * $quantity
        );

        $this->Order_items_model->ci_save($data, $item_info->id);

        $options = array("id" => $id);
        $view_data["item"] = $this->Order_items_model->get_details($options)->getRow();

        if (isset($this->login_user->client_id)) {
            $view_data["client_info"] = $this->Clients_model->get_one($this->login_user->client_id);
        }

        echo json_encode(array("success" => true, 'message' => app_lang('record_saved'), "data" => $this->template->view("items/cart/cart_item_data", $view_data), "cart_total_view" => $this->_get_cart_total_view()));
    }

    private function _get_cart_total_view() {
        $view_data = get_order_making_data(0, $this->get_cookie_hash());
        return $this->template->view('items/cart/cart_total_section', $view_data);
    }

    private function check_accept_order_before_login_permission() {
        if (isset($this->login_user->id)) {
            return true;
        } else {
            if (!(get_setting("module_order") && get_setting("visitors_can_see_store_before_login") && get_setting("accept_order_before_login"))) {
                app_redirect('signin?redirect=' . get_uri("store/process_order"));
            }
        }
    }

    function process_order() {
        $this->check_access_to_store();
        $this->check_accept_order_before_login_permission();

        $view_data = get_order_making_data(0, $this->get_cookie_hash());
        $view_data["cart_items_count"] = count($this->Order_items_model->get_details(array("created_by" => (isset($this->login_user->id) ? $this->login_user->id : 0), "created_by_hash" => $this->get_cookie_hash(), "processing" => true))->getResult());

        $view_data['clients_dropdown'] = "";
        if (isset($this->login_user->user_type) && $this->login_user->user_type == "staff") {
            $view_data['clients_dropdown'] = $this->_get_clients_dropdown();
        }

        if (isset($this->login_user->id)) {
            $view_data["custom_fields"] = $this->Custom_fields_model->get_combined_details("orders", 0, $this->login_user->is_admin, $this->login_user->user_type)->getResult();
        }

        $view_data['companies_dropdown'] = $this->_get_companies_dropdown();

        if (!isset($this->login_user->id)) {
            $view_data['topbar'] = "includes/public/topbar";
            $view_data['left_menu'] = false;
        }

        return $this->template->rander("orders/process_order", $view_data);
    }

    function item_list_data_of_login_user() {
        $this->check_access_to_store();
        $options = array("created_by" => (isset($this->login_user->id) ? $this->login_user->id : 0), "created_by_hash" => $this->get_cookie_hash(), "processing" => true);
        $list_data = $this->Order_items_model->get_details($options)->getResult();
        $result = array();
        foreach ($list_data as $data) {
            $result[] = $this->_make_order_item_row($data);
        }

        echo json_encode(array("data" => $result));
    }

    /* load item modal */

    function item_modal_form() {
        $this->check_access_to_store();
        $this->validate_submitted_data(array(
            "id" => "numeric"
        ));

        $id = $this->request->getPost('id');
        $model_info = $this->Order_items_model->get_one($id);
        if ($id) { //check permission only for existing item
            $this->check_access_to_this_order_item($model_info);
        }

        $view_data['model_info'] = $model_info;
        $view_data['order_id'] = $this->request->getPost('order_id');

        return $this->template->view('orders/item_modal_form', $view_data);
    }

    /* add or edit an order item */

    function save_item() {
        $this->check_access_to_store();
        $this->validate_submitted_data(array(
            "id" => "numeric"
        ));

        $id = $this->request->getPost('id');
        $item_id = $this->request->getPost("item_id");

        if ($id) { //item added to order items
            $item_info = $this->Order_items_model->get_one($id);
            $this->check_access_to_this_order_item($item_info);
        } else { //item not added to order items yet
            $item_info = $this->Items_model->get_one($item_id);
            $this->check_access_to_this_item($item_info);
        }

        $quantity = unformat_currency($this->request->getPost('order_item_quantity'));

        $order_item_data = array(
            "description" => $this->request->getPost('order_item_description'),
            "quantity" => $quantity,
            "created_by" => isset($this->login_user->id) ? $this->login_user->id : $this->get_cookie_hash(),
            "item_id" => isset($item_info->item_id) ? $item_info->item_id : $item_id
        );

        if (isset($this->login_user->user_type) && $this->login_user->user_type === "staff") {
            //when it's adding by team members, they could change terms
            $rate = unformat_currency($this->request->getPost('order_item_rate'));
            $order_item_data["title"] = $this->request->getPost('order_item_title');
            $order_item_data["unit_type"] = $this->request->getPost('order_unit_type');
            $order_item_data["rate"] = unformat_currency($this->request->getPost('order_item_rate'));
            $order_item_data["total"] = $rate * $quantity;
        } else {
            //adding by clients, they can't change terms
            $order_item_data["title"] = $item_info->title;
            $order_item_data["unit_type"] = $item_info->unit_type;
            $order_item_data["rate"] = $item_info->rate;
            $order_item_data["total"] = $item_info->rate * $quantity;
        }

        $order_id = $this->request->getPost("order_id");
        if ($order_id) { //order created already, add order id
            $order_item_data["order_id"] = $order_id;
        }

        $order_item_id = $this->Order_items_model->ci_save($order_item_data, $id);
        if ($order_item_id) {

            //check if the add_new_item flag is on, if so, add the item to libary. 
            $add_new_item_to_library = $this->request->getPost('add_new_item_to_library');
            if ($add_new_item_to_library) {
                $library_item_data = array(
                    "title" => $this->request->getPost('order_item_title'),
                    "description" => $this->request->getPost('order_item_description'),
                    "unit_type" => $this->request->getPost('order_unit_type'),
                    "rate" => unformat_currency($this->request->getPost('order_item_rate'))
                );
                $this->Items_model->ci_save($library_item_data);
            }

            $options = array("id" => $order_item_id);
            $item_info = $this->Order_items_model->get_details($options)->getRow();

            echo json_encode(array("success" => true, "order_id" => $item_info->order_id, "data" => $this->_make_order_item_row($item_info), "order_total_view" => $this->_get_order_total_view($item_info->order_id), 'id' => $order_item_id, 'message' => app_lang('record_saved')));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    //update the sort value for order item
    function update_item_sort_values($id = 0) {
        $this->check_access_to_store();
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
                $this->Order_items_model->ci_save($data, $id);
            }
        }
    }

    /* delete or undo an order item */

    function delete_item() {
        $this->check_access_to_store();
        $this->validate_submitted_data(array(
            "id" => "required|numeric"
        ));

        $id = $this->request->getPost('id');
        $order_item_info = $this->Order_items_model->get_one($id);
        $this->check_access_to_this_order_item($order_item_info);

        if ($this->request->getPost('undo')) {
            if ($this->Order_items_model->delete($id, true)) {
                $options = array("id" => $id);
                $item_info = $this->Order_items_model->get_details($options)->getRow();
                echo json_encode(array("success" => true, "order_id" => $item_info->order_id, "data" => $this->_make_order_item_row($item_info), "order_total_view" => $this->_get_order_total_view($item_info->order_id), "message" => app_lang('record_undone')));
            } else {
                echo json_encode(array("success" => false, app_lang('error_occurred')));
            }
        } else {
            if ($this->Order_items_model->delete($id)) {
                $item_info = $this->Order_items_model->get_one($id);
                echo json_encode(array("success" => true, "order_id" => $item_info->order_id, "order_total_view" => $this->_get_order_total_view($item_info->order_id), 'message' => app_lang('record_deleted')));
            } else {
                echo json_encode(array("success" => false, 'message' => app_lang('record_cannot_be_deleted')));
            }
        }
    }

    /* order total section */

    private function _get_order_total_view($order_id = 0) {
        if ($order_id) {
            $view_data["order_total_summary"] = $this->Orders_model->get_order_total_summary($order_id);
            $view_data["order_id"] = $order_id;
            return $this->template->view('orders/order_total_section', $view_data);
        } else {
            $view_data = get_order_making_data(0, $this->get_cookie_hash());
            return $this->template->view('orders/processing_order_total_section', $view_data);
        }
    }

    private function is_valid_recaptcha($recaptcha_post_data) {
        //load recaptcha lib
        require_once(APPPATH . "ThirdParty/recaptcha/autoload.php");
        $recaptcha = new \ReCaptcha\ReCaptcha(get_setting("re_captcha_secret_key"));
        $resp = $recaptcha->verify($recaptcha_post_data, $_SERVER['REMOTE_ADDR']);

        if ($resp->isSuccess()) {
            return true;
        } else {

            $error = "";
            foreach ($resp->getErrorCodes() as $code) {
                $error = $code;
            }

            return $error;
        }
    }

    function place_order() {
        $this->check_access_to_store();
        $this->check_accept_order_before_login_permission();

        $order_items = $this->Order_items_model->get_details(array("created_by" => (isset($this->login_user->id) ? $this->login_user->id : 0), "created_by_hash" => $this->get_cookie_hash(), "processing" => true))->getResult();
        if (!$order_items) {
            echo json_encode(array("success" => false, 'message' => app_lang('no_items_text')));
            exit;
        }

        if (isset($this->login_user->id)) {
            $client_id = $this->request->getPost("client_id") ? $this->request->getPost("client_id") : $this->login_user->client_id;
            $created_by = $this->login_user->id;
        } else {
            //check if there reCaptcha is enabled
            //if reCaptcha is enabled, check the validation
            if (get_setting("re_captcha_secret_key")) {

                $response = $this->is_valid_recaptcha($this->request->getPost("g-recaptcha-response"));

                if ($response !== true) {

                    if ($response) {
                        echo json_encode(array('success' => false, 'message' => app_lang("re_captcha_error-" . $response)));
                    } else {
                        echo json_encode(array('success' => false, 'message' => app_lang("re_captcha_expired")));
                    }

                    return false;
                }
            }

            $client_data = $this->create_new_client();
            $client_id = get_array_value($client_data, "client_id");
            $created_by = get_array_value($client_data, "client_contact_id");
        }

        $target_path = get_setting("timeline_file_path");
        $files_data = move_files_from_temp_dir_to_permanent_dir($target_path, "order");

        $order_data = array(
            "client_id" => $client_id,
            "order_date" => get_today_date(),
            "note" => $this->request->getPost('order_note'),
            "created_by" => $created_by,
            "status_id" => $this->Order_status_model->get_first_status(),
            "tax_id" => get_setting('order_tax_id') ? get_setting('order_tax_id') : 0,
            "tax_id2" => get_setting('order_tax_id2') ? get_setting('order_tax_id2') : 0,
            "company_id" => $this->request->getPost('company_id') ? $this->request->getPost('company_id') : get_default_company_id(),
            "created_by_hash" => $this->get_cookie_hash()
        );

        $order_data["files"] = $files_data;

        $order_id = $this->Orders_model->ci_save($order_data);

        if ($order_id) {
            if (isset($this->login_user->id)) {
                //custom fields is only available for logged in users
                save_custom_fields("orders", $order_id, $this->login_user->is_admin, $this->login_user->user_type);
            }

            //save items to this order
            foreach ($order_items as $order_item) {
                $order_item_data = array("order_id" => $order_id);
                $this->Order_items_model->ci_save($order_item_data, $order_item->id);
            }

            $redirect_to = "";
            if (isset($this->login_user->id) && $this->login_user->user_type == "staff") {
                $redirect_to = get_uri("orders/view/$order_id");
            } else {
                if (get_setting("show_payment_option_after_submitting_the_order")) {
                    $invoice_info = $this->Invoices_model->get_one_where(array("order_id" => $order_id, "deleted" => 0));
                    if ($invoice_info->id) {
                        $invoice_id = $invoice_info->id;
                    } else { //create invoice
                        $invoice_id = create_invoice_from_order($order_id);
                    }

                    $redirect_to = get_uri("invoices/preview/$invoice_id");
                } else {
                    $redirect_to = get_uri("store/order_preview/$order_id");
                }
            }

            //send notification
            log_notification("new_order_received", array("order_id" => $order_id));

            echo json_encode(array("success" => true, "redirect_to" => $redirect_to, 'message' => app_lang('record_saved')));
        } else {
            echo json_encode(array("success" => false, 'message' => app_lang('error_occurred')));
        }
    }

    private function check_access_to_this_order($order_data) {
        //check for valid order
        if (!$order_data) {
            show_404();
        }

        //check for security
        $order_info = get_array_value($order_data, "order_info");
        if (isset($this->login_user->id)) {
            if ($this->login_user->user_type == "client") {
                if ($this->login_user->client_id != $order_info->client_id) {
                    app_redirect("forbidden");
                }
            }
        } else {
            //check with the current hash and order hash
            if ($this->get_cookie_hash() != $order_info->created_by_hash) {
                app_redirect("forbidden");
            }
        }
    }

    function order_preview($order_id = 0) {
        $this->check_access_to_store();

        if (!$order_id) {
            show_404();
        }

        validate_numeric_value($order_id);
        $view_data = get_order_making_data($order_id);
        $this->check_access_to_this_order($view_data);

        $view_data['order_info'] = get_array_value($view_data, "order_info");
        $view_data['order_preview'] = prepare_order_pdf($view_data, "html");
        $view_data['show_close_preview'] = false;
        $view_data['order_id'] = $order_id;
        $view_data['public_user_hash'] = $this->get_cookie_hash();

        if (!isset($this->login_user->id)) {
            $view_data['topbar'] = "includes/public/topbar";
            $view_data['left_menu'] = false;
        }

        return $this->template->rander("orders/order_preview", $view_data);
    }

    private function create_new_client() {
        //match with the existing email
        $email = trim($this->request->getPost('email'));
        $user_info = $this->Users_model->get_one_where(array("email" => $email, "deleted" => 0));

        if ($user_info->id) {
            //an user is already exists, ask user to login
            echo json_encode(array("success" => false, 'message' => app_lang("account_already_exists_for_your_mail") . " " . anchor("signin?redirect=" . get_uri("store/process_order"), app_lang("signin"))));
            exit();
        }

        $company_name = $this->request->getPost('company_name');

        //check duplicate company name, if found then show an error message
        if (get_setting("disallow_duplicate_client_company_name") == "1" && $this->Clients_model->is_duplicate_company_name($company_name)) {
            echo json_encode(array("success" => false, 'message' => app_lang("account_already_exists_for_your_company_name") . " " . anchor(get_uri("signin?redirect=" . get_uri("store/process_order")), app_lang('signin'), array("class" => "text-white text-off"))));
            return false;
        }

        $now = get_current_utc_time();

        //create a new client
        $client_data = array(
            "company_name" => $company_name ? $company_name : $this->request->getPost('first_name') . " " . $this->request->getPost('last_name'),
            "type" => $this->request->getPost("account_type"),
            "created_date" => $now,
            "created_by" => 1, //add default admin
            "owner_id" => 1, //add default admin
        );

        $client_data = clean_data($client_data);
        $client_id = $this->Clients_model->ci_save($client_data);
        if (!$client_id) {
            show_404();
        }

        //client created, now create the client contact
        $first_name = $this->request->getPost('first_name');
        $last_name = $this->request->getPost('last_name');
        $password = $this->request->getPost('password');

        $client_contact_data = array(
            "first_name" => $first_name,
            "last_name" => $last_name,
            "client_id" => $client_id,
            "user_type" => "client",
            "email" => $email,
            "created_at" => $now,
            "is_primary_contact" => 1,
            "password" => password_hash($password, PASSWORD_DEFAULT)
        );

        $client_contact_data = clean_data($client_contact_data);
        $client_contact_id = $this->Users_model->ci_save($client_contact_data);

        log_notification("client_signup", array("client_id" => $client_id), $client_contact_id);

        //send welcome email
        $email_template = $this->Email_templates_model->get_final_template("new_client_greetings"); //use default template since creating new client

        $parser_data["SIGNATURE"] = $email_template->signature;
        $parser_data["CONTACT_FIRST_NAME"] = $first_name;
        $parser_data["CONTACT_LAST_NAME"] = $last_name;

        $Company_model = model('App\Models\Company_model');
        $company_info = $Company_model->get_one_where(array("is_default" => true));
        $parser_data["COMPANY_NAME"] = $company_info->name;

        $parser_data["DASHBOARD_URL"] = base_url();
        $parser_data["CONTACT_LOGIN_EMAIL"] = $email;
        $parser_data["CONTACT_LOGIN_PASSWORD"] = $password;
        $parser_data["LOGO_URL"] = get_logo_url();

        $message = $this->parser->setData($parser_data)->renderString($email_template->message);
        send_app_mail($email, $email_template->subject, $message);

        return array("client_id" => $client_id, "client_contact_id" => $client_contact_id);
    }

    private function _get_clients_dropdown() {
        $clients_dropdown = array("" => "-");
        $clients = $this->Clients_model->get_dropdown_list(array("company_name"), "id", array("is_lead" => 0));
        foreach ($clients as $key => $value) {
            $clients_dropdown[$key] = $value;
        }
        return $clients_dropdown;
    }

}

/* End of file Store.php */
/* Location: ./app/Controllers/Store.php */