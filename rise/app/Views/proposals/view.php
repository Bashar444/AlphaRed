<div class="page-content clearfix">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                <div class="proposal-title-section">
                    <div class="page-title no-bg clearfix mb5 no-border">
                        <h1 class="pl0">
                            <span><i data-feather="anchor" class='icon'></i></span>
                            <?php echo get_proposal_id($proposal_info->id); ?>
                        </h1>

                        <div class="title-button-group mr0">
                            <span class="dropdown inline-block mt15">
                                <button class="btn btn-info text-white dropdown-toggle caret mt0 mb0" type="button" data-bs-toggle="dropdown" aria-expanded="true">
                                    <i data-feather="tool" class="icon-16"></i> <?php echo app_lang('actions'); ?>
                                </button>
                                <ul class="dropdown-menu" role="menu">
                                    <li role="presentation"><?php echo anchor(get_uri("proposals/preview/" . $proposal_info->id . "/1"), "<i data-feather='search' class='icon-16'></i> " . app_lang('proposal_preview'), array("title" => app_lang('proposal_preview'), "target" => "_blank", "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation"><?php echo js_anchor("<i data-feather='printer' class='icon-16'></i> " . app_lang('print_proposal'), array('title' => app_lang('print_proposal'), 'id' => 'print-proposal-btn', "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation"><?php echo anchor(get_uri("offer/preview/" . $proposal_info->id . "/" . $proposal_info->public_key), "<i data-feather='external-link' class='icon-16'></i> " . app_lang('proposal') . " " . app_lang("url"), array("target" => "_blank", "class" => "dropdown-item")); ?> </li>
                                    <li role="presentation" class="dropdown-divider"></li>
                                    <?php if ($is_proposal_editable) { ?>
                                        <li role="presentation"><?php echo modal_anchor(get_uri("proposals/modal_form"), "<i data-feather='edit' class='icon-16'></i> " . app_lang('edit_proposal'), array("title" => app_lang('edit_proposal'), "data-post-id" => $proposal_info->id, "role" => "menuitem", "tabindex" => "-1", "class" => "dropdown-item")); ?> </li>
                                    <?php } ?>
                                    <li role="presentation"><?php echo modal_anchor(get_uri("proposals/modal_form"), "<i data-feather='copy' class='icon-16'></i> " . app_lang('clone_proposal'), array("data-post-is_clone" => true, "data-post-id" => $proposal_info->id, "title" => app_lang('clone_proposal'), "class" => "dropdown-item")); ?></li>

                                    <?php if ($proposal_status == "draft" || $proposal_status == "sent") { ?>
                                        <li role="presentation"><?php echo ajax_anchor(get_uri("proposals/update_proposal_status/" . $proposal_info->id . "/accepted"), "<i data-feather='check-circle' class='icon-16'></i> " . app_lang('mark_as_accepted'), array("data-reload-on-success" => "1", "class" => "dropdown-item")); ?> </li>
                                        <li role="presentation"><?php echo ajax_anchor(get_uri("proposals/update_proposal_status/" . $proposal_info->id . "/declined"), "<i data-feather='x-circle' class='icon-16'></i> " . app_lang('mark_as_rejected'), array("data-reload-on-success" => "1", "class" => "dropdown-item")); ?> </li>
                                        <?php if ($proposal_status == "draft") { ?>
                                            <li role="presentation"><?php echo ajax_anchor(get_uri("proposals/update_proposal_status/" . $proposal_info->id . "/sent"), "<i data-feather='send' class='icon-16'></i> " . app_lang('mark_as_sent'), array("data-reload-on-success" => "1", "class" => "dropdown-item")); ?> </li>
                                        <?php } ?>
                                    <?php } else if ($proposal_status == "accepted") { ?>
                                        <li role="presentation"><?php echo ajax_anchor(get_uri("proposals/update_proposal_status/" . $proposal_info->id . "/declined"), "<i data-feather='x-circle' class='icon-16'></i> " . app_lang('mark_as_rejected'), array("data-reload-on-success" => "1", "class" => "dropdown-item")); ?> </li>
                                    <?php } else if ($proposal_status == "declined") { ?>
                                        <li role="presentation"><?php echo ajax_anchor(get_uri("proposals/update_proposal_status/" . $proposal_info->id . "/accepted"), "<i data-feather='check-circle' class='icon-16'></i> " . app_lang('mark_as_accepted'), array("data-reload-on-success" => "1", "class" => "dropdown-item")); ?> </li>
                                    <?php } ?>

                                    <?php
                                    if ($proposal_status == "draft" || $proposal_status == "sent") {
                                        if ($client_info->is_lead) {
                                            ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("proposals/send_proposal_modal_form/" . $proposal_info->id), "<i data-feather='send' class='icon-16'></i> " . app_lang('send_to_lead'), array("title" => app_lang('send_to_lead'), "data-post-id" => $proposal_info->id, "data-post-is_lead" => true, "role" => "menuitem", "tabindex" => "-1", "class" => "dropdown-item")); ?> </li>
                                        <?php } else { ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("proposals/send_proposal_modal_form/" . $proposal_info->id), "<i data-feather='send' class='icon-16'></i> " . app_lang('send_to_client'), array("title" => app_lang('send_to_client'), "data-post-id" => $proposal_info->id, "role" => "menuitem", "tabindex" => "-1", "class" => "dropdown-item")); ?> </li>
                                            <?php
                                        }
                                    }
                                    ?>

                                    <?php if ($proposal_status == "accepted") { ?>
                                        <li role="presentation" class="dropdown-divider"></li>
                                        <?php if ($show_estimate_option) { ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("estimates/modal_form/"), "<i data-feather='file' class='icon-16'></i> " . app_lang('create_estimate'), array("title" => app_lang("create_estimate"), "data-post-proposal_id" => $proposal_info->id, "class" => "dropdown-item")); ?> </li>
                                        <?php } ?>
                                        <?php if ($show_invoice_option) { ?>
                                            <li role="presentation"><?php echo modal_anchor(get_uri("invoices/modal_form/"), "<i data-feather='file-text' class='icon-16'></i> " . app_lang('create_invoice'), array("title" => app_lang("create_invoice"), "data-post-proposal_id" => $proposal_info->id, "class" => "dropdown-item")); ?> </li>
                                        <?php } ?>
                                    <?php } ?>
                                </ul>
                            </span>
                        </div>
                    </div>

                    <ul id="proposal-tabs" data-bs-toggle="ajax-tab" class="nav nav-pills rounded classic mb20 scrollable-tabs border-white" role="tablist">
                        <li><a role="presentation" data-bs-toggle="tab"  href="javascript:;" data-bs-target="#proposal-details-section"><?php echo app_lang("details"); ?></a></li>
                        <li><a role="presentation" data-bs-toggle="tab" href="<?php echo_uri("proposals/tasks/" . $proposal_info->id); ?>" data-bs-target="#proposal-tasks-section"><?php echo app_lang('tasks'); ?></a></li>
                    </ul>
                </div>
                <div class="tab-content">
                    <div role="tabpanel" class="tab-pane fade" id="proposal-details-section">
                        <?php echo view("proposals/details"); ?>
                    </div>
                    <div role="tabpanel" class="tab-pane fade grid-button" id="proposal-tasks-section"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    //RELOAD_VIEW_AFTER_UPDATE = true;
    $(document).ready(function () {
        var optionVisibility = false;
<?php if ($is_proposal_editable) { ?>
            optionVisibility = true;
<?php } ?>

        $("#proposal-item-table").appTable({
            source: '<?php echo_uri("proposals/item_list_data/" . $proposal_info->id . "/") ?>',
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
<?php if ($is_proposal_editable) { ?>
                    //apply sortable
                    $("#proposal-item-table").find("tbody").attr("id", "proposal-item-table-sortable");
                    var $selector = $("#proposal-item-table-sortable");

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
                                url: '<?php echo_uri("proposals/update_item_sort_values") ?>',
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
                $("#proposal-total-section").html(result.proposal_total_view);
                if (typeof updateInvoiceStatusBar == 'function') {
                    updateInvoiceStatusBar(result.proposal_id);
                }
            },
            onUndoSuccess: function (result) {
                $("#proposal-total-section").html(result.proposal_total_view);
                if (typeof updateInvoiceStatusBar == 'function') {
                    updateInvoiceStatusBar(result.proposal_id);
                }
            }
        });

        $("body").on("click", "#proposal-save-and-show-btn", function () {
            $(this).trigger("submit");

            setTimeout(function () {
                $("[data-bs-target='#proposal-preview']").trigger("click");
            }, 400);
        });

    });

    updateInvoiceStatusBar = function (proposalId) {
        $.ajax({
            url: "<?php echo get_uri("proposals/get_proposal_status_bar"); ?>/" + proposalId,
            success: function (result) {
                if (result) {
                    $("#proposal-status-bar").html(result);
                }
            }
        });
    };

</script>

<?php echo view("proposals/print_proposal_helper_js"); ?>

