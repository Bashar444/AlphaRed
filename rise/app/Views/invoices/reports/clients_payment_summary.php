<div class="table-responsive">
    <table id="clients-payment-summary-table" class="display" width="100%">
    </table>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        var currency_dropdown = <?php echo $currencies_dropdown; ?>;
        var filterDropdowns = [];
        if (currency_dropdown.length > 1) {
            filterDropdowns.push({name: "currency", class: "w150", options: currency_dropdown});
        }

        filterDropdowns.push({name: "payment_method_id", class: "w200", options: <?php echo $payment_method_dropdown; ?>});

        $("#clients-payment-summary-table").appTable({
            source: '<?php echo_uri("invoice_payments/clients_payment_summary_list_data") ?>',
            order: [[0, "asc"]],
            rangeDatepicker: [{
                    startDate: {name: "start_date", value: ""},
                    endDate: {name: "end_date", value: ""},
                    showClearButton: true
                }],
            filterDropdown: filterDropdowns,
            columns: [
                {title: '<?php echo app_lang("client") ?> '},
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