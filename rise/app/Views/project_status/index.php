<div class="table-responsive">
    <table id="project-status-table" class="display no-thead b-t b-b-only no-hover" cellspacing="0" width="100%">         
    </table>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        $("#project-status-table").appTable({
            source: '<?php echo_uri("project_status/list_data") ?>',
            order: [[0, "asc"]],
            hideTools: true,
            displayLength: 100,
            columns: [
                {visible: false, searchable: false},
                {title: '<?php echo app_lang("title"); ?>'},
                {title: '<i data-feather="menu" class="icon-16"></i>', "class": "text-center option w100"}
            ]
        });
    });
</script>