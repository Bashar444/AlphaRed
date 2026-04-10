<div class="card">
    <div id="expense-chart-filters">
    </div>
    <div id="load-expense-chart"></div>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        $("#expense-chart-filters").appFilters({
            source: '<?php echo_uri("expenses/category_chart_view") ?>',
            targetSelector: '#load-expense-chart',
            rangeDatepicker: [{startDate: {name: "start_date", value: moment().startOf('year').format("YYYY-MM-DD")}, endDate: {name: "end_date", value: moment().endOf('year').format("YYYY-MM-DD")}, showClearButton: true, label: "<?php echo app_lang('date'); ?>", ranges: ['this_month', 'last_month', 'this_year', 'last_year', 'last_30_days', 'last_7_days']}],
            beforeRelaodCallback: function () {

            },
            afterRelaodCallback: function () {

            }
        });
    });
</script>