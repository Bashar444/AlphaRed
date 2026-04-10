<div id="page-content" class="page-wrapper clearfix">
    <div class="row">
        <div class="col-sm-3 col-lg-2">
            <?php
            $tab_view['active_tab'] = "tasks";
            echo view("settings/tabs", $tab_view);
            ?>
        </div>

        <div class="col-sm-9 col-lg-10">
            <div class="card">

                <ul data-bs-toggle="ajax-tab" class="nav nav-tabs bg-white title" role="tablist">
                    <li><a role="presentation" data-bs-toggle="tab" href="javascript:;" data-bs-target="#task-settings-tab"><?php echo app_lang('task_settings'); ?></a></li>
                    <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("task_status"); ?>" data-bs-target="#task-status-tab"> <?php echo app_lang('task_status'); ?></a></li>
                    <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("task_priority"); ?>" data-bs-target="#task-priority-tab"><?php echo app_lang('task_priority'); ?></a></li>
                    <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("checklist_template"); ?>" data-bs-target="#task-checklist-template-tab"><?php echo app_lang('checklist_template'); ?></a></li>
                    <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("checklist_groups"); ?>" data-bs-target="#task-checklist-group-tab"><?php echo app_lang('checklist_group'); ?></a></li>

                    <div class="tab-title clearfix no-border">
                        <div class="title-button-group">
                            <?php echo modal_anchor(get_uri("task_status/modal_form"), "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_task_status'), array("class" => "btn btn-default", "title" => app_lang('add_task_status'), "id" => "task-status-button")); ?>
                        </div>
                    </div>
                </ul>

                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane fade" id="task-settings-tab">
                        <?php echo form_open(get_uri("settings/save_task_settings"), array("id" => "task-settings-form", "class" => "general-form dashed-row", "role" => "form")); ?>

                        <div class="card mb0">
                            <div class="card-body">

                                <div class="form-group">
                                    <div class="row">
                                        <label for="enable_recurring_option_for_tasks" class="col-md-3"><?php echo app_lang('enable_recurring_option_for_tasks'); ?> <span class="help" data-bs-toggle="tooltip" title="<?php echo app_lang('cron_job_required'); ?>"><i data-feather='help-circle' class="icon-16"></i></span></label>
                                        <div class="col-md-9">
                                            <?php
                                            echo form_dropdown(
                                                    "enable_recurring_option_for_tasks", array("1" => app_lang("yes"), "0" => app_lang("no")), get_setting('enable_recurring_option_for_tasks') ? get_setting('enable_recurring_option_for_tasks') : 0, "class='select2 mini' id='enable_recurring_option_for_tasks'"
                                            );
                                            ?>                     
                                        </div>
                                    </div>
                                </div>

                                <div id="create_recurring_tasks_before_area" class="form-group <?php echo get_setting("enable_recurring_option_for_tasks") ? "" : "hide"; ?>">
                                    <div class="row">
                                        <label for="create_recurring_tasks_before" class=" col-md-3"><?php echo app_lang('create_recurring_tasks_before'); ?> <span class="help" data-bs-toggle="tooltip" data-placement="left" title="<?php echo app_lang('cron_job_required'); ?>"><i data-feather='help-circle' class="icon-16"></i></span></label>
                                        <div class="col-md-9">
                                            <?php
                                            echo form_dropdown(
                                                    "create_recurring_tasks_before", array(
                                                "" => " - ",
                                                "1" => "1 " . app_lang("day"),
                                                "2" => "2 " . app_lang("days"),
                                                "3" => "3 " . app_lang("days")
                                                    ), get_setting('create_recurring_tasks_before'), "class='select2 mini'"
                                            );
                                            ?>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <div class="row">
                                        <label for="project_task_deadline_pre_reminder" class=" col-md-3"><?php echo app_lang('send_task_deadline_pre_reminder'); ?> <span class="help" data-bs-toggle="tooltip" title="<?php echo app_lang('cron_job_required'); ?>"><i data-feather='help-circle' class="icon-16"></i></span></label>
                                        <div class="col-md-9">
                                            <?php
                                            echo form_dropdown(
                                                    "project_task_deadline_pre_reminder", array(
                                                "" => " - ",
                                                "1" => "1 " . app_lang("day"),
                                                "2" => "2 " . app_lang("days"),
                                                "3" => "3 " . app_lang("days"),
                                                "5" => "5 " . app_lang("days"),
                                                "7" => "7 " . app_lang("days"),
                                                "10" => "10 " . app_lang("days"),
                                                "14" => "14 " . app_lang("days"),
                                                "15" => "15 " . app_lang("days"),
                                                "20" => "20 " . app_lang("days"),
                                                "30" => "30 " . app_lang("days"),
                                                    ), get_setting('project_task_deadline_pre_reminder'), "class='select2 mini'"
                                            );
                                            ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="row">
                                        <label for="project_task_reminder_on_the_day_of_deadline" class="col-md-3"><?php echo app_lang('send_task_reminder_on_the_day_of_deadline'); ?> <span class="help" data-bs-toggle="tooltip" title="<?php echo app_lang('cron_job_required'); ?>"><i data-feather='help-circle' class="icon-16"></i></span></label>
                                        <div class="col-md-9">
                                            <?php
                                            echo form_dropdown(
                                                    "project_task_reminder_on_the_day_of_deadline", array("1" => app_lang("yes"), "0" => app_lang("no")), get_setting('project_task_reminder_on_the_day_of_deadline'), "class='select2 mini'"
                                            );
                                            ?>                     
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="row">
                                        <label for="project_task_deadline_overdue_reminder" class=" col-md-3"><?php echo app_lang('send_task_deadline_overdue_reminder'); ?> <span class="help" data-bs-toggle="tooltip" title="<?php echo app_lang('cron_job_required'); ?>"><i data-feather='help-circle' class="icon-16"></i></span></label>
                                        <div class="col-md-9">
                                            <?php
                                            echo form_dropdown(
                                                    "project_task_deadline_overdue_reminder", array(
                                                "" => " - ",
                                                "1" => "1 " . app_lang("day"),
                                                "2" => "2 " . app_lang("days"),
                                                "3" => "3 " . app_lang("days"),
                                                "5" => "5 " . app_lang("days"),
                                                "7" => "7 " . app_lang("days"),
                                                "10" => "10 " . app_lang("days"),
                                                "14" => "14 " . app_lang("days"),
                                                "15" => "15 " . app_lang("days"),
                                                "20" => "20 " . app_lang("days"),
                                                "30" => "30 " . app_lang("days"),
                                                    ), get_setting('project_task_deadline_overdue_reminder'), "class='select2 mini'"
                                            );
                                            ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="row">
                                        <label for="task_point_range" class="col-md-3"><?php echo app_lang('task_point_range'); ?></label>
                                        <div class="col-md-9">
                                            <?php
                                            echo form_dropdown(
                                                    "task_point_range", array(
                                                "5" => "1-5",
                                                "10" => "1-10",
                                                "15" => "1-15",
                                                "20" => "1-20",
                                                "05" => "0-5",
                                                "010" => "0-10",
                                                "015" => "0-15",
                                                "020" => "0-20",
                                                    ), get_setting('task_point_range'), "class='select2 mini'"
                                            );
                                            ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="row">
                                        <label for="show_in_kanban" class="col-md-3"><?php echo app_lang('show_in_kanban'); ?></label>
                                        <div class=" col-md-9">
                                            <?php
                                            echo form_input(array(
                                                "id" => "show_in_kanban",
                                                "name" => "show_in_kanban",
                                                "value" => get_setting("show_in_kanban"),
                                                "class" => "form-control mini",
                                                "placeholder" => app_lang('show_in_kanban')
                                            ));
                                            ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="row">
                                        <label for="show_time_with_task_start_date_and_deadline" class="col-md-3"><?php echo app_lang('show_time_with_task_start_date_and_deadline'); ?></label>
                                        <div class="col-md-9">
                                            <?php
                                            echo form_dropdown(
                                                    "show_time_with_task_start_date_and_deadline", array("1" => app_lang("yes"), "0" => app_lang("no")), get_setting('show_time_with_task_start_date_and_deadline') ? get_setting('show_time_with_task_start_date_and_deadline') : 0, "class='select2 mini' id='show_time_with_task_start_date_and_deadline'"
                                            );
                                            ?>                     
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card-footer">
                                <button type="submit" class="btn btn-primary"><i data-feather='check-circle' class="icon-16"></i> <?php echo app_lang('save'); ?></button>
                            </div>

                        </div>
                        <?php echo form_close(); ?>
                    </div>
                    <div role="tabpanel" class="tab-pane fade" id="task-status-tab"></div>
                    <div role="tabpanel" class="tab-pane fade" id="task-priority-tab"></div>
                    <div role="tabpanel" class="tab-pane fade" id="task-checklist-template-tab"></div>
                    <div role="tabpanel" class="tab-pane fade" id="task-checklist-group-tab"></div>
                </div>

            </div>
        </div>
    </div>
</div>


<script type="text/javascript">
    $(document).ready(function () {
        $("#task-settings-form").appForm({
            isModal: false,
            onSuccess: function (result) {
                if (result.success) {
                    appAlert.success(result.message, {duration: 10000});
                } else {
                    appAlert.error(result.message);
                }
            }
        });

        $("#task-settings-form .select2").select2();
        $('[data-bs-toggle="tooltip"]').tooltip();

        $("#show_in_kanban").select2({
            multiple: true,
            data: <?php echo ($show_in_kanban_dropdown); ?>
        });

        //show/hide recurring before area
        $("#enable_recurring_option_for_tasks").select2().on("change", function () {
            if ($(this).val() === "1") {
                $("#create_recurring_tasks_before_area").removeClass("hide");
            } else {
                $("#create_recurring_tasks_before_area").addClass("hide");
            }
        });

        //change the add button attributes on changing tab panel
        var addButton = $("#task-status-button");
        $(".nav-tabs li").click(function () {
            var activeField = $(this).find("a").attr("data-bs-target");

            if (activeField === "#task-status-tab") { //task status
                addButton.removeClass("hide");
                addButton.attr("title", "<?php echo app_lang("add_task_status"); ?>");
                addButton.attr("data-title", "<?php echo app_lang("add_task_status"); ?>");
                addButton.attr("data-action-url", "<?php echo get_uri("task_status/modal_form"); ?>");

                addButton.html("<?php echo "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_task_status'); ?>");
                feather.replace();
            } else if (activeField === "#task-checklist-template-tab") { //checklist template
                addButton.removeClass("hide");
                addButton.attr("title", "<?php echo app_lang("add_checklist_template"); ?>");
                addButton.attr("data-title", "<?php echo app_lang("add_checklist_template"); ?>");
                addButton.attr("data-action-url", "<?php echo get_uri("checklist_template/modal_form"); ?>");

                addButton.html("<?php echo "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_checklist_template'); ?>");
                feather.replace();
            } else if (activeField === "#task-checklist-group-tab") {
                addButton.removeClass("hide");
                addButton.attr("title", "<?php echo app_lang("add_checklist_group"); ?>");
                addButton.attr("data-title", "<?php echo app_lang("add_checklist_group"); ?>");
                addButton.attr("data-action-url", "<?php echo get_uri("checklist_groups/modal_form"); ?>");

                addButton.html("<?php echo "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_checklist_group'); ?>");
                feather.replace();
            } else if (activeField === "#task-priority-tab") { //tasks priority
                addButton.removeClass("hide");
                addButton.attr("title", "<?php echo app_lang("add_task_priority"); ?>");
                addButton.attr("data-title", "<?php echo app_lang("add_task_priority"); ?>");
                addButton.attr("data-action-url", "<?php echo get_uri("task_priority/modal_form"); ?>");

                addButton.html("<?php echo "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_task_priority'); ?>");
                feather.replace();
            } else if (activeField === "#task-settings-tab") { //don't show any button for task settings tab
                addButton.addClass("hide");
            }
        });
    });
</script>