<div class="col-md-12 mb15">
    <strong><?php echo app_lang('client') . ": "; ?></strong>
    <?php echo (anchor(get_uri("clients/view/" . $order_info->client_id), $order_info->company_name)); ?>
</div>
<div class="col-md-12 mb15">
    <strong><?php echo app_lang('status') . ": "; ?></strong>
    <?php echo js_anchor($order_info->order_status_title, array("style" => "background-color: $order_info->order_status_color", "class" => "badge", "data-id" => $order_info->id, "data-value" => $order_info->status_id, "data-act" => "update-order-status")); ?>
</div>
<div class="col-md-12 mb15">
    <strong><?php echo app_lang('created_by') . ": "; ?></strong>
    <?php
    $created_by = $order_info->created_by_user;
    if ($order_info->created_by_user_type == "staff") {
        echo get_team_member_profile_link($order_info->created_by, $created_by);
    } else {
        echo get_client_contact_profile_link($order_info->created_by, $created_by);
    }
    ?>
</div>

<?php if ($order_info->project_id) { ?>
    <div class="col-md-12 mb15">
        <strong><?php echo app_lang('project') . ": "; ?></strong>
        <?php echo (anchor(get_uri("projects/view/" . $order_info->project_id), $order_info->project_title)); ?>
    </div>
<?php } ?>

<?php if (can_access_reminders_module()) { ?>
    <div class="col-md-12 mb15" id="order-reminders">
        <div class="mb15"><strong><?php echo app_lang("reminders") . " (" . app_lang('private') . ")" . ": "; ?> </strong></div>
        <?php echo view("reminders/reminders_view_data", array("order_id" => $order_info->id, "hide_form" => true, "reminder_view_type" => "order")); ?>
    </div>
<?php } ?>