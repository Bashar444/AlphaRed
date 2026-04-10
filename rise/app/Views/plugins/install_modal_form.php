<?php echo form_open(get_uri("plugins/save_status_of_plugin/$plugin/installed"), array("id" => "plugin-form", "class" => "general-form", "role" => "form")); ?>
<div class="modal-body clearfix">
    <div class="container-fluid">
        <div class=" form-group">
            <div class="row">
                <label for="expense_date" class=" col-md-3">Purchase code</label>
                <div class="col-md-9">
                    <?php
                    echo form_input(array(
                        "id" => "file_description",
                        "name" => "file_description",
                        "value" => "",
                        "class" => "form-control",
                        "placeholder" => "Purchase code"
                    ));
                    ?>
                </div>
            </div>
        </div>

    </div>
</div>

<div class="modal-footer">
    <button type="button" class="btn btn-default cancel-upload" data-bs-dismiss="modal"><span data-feather="x" class="icon-16"></span> <?php echo app_lang('close'); ?></button>
    <button type="submit"  class="btn btn-primary start-upload"><span data-feather="download" class="icon-16"></span> <?php echo app_lang('install'); ?></button>
</div>
<?php echo form_close(); ?>

<script type="text/javascript">
    $(document).ready(function () {
        $("#plugin-form").appForm({
            onSuccess: function (result) {
                if (result.success) {
                    $("#plugin-table").appTable({reload: true});
                }
            }
        });
    });

</script>    
