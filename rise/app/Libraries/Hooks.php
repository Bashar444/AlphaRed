<?php

namespace App\Libraries;

class Hooks {

    public function change_order_status_after_payment($hook_data) {
        $order_status_after_payment = get_setting("order_status_after_payment");
        if (!$order_status_after_payment) {
            return true;
        }

        $Invoices_model = model("App\Models\Invoices_model");
        $data = get_array_value($hook_data, "data");
        $invoice_info = $Invoices_model->get_one(get_array_value($data, "invoice_id"));

        //if there is any order_id, we assume that it's the associated invoice of that order
        if (!$invoice_info->order_id) {
            return true;
        }

        $Orders_model = model("App\Models\Orders_model");
        $Order_status_model = model("App\Models\Order_status_model");

        $first_status = $Order_status_model->get_first_status();
        $order_info = $Orders_model->get_one($invoice_info->order_id);
        if ($order_info->status_id !== $first_status) {
            return true;
        }

        $order_data["status_id"] = $order_status_after_payment;
        $Orders_model->ci_save($order_data, $invoice_info->order_id);
    }

}
