<?php echo get_reports_topbar(); ?>

<div id="page-content" class="page-wrapper clearfix grid-button">
    <div class="card clearfix">
        <ul id="tickets-reports-tabs" data-bs-toggle="ajax-tab" class="nav nav-tabs bg-white inner" role="tablist">
            <li class="title-tab"><h4 class="pl15 pt10 pr15"><?php echo app_lang("tickets"); ?></h4></li>
            <li><a role="presentation" data-bs-toggle="tab"  href="javascript:;" data-bs-target="#tickets-chart-tab"><?php echo app_lang("ticket_statistics"); ?></a></li>
            <!--<li><a role="presentation" data-bs-toggle="tab" href="<?php // echo_uri("tickets/team_members_summary"); ?>" data-bs-target="#team-members-summary-tab"><?php //echo app_lang('team_members_summary'); ?></a></li>-->
        </ul>

        <div class="tab-content">

            <div role="tabpanel" class="tab-pane fade" id="tickets-chart-tab">

                <div class="bg-white">
                    <div id="tickets-chart-filters"></div>
                </div>

                <div id="load-tickets-chart"></div>

            </div>
            <div role="tabpanel" class="tab-pane fade" id="team-members-summary-tab"></div>
        </div>
    </div>
</div>


<script type="text/javascript">

    $(document).ready(function () {
        $("#tickets-chart-filters").appFilters({
            source: '<?php echo_uri("tickets/tickets_chart_report_data") ?>',
            targetSelector: '#load-tickets-chart',
            dateRangeType: "monthly",
            filterDropdown: [
                {name: "ticket_type_id", class: "w200", options: <?php echo $ticket_types_dropdown; ?>},
                {name: "assigned_to", class: "w200", options: <?php echo $assigned_to_dropdown; ?>},
                {name: "ticket_label", class: "w200", options: <?php echo $ticket_labels_dropdown; ?>}

            ]
        });
    });

</script>