<div class="card">
    <div class="tab-title clearfix">
        <h4><?php echo app_lang('invoices'); ?></h4>
    </div>

    <div class="table-responsive">
        <table id="subscription-invoices-table" class="display" width="100%">       
        </table>
    </div>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        var currencySymbol = "<?php echo $subscription_info->currency_symbol; ?>";
        $("#subscription-invoices-table").appTable({
            source: '<?php echo_uri("invoices/invoice_list_data_of_subscription/" . $subscription_id) ?>',
            order: [[0, "desc"]],
            filterDropdown: [{name: "status", class: "w150", options: <?php echo view("invoices/invoice_statuses_dropdown"); ?>}, <?php echo $custom_field_filters; ?>],
            columns: [
                {visible: false, searchable: false},
                {title: "<?php echo app_lang("invoice_id") ?>", "class": "w10p all", "iDataSort": 0},
                {visible: false, searchable: false},
                {visible: false, searchable: false},
                {visible: false, searchable: false},
                {title: "<?php echo app_lang("bill_date") ?>", "class": "w10p", "iDataSort": 4},
                {visible: false, searchable: false},
                {title: "<?php echo app_lang("due_date") ?>", "class": "w10p", "iDataSort": 6},
                {title: "<?php echo app_lang("total_invoiced") ?>", "class": "w10p text-right"},
                {title: "<?php echo app_lang("payment_received") ?>", "class": "w10p text-right"},
                {title: "<?php echo app_lang("due") ?>", "class": "w10p text-right"},
                {title: "<?php echo app_lang("status") ?>", "class": "w10p text-center"}
<?php echo $custom_field_headers; ?>,
                {visible: false, searchable: false}
            ],
            printColumns: combineCustomFieldsColumns([1, 5, 7, 8, 9, 10, 11], '<?php echo $custom_field_headers; ?>'),
            xlsColumns: combineCustomFieldsColumns([1, 5, 7, 8, 9, 10, 11], '<?php echo $custom_field_headers; ?>'),
            summation: [
                {column: 8, dataType: 'currency', currencySymbol: currencySymbol},
                {column: 9, dataType: 'currency', currencySymbol: currencySymbol},
                {column: 10, dataType: 'currency', currencySymbol: currencySymbol}
            ]
        });
    });
</script>