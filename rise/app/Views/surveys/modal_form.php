<?php echo form_open(get_uri("surveys/save"), array("id" => "survey-form", "class" => "general-form", "role" => "form")); ?>
<input type="hidden" name="id" value="<?php echo isset($model_info->id) ? $model_info->id : ''; ?>" />
<div class="modal-body clearfix">
    <div class="container-fluid">
        <div class="form-group">
            <div class="row">
                <label for="title" class="col-md-3"><?php echo app_lang('title'); ?></label>
                <div class="col-md-9">
                    <?php echo form_input(array(
                        "id" => "title",
                        "name" => "title",
                        "value" => isset($model_info->title) ? $model_info->title : "",
                        "class" => "form-control",
                        "placeholder" => app_lang('title'),
                        "data-rule-required" => true,
                        "data-msg-required" => app_lang("field_required"),
                    )); ?>
                </div>
            </div>
        </div>
        <div class="form-group">
            <div class="row">
                <label for="description" class="col-md-3"><?php echo app_lang('description'); ?></label>
                <div class="col-md-9">
                    <?php echo form_textarea(array(
                        "id" => "description",
                        "name" => "description",
                        "value" => isset($model_info->description) ? $model_info->description : "",
                        "class" => "form-control",
                        "placeholder" => app_lang('description'),
                    )); ?>
                </div>
            </div>
        </div>
        <div class="form-group">
            <div class="row">
                <label for="target_responses" class="col-md-3"><?php echo app_lang('target_responses'); ?></label>
                <div class="col-md-9">
                    <?php echo form_input(array(
                        "id" => "target_responses",
                        "name" => "target_responses",
                        "type" => "number",
                        "value" => isset($model_info->target_responses) ? $model_info->target_responses : "100",
                        "class" => "form-control",
                        "min" => "1",
                    )); ?>
                </div>
            </div>
        </div>
        <div class="form-group">
            <div class="row">
                <label for="language" class="col-md-3"><?php echo app_lang('language'); ?></label>
                <div class="col-md-9">
                    <?php echo form_dropdown("language", array(
                        "en" => "English",
                        "ta" => "Tamil",
                        "hi" => "Hindi",
                    ), isset($model_info->language) ? $model_info->language : "en", "class='select2 mini'"); ?>
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
        $("#survey-form").appForm({
            onSuccess: function (result) {
                if (typeof $("#survey-table").length !== "undefined") {
                    $("#survey-table").appTable({reload: true});
                }
            }
        });
        $("#survey-form .select2").select2();
    });
</script>
