<div class="col-md-12 mb15">
    <?php
    if ($contract_info->is_lead) {
        echo app_lang("lead") . ": ";
        echo (anchor(get_uri("leads/view/" . $contract_info->client_id), $contract_info->company_name));
    } else {
        echo app_lang("client") . ": ";
        echo (anchor(get_uri("clients/view/" . $contract_info->client_id), $contract_info->company_name));
    }
    ?>
</div>
<div class="col-md-12 mb15">
    <strong><?php echo app_lang('status') . ": "; ?></strong><?php echo $contract_status_label; ?>
</div>

<?php if ($contract_info->project_id) { ?>
    <div class="col-md-12 mb15">
        <strong><?php echo app_lang('project') . ": "; ?></strong>
        <?php echo anchor(get_uri("projects/view/" . $contract_info->project_id), $contract_info->project_title); ?>
    </div>
<?php } ?>

<div class="col-md-12 mb15">
    <strong><?php echo app_lang('last_email_sent') . ": "; ?></strong>
    <?php echo (is_date_exists($contract_info->last_email_sent_date)) ? format_to_date($contract_info->last_email_sent_date, FALSE) : app_lang("never"); ?>
</div>

<?php if (can_access_reminders_module()) { ?>
    <div class="col-md-12 mb15" id="contract-reminders">
        <div class="mb15"><strong><?php echo app_lang("reminders") . " (" . app_lang('private') . ")" . ": "; ?> </strong></div>
        <?php echo view("reminders/reminders_view_data", array("contract_id" => $contract_info->id, "hide_form" => true, "reminder_view_type" => "contract")); ?>
    </div>
<?php } ?>