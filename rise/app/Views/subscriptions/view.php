<div class="page-content subscription-details-view clearfix">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                <div clss="subscription-title-section">
                    <div class="page-title no-bg clearfix mb5 no-border">
                        <h1 class="pl0">
                            <span><i data-feather="repeat" class='icon'></i></span>
                            <?php echo get_subscription_id($subscription_info->id) . ": " . $subscription_info->title; ?>
                        </h1>

                        <div class="title-button-group mr0">
                            <span class="dropdown inline-block">
                                <button class="btn btn-info text-white dropdown-toggle caret" type="button" data-bs-toggle="dropdown" aria-expanded="true">
                                    <i data-feather="tool" class="icon-16"></i> <?php echo app_lang('actions'); ?>
                                </button>
                                <ul class="dropdown-menu" role="menu">

                                    <?php if ($can_edit_subscriptions) { ?>
                                        <?php if ($subscription_status !== "cancelled" && $subscription_status !== "active" && !$subscription_info->stripe_subscription_id && get_setting("enable_stripe_subscription")) { ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("subscriptions/activate_as_stripe_subscription_modal_form/" . $subscription_info->id), "<i data-feather='credit-card' class='icon-16'></i> " . app_lang('activate_as_stripe_subscription'), array("title" => app_lang('activate_as_stripe_subscription'), "data-post-id" => $subscription_info->id, "class" => "dropdown-item")); ?> </li>
                                        <?php } ?>

                                        <?php if ($subscription_status == "draft" && $subscription_status !== "cancelled" && $subscription_info->type === "app") { ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("subscriptions/activate_as_internal_subscription_modal_form/" . $subscription_info->id), "<i data-feather='check' class='icon-16'></i> " . app_lang('activate_as_internal_subscription'), array("title" => app_lang("activate_as_internal_subscription"), "data-post-id" => $subscription_info->id, "class" => "dropdown-item")); ?> </li>
                                        <?php } else if ($subscription_status == "pending" || $subscription_status == "active") { ?>
                                            <li role="presentation"><?php echo js_anchor("<i data-feather='x' class='icon-16'></i> " . app_lang('cancel_subscription'), array('title' => app_lang('cancel_subscription'), "data-action-url" => get_uri("subscriptions/update_subscription_status/" . $subscription_info->id . "/cancelled"), "data-action" => "delete-confirmation", "data-reload-on-success" => "1", "class" => "dropdown-item")); ?> </li>
                                        <?php } ?>

                                        <?php if ($subscription_status !== "active" && $subscription_status !== "cancelled") { ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("subscriptions/modal_form"), "<i data-feather='edit' class='icon-16'></i> " . app_lang('edit_subscription'), array("title" => app_lang('edit_subscription'), "data-post-id" => $subscription_info->id, "role" => "menuitem", "tabindex" => "-1", "class" => "dropdown-item")); ?> </li>
                                        <?php } ?>
                                    <?php } ?>

                                </ul>
                            </span>
                        </div>
                    </div>

                    <ul id="subscription-tabs" data-bs-toggle="ajax-tab" class="nav nav-pills rounded classic mb20 scrollable-tabs border-white" role="tablist">
                        <li><a role="presentation" data-bs-toggle="tab"  href="<?php echo_uri("subscriptions/details/" . $subscription_info->id); ?>" data-bs-target="#subscription-details-section"><?php echo app_lang("details"); ?></a></li>
                        <?php if ($can_view_invoices) { ?>
                            <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("subscriptions/invoices/" . $subscription_info->id); ?>" data-bs-target="#subscription-invoices-section"><?php echo app_lang('invoices'); ?></a></li>
                        <?php } ?>
                        <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("subscriptions/tasks/" . $subscription_info->id); ?>" data-bs-target="#subscription-tasks-section"><?php echo app_lang('tasks'); ?></a></li>
                    </ul>
                </div>
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane fade active" id="subscription-details-section"></div>
                    <div role="tabpanel" class="tab-pane fade grid-button" id="subscription-invoices-section"></div>
                    <div role="tabpanel" class="tab-pane fade grid-button" id="subscription-tasks-section"></div>
                </div>
            </div>
        </div>
    </div>
</div>