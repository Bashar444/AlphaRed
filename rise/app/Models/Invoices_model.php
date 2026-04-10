<?php

namespace App\Models;

class Invoices_model extends Crud_model {

    protected $table = null;

    function __construct() {
        $this->table = 'invoices';
        parent::__construct($this->table);
    }

    function get_details($options = array()) {
        $invoices_table = $this->db->prefixTable('invoices');
        $clients_table = $this->db->prefixTable('clients');
        $projects_table = $this->db->prefixTable('projects');
        $taxes_table = $this->db->prefixTable('taxes');
        $invoice_payments_table = $this->db->prefixTable('invoice_payments');
        $invoice_items_table = $this->db->prefixTable('invoice_items');
        $users_table = $this->db->prefixTable('users');

        $tolarance = get_paid_status_tolarance();

        $where = "";
        $id = $this->_get_clean_value($options, "id");
        if ($id) {
            $where .= " AND $invoices_table.id=$id";
        }
        $type = $this->_get_clean_value($options, "type");
        if ($type) {
            $where .= " AND $invoices_table.type='$type'";
        }
        $client_id = $this->_get_clean_value($options, "client_id");
        if ($client_id) {
            $where .= " AND $invoices_table.client_id=$client_id";
        }
        $subscription_id = get_array_value($options, "subscription_id");
        if ($subscription_id) {
            $where .= " AND $invoices_table.subscription_id=$subscription_id";
        }

        $exclude_draft = $this->_get_clean_value($options, "exclude_draft");
        if ($exclude_draft) {
            $where .= " AND $invoices_table.status!='draft' ";
        }

        $project_id = $this->_get_clean_value($options, "project_id");
        if ($project_id) {
            $where .= " AND $invoices_table.project_id=$project_id";
        }

        $order_id = $this->_get_clean_value($options, "order_id");
        if ($order_id) {
            $where .= " AND $invoices_table.order_id=$order_id";
        }

        $start_date = $this->_get_clean_value($options, "start_date");
        $end_date = $this->_get_clean_value($options, "end_date");
        if ($start_date && $end_date) {
            $where .= " AND ($invoices_table.due_date BETWEEN '$start_date' AND '$end_date') ";
        }

        $reminder_due_date = $this->_get_clean_value($options, "reminder_due_date");
        $reminder_due_date2 = $this->_get_clean_value($options, "reminder_due_date2");
        if ($reminder_due_date && $reminder_due_date2) {
            $where .= " AND ($invoices_table.due_date='$reminder_due_date' OR $invoices_table.due_date='$reminder_due_date2') ";
        } else if ($reminder_due_date) {
            $where .= " AND $invoices_table.due_date='$reminder_due_date' ";
        } else if ($reminder_due_date2) {
            $where .= " AND $invoices_table.due_date='$reminder_due_date2' ";
        }

        $next_recurring_start_date = $this->_get_clean_value($options, "next_recurring_start_date");
        $next_recurring_end_date = $this->_get_clean_value($options, "next_recurring_end_date");
        if ($next_recurring_start_date && $next_recurring_end_date) {
            $where .= " AND ($invoices_table.next_recurring_date BETWEEN '$next_recurring_start_date' AND '$next_recurring_end_date') ";
        } else if ($next_recurring_start_date) {
            $where .= " AND $invoices_table.next_recurring_date >= '$next_recurring_start_date' ";
        } else if ($next_recurring_end_date) {
            $where .= " AND $invoices_table.next_recurring_date <= '$next_recurring_end_date' ";
        }

        $recurring_invoice_id = $this->_get_clean_value($options, "recurring_invoice_id");
        if ($recurring_invoice_id) {
            $where .= " AND $invoices_table.recurring_invoice_id=$recurring_invoice_id";
        }

        $now = get_my_local_time("Y-m-d");
        //  $options['status'] = "draft";
        $status = $this->_get_clean_value($options, "status");

        if ($status === "draft") {
            $where .= " AND $invoices_table.status='draft' AND IFNULL(payments_table.payment_received,0)<=0";
        } else if ($status === "not_paid") {
            $where .= " AND $invoices_table.type = 'invoice' AND $invoices_table.status ='not_paid' AND IFNULL(payments_table.payment_received,0)<=0";
        } else if ($status === "partially_paid") {
            $where .= " AND $invoices_table.type = 'invoice' AND IFNULL(payments_table.payment_received,0)>0 AND IFNULL(payments_table.payment_received,0)<$invoices_table.invoice_total-$tolarance";
        } else if ($status === "fully_paid") {
            $where .= " AND $invoices_table.type = 'invoice' AND TRUNCATE(IFNULL(payments_table.payment_received,0),2)>=$invoices_table.invoice_total-$tolarance";
        } else if ($status === "overdue") {
            $where .= " AND $invoices_table.type = 'invoice' AND $invoices_table.status ='not_paid' AND $invoices_table.due_date<'$now' AND TRUNCATE(IFNULL(payments_table.payment_received,0),2)<$invoices_table.invoice_total-$tolarance";
        } else if ($status === "cancelled") {
            $where .= " AND $invoices_table.type = 'invoice' AND $invoices_table.status='cancelled' ";
        } else if ($status == "not_paid_and_partially_paid") {
            $where .= " AND $invoices_table.type = 'invoice' AND ($invoices_table.status ='not_paid' AND IFNULL(payments_table.payment_received,0)<=0 OR (IFNULL(payments_table.payment_received,0)>0 AND IFNULL(payments_table.payment_received,0)<$invoices_table.invoice_total-$tolarance))";
        } else if ($status == "credited") {
            $where .= " AND $invoices_table.type = 'invoice' AND $invoices_table.status='credited' ";
        }


        $recurring = $this->_get_clean_value($options, "recurring");
        if ($recurring) {
            $where .= " AND $invoices_table.recurring=1";
        }

        $currency = $this->_get_clean_value($options, "currency");
        if ($currency) {
            $where .= $this->_get_clients_of_currency_query($currency, $invoices_table, $clients_table);
        }

        $exclude_due_reminder_date = $this->_get_clean_value($options, "exclude_due_reminder_date");
        if ($exclude_due_reminder_date) {
            $where .= " AND ($invoices_table.due_reminder_date IS NULL OR $invoices_table.due_reminder_date !='$exclude_due_reminder_date') ";
        }

        $exclude_recurring_reminder_date = $this->_get_clean_value($options, "exclude_recurring_reminder_date");
        if ($exclude_recurring_reminder_date) {
            $where .= " AND ($invoices_table.recurring_reminder_date IS NULL OR $invoices_table.recurring_reminder_date !='$exclude_recurring_reminder_date') ";
        }

        $select_labels_data_query = $this->get_labels_data_query();

        //prepare custom fild binding query
        $custom_fields = get_array_value($options, "custom_fields");
        $custom_field_filter = get_array_value($options, "custom_field_filter");
        $custom_field_query_info = $this->prepare_custom_field_query_string("invoices", $custom_fields, $invoices_table, $custom_field_filter);
        $select_custom_fieds = get_array_value($custom_field_query_info, "select_string");
        $join_custom_fieds = get_array_value($custom_field_query_info, "join_string");
        $custom_fields_where = get_array_value($custom_field_query_info, "where_string");

        $sql = "SELECT $invoices_table.*, $clients_table.currency, $clients_table.currency_symbol, $clients_table.company_name, $projects_table.title AS project_title, credit_note_table.id AS credit_note_id,
           $invoices_table.invoice_total AS invoice_value, IFNULL(payments_table.payment_received,0) AS payment_received, tax_table.percentage AS tax_percentage, tax_table2.percentage AS tax_percentage2, tax_table3.percentage AS tax_percentage3, CONCAT($users_table.first_name, ' ',$users_table.last_name) AS cancelled_by_user, $select_labels_data_query $select_custom_fieds
        FROM $invoices_table
        LEFT JOIN (
            SELECT $invoices_table.id, $invoices_table.main_invoice_id
            FROM $invoices_table 
            WHERE $invoices_table.deleted=0 AND $invoices_table.main_invoice_id!=0
        ) AS credit_note_table ON credit_note_table.main_invoice_id=$invoices_table.id
        LEFT JOIN $clients_table ON $clients_table.id= $invoices_table.client_id
        LEFT JOIN $projects_table ON $projects_table.id= $invoices_table.project_id
        LEFT JOIN $users_table ON $users_table.id= $invoices_table.cancelled_by
        LEFT JOIN (SELECT $taxes_table.* FROM $taxes_table) AS tax_table ON tax_table.id = $invoices_table.tax_id
        LEFT JOIN (SELECT $taxes_table.* FROM $taxes_table) AS tax_table2 ON tax_table2.id = $invoices_table.tax_id2
        LEFT JOIN (SELECT $taxes_table.* FROM $taxes_table) AS tax_table3 ON tax_table3.id = $invoices_table.tax_id3
        LEFT JOIN (SELECT invoice_id, SUM(amount) AS payment_received FROM $invoice_payments_table WHERE deleted=0 GROUP BY invoice_id) AS payments_table ON payments_table.invoice_id = $invoices_table.id 
        LEFT JOIN (SELECT invoice_id, SUM(total) AS invoice_value FROM $invoice_items_table WHERE deleted=0 GROUP BY invoice_id) AS items_table ON items_table.invoice_id = $invoices_table.id 
        $join_custom_fieds
        WHERE $invoices_table.deleted=0 $where $custom_fields_where";
        return $this->db->query($sql);
    }

