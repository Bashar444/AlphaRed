<div class="reports-tabs">
    <div class="page-wrapper pb-0">
        <?php
        foreach ($reports_menu as $report_menu) {
            $button_name = get_array_value($report_menu, "name");
            if (!$button_name) {
                continue;
            }

            $url = get_array_value($report_menu, "url");
            $class = get_array_value($report_menu, "class");
            $dropdown_item = get_array_value($report_menu, "dropdown_item");

            $single_button = get_array_value($report_menu, "single_button");
            if (!$single_button) {
                ?>
                <div class="dropdown btn-group me-2">
                    <button class="btn btn-default round dropdown-toggle caret" type="button" data-bs-toggle="dropdown" aria-expanded="true">
                        <i data-feather="<?php echo $class; ?>" class="icon-16 mr5"></i> <?php echo app_lang($button_name); ?>
                    </button>
                    <ul class="dropdown-menu" role="menu">
                        <?php
                        if ($dropdown_item) {
                            foreach ($dropdown_item as $item) {
                                $item_name = get_array_value($item, "name");
                                if (!$item_name) {
                                    continue;
                                }

                                $url = get_array_value($item, "url");

                                echo "<li role='presentation'>" . anchor(get_uri($url), app_lang($item_name), array('class' => 'dropdown-item js-reports-link', 'title' => app_lang($item_name))) . "</li>";
                            }
                        }
                        ?>
                    </ul>
                </div>
                <?php
            } else {
                echo anchor(get_uri($url), "<i data-feather='$class' class='icon-16 mr5'></i> " . app_lang($button_name), array("class" => "btn btn-default round me-2 js-reports-link", "title" => app_lang($button_name)));
            }
        }
        ?>
    </div>
</div>


<script>

    //save the selected tab in browser cookie
    $(document).ready(function () {
        $(".js-reports-link").click(function () {
            var link = $(this).attr("href");
            if (link) {
                setCookie("selected_report_" + "<?php echo $login_user->id; ?>", link);
            }
        });
    });
</script>