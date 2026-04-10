<div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h4><?php echo app_lang("api_keys"); ?></h4>
        <?php if (empty($upgrade_required)) { ?>
            <button class="btn btn-primary" id="btn-generate-key"><i class="fa fa-plus"></i> <?php echo app_lang("generate_key"); ?></button>
        <?php } ?>
    </div>
    <div class="card-body">
        <?php if (!empty($upgrade_required)) { ?>
            <div class="text-center py-5">
                <i class="fa fa-lock fa-3x text-muted mb-3"></i>
                <h5><?php echo app_lang("plan_upgrade_required"); ?></h5>
                <p><?php echo app_lang("api_access_enterprise_only"); ?></p>
                <a href="<?php echo get_uri("primo_subscriptions"); ?>" class="btn btn-primary"><?php echo app_lang("view_plans"); ?></a>
            </div>
        <?php } else { ?>

            <!-- Key generation alert area -->
            <div class="alert alert-success d-none" id="new-key-alert">
                <strong><?php echo app_lang("api_key_generated"); ?></strong>
                <br>
                <code id="new-key-value" class="fs-5"></code>
                <br>
                <small class="text-danger"><?php echo app_lang("copy_key_warning"); ?></small>
                <button class="btn btn-sm btn-outline-secondary ms-2" id="btn-copy-key"><i class="fa fa-copy"></i> <?php echo app_lang("copy"); ?></button>
            </div>

            <table id="api-keys-table" class="display" cellspacing="0" width="100%"></table>

            <script>
                $(document).ready(function () {
                    $("#api-keys-table").appTable({
                        source: "<?php echo get_uri("api_keys/list_data"); ?>",
                        columns: [
                            {title: "ID"},
                            {title: "<?php echo app_lang("label"); ?>"},
                            {title: "<?php echo app_lang("api_key"); ?>"},
                            {title: "<?php echo app_lang("status"); ?>"},
                            {title: "<?php echo app_lang("requests"); ?>"},
                            {title: "<?php echo app_lang("last_used"); ?>"},
                            {title: "<?php echo app_lang("created"); ?>"},
                            {title: ""},
                        ]
                    });

                    $("#btn-generate-key").click(function () {
                        var label = prompt("<?php echo app_lang("enter_key_label"); ?>");
                        if (!label) return;

                        $.post("<?php echo get_uri("api_keys/generate"); ?>", {label: label}, function (result) {
                            if (result.success) {
                                $("#new-key-value").text(result.api_key);
                                $("#new-key-alert").removeClass("d-none");
                                $("#api-keys-table").appTable({reload: true});
                            } else {
                                appAlert(result.message, {type: "error"});
                            }
                        }, "json");
                    });

                    $("#btn-copy-key").click(function () {
                        navigator.clipboard.writeText($("#new-key-value").text());
                        $(this).html('<i class="fa fa-check"></i> Copied!');
                    });
                });
            </script>
        <?php } ?>
    </div>
</div>
