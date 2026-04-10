<div id="page-content" class="page-wrapper clearfix">
    <div class="row">
        <div class="col-sm-3 col-lg-2">
            <?php
            $tab_view['active_tab'] = "store";
            echo view("settings/tabs", $tab_view);
            ?>
        </div>

        <div class="col-sm-9 col-lg-10">
            <?php echo form_open(get_uri("settings/save_store_settings"), array("id" => "store-settings-form", "class" => "general-form dashed-row", "role" => "form")); ?>
            <div class="card">
                <div class=" card-header">
                    <h4><?php echo app_lang("store_settings"); ?></h4>
                </div>
                <div class="card-body post-dropzone">
                    <div class="form-group">
                        <div class="row">
                            <label for="visitors_can_see_store_before_login" class=" col-md-2 col-xs-8 col-sm-4"><?php echo app_lang('visitors_can_see_store_before_login'); ?></label>
                            <div class="col-md-10 col-xs-4 col-sm-8">
                                <?php
                                echo form_checkbox(
                                        "visitors_can_see_store_before_login", "1", get_setting('visitors_can_see_store_before_login') ? true : false, "id='visitors_can_see_store_before_login' class='form-check-input'"
                                );
                                ?>
                                <span class="related_to_public_store_setting ml10 <?php echo get_setting("visitors_can_see_store_before_login") ? "" : "hide" ?>"><i data-feather="alert-circle" class="icon-16"></i> <?php echo app_lang('public_store_page_setting_help_message'); ?> <span><?php echo anchor("settings/general", app_lang("general_settings")); ?></span></span>
                            </div>
                            <?php if (!get_setting("client_can_access_store")) { ?>
                                <div class="related_to_public_store_setting col-md-12 ml10 mt5 text-danger <?php echo get_setting("visitors_can_see_store_before_login") ? "" : "hide" ?>"><i data-feather="alert-triangle" class="icon-16"></i> <?php echo app_lang('public_store_page_setting_permission_error_message'); ?></div>
                            <?php } ?>
                        </div>
                    </div>
                    <div id="accept_order_before_login_area" class="form-group <?php echo (get_setting("visitors_can_see_store_before_login") && !get_setting('show_payment_option_after_submitting_the_order')) ? "" : "text-off" ?>">
                        <div class="row">
                            <label for="accept_order_before_login" class=" col-md-2 col-xs-8 col-sm-4"><?php echo app_lang('accept_order_before_login'); ?></label>
                            <div class="col-md-10 col-xs-4 col-sm-8">
                                <?php
                                echo form_checkbox(
                                        "accept_order_before_login", "1", get_setting('accept_order_before_login') ? true : false, "id='accept_order_before_login' class='form-check-input'"
                                );
                                ?>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="row">
                            <label for="show_payment_option_after_submitting_the_order" class=" col-md-2 col-xs-8 col-sm-4"><?php echo app_lang('show_payment_option_after_submitting_the_order'); ?></label>
                            <div class="col-md-10 col-xs-4 col-sm-8">
                                <?php
                                echo form_checkbox(
                                        "show_payment_option_after_submitting_the_order", "1", get_setting('show_payment_option_after_submitting_the_order') ? true : false, "id='show_payment_option_after_submitting_the_order' class='form-check-input'"
                                );
                                ?>
                            </div>
                        </div>
                    </div>
                    <div id="order_status_after_payment_area" class="form-group <?php echo get_setting("show_payment_option_after_submitting_the_order") ? "" : "hide" ?>">
                        <div class="row">
                            <label for="order_status_after_payment" class="col-md-2"><?php echo app_lang('order_status_after_payment'); ?></label>
                            <div class="col-md-10">
                                <?php
                                echo form_dropdown("order_status_after_payment", $order_statuses_dropdown, array(get_setting('order_status_after_payment')), "class='select2 tax-select2 mini'");
                                //get first item
                                $first_order_status = array_slice($order_statuses_dropdown, 1, 1);
                                $first_order_status = $first_order_status[0];
                                ?>   
                                <span class="ml10"><i data-feather="alert-circle" class="icon-16"></i> <?php echo app_lang('order_status_after_payment_help_message') . " " . "<b>$first_order_status</b>."; ?></span>
                            </div>
                        </div>
                    </div>
                    <div class="related_to_public_store_setting form-group <?php echo get_setting("visitors_can_see_store_before_login") ? "" : "hide" ?>">
                        <div class="row">
                            <label class=" col-md-2"><?php echo app_lang('banner_image_on_public_store'); ?></label>
                            <div class=" col-md-10">
                                <?php if (get_setting("banner_image_on_public_store")) { ?>
                                    <div class="float-start mr15">
                                        <img id="banner-image-on-public-store-preview" style="max-width: 300px; max-height: 80px;" src="<?php echo get_file_from_setting("banner_image_on_public_store", false, get_setting("timeline_file_path")); ?>" alt="..." />
                                    </div>
                                <?php } ?>
                                <div class="float-start mr15">
                                    <?php echo view("includes/dropzone_preview"); ?>    
                                </div>
                                <div class="float-start upload-file-button btn btn-default btn-sm">
                                    <span>...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <button type="submit" class="btn btn-primary"><span data-feather='check-circle' class="icon-16"></span> <?php echo app_lang('save'); ?></button>
                </div>
            </div>

            <?php echo form_close(); ?>
        </div>
    </div>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        $("#store-settings-form").appForm({
            isModal: false,
            onSuccess: function (result) {
                if (result.success) {
                    appAlert.success(result.message, {duration: 10000});
                } else {
                    appAlert.error(result.message);
                }
            }
        });

        var uploadUrl = "<?php echo get_uri("settings/upload_file"); ?>";
        var validationUrl = "<?php echo get_uri("settings/validate_file"); ?>";

        var dropzone = attachDropzoneWithForm("#store-settings-form", uploadUrl, validationUrl, {maxFiles: 1});

        $("#store-settings-form .select2").select2();
        $('[data-bs-toggle="tooltip"]').tooltip();

        var $show_payment_option_after_submitting_the_order = $("#show_payment_option_after_submitting_the_order"),
                $visitors_can_see_store_before_login = $("#visitors_can_see_store_before_login"),
                $accept_order_before_login = $("#accept_order_before_login"),
                $accept_order_before_login_area = $("#accept_order_before_login_area"),
                $order_status_after_payment_area = $("#order_status_after_payment_area");

        var maskAcceptOrderBeforeLogin = function () {
            $accept_order_before_login.attr('checked', false).attr('disabled', 'disabled');
            $accept_order_before_login_area.addClass("text-off");
        };

        var unMaskAcceptOrderBeforeLogin = function () {
            if ($visitors_can_see_store_before_login.is(":checked") && !$show_payment_option_after_submitting_the_order.is(":checked")) {
                $accept_order_before_login.removeAttr('disabled');
                $accept_order_before_login_area.removeClass("text-off");
            }
        };

        $show_payment_option_after_submitting_the_order.click(function () {
            if ($(this).is(":checked")) {
                maskAcceptOrderBeforeLogin();
                $order_status_after_payment_area.removeClass("hide");
            } else {
                unMaskAcceptOrderBeforeLogin();
                $order_status_after_payment_area.addClass("hide");
            }
        });

        $visitors_can_see_store_before_login.click(function () {
            if ($(this).is(":checked")) {
                unMaskAcceptOrderBeforeLogin();
                $(".related_to_public_store_setting").removeClass("hide");
            } else {
                maskAcceptOrderBeforeLogin();
                $(".related_to_public_store_setting").addClass("hide");
            }
        });
    });
</script>