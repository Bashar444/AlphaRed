<?php echo get_reports_topbar(); ?>

<div id="page-content" class="page-wrapper clearfix grid-button">
    <div class="card clearfix">
        <ul id="invoices-summary-tabs" data-bs-toggle="ajax-tab" class="nav nav-tabs bg-white inner" role="tablist">
            <li class="title-tab"><h4 class="pl15 pt10 pr15"><?php echo app_lang("invoices_summary"); ?></h4></li>
            <li><a role="presentation" data-bs-toggle="tab"  href="javascript:;" data-bs-target="#yearly-invoices-summary"><?php echo app_lang("yearly"); ?></a></li>
            <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("invoices/monthly_invoices_summary"); ?>" data-bs-target="#monthly-invoices-summary"><?php echo app_lang('monthly'); ?></a></li>
            <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("invoices/custom_invoices_summary"); ?>" data-bs-target="#custom-invoices-summary"><?php echo app_lang('custom'); ?></a></li>
        </ul>

        <div class="tab-content">
            <div role="tabpanel" class="tab-pane fade" id="yearly-invoices-summary">
                <div class="table-responsive">
                    <table id="yearly-invoices-summary-table" class="display" width="100%">
                    </table>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane fade" id="monthly-invoices-summary"></div>
            <div role="tabpanel" class="tab-pane fade" id="custom-invoices-summary"></div>
        </div>
    </div>
</div>

<script type="text/javascript">
    loadInvoicesSummaryTable = function (selector, dateRange) {
        var customDatePicker = "";
        if (dateRange === "custom") {
            customDatePicker = [{startDate: {name: "start_date", value: ""}, endDate: {name: "end_date", value: ""}, showClearButton: true}];

            dateRange = "";
        }
        var currency_dropdown = <?php echo $currencies_dropdown; ?>;

        var filtrDropdown = [];
        if (currency_dropdown.length > 1) {
            filtrDropdown = [
                {name: "currency", class: "w150", options: <?php echo $currencies_dropdown; ?>}
            ];
        }


        $(selector).appTable({
            source: '<?php echo_uri("invoices/invoices_summary_list_data") ?>',
            dateRangeType: dateRange,
            filterDropdown: filtrDropdown,
            rangeDatepicker: customDatePicker,
            columns: [
                {title: '<?php echo app_lang("client_name") ?> '},
                {title: '<?php echo app_lang("count") ?>', class: "text-right"},
                {title: '<?php echo app_lang("invoice_total") ?>', class: "text-right"},
                {title: '<?php echo app_lang("discount") ?>', class: "text-right"},
                {title: '<?php echo app_lang("tax") ?>', class: "text-right"},
                {title: '<?php echo app_lang("second_tax") ?>', class: "text-right"},
                {title: '<?php echo app_lang("tax_deducted_at_source") ?>', class: "text-right"},
                {title: '<?php echo app_lang("payment_received") ?>', class: "text-right"},
                {title: '<?php echo app_lang("due") ?>', class: "text-right"}
            ],
            printColumns: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            xlsColumns: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            summation: [
                {column: 1, dataType: 'number'},
                {column: 2, dataType: 'currency', dynamicSymbol: true},
                {column: 3, dataType: 'currency', dynamicSymbol: true},
                {column: 4, dataType: 'currency', dynamicSymbol: true},
                {column: 5, dataType: 'currency', dynamicSymbol: true},
                {column: 6, dataType: 'currency', dynamicSymbol: true},
                {column: 7, dataType: 'currency', dynamicSymbol: true},
                {column: 8, dataType: 'currency', dynamicSymbol: true},
            ]
        });
    };

    $(document).ready(function () {
        loadInvoicesSummaryTable("#yearly-invoices-summary-table", "yearly");
    });
</script>