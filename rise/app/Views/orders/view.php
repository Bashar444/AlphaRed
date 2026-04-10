<div class="page-content clearfix">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                <div class="order-title-section">
                    <div class="page-title no-bg clearfix mb5 no-border">
                        <h1 class="pl0">
                            <span><i data-feather="shopping-cart" class='icon'></i></span>
                            <?php echo get_order_id($order_info->id); ?>
                        </h1>

                        <div class="title-button-group">
                            <span class="dropdown inline-block mt15">
                                <button class="btn btn-info text-white dropdown-toggle caret mt0 mb0" type="button" data-bs-toggle="dropdown" aria-expanded="true">
                                    <i data-feather="tool" class="icon-16"></i> <?php echo app_lang('actions'); ?>
                                </button>
                                <ul class="dropdown-menu" role="menu">
                                    <li role="presentation"><?php echo anchor(get_uri("orders/download_pdf/" . $order_info->id), "<i data-feather='download' class='icon-16'></i> " . app_lang('download_pdf'), array("title" => app_lang('download_pdf'), "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation"><?php echo anchor(get_uri("orders/download_pdf/" . $order_info->id . "/view"), "<i data-feather='file-text' class='icon-16'></i> " . app_lang('view_pdf'), array("title" => app_lang('view_pdf'), "target" => "_blank", "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation"><?php echo anchor(get_uri("store/order_preview/" . $order_info->id . "/1"), "<i data-feather='search' class='icon-16'></i> " . app_lang('order_preview'), array("title" => app_lang('order_preview'), "target" => "_blank", "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation" class="dropdown-divider"></li>
                                    <li role="presentation"><?php echo modal_anchor(get_uri("orders/modal_form"), "<i data-feather='edit' class='icon-16'></i> " . app_lang('edit_order'), array("title" => app_lang('edit_order'), "data-post-id" => $order_info->id, "role" => "menuitem", "tabindex" => "-1", "class" => "dropdown-item")); ?> </li>

                                    <li role="presentation" class="dropdown-divider"></li>
                                    <?php if ($show_estimate_option) { ?>
                                        <li role="presentation"><?php echo modal_anchor(get_uri("estimates/modal_form"), "<i data-feather='file' class='icon-16'></i> " . app_lang('create_estimate'), array("title" => app_lang("create_estimate"), "data-post-order_id" => $order_info->id, "class" => "dropdown-item")); ?> </li>
                                    <?php } ?>
                                    <?php if ($show_invoice_option) { ?>
                                        <li role="presentation"><?php echo modal_anchor(get_uri("invoices/modal_form"), "<i data-feather='file-text' class='icon-16'></i> " . app_lang('create_invoice'), array("title" => app_lang("create_invoice"), "data-post-order_id" => $order_info->id, "class" => "dropdown-item")); ?> </li>
                                    <?php } ?>
                                    <?php if ($can_create_projects && !$order_info->project_id) { ?>
                                        <li role="presentation"><?php echo modal_anchor(get_uri("projects/modal_form"), "<i data-feather='grid' class='icon-16'></i> " . app_lang('create_project'), array("title" => app_lang("create_project"), "data-post-order_id" => $order_info->id, "data-post-client_id" => $order_info->client_id, "class" => "dropdown-item")); ?> </li>
                                    <?php } ?>

                                </ul>
                            </span>
                        </div>
                    </div>

                    <ul id="order-tabs" data-bs-toggle="ajax-tab" class="nav nav-pills rounded classic mb20 scrollable-tabs border-white" role="tablist">
                        <li><a role="presentation" data-bs-toggle="tab"  href="<?php echo_uri("orders/details/" . $order_info->id); ?>" data-bs-target="#order-details-section"><?php echo app_lang("details"); ?></a></li>
                        <?php if ($can_view_invoices) { ?>
                            <li><a role="presentation" data-bs-toggle="tab"  href="<?php echo_uri("orders/invoices/" . $order_info->id); ?>" data-bs-target="#order-invoices-section"><?php echo app_lang("invoices"); ?></a></li>
                            <li><a role="presentation" data-bs-toggle="tab"  href="<?php echo_uri("orders/invoice_payment_list/" . $order_info->id); ?>" data-bs-target="#order-invoice-payment-list-section"><?php echo app_lang("invoice_payment_list"); ?></a></li>
                        <?php } ?>
                        <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("orders/tasks/" . $order_info->id); ?>" data-bs-target="#order-tasks-section"><?php echo app_lang('tasks'); ?></a></li>
                    </ul>
                </div>
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane fade active" id="order-details-section"></div>
                    <div role="tabpanel" class="tab-pane fade grid-button" id="order-invoices-section"></div>
                    <div role="tabpanel" class="tab-pane fade grid-button" id="order-invoice-payment-list-section"></div>
                    <div role="tabpanel" class="tab-pane fade grid-button" id="order-tasks-section"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php
//required to send email 

load_css(array(
    "assets/js/summernote/summernote.css",
));
load_js(array(
    "assets/js/summernote/summernote.min.js",
));
?>

<?php echo view("orders/update_order_status_script", array("details_view" => true)); ?>