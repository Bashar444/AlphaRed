<?php echo get_reports_topbar(); ?>

<div id="page-content" class="page-wrapper clearfix grid-button">
    <div class="card clearfix">
        <ul id="payment-summary-tabs" data-bs-toggle="ajax-tab" class="nav nav-tabs bg-white inner" role="tablist">
            <li class="title-tab"><h4 class="pl15 pt10 pr15"><?php echo app_lang("payments_summary"); ?></h4></li>
            <li><a id="yearly-summary-button"  role="presentation" data-bs-toggle="tab"  href="javascript:;" data-bs-target="#yearly-payment-summary"><?php echo app_lang("monthly_summary"); ?></a></li>
            <?php if ($can_access_clients) { ?>
                <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("invoice_payments/clients_payment_summary/"); ?>" data-bs-target="#clients-payment-summary"><?php echo app_lang('clients_summary'); ?></a></li>
            <?php } ?>
        </ul>

        <div class="tab-content">
            <div role="tabpanel" class="tab-pane fade" id="yearly-payment-summary">
                <div class="table-responsive">
                    <table id="yearly-payment-summary-table" class="display" width="100%">
                    </table>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane fade" id="clients-payment-summary"></div>
        </div>
    </div>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        var currency_dropdown = <?php echo $currencies_dropdown; ?>;
        var filterDropdowns = [];
        if (currency_dropdown.length > 1) {
            filterDropdowns.push({name: "currency", class: "w150", options: currency_dropdown});
        }

        filterDropdowns.push({name: "payment_method_id", class: "w200", options: <?php echo $payment_method_dropdown; ?>});

        $("#yearly-payment-summary-table").appTable({
            source: '<?php echo_uri("invoice_payments/yearly_payment_summary_list_data") ?>',
            order: [[0, "asc"]],
            dateRangeType: "yearly",
            filterDropdown: filterDropdowns,
            columns: [
                {title: '<?php echo app_lang("month") ?> '},
                {title: '<?php echo app_lang("count") ?>', class: "text-right"},
                {title: '<?php echo app_lang("amount") ?>', "class": "text-right w15p"}
            ],
            printColumns: [0, 1, 2],
            xlsColumns: [0, 1, 2],
            summation: [
                {column: 1, dataType: 'number'},
                {column: 2, dataType: 'currency', dynamicSymbol: true}
            ]
        });
    });
</script>