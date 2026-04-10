<div id="page-content" class="page-wrapper clearfix">
    <div class="card clearfix">
        <ul id="order-tabs" data-bs-toggle="ajax-tab" class="nav nav-tabs bg-white title" role="tablist">
            <li class="title-tab"><h4 class="pl15 pt10 pr15"><?php echo app_lang('orders'); ?></h4></li>
            <li><a id="monthly-order-button"  role="presentation" data-bs-toggle="tab" href="javascript:;" data-bs-target="#monthly-orders"><?php echo app_lang("monthly"); ?></a></li>
            <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("orders/yearly"); ?>" data-bs-target="#yearly-orders"><?php echo app_lang('yearly'); ?></a></li>
            <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("orders/custom"); ?>" data-bs-target="#custom-orders"><?php echo app_lang('custom'); ?></a></li>

            <div class="tab-title clearfix no-border">
                <div class="title-button-group">
                    <?php echo js_anchor("<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_order'), array("class" => "btn btn-default", "id" => "add-order-btn")); ?>           
                </div>
            </div>
        </ul>

        <div class="tab-content">
            <div role="tabpanel" class="tab-pane fade" id="monthly-orders">
                <div class="table-responsive">
                    <table id="monthly-orders-table" class="display" cellspacing="0" width="100%">   
                    </table>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane fade" id="yearly-orders"></div>
            <div role="tabpanel" class="tab-pane fade" id="custom-orders"></div>
        </div>
    </div>
</div>

<script type="text/javascript">
    loadOrdersTable = function (selector, dateRange) {

        var dateRangeType = dateRange;
        var rangeDatepicker = "";
        if (dateRange === "custom") {
            dateRangeType = "";
            rangeDatepicker = [{startDate: {name: "start_date", value: moment().format("YYYY-MM-DD")}, endDate: {name: "end_date", value: moment().format("YYYY-MM-DD")}, showClearButton: true}];
        }

        $(selector).appTable({
            source: '<?php echo_uri("orders/list_data") ?>',
            order: [[0, "desc"]],
            dateRangeType: dateRangeType,
            rangeDatepicker: rangeDatepicker,
            filterDropdown: [{name: "status_id", class: "w150", options: <?php echo view("orders/order_statuses_dropdown"); ?>}, <?php echo $custom_field_filters; ?>],
            columns: [
                {visible: false, searchable: false},
                {title: "<?php echo app_lang("order") ?> ", "class": "w10p all", "iDataSort": 0},
                {title: "<?php echo app_lang("client") ?>", "class": "w20p"},
                {title: "<?php echo app_lang("invoices") ?>", "class": "w20p"},
                {visible: false, searchable: false},
                {title: "<?php echo app_lang("order_date") ?>", "iDataSort": 4, "class": "w20p"},
                {title: "<?php echo app_lang("amount") ?>", "class": "text-right w10p"},
                {title: "<?php echo app_lang("status") ?>", "class": "text-center"}
<?php echo $custom_field_headers; ?>,
                {title: '<i data-feather="menu" class="icon-16"></i>', "class": "text-center option w100"}
            ],
            printColumns: combineCustomFieldsColumns([0, 1, 2, 4, 5, 6], '<?php echo $custom_field_headers; ?>'),
            xlsColumns: combineCustomFieldsColumns([0, 1, 2, 4, 5, 6], '<?php echo $custom_field_headers; ?>'),
            summation: [{column: 6, dataType: 'currency', currencySymbol: AppHelper.settings.currencySymbol}]
        });
    };

    $(document).ready(function () {
        loadOrdersTable("#monthly-orders-table", "monthly");

        $("#add-order-btn").click(function () {
            window.location.href = "<?php echo get_uri("store"); ?>";
        });
    });

</script>

<?php echo view("orders/update_order_status_script"); ?>