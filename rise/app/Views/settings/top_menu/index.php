
<?php echo form_open(get_uri("settings/save_top_menu_settings"), array("id" => "top-menu-settings-form", "class" => "general-form dashed-row", "role" => "form")); ?>

<div class="card-body">
    <input type="hidden" id="top-menus-data" name="top_menus" value="" />

    <div class="form-group">
        <div class="row">
            <div class="col-md-12">
                <i data-feather="info" class="icon-16"></i> <?php echo app_lang("top_menu_description_message"); ?>
            </div>
        </div>
    </div>

    <div class="form-group">
        <div class="row">
            <label for="enable_top_menu" class=" col-md-2"><?php echo app_lang('enable_top_menu'); ?></label>
            <div class="col-md-10">
                <?php
                echo form_checkbox("enable_top_menu", "1", get_setting("enable_top_menu") ? true : false, "id='enable_top_menu' class='form-check-input ml15'");
                ?>
            </div>
        </div>
    </div>

    <div id="top-menu-details-area" class="<?php echo get_setting("enable_top_menu") ? "" : "hide"; ?>">
        <div class="form-group" id="top-menu-input-area">
            <div class="row">
                <label for="top_menus" class=" col-md-2"><?php echo app_lang('menu_items'); ?></label>
                <div class="col-md-10">
                    <div id="top-menus-show-area">
                        <?php echo $top_menus; ?>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <?php
                            echo form_input(array(
                                "id" => "top_menu_name",
                                "name" => "menu_name",
                                "class" => "form-control",
                                "placeholder" => app_lang('menu_name')
                            ));
                            ?>
                        </div>
                        <div class="col-md-6">
                            <?php
                            echo form_input(array(
                                "id" => "top_url",
                                "name" => "url",
                                "class" => "form-control",
                                "placeholder" => "URL"
                            ));
                            ?>
                        </div>
                        <div id="top-menus-options-area" class="col-md-12 mt15 hide">
                            <button id="top-menus-add-button" type="button" class="btn btn-primary"><span data-feather="check-circle" class="icon-16"></span> <?php echo app_lang('add'); ?></button> 
                            <button id="top-menus-close-button" type="button" class="btn btn-default"><span data-feather="x" class="icon-16"></span> <?php echo app_lang('cancel'); ?></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
<div class="card-footer">
    <button type="submit" class="btn btn-primary"><span data-feather="check-circle" class="icon-16"></span> <?php echo app_lang('save'); ?></button>
</div>

<?php echo form_close(); ?>

<script type="text/javascript">
    $(document).ready(function () {
        $("#top-menu-settings-form").appForm({
            isModal: false,
            onSuccess: function (result) {
                if (result.success) {
                    appAlert.success(result.message, {duration: 10000});
                } else {
                    appAlert.error(result.message);
                }
            }
        });

        //save positions for first time
        setTimeout(function () {
            saveTopMenusPosition();
        }, 300);

        //show/hide details area
        $("#enable_top_menu").click(function () {
            if ($(this).is(":checked")) {
                $("#top-menu-details-area").removeClass("hide");
            } else {
                $("#top-menu-details-area").addClass("hide");
            }
        });

        var $topMenusShowArea = $("#top-menus-show-area"),
                $topMenusOptionsArea = $("#top-menus-options-area"),
                $addTopMenuBtn = $("#top-menus-add-button"),
                $closeTopMenuBtn = $("#top-menus-close-button");

        //show save & cancel button when the input is focused
        $("#top_menu_name, #top_url").focus(function () {
            $topMenusOptionsArea.removeClass("hide");
        });

        //add menu
        $addTopMenuBtn.click(function () {
            var menuName = $("#top_menu_name").val(),
                    url = $("#top_url").val();

            if (menuName && url) {
                $.ajax({
                    url: "<?php echo get_uri('settings/save_top_menu') ?>",
                    type: 'POST',
                    dataType: 'json',
                    data: {menu_name: menuName, url: url},
                    success: function (result) {
                        if (result.success) {
                            $topMenusShowArea.append(result.data);

                            $("#top_menu_name").val("").focus();
                            $("#top_url").val("");

                            saveTopMenusPosition();
                        }
                    }
                });
            }
        });

        //close options
        $closeTopMenuBtn.click(function () {
            $topMenusOptionsArea.addClass("hide");
        });

        //delete
        $("body").on("click", ".top-menu-delete-btn", function () {
            $(this).closest("div.top-menu-item").fadeOut(300, function () {
                $(this).closest("div.top-menu-item").remove();

                saveTopMenusPosition();
            });
        });

        //store the temp id for update operation
        $("body").on("click", ".top-menu-item .top-menu-edit-btn", function () {
            window.topMenuItemTempId = $(this).closest(".top-menu-item").attr("data-top_menu_temp_id");
        });

        //make the menus sortable
        var $selector = $("#top-menus-show-area");
        Sortable.create($selector[0], {
            animation: 150,
            chosenClass: "sortable-chosen",
            ghostClass: "sortable-ghost",
            onUpdate: function (e) {
                saveTopMenusPosition();
            }
        });

        $("#top-menu-input-area input").keydown(function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                $addTopMenuBtn.trigger("click");
            }
        });
    });

    function saveTopMenusPosition() {
        var menus = [];

        $("#top-menus-show-area .top-menu-item").each(function (index) {
            var menuName = $(this).find("a").text(),
                    url = $(this).find("a").attr("href");

            if (menuName && url) {
                menus.push({menu_name: menuName, url: url});
            }
        });

        //convert array to json data and save into an input field
        $("#top-menus-data").val(JSON.stringify(menus));
    }
</script>