    function get_invoice_total_summary($invoice_id) {
        $invoice_payments_table = $this->db->prefixTable('invoice_payments');
        $clients_table = $this->db->prefixTable('clients');
        $invoices_table = $this->db->prefixTable('invoices');

        $result = $this->get_invoice_total_meta($invoice_id);

        $client_sql = "SELECT $clients_table.currency_symbol, $clients_table.currency FROM $clients_table WHERE $clients_table.id=(SELECT $invoices_table.client_id FROM $invoices_table WHERE $invoices_table.id=$invoice_id LIMIT 1)";
        $client = $this->db->query($client_sql)->getRow();

        $result->currency_symbol = $client->currency_symbol ? $client->currency_symbol : get_setting("currency_symbol");
        $result->currency = $client->currency ? $client->currency : get_setting("default_currency");

        $payment_sql = "SELECT SUM($invoice_payments_table.amount) AS total_paid
        FROM $invoice_payments_table
        WHERE $invoice_payments_table.deleted=0 AND $invoice_payments_table.invoice_id=$invoice_id";
        $payment = $this->db->query($payment_sql)->getRow();

        $result->total_paid = is_null($payment->total_paid) ? 0 : $payment->total_paid;
        $result->balance_due = number_format($result->invoice_total, 2, ".", "") - number_format($result->total_paid, 2, ".", "");

        return $result;
    }

