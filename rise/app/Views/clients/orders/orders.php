<div class="card rounded-bottom">
    <div class="tab-title clearfix">
        <h4><?php echo app_lang('orders'); ?></h4>
    </div>
    <div class="table-responsive">
        <table id="order-table" class="display" width="100%">
        </table>
    </div>
</div>
<script type="text/javascript">
    $(document).ready(function () {
        $("#order-table").appTable({
            source: '<?php echo_uri("orders/order_list_data_of_client/" . $client_id) ?>',
            order: [[0, "desc"]],
            filterDropdown: [<?php echo $custom_field_filters; ?>],
            columns: [
                {visible: false, searchable: false},
                {title: "<?php echo app_lang("order") ?>", "class": "w10p", "iDataSort": 0},
                {visible: false, searchable: false},
                {title: "<?php echo app_lang("invoices") ?>", "class": "w20p"},
                {visible: false, searchable: false},
                {title: "<?php echo app_lang("order_date") ?>", "iDataSort": 4, "class": "w15p"},
                {title: "<?php echo app_lang("amount") ?>", "class": "text-right w15p"},
                {title: "<?php echo app_lang("status") ?>", "class": "text-center w15p"}
<?php echo $custom_field_headers; ?>,
                {visible: false}
            ],
            summation: [{column: 5, dataType: 'currency'}]
        });
    });
</script>