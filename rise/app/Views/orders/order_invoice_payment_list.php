<div class="card">
    <div class="tab-title clearfix">
        <h4> <?php echo app_lang('invoice_payment_list'); ?></h4>
    </div>
    <div class="table-responsive">
        <table id="invoice-payment-table" class="display" cellspacing="0" width="100%">            
        </table>
    </div>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        $("#invoice-payment-table").appTable({
            source: '<?php echo_uri("invoice_payments/payment_list_data_of_order/" . $order_info->id . "/$order_info->client_id") ?>',
            order: [[0, "asc"]],
            columns: [
                {title: "<?php echo app_lang("invoice_id") ?>", "class": "w15p all"},
                {visible: false, searchable: false},
                {title: '<?php echo app_lang("payment_date") ?> ', "class": "w15p", "iDataSort": 1},
                {title: '<?php echo app_lang("payment_method") ?>', "class": "w15p"},
                {title: '<?php echo app_lang("note") ?>', "class": "w15p"},
                {title: '<?php echo app_lang("amount") ?>', "class": "text-right w15p"},
                {visible: false, searchable: false}
            ]
        });
    });
</script>