    function invoice_statistics($options = array()) {
        $invoices_table = $this->db->prefixTable('invoices');
        $invoice_payments_table = $this->db->prefixTable('invoice_payments');
        $clients_table = $this->db->prefixTable('clients');

        $info = new \stdClass();
        $year = get_my_local_time("Y");

        $where = "";
        $payments_where = "";
        $invoices_where = "";
        $invoice_date_where = "";

        $start_date = $this->_get_clean_value($options, "start_date");
        $end_date = $this->_get_clean_value($options, "end_date");
        if ($start_date && $end_date) {
            $invoice_date_where .= " AND ($invoices_table.bill_date BETWEEN '$start_date' AND '$end_date')";
        } else {
            $invoice_date_where .= " AND YEAR($invoices_table.bill_date)=$year";
        }

        $client_id = $this->_get_clean_value($options, "client_id");
        if ($client_id) {
            $where .= " AND $invoices_table.client_id=$client_id";
        } else {
            $invoices_where = $this->_get_clients_of_currency_query($this->_get_clean_value($options, "currency"), $invoices_table, $clients_table);

            $payments_where = " AND $invoice_payments_table.invoice_id IN(SELECT $invoices_table.id FROM $invoices_table WHERE $invoices_table.deleted=0 $invoices_where)";
        }

        $payments = $this->_get_clean_value($options, "payments");
        if ($payments) {
            $payments = "SELECT SUM($invoice_payments_table.amount) AS total, MONTH($invoice_payments_table.payment_date) AS month
            FROM $invoice_payments_table
            LEFT JOIN $invoices_table ON $invoices_table.id=$invoice_payments_table.invoice_id    
            WHERE $invoice_payments_table.deleted=0 AND YEAR($invoice_payments_table.payment_date)=$year AND $invoices_table.deleted=0 $where $payments_where
            GROUP BY MONTH($invoice_payments_table.payment_date)";

            $info->payments = $this->db->query($payments)->getResult();
        }


        $invoices = "SELECT SUM($invoices_table.invoice_total) AS total, MONTH(bill_date) AS month 
            FROM $invoices_table  
            WHERE $invoices_table.deleted=0 AND $invoices_table.status='not_paid' $where $invoice_date_where $invoices_where
            GROUP BY MONTH(bill_date)";

        $info->invoices = $this->db->query($invoices)->getResult();
        $info->currencies = $this->get_used_currencies_of_client()->getResult();

        return $info;
    }

