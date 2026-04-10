<?php echo get_reports_topbar(); ?>

<div id="page-content" class="page-wrapper clearfix grid-button">
    <div class="card clearfix">
        <ul id="leads-reports-tabs" data-bs-toggle="ajax-tab" class="nav nav-tabs bg-white inner" role="tablist">
            <li class="title-tab"><h4 class="pl15 pt10 pr15"><?php echo app_lang("leads"); ?></h4></li>
            <li><a id="converted-to-client-button" role="presentation" data-bs-toggle="tab"  href="javascript:;" data-bs-target="#converted-to-client-tab"><?php echo app_lang("converted_to_client"); ?></a></li>
            <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("leads/team_members_summary"); ?>" data-bs-target="#team-members-summary-tab"><?php echo app_lang('team_members_summary'); ?></a></li>

        </ul>

        <div class="tab-content">

            <div role="tabpanel" class="tab-pane fade" id="converted-to-client-tab">

                <div class="bg-white">
                    <div id="converted-to-client-monthly-chart-filters"></div>
                </div>

                <div id="load-converted-to-client-monthly-chart"></div>

            </div>
            <div role="tabpanel" class="tab-pane fade" id="team-members-summary-tab"></div>
        </div>
    </div>
</div>

<?php
$range_type_dropdown = json_encode(array(
    array("id" => "conversion_date_wise", "text" => app_lang('conversion_date_wise')),
    array("id" => "created_date_wise", "text" => app_lang('created_date_wise'))
        ));
?>

<script type="text/javascript">

    $(document).ready(function () {
        $("#converted-to-client-monthly-chart-filters").appFilters({
            source: '<?php echo_uri("leads/converted_to_client_charts_data") ?>',
            targetSelector: '#load-converted-to-client-monthly-chart',
            dateRangeType: "monthly",
            reloadSelector: "#converted-to-client-button",
            filterDropdown: [
                {name: "owner_id", class: "w200", options: <?php echo $owners_dropdown; ?>},
                {name: "source_id", class: "w200", options: <?php echo $sources_dropdown; ?>},
                {name: "date_range_type", class: "w200", options: <?php echo $range_type_dropdown; ?>}
            ]
        });
    });

</script>