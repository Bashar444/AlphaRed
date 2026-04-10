<div id="page-content" class="page-wrapper clearfix">
    <div class="row">
        <div class="col-sm-3 col-lg-2">
            <?php
            $tab_view['active_tab'] = "projects";
            echo view("settings/tabs", $tab_view);
            ?>
        </div>

        <div class="col-sm-9 col-lg-10">
            <div class="card">
                <ul data-bs-toggle="ajax-tab" class="nav nav-tabs bg-white title" role="tablist">
                    <li><a role="presentation" data-bs-toggle="tab" href="javascript:;" data-bs-target="#project-settings-tab"> <?php echo app_lang('project_settings'); ?></a></li>
                    <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("project_status"); ?>" data-bs-target="#project-status-tab"><?php echo app_lang('project_status'); ?></a></li>

                    <div class="tab-title clearfix no-border">
                        <div class="title-button-group">
                            <?php echo modal_anchor(get_uri("project_status/modal_form"), "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_project_status'), array("class" => "btn btn-default", "title" => app_lang('add_project_status'), "id" => "project-status-button")); ?>
                        </div>
                    </div>
                </ul>

                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane fade" id="project-settings-tab">
                        <?php echo form_open(get_uri("settings/save_projects_settings"), array("id" => "project-settings-form", "class" => "general-form dashed-row", "role" => "form")); ?>
                        <div class="card-body">
                            <div class="form-group">
                                <div class="row">
                                    <label for="project_tab_order" class=" col-md-3"><?php echo app_lang('set_project_tab_order'); ?></label>
                                    <div class=" col-md-9">
                                        <?php
                                        echo form_input(array(
                                            "id" => "project_tab_order",
                                            "name" => "project_tab_order",
                                            "value" => get_setting("project_tab_order"),
                                            "class" => "form-control",
                                            "placeholder" => app_lang('project_tab_order')
                                        ));
                                        ?>
                                        <span class="mt10 d-inline-block text-off"><i data-feather="info" class="icon-16"></i> <?php echo app_lang("project_tab_order_help_message"); ?></span> 
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button type="submit" class="btn btn-primary"><span data-feather="check-circle" class="icon-16"></span> <?php echo app_lang('save'); ?></button>
                        </div>
                        <?php echo form_close(); ?>
                    </div>
                    <div role="tabpanel" class="tab-pane fade" id="project-status-tab"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        $("#project-settings-form").appForm({
            isModal: false,
            onSuccess: function (result) {
                appAlert.success(result.message, {duration: 10000});
            }
        });

        $("#project_tab_order").select2({
            multiple: true,
            data: <?php echo ($project_tabs_dropdown); ?>
        });

        $('[data-bs-toggle="tooltip"]').tooltip();
    });
</script>