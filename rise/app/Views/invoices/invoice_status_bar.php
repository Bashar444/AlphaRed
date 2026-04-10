<div id="invoice-status-bar">
    <div class="col-md-12 mb15">
        <strong><?php echo app_lang("client") . ": "; ?></strong>
        <?php echo (anchor(get_uri("clients/view/" . $invoice_info->client_id), $invoice_info->company_name)); ?>
    </div>

    <?php if ($invoice_info->project_id) { ?>
        <div class="col-md-12 mb15">
            <strong><?php echo app_lang("project") . ": "; ?></strong>
            <?php echo anchor(get_uri("projects/view/" . $invoice_info->project_id), $invoice_info->project_title); ?>
        </div>
    <?php } ?>
    <?php if ($invoice_info->type == "invoice") { ?>
        <div class="col-md-12 mb15">
            <strong><?php echo app_lang('status') . ": "; ?></strong><?php echo $invoice_status_label; ?>
        </div>
    <?php } ?>
    <?php if ($invoice_info->labels_list) { ?>
        <div class="col-md-12 mb15">
            <strong><?php echo app_lang('label') . ": "; ?></strong><?php echo make_labels_view_data($invoice_info->labels_list, "", true); ?>
        </div>
    <?php } ?>

    <div class="col-md-12 mb15">
        <strong><?php echo app_lang('last_email_sent') . ": "; ?></strong>
        <?php echo (is_date_exists($invoice_info->last_email_sent_date)) ? format_to_date($invoice_info->last_email_sent_date, FALSE) : app_lang("never"); ?>
    </div>

    <?php if ($invoice_info->recurring_invoice_id) { ?>
        <div class="col-md-12 mb15">
            <strong><?php echo app_lang('created_from') . ": "; ?></strong>
            <?php echo anchor(get_uri("invoices/view/" . $invoice_info->recurring_invoice_id), get_invoice_id($invoice_info->recurring_invoice_id)); ?>
        </div>
    <?php } ?>
    <?php if ($invoice_info->subscription_id) { ?>
        <div class="col-md-12 mb15">
            <strong><?php echo app_lang('created_from') . ": "; ?></strong>
            <?php echo anchor(get_uri("subscriptions/view/" . $invoice_info->subscription_id), get_subscription_id($invoice_info->subscription_id)); ?>
        </div>
    <?php } ?>
    <?php if ($invoice_info->estimate_id && $login_user->is_admin) { ?>
        <div class="col-md-12 mb15">
            <strong><?php echo app_lang('created_from') . ": "; ?></strong>
            <?php echo anchor(get_uri("estimates/view/" . $invoice_info->estimate_id), get_estimate_id($invoice_info->estimate_id)); ?>
        </div>
    <?php } ?>

    <?php if ($invoice_info->cancelled_at) { ?>
        <div class="col-md-12 mb15">
            <strong><?php echo app_lang('cancelled_at') . ": "; ?></strong>
            <?php echo format_to_relative_time($invoice_info->cancelled_at); ?>
        </div>
    <?php } ?>

    <?php if ($invoice_info->cancelled_by) { ?>
        <div class="col-md-12 mb15">
            <strong><?php echo app_lang('cancelled_by') . ": "; ?></strong>
            <?php echo get_team_member_profile_link($invoice_info->cancelled_by, $invoice_info->cancelled_by_user); ?>
        </div>
    <?php } ?>

</div>