    function get_used_currencies_of_client() {
        $clients_table = $this->db->prefixTable('clients');
        $default_currency = get_setting("default_currency");

        $sql = "SELECT $clients_table.currency, $clients_table.currency_symbol
            FROM $clients_table
            WHERE $clients_table.deleted=0 AND $clients_table.currency!='' AND $clients_table.currency!='$default_currency'
            GROUP BY $clients_table.currency";

        return $this->db->query($sql);
    }

    function get_invoices_total_and_paymnts($options = array()) {
        $invoices_table = $this->db->prefixTable('invoices');
        $invoice_payments_table = $this->db->prefixTable('invoice_payments');
        $clients_table = $this->db->prefixTable('clients');

        $info = new \stdClass();

        $tolarance = get_paid_status_tolarance();

        $where = "";

        $return_only = get_array_value($options, "return_only");

        $currency = $this->_get_clean_value($options, "currency");
        if ($currency) {
            $where .= $this->_get_clients_of_currency_query($currency, $invoices_table, $clients_table);
        }

        $payments = "SELECT SUM($invoice_payments_table.amount) AS total,
            (SELECT $clients_table.currency FROM $clients_table WHERE $clients_table.id=(
                SELECT $invoices_table.client_id FROM $invoices_table WHERE $invoices_table.id=$invoice_payments_table.invoice_id
                )
            ) AS currency
            FROM $invoice_payments_table
            LEFT JOIN $invoices_table ON $invoices_table.id=$invoice_payments_table.invoice_id    
            WHERE $invoice_payments_table.deleted=0 AND $invoices_table.deleted=0
            GROUP BY currency";

        $now = get_my_local_time("Y-m-d");

        $invoices = "SELECT SUM($invoices_table.invoice_total) AS total, SUM(1) AS count, (SELECT $clients_table.currency FROM $clients_table WHERE $clients_table.id=$invoices_table.client_id) AS currency
            FROM $invoices_table
            WHERE $invoices_table.deleted=0 AND $invoices_table.status='not_paid' $where
            GROUP BY currency";

        $draft = "SELECT SUM($invoices_table.invoice_total) AS total, SUM(1) AS count, (SELECT $clients_table.currency FROM $clients_table WHERE $clients_table.id=$invoices_table.client_id) AS currency
            FROM $invoices_table
            WHERE $invoices_table.deleted=0 AND $invoices_table.status='draft' $where
            GROUP BY currency";

        $fully_paid = "SELECT SUM($invoices_table.invoice_total) AS total, SUM(1) AS count, (SELECT $clients_table.currency FROM $clients_table WHERE $clients_table.id=$invoices_table.client_id) AS currency
            FROM $invoices_table
            LEFT JOIN (SELECT invoice_id, SUM($invoice_payments_table.amount) AS payment_received FROM $invoice_payments_table WHERE deleted=0 GROUP BY invoice_id) AS payments_table ON payments_table.invoice_id = $invoices_table.id 
            WHERE  $invoices_table.deleted=0 AND $invoices_table.status='not_paid' AND TRUNCATE(IFNULL(payments_table.payment_received,0),2)>=($invoices_table.invoice_total-$tolarance) $where
            GROUP BY currency";

        $partially_paid = "SELECT SUM($invoices_table.invoice_total) AS total, SUM(1) AS count, (SELECT $clients_table.currency FROM $clients_table WHERE $clients_table.id=$invoices_table.client_id) AS currency
            FROM $invoices_table
            LEFT JOIN (SELECT invoice_id, SUM(amount) AS payment_received FROM $invoice_payments_table WHERE deleted=0 GROUP BY invoice_id) AS payments_table ON payments_table.invoice_id = $invoices_table.id 
            WHERE $invoices_table.deleted=0 AND $invoices_table.status='not_paid' AND IFNULL(payments_table.payment_received,0)>0 && TRUNCATE(IFNULL(payments_table.payment_received,0),2) < $invoices_table.invoice_total-$tolarance $where
            GROUP BY currency";

        $not_paid = "SELECT SUM($invoices_table.invoice_total) AS total, SUM(1) AS count, (SELECT $clients_table.currency FROM $clients_table WHERE $clients_table.id=$invoices_table.client_id) AS currency
            FROM $invoices_table            
            LEFT JOIN (SELECT invoice_id, SUM(amount) AS payment_received FROM $invoice_payments_table WHERE deleted=0 GROUP BY invoice_id) AS payments_table ON payments_table.invoice_id = $invoices_table.id 
            WHERE $invoices_table.deleted=0 AND $invoices_table.status='not_paid' AND IFNULL(payments_table.payment_received,0)<=0 $where
            GROUP BY currency";

        $overdue = "SELECT SUM($invoices_table.invoice_total - IFNULL(payments_table.payment_received,0)) AS total , SUM(1) AS count, (SELECT $clients_table.currency FROM $clients_table WHERE $clients_table.id=$invoices_table.client_id) AS currency
            FROM $invoices_table
            LEFT JOIN (SELECT invoice_id, SUM(amount) AS payment_received FROM $invoice_payments_table WHERE deleted=0 GROUP BY invoice_id) AS payments_table ON payments_table.invoice_id = $invoices_table.id 
            WHERE $invoices_table.deleted=0  AND $invoices_table.status='not_paid' AND $invoices_table.due_date<'$now' AND TRUNCATE(IFNULL(payments_table.payment_received,0),2)<$invoices_table.invoice_total-$tolarance $where
            GROUP BY currency";

        $payments_total = 0;

        if (!$return_only || $return_only == "payments" || $return_only == "due") {
            $payments_result = $this->db->query($payments)->getResult();
            foreach ($payments_result as $payment) {
                $payments_total += get_converted_amount($payment->currency, $payment->total);
            }
        }

        $invoices_total = 0;
        $invoices_count = 0;

        if (!$return_only || $return_only == "invoices" || $return_only == "due") {
            $invoices_result = $this->db->query($invoices)->getResult();
            foreach ($invoices_result as $invoice) {
                $invoices_count += $invoice->count;
                $invoices_total += get_converted_amount($invoice->currency, $invoice->total);
            }
        }

        $draft_total = 0;
        $draft_count = 0;
        if (!$return_only || $return_only == "draft") {
            $drafts_result = $this->db->query($draft)->getResult();
            foreach ($drafts_result as $draft) {
                $draft_count += $draft->count;
                $draft_total += get_converted_amount($draft->currency, $draft->total);
            }
        }

        $fully_paid_total = 0;
        $fully_paid_count = 0;
        if (!$return_only || $return_only == "fully_paid") {
            $fully_paid_result = $this->db->query($fully_paid)->getResult();
            foreach ($fully_paid_result as $fully_paid) {
                $fully_paid_count += $fully_paid->count;
                $fully_paid_total += get_converted_amount($fully_paid->currency, $fully_paid->total);
            }
        }

        $partially_paid_total = 0;
        $partially_paid_count = 0;
        if (!$return_only || $return_only == "partially_paid") {
            $partially_paid_result = $this->db->query($partially_paid)->getResult();
            foreach ($partially_paid_result as $partially_paid) {
                $partially_paid_count += $partially_paid->count;
                $partially_paid_total += get_converted_amount($partially_paid->currency, $partially_paid->total);
            }
        }

        $not_paid_total = 0;
        $not_paid_count = 0;
        if (!$return_only || $return_only == "not_paid") {
            $not_paid_result = $this->db->query($not_paid)->getResult();
            foreach ($not_paid_result as $not_paid) {
                $not_paid_count += $not_paid->count;
                $not_paid_total += get_converted_amount($not_paid->currency, $not_paid->total);
            }
        }

        $overdue_total = 0;
        $overdue_count = 0;
        if (!$return_only || $return_only == "overdue") {
            $overdue_result = $this->db->query($overdue)->getResult();
            foreach ($overdue_result as $overdue) {
                $overdue_count += $overdue->count;
                $overdue_total += get_converted_amount($overdue->currency, $overdue->total);
            }
        }

        $info->payments_total = $payments_total;

        $info->invoices_total = $invoices_total;
        $info->invoices_count = $invoices_count;

        $info->draft_total = $draft_total;
        $info->draft_count = $draft_count;

        $info->fully_paid_total = $fully_paid_total;
        $info->fully_paid_count = $fully_paid_count;

        $info->partially_paid_total = $partially_paid_total;
        $info->partially_paid_count = $partially_paid_count;

        $info->not_paid = $not_paid_total;
        $info->not_paid_count = $not_paid_count;

        $info->overdue = $overdue_total;
        $info->overdue_count = $overdue_count;

        $info->due = ignor_minor_value($invoices_total - $payments_total);

        return $info;
    }

