<div class="page-content invoice-details-view clearfix">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                <div class="invoice-title-section">
                    <div class="page-title no-bg clearfix mb5 no-border">
                        <h1 class="pl0">
                            <span><i data-feather="file-text" class='icon'></i></span>
                            <?php
                            if ($invoice_info->type == "credit_note") {
                                echo app_lang("credit_note") . " - ";
                            }
                            ?>
                            <?php echo get_invoice_id($invoice_info->id); ?>
                            <?php
                            if ($invoice_info->recurring) {
                                $recurring_status_class = "text-primary";
                                if ($invoice_info->no_of_cycles_completed > 0 && $invoice_info->no_of_cycles_completed == $invoice_info->no_of_cycles) {
                                    $recurring_status_class = "text-danger";
                                }
                                ?>
                                <span class="label ml15 b-a "><span class="<?php echo $recurring_status_class; ?>"><?php echo app_lang('recurring'); ?></span></span>
                            <?php } ?>
                        </h1>

                        <div class="title-button-group mr0">
                            <?php if ($invoice_status !== "cancelled" && $invoice_info->status !== "credited" && $can_edit_invoices) { ?>
                                <?php echo modal_anchor(get_uri("invoice_payments/payment_modal_form"), "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_payment'), array("class" => "btn btn-default", "title" => app_lang('add_payment'), "data-post-invoice_id" => $invoice_info->id)); ?>
                            <?php } ?>
                            <span class="dropdown inline-block">
                                <button class="btn btn-info text-white dropdown-toggle caret" type="button" data-bs-toggle="dropdown" aria-expanded="true">
                                    <i data-feather="tool" class="icon-16"></i> <?php echo app_lang('actions'); ?>
                                </button>
                                <ul class="dropdown-menu" role="menu">
                                    <?php if ($invoice_status !== "cancelled" && $can_edit_invoices) { ?>
                                        <?php if ($invoice_info->type == "invoice") { ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("invoices/send_invoice_modal_form/" . $invoice_info->id), "<i data-feather='mail' class='icon-16'></i> " . app_lang('email_invoice_to_client'), array("title" => app_lang('email_invoice_to_client'), "data-post-id" => $invoice_info->id, "role" => "menuitem", "tabindex" => "-1", "class" => "dropdown-item")); ?> </li>
                                        <?php } else { ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("invoices/send_invoice_modal_form/" . $invoice_info->id), "<i data-feather='mail' class='icon-16'></i> " . app_lang('email_credit_note_to_client'), array("title" => app_lang('email_credit_note_to_client'), "data-post-id" => $invoice_info->id, "role" => "menuitem", "tabindex" => "-1", "class" => "dropdown-item")); ?> </li>
                                        <?php } ?>
                                    <?php } ?>
                                    <li role="presentation"><?php echo anchor(get_uri("invoices/download_pdf/" . $invoice_info->id), "<i data-feather='download' class='icon-16'></i> " . app_lang('download_pdf'), array("title" => app_lang('download_pdf'), "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation"><?php echo anchor(get_uri("invoices/download_pdf/" . $invoice_info->id . "/view"), "<i data-feather='file-text' class='icon-16'></i> " . app_lang('view_pdf'), array("title" => app_lang('view_pdf'), "target" => "_blank", "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation"><?php echo anchor(get_uri("invoices/preview/" . $invoice_info->id . "/1"), "<i data-feather='search' class='icon-16'></i> " . app_lang('preview'), array("title" => app_lang('preview'), "target" => "_blank", "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation"><?php echo js_anchor("<i data-feather='printer' class='icon-16'></i> " . app_lang('print'), array('title' => app_lang('print'), 'id' => 'print-invoice-btn', "class" => "dropdown-item")); ?> </li>

                                    <?php if ($can_edit_invoices && $invoice_info->type == "invoice") { ?>
                                        <li role="presentation" class="dropdown-divider"></li>

                                        <?php
                                        $edit_url = "invoices/modal_form";
                                        if (get_setting("enable_invoice_lock_state") && !$is_invoice_editable) {
                                            $edit_url = "invoices/recurring_modal_form";
                                        }
                                        ?>

                                        <li role="presentation"><?php echo modal_anchor(get_uri($edit_url), "<i data-feather='edit' class='icon-16'></i> " . app_lang('edit_invoice'), array("title" => app_lang('edit_invoice'), "data-post-id" => $invoice_info->id, "role" => "menuitem", "tabindex" => "-1", "class" => "dropdown-item")); ?> </li>


                                        <?php if ($invoice_status == "draft" && $invoice_status !== "cancelled") { ?>
                                            <li role="presentation"><?php echo ajax_anchor(get_uri("invoices/update_invoice_status/" . $invoice_info->id . "/not_paid"), "<i data-feather='check' class='icon-16'></i> " . app_lang('mark_invoice_as_not_paid'), array("data-reload-on-success" => "1", "class" => "dropdown-item")); ?> </li>
                                        <?php } else if ($invoice_status == "not_paid" || $invoice_status == "overdue" || $invoice_status == "partially_paid") { ?>
                                            <li role="presentation"><?php echo js_anchor("<i data-feather='x' class='icon-16'></i> " . app_lang('mark_invoice_as_cancelled'), array('title' => app_lang('mark_invoice_as_cancelled'), "data-action-url" => get_uri("invoices/update_invoice_status/" . $invoice_info->id . "/cancelled"), "data-action" => "delete-confirmation", "data-reload-on-success" => "1", "class" => "dropdown-item")); ?> </li>
                                        <?php } ?>

                                        <?php if ($invoice_status !== "draft" && $invoice_status !== "cancelled" && $invoice_info->status !== "credited") { ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("invoices/create_credit_note_modal_form/" . $invoice_info->id), "<i data-feather='file-minus' class='icon-16'></i> " . app_lang('create_credit_note'), array("title" => app_lang("create_credit_note"), "data-post-id" => $invoice_info->id, "class" => "dropdown-item")); ?> </li>
                                        <?php } ?>

                                        <li role="presentation"><?php echo modal_anchor(get_uri("invoices/modal_form"), "<i data-feather='copy' class='icon-16'></i> " . app_lang('clone_invoice'), array("data-post-is_clone" => true, "data-post-id" => $invoice_info->id, "title" => app_lang('clone_invoice'), "class" => "dropdown-item")); ?></li>
                                    <?php } ?>

                                </ul>
                            </span>
                        </div>
                    </div>

                    <ul id="invoice-tabs" data-bs-toggle="ajax-tab" class="nav nav-pills rounded classic mb20 scrollable-tabs border-white" role="tablist">
                        <li><a role="presentation" data-bs-toggle="tab"  href="<?php echo_uri("invoices/details/" . $invoice_info->id); ?>" data-bs-target="#invoice-details-section"><?php echo app_lang("details"); ?></a></li>
                        <?php if ($invoice_info->type == "invoice") { ?>
                            <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("invoices/payments/" . $invoice_info->id); ?>" data-bs-target="#invoice-payments-section"><?php echo app_lang('payments'); ?></a></li>
                            <?php if ($invoice_info->recurring) { ?>
                                <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("invoices/sub_invoices/" . $invoice_info->id); ?>" data-bs-target="#sub-invoices-section"><?php echo app_lang('sub_invoices'); ?></a></li>
                            <?php } ?>
                        <?php } ?>
                        <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("invoices/tasks/" . $invoice_info->id); ?>" data-bs-target="#invoice-tasks-section"><?php echo app_lang('tasks'); ?></a></li>
                    </ul>
                </div>
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane fade active" id="invoice-details-section"></div>
                    <?php if ($invoice_info->type == "invoice") { ?>
                        <div role="tabpanel" class="tab-pane fade grid-button" id="invoice-payments-section"></div>
                        <?php if ($invoice_info->recurring) { ?>
                            <div role="tabpanel" class="tab-pane fade grid-button" id="sub-invoices-section"></div>
                        <?php } ?>
                    <?php } ?>
                    <div role="tabpanel" class="tab-pane fade grid-button" id="invoice-tasks-section"></div>
                </div>
            </div>
        </div>
    </div>    
</div>
<script type="text/javascript">
    $(document).ready(function () {
        //modify the delete confirmation texts
        $("#confirmationModalTitle").html("<?php echo app_lang('cancel') . "?"; ?>");
        $("#confirmDeleteButton").html("<i data-feather='x' class='icon-16'></i> <?php echo app_lang("cancel"); ?>");
    });

    updateInvoiceStatusBar = function (invoiceId) {
        $.ajax({
            url: "<?php echo get_uri("invoices/get_invoice_status_bar"); ?>/" + invoiceId,
            success: function (result) {
                if (result) {
                    $("#invoice-status-bar").html(result);
                }
            }
        });
    };

    //print invoice
    $("#print-invoice-btn").click(function () {
        appLoader.show();

        $.ajax({
            url: "<?php echo get_uri('invoices/print_invoice/' . $invoice_info->id) ?>",
            dataType: 'json',
            success: function (result) {
                if (result.success) {
                    document.body.innerHTML = result.print_view; //add invoice's print view to the page
                    $("html").css({"overflow": "visible"});

                    setTimeout(function () {
                        window.print();
                    }, 200);
                } else {
                    appAlert.error(result.message);
                }

                appLoader.hide();
            }
        });
    });

    //reload page after finishing print action
    window.onafterprint = function () {
        location.reload();
    };

</script>

<?php
//required to send email 

load_css(array(
    "assets/js/summernote/summernote.css",
));
load_js(array(
    "assets/js/summernote/summernote.min.js",
));
?>