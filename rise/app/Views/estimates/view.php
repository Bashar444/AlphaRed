<div class="page-content clearfix">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                <div class="estimate-title-section">
                    <div class="page-title no-bg clearfix mb5 no-border">
                        <h1 class="pl0">
                            <span><i data-feather="file" class='icon'></i></span>
                            <?php echo get_estimate_id($estimate_info->id); ?>
                        </h1>

                        <div class="title-button-group mr0">
                            <span class="dropdown inline-block mt15">
                                <button class="btn btn-info text-white dropdown-toggle caret mt0 mb0" type="button" data-bs-toggle="dropdown" aria-expanded="true">
                                    <i data-feather="tool" class="icon-16"></i> <?php echo app_lang('actions'); ?>
                                </button>
                                <ul class="dropdown-menu" role="menu">
                                    <li role="presentation"><?php echo anchor(get_uri("estimates/download_pdf/" . $estimate_info->id), "<i data-feather='download' class='icon-16'></i> " . app_lang('download_pdf'), array("title" => app_lang('download_pdf'), "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation"><?php echo anchor(get_uri("estimates/download_pdf/" . $estimate_info->id . "/view"), "<i data-feather='file-text' class='icon-16'></i> " . app_lang('view_pdf'), array("title" => app_lang('view_pdf'), "target" => "_blank", "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation"><?php echo anchor(get_uri("estimates/preview/" . $estimate_info->id . "/1"), "<i data-feather='search' class='icon-16'></i> " . app_lang('estimate_preview'), array("title" => app_lang('estimate_preview'), "target" => "_blank", "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation"><?php echo anchor(get_uri("estimate/preview/" . $estimate_info->id . "/" . $estimate_info->public_key), "<i data-feather='external-link' class='icon-16'></i> " . app_lang('estimate') . " " . app_lang("url"), array("target" => "_blank", "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation"><?php echo js_anchor("<i data-feather='printer' class='icon-16'></i> " . app_lang('print_estimate'), array('title' => app_lang('print_estimate'), 'id' => 'print-estimate-btn', "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation" class="dropdown-divider"></li>

                                    <?php if ($is_estimate_editable) { ?>
                                        <li role="presentation"><?php echo modal_anchor(get_uri("estimates/modal_form"), "<i data-feather='edit' class='icon-16'></i> " . app_lang('edit_estimate'), array("title" => app_lang('edit_estimate'), "data-post-id" => $estimate_info->id, "role" => "menuitem", "tabindex" => "-1", "class" => "dropdown-item")); ?> </li>
                                    <?php } ?>

                                    <li role="presentation"><?php echo modal_anchor(get_uri("estimates/modal_form"), "<i data-feather='copy' class='icon-16'></i> " . app_lang('clone_estimate'), array("data-post-is_clone" => true, "data-post-id" => $estimate_info->id, "title" => app_lang('clone_estimate'), "class" => "dropdown-item")); ?></li>

                                    <?php
                                    if ($estimate_status == "draft" || $estimate_status == "sent") {
                                        ?>
                                        <li role="presentation"><?php echo ajax_anchor(get_uri("estimates/update_estimate_status/" . $estimate_info->id . "/accepted"), "<i data-feather='check-circle' class='icon-16'></i> " . app_lang('mark_as_accepted'), array("data-reload-on-success" => "1", "class" => "dropdown-item")); ?> </li>
                                        <li role="presentation"><?php echo ajax_anchor(get_uri("estimates/update_estimate_status/" . $estimate_info->id . "/declined"), "<i data-feather='x-circle' class='icon-16'></i> " . app_lang('mark_as_declined'), array("data-reload-on-success" => "1", "class" => "dropdown-item")); ?> </li>
                                    <?php } else if ($estimate_status == "accepted") {
                                        ?>
                                        <li role="presentation"><?php echo ajax_anchor(get_uri("estimates/update_estimate_status/" . $estimate_info->id . "/declined"), "<i data-feather='x-circle' class='icon-16'></i> " . app_lang('mark_as_declined'), array("data-reload-on-success" => "1", "class" => "dropdown-item")); ?> </li>
                                        <?php
                                    } else if ($estimate_status == "declined") {
                                        ?>
                                        <li role="presentation"><?php echo ajax_anchor(get_uri("estimates/update_estimate_status/" . $estimate_info->id . "/accepted"), "<i data-feather='check-circle' class='icon-16'></i> " . app_lang('mark_as_accepted'), array("data-reload-on-success" => "1", "class" => "dropdown-item")); ?> </li>
                                        <?php
                                    }
                                    ?>

                                    <?php
                                    if ($client_info->is_lead) {
                                        if ($estimate_status == "draft" || $estimate_status == "sent") {
                                            ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("estimates/send_estimate_modal_form/" . $estimate_info->id), "<i data-feather='send' class='icon-16'></i> " . app_lang('send_to_lead'), array("title" => app_lang('send_to_lead'), "data-post-id" => $estimate_info->id, "data-post-is_lead" => true, "role" => "menuitem", "tabindex" => "-1", "class" => "dropdown-item")); ?> </li>
                                            <?php
                                        }
                                    } else {
                                        if ($estimate_status == "draft" || $estimate_status == "sent") {
                                            ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("estimates/send_estimate_modal_form/" . $estimate_info->id), "<i data-feather='send' class='icon-16'></i> " . app_lang('send_to_client'), array("title" => app_lang('send_to_client'), "data-post-id" => $estimate_info->id, "role" => "menuitem", "tabindex" => "-1", "class" => "dropdown-item")); ?> </li>
                                            <?php
                                        }
                                    }
                                    ?>

                                    <?php if ($estimate_status == "accepted") { ?>
                                        <li role="presentation" class="dropdown-divider"></li>
                                        <?php if ($can_create_projects && !$estimate_info->project_id) { ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("projects/modal_form"), "<i data-feather='plus' class='icon-16'></i> " . app_lang('create_project'), array("data-post-estimate_id" => $estimate_info->id, "title" => app_lang('create_project'), "data-post-client_id" => $estimate_info->client_id, "class" => "dropdown-item")); ?> </li>
                                        <?php } ?>
                                        <?php if ($show_invoice_option) { ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("invoices/modal_form"), "<i data-feather='refresh-cw' class='icon-16'></i> " . app_lang('create_invoice'), array("title" => app_lang("create_invoice"), "data-post-estimate_id" => $estimate_info->id, "class" => "dropdown-item")); ?> </li>
                                        <?php } ?>
                                    <?php } ?>
                                </ul>
                            </span>
                        </div>
                    </div>

                    <ul id="estimate-tabs" data-bs-toggle="ajax-tab" class="nav nav-pills rounded classic mb20 scrollable-tabs border-white" role="tablist">
                        <li><a role="presentation" data-bs-toggle="tab"  href="javascript:;" data-bs-target="#estimate-details-section"><?php echo app_lang("details"); ?></a></li>
                        <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("estimates/tasks/" . $estimate_info->id); ?>" data-bs-target="#estimate-tasks-section"><?php echo app_lang('tasks'); ?></a></li>
                    </ul>
                </div>
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane fade" id="estimate-details-section">
                        <?php echo view("estimates/details"); ?>
                    </div>
                    <div role="tabpanel" class="tab-pane fade grid-button" id="estimate-tasks-section"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    //RELOAD_VIEW_AFTER_UPDATE = true;
    $(document).ready(function () {
        var optionVisibility = false;
<?php if ($is_estimate_editable) { ?>
            optionVisibility = true;
<?php } ?>

        $("#estimate-item-table").appTable({
            source: '<?php echo_uri("estimates/item_list_data/" . $estimate_info->id . "/") ?>',
            order: [[0, "asc"]],
            hideTools: true,
            displayLength: 100,
            stateSave: false,
            columns: [
                {visible: false, searchable: false},
                {title: "<?php echo app_lang("item") ?> ", sortable: false},
                {title: "<?php echo app_lang("quantity") ?>", "class": "text-right w15p", sortable: false},
                {title: "<?php echo app_lang("rate") ?>", "class": "text-right w15p", sortable: false},
                {title: "<?php echo app_lang("total") ?>", "class": "text-right w15p", sortable: false},
                {title: "<i data-feather='menu' class='icon-16'></i>", "class": "text-center option w100", sortable: false, visible: optionVisibility}
            ],

            onInitComplete: function () {
<?php if ($is_estimate_editable) { ?>
                    //apply sortable
                    $("#estimate-item-table").find("tbody").attr("id", "estimate-item-table-sortable");
                    var $selector = $("#estimate-item-table-sortable");

                    Sortable.create($selector[0], {
                        animation: 150,
                        chosenClass: "sortable-chosen",
                        ghostClass: "sortable-ghost",
                        onUpdate: function (e) {
                            appLoader.show();
                            //prepare sort indexes 
                            var data = "";
                            $.each($selector.find(".item-row"), function (index, ele) {
                                if (data) {
                                    data += ",";
                                }

                                data += $(ele).attr("data-id") + "-" + index;
                            });

                            //update sort indexes
                            $.ajax({
                                url: '<?php echo_uri("estimates/update_item_sort_values") ?>',
                                type: "POST",
                                data: {sort_values: data},
                                success: function () {
                                    appLoader.hide();
                                }
                            });
                        }
                    });
<?php } ?>
            },

            onDeleteSuccess: function (result) {
                $("#estimate-total-section").html(result.estimate_total_view);
                if (typeof updateInvoiceStatusBar == 'function') {
                    updateInvoiceStatusBar(result.estimate_id);
                }
            },
            onUndoSuccess: function (result) {
                $("#estimate-total-section").html(result.estimate_total_view);
                if (typeof updateInvoiceStatusBar == 'function') {
                    updateInvoiceStatusBar(result.estimate_id);
                }
            }
        });

        //print estimate
        $("#print-estimate-btn").click(function () {
            appLoader.show();

            $.ajax({
                url: "<?php echo get_uri('estimates/print_estimate/' . $estimate_info->id) ?>",
                dataType: 'json',
                success: function (result) {
                    if (result.success) {
                        document.body.innerHTML = result.print_view; //add estimate's print view to the page
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


    });


    updateInvoiceStatusBar = function (estimateId) {
        $.ajax({
            url: "<?php echo get_uri("estimates/get_estimate_status_bar"); ?>/" + estimateId,
            success: function (result) {
                if (result) {
                    $("#estimate-status-bar").html(result);
                }
            }
        });
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
