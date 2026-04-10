<div class="table-responsive">
    <table id="clints-summary" class="display" width="100%">
    </table>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        var timeVisiblity = (<?php echo $show_time_logged_data; ?> == 1) ? true : false;

        $("#clints-summary").appTable({
            source: '<?php echo_uri("projects/clients_summary_data") ?>',
            rangeDatepicker: [{startDate: {name: "start_date_from", value: ""}, endDate: {name: "start_date_to", value: ""}, showClearButton: true, label: "<?php echo app_lang('project_start_date'); ?>", ranges: ['this_month', 'last_month', 'this_year', 'last_year', 'last_30_days', 'last_7_days']}],
            columns: [
                {title: '<?php echo app_lang("client") ?> '},
                {title: '<?php echo $project_status_text_info->open . " " . app_lang("projects") ?>', class: "text-right"},
                {title: '<?php echo $project_status_text_info->completed . " " . app_lang("projects") ?>', class: "text-right"},
                {title: '<?php echo $project_status_text_info->hold . " " . app_lang("projects") ?>', class: "text-right"},
                {title: '<?php echo app_lang("open_tasks") ?>', class: "text-right"},
                {title: '<?php echo app_lang("completed_tasks") ?>', class: "text-right"},
                {title: '<?php echo app_lang("total_time_logged") ?>', visible: timeVisiblity, class: "text-right"},
                {title: '<?php echo app_lang("total_time_logged") . " (" . app_lang("hours") ?>)', visible: timeVisiblity, class: "text-right"}
            ],
            printColumns: [0, 1, 2, 3, 4, 5, 6, 7],
            xlsColumns: [0, 1, 2, 3, 4, 5, 6, 7],
            summation: [
                {column: 1, dataType: 'number'},
                {column: 2, dataType: 'number'},
                {column: 3, dataType: 'number'},
                {column: 4, dataType: 'number'},
                {column: 5, dataType: 'number'},
                {column: 7, dataType: 'number'}
            ]
        });
    });
</script>