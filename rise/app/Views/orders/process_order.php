<div id="page-content" class="page-wrapper clearfix">
    <div class="process-order-preview" id="process-order-preview">
        <div class="card">

            <?php echo form_open(get_uri("store/place_order"), array("id" => "place-order-form", "class" => "general-form", "role" => "form")); ?>

            <div class="page-title clearfix">
                <h1> <?php echo app_lang('process_order'); ?></h1>
            </div>

            <div class="p20">

                <div class="mb20 ml15 mr15"><?php echo app_lang("process_order_info_message"); ?></div>

                <div class="m15 pb15 mb30">
                    <div class="table-responsive">
                        <table id="order-item-table" class="display mt0" width="100%">            
                        </table>
                    </div>
                    <div class="clearfix">
                        <div class="float-start mt20">
                            <?php
                            if (isset($login_user->id)) {
                                echo modal_anchor(get_uri("store/item_modal_form"), "<i data-feather='plus-circle' class='icon-16'></i> " . app_lang('add_item'), array("class" => "btn btn-info text-white", "title" => app_lang('add_item')));
                            }
                            ?>
                        </div>
                        <div class="float-end" id="order-total-section">
                            <?php echo view("orders/processing_order_total_section"); ?>
                        </div>
                    </div>
                </div>

                <div class="pl15 pr15">
                    <?php if (isset($login_user->user_type) && $login_user->user_type === "staff" && count($companies_dropdown) > 1) { ?>
                        <div class="form-group mt15 clearfix">
                            <div class="row">
                                <label for="company_id" class=" col-md-3"><?php echo app_lang('company'); ?></label>
                                <div class="col-md-9">
                                    <?php
                                    echo form_input(array(
                                        "id" => "company_id",
                                        "name" => "company_id",
                                        "value" => get_default_company_id(),
                                        "class" => "form-control",
                                        "placeholder" => app_lang('company')
                                    ));
                                    ?>
                                </div>
                            </div>
                        </div>
                    <?php } ?>
                    <?php if (isset($clients_dropdown) && $clients_dropdown) { ?>
                        <div class="form-group mt15 clearfix">
                            <div class="row">
                                <label for="client_id" class=" col-md-3"><?php echo app_lang('client'); ?></label>
                                <div class="col-md-9">
                                    <?php
                                    echo form_dropdown("client_id", $clients_dropdown, array(), "class='select2 validate-hidden' id='client_id' data-rule-required='true', data-msg-required='" . app_lang('field_required') . "'");
                                    ?>
                                </div>
                            </div>
                        </div>
                    <?php } ?>

                    <?php if (isset($login_user->id)) { ?>
                        <div class="form-group clearfix">
                            <div class="row">
                                <label for="order_note" class=" col-md-3"><?php echo app_lang('note'); ?></label>
                                <div class=" col-md-9">
                                    <?php
                                    echo form_textarea(array(
                                        "id" => "order_note",
                                        "name" => "order_note",
                                        "class" => "form-control",
                                        "placeholder" => app_lang('note'),
                                        "data-rich-text-editor" => true
                                    ));
                                    ?>
                                </div>
                            </div>
                        </div>
                    <?php } ?>

                    <?php
                    if (isset($custom_fields)) {
                        echo view("custom_fields/form/prepare_context_fields", array("custom_fields" => $custom_fields, "label_column" => "col-md-3", "field_column" => " col-md-9"));
                    }
                    ?> 

                    <?php if (!isset($login_user->id)) { ?>
                        <div class="client-info-section">

                            <div class="form-group clearfix">
                                <div class="row">
                                    <label for="first_name" class=" col-md-3"><?php echo app_lang('first_name'); ?></label>
                                    <div  class=" col-md-9">
                                        <?php
                                        echo form_input(array(
                                            "id" => "first_name",
                                            "name" => "first_name",
                                            "class" => "form-control",
                                            "placeholder" => app_lang('first_name'),
                                            "data-rule-required" => true,
                                            "data-msg-required" => app_lang("field_required"),
                                        ));
                                        ?>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group clearfix">
                                <div class="row">
                                    <label for="last_name" class=" col-md-3"><?php echo app_lang('last_name'); ?></label>
                                    <div  class=" col-md-9">
                                        <?php
                                        echo form_input(array(
                                            "id" => "last_name",
                                            "name" => "last_name",
                                            "class" => "form-control",
                                            "placeholder" => app_lang('last_name'),
                                            "data-rule-required" => true,
                                            "data-msg-required" => app_lang("field_required"),
                                        ));
                                        ?>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="row">
                                    <label for="account_type" class="col-md-3"><?php echo app_lang('type'); ?></label>
                                    <div class="col-md-9">
                                        <?php
                                        echo form_radio(array(
                                            "id" => "type_organization",
                                            "name" => "account_type",
                                            "class" => "form-check-input account-type",
                                            "data-msg-required" => app_lang("field_required"),
                                                ), "organization", true);
                                        ?>
                                        <label for="type_organization" class="mr15"><?php echo app_lang('organization'); ?></label>
                                        <?php
                                        echo form_radio(array(
                                            "id" => "type_person",
                                            "name" => "account_type",
                                            "class" => "form-check-input account-type",
                                            "data-msg-required" => app_lang("field_required"),
                                                ), "person", false);
                                        ?>
                                        <label for="type_person" class=""><?php echo app_lang('individual'); ?></label>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group company-name-section clearfix">
                                <div class="row">
                                    <label for="company_name" class="col-md-3"><?php echo app_lang('company_name'); ?></label>
                                    <div class="col-md-9">
                                        <?php
                                        echo form_input(array(
                                            "id" => "company_name",
                                            "name" => "company_name",
                                            "class" => "form-control",
                                            "placeholder" => app_lang('company_name'),
                                            "data-rule-required" => true,
                                            "data-msg-required" => app_lang("field_required"),
                                        ));
                                        ?>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group clearfix">
                                <div class="row">
                                    <label for="email" class="col-md-3"><?php echo app_lang('email'); ?></label>
                                    <div class="col-md-9">
                                        <?php
                                        echo form_input(array(
                                            "id" => "email",
                                            "name" => "email",
                                            "class" => "form-control",
                                            "data-rule-email" => true,
                                            "data-msg-email" => app_lang("enter_valid_email"),
                                            "data-rule-required" => true,
                                            "data-msg-required" => app_lang("field_required"),
                                            "placeholder" => app_lang('email'),
                                        ));
                                        ?>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group clearfix">
                                <div class="row">
                                    <label for="password" class="col-md-3"><?php echo app_lang('password'); ?></label>
                                    <div class="col-md-9">
                                        <?php
                                        echo form_password(array(
                                            "id" => "password",
                                            "name" => "password",
                                            "class" => "form-control",
                                            "data-rule-required" => true,
                                            "data-msg-required" => app_lang("field_required"),
                                            "data-rule-minlength" => 6,
                                            "data-msg-minlength" => app_lang("enter_minimum_6_characters"),
                                            "autocomplete" => "off",
                                            "style" => "z-index:auto;",
                                            "placeholder" => app_lang('password'),
                                        ));
                                        ?>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group clearfix">
                                <div class="row">
                                    <label for="retype_password" class="col-md-3"><?php echo app_lang('retype_password'); ?></label>
                                    <div class="col-md-9">
                                        <?php
                                        echo form_password(array(
                                            "id" => "retype_password",
                                            "name" => "retype_password",
                                            "class" => "form-control",
                                            "autocomplete" => "off",
                                            "style" => "z-index:auto;",
                                            "data-rule-equalTo" => "#password",
                                            "data-msg-equalTo" => app_lang("enter_same_value"),
                                            "placeholder" => app_lang('retype_password'),
                                        ));
                                        ?>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group clearfix">
                                <div class="row">
                                    <label for="order_note" class=" col-md-3"><?php echo app_lang("order") . " " . strtolower(app_lang('note')); ?></label>
                                    <div class=" col-md-9">
                                        <?php
                                        echo form_textarea(array(
                                            "id" => "order_note",
                                            "name" => "order_note",
                                            "class" => "form-control",
                                            "placeholder" => app_lang("order") . " " . strtolower(app_lang('note')),
                                            "data-rich-text-editor" => true
                                        ));
                                        ?>
                                    </div>
                                </div>
                            </div>

                            <?php if (get_setting("enable_gdpr") && get_setting("show_terms_and_conditions_in_client_signup_page") && get_setting("gdpr_terms_and_conditions_link")) { ?>
                                <div class="form-group clearfix">
                                    <div class="row">
                                        <div class="col-md-3"></div>
                                        <div class="col-md-9">
                                            <label for="i_accept_the_terms_and_conditions">
                                                <?php
                                                echo form_checkbox("i_accept_the_terms_and_conditions", "1", false, "id='i_accept_the_terms_and_conditions' class='float-start form-check-input' data-rule-required='true' data-msg-required='" . app_lang("field_required") . "'");
                                                ?>    
                                                <span class="ml10"><?php echo app_lang('i_accept_the_terms_and_conditions') . " " . anchor(get_setting("gdpr_terms_and_conditions_link"), app_lang("gdpr_terms_and_conditions") . ".", array("target" => "_blank")); ?> </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            <?php } ?>

                            <div class="form-group clearfix">
                                <div class="row">
                                    <div class="col-md-3"></div>
                                    <div class="col-md-9">
                                        <?php echo view("signin/re_captcha"); ?>
                                    </div>
                                </div>
                            </div>

                        </div>

                    <?php } ?>

                </div>
            </div>
            <div  id="order-dropzone" class="post-dropzone">
                <?php echo view("includes/dropzone_preview"); ?>

                <div class="card-footer clearfix">
                    <?php if (isset($login_user->id) && $login_user->id) { ?>
                        <button class="btn btn-default upload-file-button float-start me-auto btn-sm round m-1" type="button" style="color:#7988a2"><i data-feather="camera" class="icon-16"></i> <?php echo app_lang("upload_file"); ?></button>   
                    <?php } ?>
                    <?php
                    $submit_btn_text = app_lang('place_order');
                    if (get_setting("show_payment_option_after_submitting_the_order")) {
                        if (isset($login_user->id) && $login_user->user_type == "client") {
                            $submit_btn_text = app_lang('save_and_continue');
                        } else if (!isset($login_user->id)) {
                            $submit_btn_text = app_lang('save_and_continue_to_login_for_payment');
                        }
                    }
                    ?>
                    <button type="submit" class="btn btn-primary float-end ml10"><span data-feather="check-circle" class="icon-16"></span> <?php echo $submit_btn_text; ?></button>
                    <?php echo anchor(get_uri("store"), "<i data-feather='search' class='icon-16'></i> " . app_lang('find_more_items'), array("class" => "btn btn-default float-end")); ?> 
                </div>
            </div>
            <?php echo form_close(); ?>

        </div>
    </div>

    <script type="text/javascript">
        $(document).ready(function () {
<?php if (isset($login_user->id) && $login_user->id) { ?>
                var uploadUrl = "<?php echo get_uri("orders/upload_file"); ?>";
                var validationUri = "<?php echo get_uri("orders/validate_orders_file"); ?>";

                var dropzone = attachDropzoneWithForm("#order-dropzone", uploadUrl, validationUri);
<?php } ?>

            $("#place-order-form").appForm({
                isModal: false,
                onSubmit: function () {
                    appLoader.show();
                    $("#place-order-form").find('[type="submit"]').attr('disabled', 'disabled');
                },
                onSuccess: function (result) {
                    appLoader.hide();

                    if (result.redirect_to) {
                        window.location = result.redirect_to;
                    } else {
                        $("#process-order-preview").html("");
                        appAlert.success(result.message, {container: "#process-order-preview", animate: false});
                        $('.scrollable-page').scrollTop(0); //scroll to top
                    }
                }
            });

            $("#client_id").select2();

            $("#order-item-table").appTable({
                source: '<?php echo_uri("store/item_list_data_of_login_user") ?>',
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

            $("#company_id").select2({data: <?php echo json_encode($companies_dropdown); ?>});

            $('.account-type').click(function () {
                var inputValue = $(this).attr("value");
                if (inputValue === "person") {
                    $(".company-name-section").addClass("hide");
                } else {
                    $(".company-name-section").removeClass("hide");
                }
            });
        });
    </script>

</div>