    //update invoice status
    function update_invoice_status($invoice_id = 0, $status = "not_paid") {
        $status = $status ? $this->db->escapeString($status) : $status;
        $status_data = array("status" => $status);
        return $this->ci_save($status_data, $invoice_id);
    }

    //get the recurring invoices which are ready to renew as on a given date
    function get_renewable_invoices($date) {
        $invoices_table = $this->db->prefixTable('invoices');

        $sql = "SELECT * FROM $invoices_table
                        WHERE $invoices_table.deleted=0 AND $invoices_table.recurring=1
                        AND $invoices_table.next_recurring_date IS NOT NULL AND $invoices_table.next_recurring_date<='$date'
                        AND ($invoices_table.no_of_cycles < 1 OR ($invoices_table.no_of_cycles_completed < $invoices_table.no_of_cycles ))";

        return $this->db->query($sql);
    }

    //get invoices dropdown list
    function get_invoices_dropdown_list() {
        $invoices_table = $this->db->prefixTable('invoices');

        $sql = "SELECT $invoices_table.id FROM $invoices_table
                        WHERE $invoices_table.deleted=0 AND $invoices_table.type = 'invoice'
                        ORDER BY $invoices_table.id DESC";

        return $this->db->query($sql);
    }

    //get label suggestions
    function get_label_suggestions() {
        $invoices_table = $this->db->prefixTable('invoices');
        $sql = "SELECT GROUP_CONCAT(labels) as label_groups
        FROM $invoices_table
        WHERE $invoices_table.deleted=0";
        return $this->db->query($sql)->getRow()->label_groups;
    }

