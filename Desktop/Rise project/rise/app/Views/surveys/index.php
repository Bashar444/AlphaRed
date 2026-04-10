<div class="card">
    <div class="card-header clearfix">
        <div class="title-button-row">
            <?php echo modal_anchor(get_uri("surveys/modal_form"), "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_survey'), array("class" => "btn btn-default", "title" => app_lang('add_survey'))); ?>
        </div>
    </div>
    <div class="table-responsive">
        <table id="survey-table" class="display" cellspacing="0" width="100%">
            <thead>
                <tr>
                    <th><?php echo app_lang("title"); ?></th>
                    <th><?php echo app_lang("status"); ?></th>
                    <th><?php echo app_lang("responses"); ?></th>
                    <th><?php echo app_lang("created"); ?></th>
                    <th class="text-center w100"><i data-feather="menu" class="icon-16"></i></th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        $("#survey-table").appTable({
            source: '<?php echo_uri("surveys/list_data"); ?>',
            columns: [
                {title: "<?php echo app_lang("title"); ?>"},
                {title: "<?php echo app_lang("status"); ?>"},
                {title: "<?php echo app_lang("responses"); ?>"},
                {title: "<?php echo app_lang("created"); ?>"},
                {title: "<i data-feather='menu' class='icon-16'></i>", class: "text-center option w100"}
            ]
        });
    });
</script>
