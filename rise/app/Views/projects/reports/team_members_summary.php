<?php echo get_reports_topbar(); ?>

<div id="page-content" class="page-wrapper clearfix grid-button">
    <div class="card clearfix">
        <ul id="project-reports-tabs" data-bs-toggle="ajax-tab" class="nav nav-tabs bg-white inner" role="tablist">
            <li class="title-tab"><h4 class="pl15 pt10 pr15"><?php echo app_lang("projects"); ?></h4></li>
            <li><a role="presentation" data-bs-toggle="tab"  href="javascript:;" data-bs-target="#team-members-summary-tab"><?php echo app_lang("team_members_summary"); ?></a></li>
            <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("projects/clients_summary"); ?>" data-bs-target="#clints-summary-tab"><?php echo app_lang('clients_summary'); ?></a></li>

        </ul>

        <div class="tab-content">
            <div role="tabpanel" class="tab-pane fade" id="team-members-summary-tab">
                <div class="table-responsive">
                    <table id="team-members-summary" class="display" width="100%">
                    </table>
                </div>
            </div>
            <div role="tabpanel" class="tab-pane fade" id="clints-summary-tab"></div>

        </div>
    </div>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        var timeVisiblity = (<?php echo $show_time_logged_data; ?> == 1) ? true : false;

        $("#team-members-summary").appTable({
            source: '<?php echo_uri("projects/team_members_summary_data") ?>',
            rangeDatepicker: [{startDate: {name: "start_date_from", value: ""}, endDate: {name: "start_date_to", value: ""}, showClearButton: true, label: "<?php echo app_lang('project_start_date'); ?>", ranges: ['this_month', 'last_month', 'this_year', 'last_year', 'last_30_days', 'last_7_days']}],
            columns: [
                {title: '<?php echo app_lang("team_member") ?> '},
                {title: '<?php echo $project_status_text_info->open . " " . app_lang("projects") ?>', class: "text-right"},
                {title: '<?php echo $project_status_text_info->completed . " " . app_lang("projects") ?>', class: "text-right"},
                {title: '<?php echo $project_status_text_info->hold . " " . app_lang("projects") ?>', class: "text-right"},
                {title: '<?php echo app_lang("open_tasks") ?>', class: "text-right"},
                {title: '<?php echo app_lang("completed_tasks") ?>', class: "text-right"},
                {title: '<?php echo app_lang("total_time_logged") ?>', visible: timeVisiblity, class: "text-right"},
                {title: '<?php echo app_lang("total_time_logged") . " (" . app_lang("hours") ?>)', visible: timeVisiblity, class: "text-right"}
            ],
            printColumns: [0, 1, 2, 3, 4, 5, 6, 7],
            xlsColumns: [0, 1, 2, 3, 4, 5, 6, 7]
        });
    });
</script>