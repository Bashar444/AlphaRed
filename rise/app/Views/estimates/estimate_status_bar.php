<div class="col-md-12 mb15">
    <?php
    if ($estimate_info->is_lead) {
        echo "<strong>" . app_lang("lead") . ": </strong>";
        echo (anchor(get_uri("leads/view/" . $estimate_info->client_id), $estimate_info->company_name));
    } else {
        echo "<strong>" . app_lang("client") . ": </strong>";
        echo (anchor(get_uri("clients/view/" . $estimate_info->client_id), $estimate_info->company_name));
    }
    ?>
</div>
<div class="col-md-12 mb15">
    <strong><?php echo app_lang('status') . ": "; ?></strong><?php echo $estimate_status_label; ?>
</div>
<div class="col-md-12 mb15">
    <strong><?php echo app_lang('last_email_sent') . ": "; ?></strong>
    <?php echo (is_date_exists($estimate_info->last_email_sent_date)) ? format_to_date($estimate_info->last_email_sent_date, FALSE) : app_lang("never"); ?>
</div>

<?php if (!$estimate_info->estimate_request_id == 0) { ?>
    <div class="col-md-12 mb15">
        <strong><?php echo app_lang('estimate_request') . ": "; ?></strong>
        <?php echo (anchor(get_uri("estimate_requests/view_estimate_request/" . $estimate_info->estimate_request_id), app_lang('estimate_request') . " - " . $estimate_info->estimate_request_id)); ?>
    </div>
<?php } ?>
<?php if ($estimate_info->project_id) { ?>
    <div class="col-md-12 mb15">
        <strong><?php echo app_lang('project') . ": "; ?></strong>
        <?php echo (anchor(get_uri("projects/view/" . $estimate_info->project_id), $estimate_info->project_title)); ?>
    </div>
<?php } ?>
<?php if (can_access_reminders_module()) { ?>
    <div class="col-md-12 mb15" id="estimate-reminders">
        <div class="mb15"><strong><?php echo app_lang("reminders") . " (" . app_lang('private') . ")" . ": "; ?> </strong></div>
        <?php echo view("reminders/reminders_view_data", array("estimate_id" => $estimate_info->id, "hide_form" => true, "reminder_view_type" => "estimate")); ?>
    </div>
<?php } ?>