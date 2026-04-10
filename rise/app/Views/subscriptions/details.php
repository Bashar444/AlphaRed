<div class="clearfix default-bg">
    <div class="row">
        <div class="col-md-9 d-flex align-items-stretch">
            <div class="card p15 b-t w-100" id="subscription-item-section">
                <div class="table-responsive mt15 pl15 pr15">
                    <table id="subscription-item-table" class="display" width="100%">            
                    </table>
                </div>

                <div class="clearfix">
                    <?php if (!$has_item_in_this_subscription && $subscription_info->status != "active") { ?>
                        <div class="float-start mt20 ml15" id="subscription-add-item-btn">
                            <?php echo modal_anchor(get_uri("subscriptions/item_modal_form"), "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_item'), array("class" => "btn btn-info text-white", "title" => app_lang('add_item'), "data-post-subscription_id" => $subscription_info->id)); ?>
                        </div>
                    <?php } ?>
                    <div class="float-end pr15" id="subscription-total-section">
                        <?php echo view("subscriptions/subscription_total_section", array("subscription_id" => $subscription_info->id, "can_edit_subscriptions" => $can_edit_subscriptions)); ?>
                    </div>
                </div>

                <?php
                $files = @unserialize($subscription_info->files);
                if ($files && is_array($files) && count($files)) {
                    ?>
                    <div class="clearfix">
                        <div class="col-md-12 mt20">
                            <p class="b-t"></p>
                            <div class="mb5 strong"><?php echo app_lang("files"); ?></div>
                            <?php
                            foreach ($files as $key => $value) {
                                $file_name = get_array_value($value, "file_name");
                                echo "<div>";
                                echo js_anchor(remove_file_prefix($file_name), array("data-toggle" => "app-modal", "data-sidebar" => "0", "data-url" => get_uri("subscriptions/file_preview/" . $subscription_info->id . "/" . $key)));
                                echo "</div>";
                            }
                            ?>
                        </div>
                    </div>
                <?php } ?>

                <p class="b-t b-info pt10 m15"><?php echo nl2br($subscription_info->note); ?></p>
            </div>
        </div>
        <div class="col-md-3 d-flex align-items-stretch">
            <div class="card p15" id="subscription-info-section">
                <div class="clearfix p20">
                    <div class="row">
                        <div class="col-md-12 mb15">
                            <?php
                            $color = get_setting("invoice_color");
                            if (!$color) {
                                $color = "#2AA384";
                            }

                            $data = array(
                                "client_info" => $client_info,
                                "color" => $color,
                                "subscription_info" => $subscription_info
                            );

                            echo view('subscriptions/subscription_parts/header_style_1.php', $data);
                            ?>
                        </div>
                        <div class="col-md-12 mb15">
                            <strong><?php echo app_lang('client') . ": "; ?></strong><?php echo (anchor(get_uri("clients/view/" . $subscription_info->client_id), $subscription_info->company_name)); ?>
                        </div>
                        <div class="col-md-12 mb15">
                            <strong><?php echo app_lang('status') . ": "; ?></strong><?php echo $subscription_status_label; ?>
                        </div>
                        <div class="col-md-12 mb15">
                            <strong><?php echo app_lang('type') . ": "; ?></strong><?php echo $subscription_type_label; ?>
                        </div>
                        <?php if ($subscription_info->labels_list) { ?>
                            <div class="col-md-12 mb15">
                                <strong><?php echo app_lang('label') . ": "; ?></strong><?php echo make_labels_view_data($subscription_info->labels_list, "", true); ?>
                            </div>
                        <?php } ?>
                        <?php if ($subscription_info->payment_status === "failed") { ?>
                            <div class="col-md-12 mb15"><?php
                                echo "<strong>" . app_lang("payment_status") . ": </strong>" . "<span class='mt0 badge bg-danger large'>" . app_lang("failed") . "</span>";
                                ?>
                            </div> 
                        <?php } ?>
                        <?php if ($subscription_info->cancelled_at) { ?>
                            <div class="col-md-12 mb15">
                                <strong><?php echo app_lang('cancelled_at') . ": "; ?></strong><?php echo format_to_relative_time($subscription_info->cancelled_at); ?>
                            </div>
                        <?php } ?>

                        <?php if ($subscription_info->cancelled_by) { ?>
                            <div class="col-md-12 mb15">
                                <strong><?php echo app_lang('cancelled_by') . ": "; ?></strong><?php echo get_team_member_profile_link($subscription_info->cancelled_by, $subscription_info->cancelled_by_user); ?>
                            </div>
                        <?php } ?>

                        <div class="col-md-12 mb15">
                            <strong><?php echo app_lang('repeat_every') . ": "; ?></strong><?php echo $subscription_info->repeat_every . " " . app_lang("interval_" . $subscription_info->repeat_type); ?>
                        </div>

                        <?php
                        $recurring_stopped = false;
                        if ($subscription_info->no_of_cycles_completed > 0 && $subscription_info->no_of_cycles_completed == $subscription_info->no_of_cycles) {
                            $recurring_stopped = true;
                        }

                       
                            ?>
                        <?php if (can_access_reminders_module()) { ?>
                            <div class="col-md-12 mb15" id="subscription-reminders">
                                <div class="mb15"><strong><?php echo app_lang("reminders") . " (" . app_lang('private') . ")" . ": "; ?> </strong></div>
                                <?php echo view("reminders/reminders_view_data", array("subscription_id" => $subscription_info->id, "hide_form" => true, "reminder_view_type" => "subscription")); ?>
                            </div>
                        <?php } ?>

                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script type="text/javascript">
    $(document).ready(function () {
        var optionVisibility = false;
<?php if ($can_edit_subscriptions && $subscription_status !== "active") { ?>
            optionVisibility = true;
<?php } ?>

        $("#subscription-item-table").appTable({
            source: '<?php echo_uri("subscriptions/item_list_data/" . $subscription_info->id . "/") ?>',
            order: [[0, "asc"]],
            hideTools: true,
            displayLength: 100,
            columns: [
                {title: '<?php echo app_lang("item") ?> ', sortable: false},
                {title: '<?php echo app_lang("quantity") ?>', "class": "text-right w15p", sortable: false},
                {title: '<?php echo app_lang("rate") ?>', "class": "text-right w15p", sortable: false},
                {title: '<?php echo app_lang("total") ?>', "class": "text-right w15p", sortable: false},
                {title: '<i data-feather="menu" class="icon-16"></i>', "class": "text-center option w100", sortable: false, visible: optionVisibility}
            ]
        });

        //modify the delete confirmation texts
        $("#confirmationModalTitle").html("<?php echo app_lang('cancel') . "?"; ?>");
        $("#confirmDeleteButton").html("<i data-feather='x' class='icon-16'></i> <?php echo app_lang("cancel"); ?>");
    });
</script>