<div class="clearfix default-bg">
    <div class="row">
        <div class="col-md-9 d-flex align-items-stretch">
            <div class="card p15 w-100">
                <div id="page-content" class="clearfix grid-button">
                    <div style="max-width: 1000px; margin: auto;">
                        <div class="clearfix p20">
                            <!-- small font size is required to generate the pdf, overwrite that for screen -->
                            <style type="text/css"> .invoice-meta {
                                    font-size: 100% !important;
                                }</style>

                            <?php
                            $color = get_setting("invoice_color");
                            if (!$color) {
                                $color = "#2AA384";
                            }
                            $invoice_style = get_setting("invoice_style");
                            $data = array(
                                "client_info" => $client_info,
                                "color" => $color,
                                "invoice_info" => $invoice_info
                            );

                            if ($invoice_style === "style_3") {
                                echo view('invoices/invoice_parts/header_style_3.php', $data);
                            } else if ($invoice_style === "style_2") {
                                echo view('invoices/invoice_parts/header_style_2.php', $data);
                            } else {
                                echo view('invoices/invoice_parts/header_style_1.php', $data);
                            }
                            ?>
                        </div>

                        <div class="table-responsive mt15 pl15 pr15">
                            <table id="invoice-item-table" class="display" width="100%">            
                            </table>
                        </div>

                        <div class="clearfix">
                            <?php if ($can_edit_invoices) { ?>
                                <div class="float-start mt20 ml15">
                                    <?php echo modal_anchor(get_uri("invoices/item_modal_form"), "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_item'), array("class" => "btn btn-info text-white", "title" => app_lang('add_item'), "data-post-invoice_id" => $invoice_info->id)); ?>
                                </div>
                            <?php } ?>
                            <div class="float-end pr15" id="invoice-total-section">
                                <?php echo view("invoices/invoice_total_section", array("invoice_id" => $invoice_info->id, "can_edit_invoices" => $can_edit_invoices)); ?>
                            </div>
                        </div>

                        <?php
                        $files = @unserialize($invoice_info->files);
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
                                        echo js_anchor(remove_file_prefix($file_name), array("data-toggle" => "app-modal", "data-sidebar" => "0", "data-url" => get_uri("invoices/file_preview/" . $invoice_info->id . "/" . $key)));
                                        echo "</div>";
                                    }
                                    ?>
                                </div>
                            </div>
                        <?php } ?>

                        <p class="b-t b-info pt10 m15"><?php echo nl2br($invoice_info->note ? process_images_from_content($invoice_info->note) : ""); ?></p>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 d-flex align-items-stretch">
            <div class="card p15 w-100">
                <div class="clearfix p20">
                    <div class="row">
                        <?php echo view("invoices/invoice_status_bar"); ?>

                        <?php if ($invoice_info->recurring) { ?>
                            <?php
                            $recurring_stopped = false;
                            $recurring_cycle_class = "";
                            if ($invoice_info->no_of_cycles_completed > 0 && $invoice_info->no_of_cycles_completed == $invoice_info->no_of_cycles) {
                                $recurring_cycle_class = "text-danger";
                                $recurring_stopped = true;
                            }


                            $cycles = $invoice_info->no_of_cycles_completed . "/" . $invoice_info->no_of_cycles;
                            if (!$invoice_info->no_of_cycles) { //if not no of cycles, so it's infinity
                                $cycles = $invoice_info->no_of_cycles_completed . "/&#8734;";
                            }
                            ?>

                            <div class="col-md-12 mb15">
                                <strong><?php echo app_lang('repeat_every') . ": "; ?></strong>
                                <?php echo $invoice_info->repeat_every . " " . app_lang("interval_" . $invoice_info->repeat_type); ?>
                            </div>
                            <div class="col-md-12 mb15 <?php echo $recurring_cycle_class ?>">
                                <strong><?php echo app_lang('cycles') . ": "; ?></strong><?php echo $cycles; ?>
                            </div>

                            <?php if (!$recurring_stopped && (int) $invoice_info->next_recurring_date) { ?>
                                <div class="col-md-12 mb15">
                                    <strong><?php echo app_lang('next_recurring_date') . ": "; ?></strong><?php echo format_to_date($invoice_info->next_recurring_date, false); ?>
                                </div>
                            <?php } ?>

                        <?php } ?>

                        <?php if (can_access_reminders_module()) { ?>
                            <div class="col-md-12 mb15" id="invoice-reminders">
                                <div class="mb15"><strong><?php echo app_lang("reminders") . " (" . app_lang('private') . ")" . ": "; ?> </strong></div>
                                <?php echo view("reminders/reminders_view_data", array("invoice_id" => $invoice_info->id, "hide_form" => true, "reminder_view_type" => "invoice")); ?>
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
        if ("<?php echo $can_edit_invoices ?>") {
            optionVisibility = true;
        }
        var delay;
        var taxableRows = [];

        $("#invoice-item-table").appTable({
            source: '<?php echo_uri("invoices/item_list_data/" . $invoice_info->id . "/") ?>',
            order: [[0, "asc"]],
            hideTools: true,
            displayLength: 100,
            stateSave: false,
            columns: [
                {visible: false, searchable: false},
                {title: '<?php echo app_lang("item") ?> ', sortable: false},
                {title: '<?php echo app_lang("quantity") ?>', "class": "text-right w15p", sortable: false},
                {title: '<?php echo app_lang("rate") ?>', "class": "text-right w15p", sortable: false},
                {title: '<?php echo app_lang("taxable") ?>', "class": "text-right w15p", sortable: false},
                {title: '<?php echo app_lang("total") ?>', "class": "text-right w15p", sortable: false},
                {title: '<i data-feather="menu" class="icon-16"></i>', "class": "text-center option w100", sortable: false, visible: optionVisibility}
            ],
            rowCallback: function (nRow, aData) {
                var column = $("#invoice-item-table").DataTable().column(4);
                var taxableColumn = "<?php echo get_setting('taxable_column'); ?>";
                if (taxableColumn == "always_show") {
                    column.visible(true);
                } else if (taxableColumn == "never_show") {
                    column.visible(false);
                } else {
                    taxableRows.push(aData[4]);
                    clearTimeout(delay);
                    delay = setTimeout(function () {
                        var unique = getUniqueArray(taxableRows);

                        if (unique.length === 2) {
                            column.visible(true);
                        } else {
                            column.visible(false);
                        }
                        taxableRows = [];
                    }, 100);
                }

            },
            onInitComplete: function () {
<?php if ($can_edit_invoices) { ?>
                    //apply sortable
                    $("#invoice-item-table").find("tbody").attr("id", "invoice-item-table-sortable");
                    var $selector = $("#invoice-item-table-sortable");

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
                                url: '<?php echo_uri("invoices/update_item_sort_values") ?>',
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
                $("#invoice-total-section").html(result.invoice_total_view);
                if (typeof updateInvoiceStatusBar == 'function') {
                    updateInvoiceStatusBar(result.invoice_id);
                }
            },
            onUndoSuccess: function (result) {
                $("#invoice-total-section").html(result.invoice_total_view);
                if (typeof updateInvoiceStatusBar == 'function') {
                    updateInvoiceStatusBar(result.invoice_id);
                }
            }
        });
    });
</script>