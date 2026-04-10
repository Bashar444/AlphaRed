<div class="card">
    <div class="card-header">
        <h4><?php echo app_lang("manage_datasets"); ?></h4>
    </div>
    <div class="card-body">
        <table id="datasets-table" class="display" cellspacing="0" width="100%"></table>
    </div>
</div>

<script>
    $(document).ready(function () {
        $("#datasets-table").appTable({
            source: "<?php echo get_uri("primo_admin/datasets_list_data"); ?>",
            columns: [
                {title: "ID"},
                {title: "<?php echo app_lang("title"); ?>"},
                {title: "<?php echo app_lang("category"); ?>"},
                {title: "<?php echo app_lang("views"); ?>"},
                {title: "<?php echo app_lang("status"); ?>"},
                {title: "<?php echo app_lang("created"); ?>"},
                {title: ""},
            ]
        });
    });
</script>
