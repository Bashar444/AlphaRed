<div class="clearfix ">
    <div class="row">
        <div class="col-md-9 d-flex align-items-stretch">
            <div class="card p15 b-t w-100" id="subscription-item-section">
                <?php echo view("tickets/view_data"); ?>
            </div>
        </div>
        <div class="col-md-3 d-flex align-items-stretch">
            <div class="card p15" id="subscription-info-section">
                <div class="clearfix p20">
                    <div class="row">
                        <?php if ($login_user->user_type === "staff" && $ticket_info->client_id) { ?>
                            <div class="col-md-12 mb15">
                                <strong><?php echo app_lang("client") . ": "; ?></strong>
                                <?php echo $ticket_info->company_name ? anchor(get_uri("clients/view/" . $ticket_info->client_id), $ticket_info->company_name) : "-"; ?>
                            </div>

                            <?php if ($ticket_info->requested_by) { ?>
                                <div class="col-md-12 mb15">
                                    <strong><?php echo app_lang("requested_by") . ": "; ?></strong>
                                    <?php echo anchor(get_uri("clients/contact_profile/" . $ticket_info->requested_by), $ticket_info->requested_by_name ? $ticket_info->requested_by_name : ""); ?>
                                </div>
                            <?php } ?>

                        <?php } ?>

                        <div class="col-md-12 mb15">
                            <strong><?php echo app_lang('status') . ": "; ?></strong>
                            <?php
                            $ticket_status_class = "bg-danger";
                            if ($ticket_info->status === "new") {
                                $ticket_status_class = "bg-warning";
                            } else if ($ticket_info->status === "closed") {
                                $ticket_status_class = "bg-success";
                            }

                            if ($ticket_info->status === "client_replied" && $login_user->user_type === "client") {
                                $ticket_info->status = "open"; //don't show client_replied status to client
                            }

                            $ticket_status = "<span class='badge $ticket_status_class large'>" . app_lang($ticket_info->status) . "</span> ";
                            echo $ticket_status;
                            ?>
                        </div>

                        <?php if ($ticket_info->labels_list) { ?>
                            <div class="col-md-12 mb15">
                                <strong><?php echo app_lang("label") . ": "; ?></strong>
                                <?php echo make_labels_view_data($ticket_info->labels_list); ?>
                            </div>
                        <?php } ?>

                        <?php if ($ticket_info->project_id != "0" && $show_project_reference == "1") { ?>
                            <div class="col-md-12 mb15">
                                <strong><?php echo app_lang("project") . ": "; ?></strong>
                                <?php echo $ticket_info->project_title ? anchor(get_uri("projects/view/" . $ticket_info->project_id), $ticket_info->project_title) : "-"; ?>
                            </div>
                        <?php } ?>

                        <div class="col-md-12 mb15">
                            <strong><?php echo app_lang("created") . ": "; ?></strong>
                            <?php echo format_to_relative_time($ticket_info->created_at); ?> 
                        </div>

                        <?php if ($ticket_info->closed_at && $ticket_info->status == "closed") { ?>
                            <div class="col-md-12 mb15">
                                <strong><?php echo app_lang("closed") . ": "; ?></strong>
                                <?php echo format_to_relative_time($ticket_info->closed_at); ?> 
                            </div>
                        <?php } ?>

                        <?php if ($ticket_info->ticket_type) { ?>
                            <div class="col-md-12 mb15">
                                <strong><?php echo app_lang("ticket_type") . ": "; ?></strong>
                                <?php echo $ticket_info->ticket_type; ?> 
                            </div>
                        <?php } ?>

                        <?php
                        if ($ticket_info->assigned_to && $login_user->user_type == "staff") {
                            //show assign to field to team members only

                            $image_url = get_avatar($ticket_info->assigned_to_avatar);
                            $assigned_to_user = "<span class='avatar avatar-xs mr10'><img src='$image_url' alt='...'></span> $ticket_info->assigned_to_user";
                            ?>
                            <div class="col-md-12 mb15">
                                <strong><?php echo app_lang("assigned_to") . ": "; ?></strong>
                                <?php echo get_team_member_profile_link($ticket_info->assigned_to, $assigned_to_user); ?>
                            </div>
                            <?php
                        }
                        ?>

                        <?php if ($ticket_info->task_id != "0") { ?>
                            <div class="col-md-12 mb15">
                                <strong><?php echo app_lang("task") . ": "; ?></strong>
                                <?php echo modal_anchor(get_uri("tasks/view"), $ticket_info->task_title, array("title" => app_lang('task_info') . " #$ticket_info->task_id", "data-post-id" => $ticket_info->task_id, "data-modal-lg" => "1")) ?>
                            </div>
                        <?php } ?>

                        <?php if ($ticket_info->merged_with_ticket_id) { ?>
                            <div class="col-md-12 mb15">
                                <strong><?php echo app_lang("moved_to") . ": "; ?></strong>
                                <?php echo anchor(get_uri("tickets/view/" . $ticket_info->merged_with_ticket_id), get_ticket_id($ticket_info->merged_with_ticket_id), array()); ?>
                            </div>
                        <?php } ?>

                        <?php
                        if (count($custom_fields_list)) {
                            $fields = "";
                            foreach ($custom_fields_list as $data) {
                                if ($data->value) {
                                    $fields .= "<div class='col-md-12 mb15'><strong> $data->title:</strong> " . view("custom_fields/output_" . $data->field_type, array("value" => $data->value)) . "</div>";
                                }
                            }
                            if ($fields) {
                                echo $fields;
                            }
                        }
                        ?>

                        <?php if (can_access_reminders_module()) { ?>
                            <div class="col-md-12 mb15" id="ticket-reminders">
                                <div class="mb15"><strong><?php echo app_lang("reminders") . " (" . app_lang('private') . ")" . ": "; ?> </strong></div>
                                <?php echo view("reminders/reminders_view_data", array("ticket_id" => $ticket_info->id, "hide_form" => true, "reminder_view_type" => "ticket")); ?>
                            </div>
                        <?php } ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>