    //get invoice last id
    function get_last_invoice_id() {
        $invoices_table = $this->db->prefixTable('invoices');

        $sql = "SELECT MAX($invoices_table.id) AS last_id FROM $invoices_table";

        return $this->db->query($sql)->getRow()->last_id;
    }

    //save initial number of invoice
    function save_initial_number_of_invoice($value) {
        $invoices_table = $this->db->prefixTable('invoices');

        $sql = "ALTER TABLE $invoices_table AUTO_INCREMENT=$value;";

        return $this->db->query($sql);
    }

    function get_invoice_total_meta($invoice_id) {
        $id = $this->db->escapeString($invoice_id);
        $invoices_table = $this->db->prefixTable('invoices');
        $invoice_items_table = $this->db->prefixTable('invoice_items');
        $info = $this->get_sales_total_meta($id, $invoices_table, $invoice_items_table);
        return $info;
    }

    function update_invoice_total_meta($invoice_id) {
        $info = $this->get_invoice_total_meta($invoice_id);

        $data = array(
            "invoice_total" => $info->invoice_total,
            "invoice_subtotal" => $info->invoice_subtotal,
            "discount_total" => $info->discount_total,
            "tax" => $info->tax,
            "tax2" => $info->tax2,
            "tax3" => $info->tax3
        );

        return $this->ci_save($data, $invoice_id);
    }

