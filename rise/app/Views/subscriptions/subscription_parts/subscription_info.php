<div class="mb15"><span class="subscription-info-title" style="font-size:20px; font-weight: bold;background-color: <?php echo $color; ?>; color: #fff;">&nbsp;<?php echo get_subscription_id($subscription_info->id); ?>&nbsp;</span></div>
<div style="line-height: 10px;"></div><?php
if (isset($subscription_info->custom_fields) && $subscription_info->custom_fields) {
    foreach ($subscription_info->custom_fields as $field) {
        if ($field->value) {
            echo "<div class='mb15'><strong>" . $field->custom_field_title . ": </strong>" . view("custom_fields/output_" . $field->custom_field_type, array("value" => $field->value)) . "</div>";
        }
    }
}
?>

<?php if ($subscription_info->bill_date) { ?>
    <div class="col-md-12 mb15"><strong><?php echo app_lang('first_billing_date') . ": "; ?></strong><?php echo format_to_date($subscription_info->bill_date, false); ?></div>
<?php } ?>


<?php if ($subscription_info->status == "active" && $subscription_info->next_recurring_date) { ?>
    <div  class="col-md-12 mb15"><strong><?php echo app_lang('next_billing_date') . ": "; ?></strong><?php echo format_to_date($subscription_info->next_recurring_date, false); ?></div>
<?php } ?>    