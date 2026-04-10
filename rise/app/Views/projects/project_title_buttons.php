<?php
if (can_access_reminders_module()) {
    echo modal_anchor(get_uri("events/reminders"), "<i data-feather='clock' class='icon-16'></i> " . app_lang('reminders'), array("class" => "btn btn-light hidden-sm", "id" => "reminder-icon", "data-post-project_id" => $project_info->id, "data-post-reminder_view_type" => "project", "title" => app_lang('reminders') . " (" . app_lang('private') . ")"));
}
?>

<?php
if ($can_edit_timesheet_settings || $can_edit_slack_settings || $can_create_projects) {
    echo modal_anchor(get_uri("projects/settings_modal_form"), "<i data-feather='settings' class='icon-16'></i> " . app_lang('settings'), array("class" => "btn btn-light", "title" => app_lang('settings'), "data-post-project_id" => $project_info->id));
}
?>
<?php if ($show_actions_dropdown) { ?>
    <div class="dropdown btn-group">
        <button class="btn btn-secondary dropdown-toggle caret" type="button" data-bs-toggle="dropdown" aria-expanded="true">
            <i data-feather="tool" class="icon-16"></i> <?php echo app_lang('actions'); ?>
        </button>
        <ul class="dropdown-menu" role="menu">
            <?php
            foreach ($project_statuses as $status) {
                if ($can_edit_projects && $project_info->status_id != $status->id) {
                    echo '<li role="presentation">' . ajax_anchor(get_uri("projects/change_status/$project_info->id/$status->id"), "<i data-feather='$status->icon' class='icon-16'></i> " . app_lang('mark_project_as') . " " . ($status->title_language_key ? app_lang($status->title_language_key) : $status->title), array("data-reload-on-success" => true, "class" => "dropdown-item")) . '</li>';
                }
            }

            if ($login_user->user_type == "staff" && $can_create_projects) {
                echo "<li role='presentation'>" . modal_anchor(get_uri("projects/clone_project_modal_form"), "<i data-feather='copy' class='icon-16'></i> " . app_lang('clone_project'), array("class" => "dropdown-item", "data-post-id" => $project_info->id, "title" => app_lang('clone_project'))) . " </li>";
            }

            if ($can_edit_projects) {
                echo "<li role='presentation'>" . modal_anchor(get_uri("projects/modal_form"), "<i data-feather='edit' class='icon-16'></i> " . app_lang('edit_project'), array("class" => "dropdown-item edit", "title" => app_lang('edit_project'), "data-post-id" => $project_info->id)) . " </li>";
            }
            ?>

        </ul>
    </div>
<?php } ?>
<?php
if ($show_timmer) {
    echo view("projects/project_timer");
}
?>