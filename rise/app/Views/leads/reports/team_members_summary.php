<div class="table-responsive">
    <table id="team-members-summary" class="display" width="100%">
    </table>
</div>

<?php
$columns = array(array("title" => app_lang("owner")));
foreach ($lead_statuses as $status) {
    $columns[] = array("title" => $status->title, "class" => "text-right");
}
$columns[] = array("title" => app_lang("converted_to_client"), "class" => "text-right");
?>

<script type="text/javascript">

    $(document).ready(function () {

        $("#team-members-summary").appTable({

            source: '<?php echo_uri("leads/team_members_summary_data") ?>',
            rangeDatepicker: [{startDate: {name: "created_date_from", value: ""}, endDate: {name: "created_date_to", value: ""}, showClearButton: true, label: "<?php echo app_lang('created_date'); ?>", ranges: ['this_month', 'last_month', 'this_year', 'last_year', 'last_30_days', 'last_7_days']}],
            filterDropdown: [
                {name: "source_id", class: "w200", options: <?php echo $sources_dropdown; ?>},
                {name: "label_id", class: "w200", options: <?php echo $labels_dropdown; ?>}
            ],
            columns: <?php echo json_encode($columns) ?>,
            printColumns: [0, 1, 2, 3, 4, 5, 6, 7],
            xlsColumns: [0, 1, 2, 3, 4, 5, 6, 7]
        });
    }
    );
</script>