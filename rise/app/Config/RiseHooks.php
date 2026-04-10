<?php

register_data_insert_hook(function ($hook_data) {
    $table_without_prefix = get_array_value($hook_data, "table_without_prefix");
    
    if ($table_without_prefix === "invoice_payments") {
        $Hooks = new App\Libraries\Hooks();
        $Hooks->change_order_status_after_payment($hook_data);
    }
});