    function save_invoice_and_update_total($data, $id = 0) {
        $save_id = $this->ci_save($data, $id);

        $update_total = false;
        $total_updateable_fields = array("tax_id", "tax_id2", "tax_id3", "discount_amount", "discount_amount_type", "discount_type");
        foreach ($total_updateable_fields as $field) {
            if (array_key_exists($field, $data)) {
                $update_total = true;
            }
        }

        if ($update_total) {
            $this->update_invoice_total_meta($save_id);
        }

        return $save_id;
    }

    function get_invoices_summary($options = array()) {
        $invoice_payments_table = $this->db->prefixTable('invoice_payments');
        $clients_table = $this->db->prefixTable('clients');
        $invoices_table = $this->db->prefixTable('invoices');

        $where = "";
        $start_date = $this->_get_clean_value($options, "start_date");
        $end_date = $this->_get_clean_value($options, "end_date");
        if ($start_date && $end_date) {
            $where .= " AND ($invoices_table.due_date BETWEEN '$start_date' AND '$end_date') ";
        }


        $selected_currency = get_array_value($options, "currency");
        $default_currency = get_setting("default_currency");
        $currency = $selected_currency ? $selected_currency : get_setting("default_currency");
        $currency = $this->db->escapeString($currency);

        $where .= ($currency == $default_currency) ? " AND ($clients_table.currency='$default_currency' OR $clients_table.currency='' OR $clients_table.currency IS NULL)" : " AND $clients_table.currency='$currency'";

        $sql = "SELECT COUNT($invoices_table.id) AS invoice_count, SUM($invoices_table.invoice_total) AS invoice_total, SUM($invoices_table.discount_total) AS discount_total, SUM($invoices_table.tax) AS tax_total, SUM($invoices_table.tax2) AS tax2_total, SUM($invoices_table.tax3) AS tax3_total,
                $invoices_table.client_id, $clients_table.company_name AS client_name, $clients_table.currency, $clients_table.currency_symbol,
                SUM(payments_table.payment_received) AS payment_received
            FROM $invoices_table
            LEFT JOIN $clients_table ON $clients_table.id = $invoices_table.client_id             
            LEFT JOIN (SELECT SUM($invoice_payments_table.amount) AS payment_received, $invoice_payments_table.invoice_id FROM $invoice_payments_table WHERE $invoice_payments_table.deleted=0 GROUP BY $invoice_payments_table.invoice_id) AS payments_table ON payments_table.invoice_id = $invoices_table.id
            WHERE $invoices_table.deleted=0 AND $invoices_table.status = 'not_paid' $where
            GROUP BY $invoices_table.client_id";
        $result = $this->db->query($sql);

        return $result;
    }
}
