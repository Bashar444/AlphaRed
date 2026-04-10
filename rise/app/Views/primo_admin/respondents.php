<div class="card">
    <div class="card-header">
        <h4><?php echo app_lang("manage_respondents"); ?></h4>
    </div>
    <div class="card-body">
        <table id="respondents-table" class="display" cellspacing="0" width="100%"></table>
    </div>
</div>

<script>
    $(document).ready(function () {
        $("#respondents-table").appTable({
            source: "<?php echo get_uri("primo_admin/respondents_list_data"); ?>",
            columns: [
                {title: "ID"},
                {title: "<?php echo app_lang("name"); ?>"},
                {title: "<?php echo app_lang("phone"); ?>"},
                {title: "<?php echo app_lang("age_group"); ?>"},
                {title: "<?php echo app_lang("gender"); ?>"},
                {title: "<?php echo app_lang("region"); ?>"},
                {title: "<?php echo app_lang("status"); ?>"},
                {title: "<?php echo app_lang("quality_score"); ?>"},
                {title: "<?php echo app_lang("joined"); ?>"},
                {title: ""},
            ]
        });
    });
</script>
