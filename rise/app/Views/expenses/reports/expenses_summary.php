<?php echo get_reports_topbar(); ?>

<div id="page-content" class="page-wrapper clearfix grid-button">
    <div class="card clearfix">
        <ul id="summary-summary-tabs" data-bs-toggle="ajax-tab" class="nav nav-tabs bg-white inner" role="tablist">
            <li class="title-tab"><h4 class="pl15 pt10 pr15"><?php echo app_lang("expenses_summary"); ?></h4></li>
            <li><a role="presentation" data-bs-toggle="tab" href="javascript:;" data-bs-target="#yearly-expenses-summary"><?php echo app_lang('yearly'); ?></a></li>
            <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("expenses/monthly_summary"); ?>" data-bs-target="#monthly-expenses-summary"><?php echo app_lang("monthly"); ?></a></li>
            <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("expenses/custom_summary"); ?>" data-bs-target="#custom-expenses-summary"><?php echo app_lang('custom'); ?></a></li>
            <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("expenses/yearly_chart"); ?>" data-bs-target="#yearly-chart"><?php echo app_lang('yearly_chart'); ?></a></li>
            <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("expenses/category_chart"); ?>" data-bs-target="#category-chart"><?php echo app_lang('category_chart'); ?></a></li>
        </ul>

        <div class="tab-content">
            <div role="tabpanel" class="tab-pane fade" id="yearly-expenses-summary">
                <div class="table-responsive">
                    <table id="yearly-expenses-summary-table" class="display" width="100%">
                    </table>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane fade" id="monthly-expenses-summary"></div>
            <div role="tabpanel" class="tab-pane fade" id="custom-expenses-summary"></div>
            <div role="tabpanel" class="tab-pane fade" id="yearly-chart"></div>
            <div role="tabpanel" class="tab-pane fade" id="category-chart"></div>
        </div>
    </div>
</div>

<script type="text/javascript">
    loadExpensesSummaryTable = function (selector, dateRange) {
        var customDatePicker = "";
        if (dateRange === "custom") {
            customDatePicker = [{startDate: {name: "start_date", value: ""}, endDate: {name: "end_date", value: ""}, showClearButton: true}];

            dateRange = "";
        }

        $(selector).appTable({
            source: '<?php echo_uri("expenses/summary_list_data") ?>',
            order: [[0, "asc"]],
            dateRangeType: dateRange,
            rangeDatepicker: customDatePicker,
            columns: [
                {title: '<?php echo app_lang("category") ?>'},
                {title: '<?php echo app_lang("amount") ?>', "class": "text-right"},
                {title: '<?php echo app_lang("tax") ?>', "class": "text-right"},
                {title: '<?php echo app_lang("second_tax") ?>', "class": "text-right"},
                {title: '<?php echo app_lang("total") ?>', "class": "text-right"}
            ],
            printColumns: [0, 1, 2, 3, 4],
            xlsColumns: [0, 1, 2, 3, 4],
            summation: [{column: 1, dataType: 'currency'}, {column: 2, dataType: 'currency'}, {column: 3, dataType: 'currency'}, {column: 4, dataType: 'currency'}]
        });
    };

    $(document).ready(function () {
        loadExpensesSummaryTable("#yearly-expenses-summary-table", "yearly");
    });
</script>