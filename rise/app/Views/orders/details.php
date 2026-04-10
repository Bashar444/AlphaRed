<div class="clearfix default-bg">
    <div class="row">
        <div class="col-md-9 d-flex align-items-stretch">
            <div class="card p15 w-100">
                <div id="page-content" class="clearfix">
                    <div style="max-width: 1000px; margin: auto;">
                        <div class="clearfix p20">
                            <!-- small font size is required to generate the pdf, overwrite that for screen -->
                            <style type="text/css"> .invoice-meta {
                                    font-size: 100% !important;
                                }</style>

                            <?php
                            $color = get_setting("order_color");
                            if (!$color) {
                                $color = get_setting("invoice_color");
                            }
                            $style = get_setting("invoice_style");
                            ?>
                            <?php
                            $data = array(
                                "client_info" => $client_info,
                                "color" => $color ? $color : "#2AA384",
                                "order_info" => $order_info
                            );

                            if ($style === "style_3") {
                                echo view('orders/order_parts/header_style_3.php', $data);
                            } else if ($style === "style_2") {
                                echo view('orders/order_parts/header_style_2.php', $data);
                            } else {
                                echo view('orders/order_parts/header_style_1.php', $data);
                            }
                            ?>

                        </div>

                        <div class="table-responsive mt15 pl15 pr15">
                            <table id="order-item-table" class="display" width="100%">            
                            </table>
                        </div>

                        <div class="clearfix">
                            <div class="float-start mt20 ml15">
                                <?php echo modal_anchor(get_uri("store/item_modal_form"), "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_item'), array("class" => "btn btn-info text-white", "title" => app_lang('add_item'), "data-post-order_id" => $order_info->id)); ?>
                            </div>
                            <div class="float-end pr15" id="order-total-section">
                                <?php echo view("orders/order_total_section"); ?>
                            </div>
                        </div>

                        <?php
                        $files = @unserialize($order_info->files);
                        if ($files && is_array($files) && count($files)) {
                            ?>
                            <div class="clearfix">
                                <div class="col-md-12 m15">
                                    <p class="b-t"></p>
                                    <div class="mb5 strong"><?php echo app_lang("files"); ?></div>
                                    <?php
                                    foreach ($files as $key => $value) {
                                        $file_name = get_array_value($value, "file_name");
                                        echo "<div>";
                                        echo js_anchor(remove_file_prefix($file_name), array("data-toggle" => "app-modal", "data-sidebar" => "0", "data-url" => get_uri("orders/file_preview/" . $order_info->id . "/" . $key)));
                                        echo "</div>";
                                    }
                                    ?>
                                </div>
                            </div>
                        <?php } ?>

                        <p class="b-t b-info pt-3 m15"><?php echo nl2br($order_info->note ? process_images_from_content($order_info->note) : ""); ?></p>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3 d-flex align-items-stretch">
            <div class="card p15 w-100">
                <div class="clearfix p20">
                    <div class="row">
                        <?php echo view("orders/order_info_section"); ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    //RELOAD_VIEW_AFTER_UPDATE = true;
    $(document).ready(function () {
        $("#order-item-table").appTable({
            source: '<?php echo_uri("orders/item_list_data/" . $order_info->id . "/") ?>',
            order: [[0, "asc"]],
            hideTools: true,
            displayLength: 100,
            columns: [
                {visible: false, searchable: false},
                {title: "<?php echo app_lang("item") ?> ", sortable: false},
                {title: "<?php echo app_lang("quantity") ?>", "class": "text-right w15p", sortable: false},
                {title: "<?php echo app_lang("rate") ?>", "class": "text-right w15p", sortable: false},
                {title: "<?php echo app_lang("total") ?>", "class": "text-right w15p", sortable: false},
                {title: '<i data-feather="menu" class="icon-16"></i>', "class": "text-center option w100", sortable: false}
            ],

            onInitComplete: function () {
                //apply sortable
                $("#order-item-table").find("tbody").attr("id", "order-item-table-sortable");
                var $selector = $("#order-item-table-sortable");

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
                            url: '<?php echo_uri("store/update_item_sort_values") ?>',
                            type: "POST",
                            data: {sort_values: data},
                            success: function () {
                                appLoader.hide();
                            }
                        });
                    }
                });

            },

            onDeleteSuccess: function (result) {
                $("#order-total-section").html(result.order_total_view);
            },
            onUndoSuccess: function (result) {
                $("#order-total-section").html(result.order_total_view);
            }
        });
    });

</script>