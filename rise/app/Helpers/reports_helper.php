<?php

use App\Controllers\Security_Controller;
use App\Libraries\Template;

/**
 * get report menu
 * @param string $type
 * 
 * @return html
 */
if (!function_exists('get_reports_topbar')) {

    function get_reports_topbar($return_array = false) {
        $ci = new Security_Controller(false);
        $permissions = $ci->login_user->permissions;

        $access_invoice = get_array_value($permissions, "invoice");
        $access_expense = get_array_value($permissions, "expense");
        $access_lead = get_array_value($permissions, "lead");
        $access_ticket = get_array_value($permissions, "ticket");

        /*
          $access_order = get_array_value($permissions, "order");
          $access_estimate = get_array_value($permissions, "estimate");
          $access_proposal = get_array_value($permissions, "proposal");
         */

        $show_payments_button = false;
        $show_expenses_button = false;

        $sales_dropdown_button = array();
        if (get_setting("module_invoice") == "1" && ($ci->login_user->is_admin || $access_invoice)) {
            $sales_dropdown_button["invoices_summary"] = array("name" => "invoices_summary", "url" => "invoices/invoices_summary");
            $show_payments_button = true;
        }

        /*
          if (get_setting("module_order") == "1" && ($ci->login_user->is_admin || $access_order)) {
          $sales_dropdown_button["orders_summary"] = array("name" => "orders_summary", "url" => "orders/orders_summary");
          }
         */

        if (count($sales_dropdown_button)) {
            $reports_menu["sales"] = array("name" => "sales", "url" => "invoices", "class" => "shopping-cart", "dropdown_item" => $sales_dropdown_button);
        }

        /*
          $prospects_dropdown_button = array();
          if (get_setting("module_estimate") == "1" && ($ci->login_user->is_admin || $access_estimate)) {
          $prospects_dropdown_button["estimates_summary"] = array("name" => "estimates_summary", "url" => "estimates_summary");
          }

          if (get_setting("module_estimate_request") == "1" && ($ci->login_user->is_admin || $access_estimate)) {
          $prospects_dropdown_button["estimate_request_summary"] = array("name" => "estimate_request_summary", "url" => "estimate_request_summary");
          }

          if (get_setting("module_proposal") == "1" && ($ci->login_user->is_admin || $access_proposal)) {
          $prospects_dropdown_button["proposals_summary"] = array("name" => "proposals_summary", "url" => "proposals_summary");
          }

          if (count($prospects_dropdown_button)) {
          $reports_menu["prospects"] = array("name" => "prospects", "url" => "estimates_summary", "class" => "anchor", "dropdown_item" => $prospects_dropdown_button);
          }
         */

        $finance_dropdown_button = array();
        if (get_setting("module_expense") == "1" && ($ci->login_user->is_admin || $access_expense)) {
            $show_expenses_button = true;
        }

        if ($show_expenses_button && $show_payments_button) {
            $finance_dropdown_button["income_vs_expenses"] = array("name" => "income_vs_expenses", "url" => "expenses/income_vs_expenses");
        }
        if ($show_expenses_button) {
            $finance_dropdown_button["expenses_summary"] = array("name" => "expenses_summary", "url" => "expenses/summary");
        }
        if ($show_payments_button) {
            $finance_dropdown_button["payments_summary"] = array("name" => "payments_summary", "url" => "invoice_payments/payments_summary");
        }



        if (count($finance_dropdown_button)) {
            $reports_menu["finance"] = array("name" => "finance", "url" => "expenses_summary", "class" => "bar-chart-2", "dropdown_item" => $finance_dropdown_button);
        }

        if (get_setting("module_project_timesheet") && ($ci->login_user->is_admin || !get_array_value($permissions, "do_not_show_projects"))) {
            $reports_menu[] = array("name" => "timesheets", "url" => "projects/all_timesheets", "class" => "clock", "single_button" => true);
        }

        if ($ci->login_user->is_admin || get_array_value($permissions, "can_manage_all_projects") == "1") {
            $reports_menu[] = array("name" => "projects", "url" => "projects/team_members_summary", "class" => "command", "single_button" => true);
        }

        if (get_setting("module_lead") == "1" && ($ci->login_user->is_admin || $access_lead == "all")) {
            $reports_menu[] = array("name" => "leads", "url" => "leads/converted_to_client_report", "class" => "layers", "single_button" => true);
        }

        if (get_setting("module_ticket") == "1" && ($ci->login_user->is_admin || $access_ticket == "all")) {
            $reports_menu[] = array("name" => "tickets", "url" => "tickets/tickets_chart_report", "class" => "life-buoy", "single_button" => true);
        }

        if ($return_array) {
            return $reports_menu;
        } else {
            $view_data["reports_menu"] = $reports_menu;
            $template = new Template();
            return $template->view("reports/topbar", $view_data);
        }
    }

}
