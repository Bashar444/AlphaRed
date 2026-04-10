<div id="page-content" class="page-wrapper clearfix">
    <?php
    load_css(array(
        "assets/css/invoice.css",
    ));
    ?>

    <div class="invoice-preview">
        <?php
        if (isset($login_user->user_type) && $login_user->user_type === "client") {
            echo "<div class='text-center'>" . anchor("orders/download_pdf/" . $order_info->id, app_lang("download_pdf"), array("class" => "btn btn-default round")) . "</div>";
        }

        if ($show_close_preview) {
            echo "<div class='text-center'>" . anchor("orders/view/" . $order_info->id, app_lang("close_preview"), array("class" => "btn btn-default round")) . "</div>";
        }
        ?>

        <div id="order-preview" class="invoice-preview-container bg-white mt15">
            <?php if (isset($login_user->user_type)) { ?>
                <div class="row">
                    <div class="col-md-12 position-relative">
                        <div class="ribbon"><?php echo "<span class='mt0 badge large' style='background-color: $order_info->order_status_color'>$order_info->order_status_title</span>"; ?></div>
                    </div>
                </div>
            <?php } ?>

            <?php
            echo $order_preview;
            ?>
        </div>

        <?php if (isset($login_user->id)) { ?>
            <div class="card mt20">
                <div class="tab-title clearfix">
                    <h4> <?php echo app_lang('invoices'); ?></h4>
                </div>
                <div class="table-responsive">
                    <table id="order-invoices-table" class="display" cellspacing="0" width="100%">            
                    </table>
                </div>
            </div>

            <div class="card mt20">
                <div class="tab-title clearfix">
                    <h4> <?php echo app_lang('invoice_payment_list'); ?></h4>
                </div>
                <div class="table-responsive">
                    <table id="invoice-payment-table" class="display" cellspacing="0" width="100%">            
                    </table>
                </div>
            </div>
        <?php } ?>

    </div>
</div>

<script type="text/javascript">
    $(document).ready(function () {

<?php if (isset($login_user->id)) { ?>

            var currencySymbol = "<?php echo $order_info->currency_symbol; ?>";
            $("#order-invoices-table").appTable({
                source: '<?php echo_uri("invoices/invoice_list_data_of_order/" . $order_info->id . "/$order_info->client_id") ?>',
                order: [[0, "desc"]],
                columns: [
                    {visible: false, searchable: false},
                    {title: "<?php echo app_lang("invoice_id") ?>", "class": "w10p all", "iDataSort": 0},
                    {visible: false, searchable: false},
                    {visible: false, searchable: false},
                    {visible: false, searchable: false},
                    {title: "<?php echo app_lang("bill_date") ?>", "class": "w10p", "iDataSort": 4},
                    {visible: false, searchable: false},
                    {title: "<?php echo app_lang("due_date") ?>", "class": "w10p", "iDataSort": 6},
                    {title: "<?php echo app_lang("total_invoiced") ?>", "class": "w10p text-right"},
                    {title: "<?php echo app_lang("payment_received") ?>", "class": "w10p text-right"},
                    {title: "<?php echo app_lang("due") ?>", "class": "w10p text-right"},
                    {title: "<?php echo app_lang("status") ?>", "class": "w10p text-center"},
                    {visible: false, searchable: false}
                ],
                printColumns: [1, 5, 7, 8, 9, 10, 11],
                xlsColumns: [1, 5, 7, 8, 9, 10, 11],
                summation: [
                    {column: 8, dataType: 'currency', currencySymbol: currencySymbol},
                    {column: 9, dataType: 'currency', currencySymbol: currencySymbol},
                    {column: 10, dataType: 'currency', currencySymbol: currencySymbol}
                ]
            });

            $("#invoice-payment-table").appTable({
                source: '<?php echo_uri("invoice_payments/payment_list_data_of_order/" . $order_info->id . "/$order_info->client_id") ?>',
                order: [[0, "asc"]],
                columns: [
                    {title: "<?php echo app_lang("invoice_id") ?>", "class": "w15p all"},
                    {visible: false, searchable: false},
                    {title: '<?php echo app_lang("payment_date") ?> ', "class": "w15p", "iDataSort": 1},
                    {title: '<?php echo app_lang("payment_method") ?>', "class": "w15p"},
                    {title: '<?php echo app_lang("note") ?>', "class": "w15p"},
                    {title: '<?php echo app_lang("amount") ?>', "class": "text-right w15p"},
                    {visible: false, searchable: false}
                ]
            });

<?php } ?>

    });
</script>