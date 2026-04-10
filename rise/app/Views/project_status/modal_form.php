<?php echo form_open(get_uri("project_status/save"), array("id" => "project-status-form", "class" => "general-form", "role" => "form")); ?>
<div class="modal-body clearfix">
    <div class="container-fluid">
        <input type="hidden" name="id" value="<?php echo $model_info->id; ?>" />

        <div class="form-group">
            <div class="row">
                <label for="title" class=" col-md-3"><?php echo app_lang('title'); ?></label>
                <div class=" col-md-9">
                    <?php
                    echo form_input(array(
                        "id" => "title",
                        "name" => "title",
                        "value" => $model_info->title,
                        "class" => "form-control",
                        "placeholder" => app_lang('title'),
                        "autofocus" => true,
                        "data-rule-required" => true,
                        "data-msg-required" => app_lang("field_required"),
                    ));
                    ?>

                    <div class="help-block ml10 mt-1"><?php
                        if ($model_info->key_name) {
                            echo app_lang($model_info->key_name . '_project_status_recommendation_help_text');
                        }
                        ?></div>
                </div>
            </div>
        </div>

        <div class="form-group">
            <div class="row">
                <label for="title_language_key" class=" col-md-3"><?php echo app_lang('title_language_key'); ?>
                    <span class="help" data-container="body" data-bs-toggle="tooltip" title="<?php echo app_lang('status_language_key_recommendation_help_text') ?>"><i data-feather="help-circle" class="icon-16"></i></span>
                </label>
                <div class=" col-md-9">
                    <?php
                    echo form_input(array(
                        "id" => "title_language_key",
                        "name" => "title_language_key",
                        "value" => $model_info->title_language_key,
                        "class" => "form-control",
                        "placeholder" => app_lang('keep_it_blank_if_you_do_not_use_translation')
                    ));
                    ?>
                </div>
            </div>
        </div>


        <div class="form-group">
            <div class="row">
                <div class="col-md-12">
                    <?php echo view("left_menu/icon_plate"); ?>
                </div>
            </div>
        </div>

    </div>
</div>

<div class="modal-footer">
    <button type="button" class="btn btn-default" data-bs-dismiss="modal"><span data-feather="x" class="icon-16"></span> <?php echo app_lang('close'); ?></button>
    <button type="submit" class="btn btn-primary"><span data-feather="check-circle" class="icon-16"></span> <?php echo app_lang('save'); ?></button>
</div>

<?php echo form_close(); ?>

<script type="text/javascript">
    $(document).ready(function () {
        $("#project-status-form").appForm({
            onSuccess: function (result) {
                $("#project-status-table").appTable({newData: result.data, dataId: result.id});
            }
        });

        setTimeout(function () {
            $("#title").focus();
        }, 200);


        $('[data-bs-toggle="tooltip"]').tooltip();
    });
</script>    