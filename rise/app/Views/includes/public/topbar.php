<nav class="navbar navbar-expand-sm fixed-top navbar-light bg-white shadow-sm public-navbar" role="navigation">
    <div class="container-fluid">
        <a class="navbar-brand" href="<?php echo_uri(); ?>"><img class="dashboard-image" src="<?php echo get_logo_url(); ?>" /></a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbar">
            <ul class="navbar-nav ms-auto mt-2 mt-sm-0">
                <?php
                if (get_setting("enable_top_menu")) {

                    $top_menus = unserialize(get_setting("top_menus"));
                    if ($top_menus && is_array($top_menus)) {
                        foreach ($top_menus as $menu) {
                             echo " <li class='nav-item'>" . anchor($menu->url, $menu->menu_name, array("class" => "nav-link")) . " </li>";
                        }
                    }
                    
                } else {
                    if (get_setting("module_order") && get_setting("visitors_can_see_store_before_login")) {
                        echo " <li class='nav-item'>" . anchor("store", app_lang("store"), array("class" => "nav-link")) . " </li>";
                    }

                    if (get_setting("module_knowledge_base")) {
                        echo " <li class='nav-item'>" . anchor("knowledge_base", app_lang("knowledge_base"), array("class" => "nav-link")) . " </li>";
                    }

                    if (!get_setting("disable_client_login")) {
                        echo " <li class='nav-item'>" . anchor("signin", app_lang("signin"), array("class" => "nav-link")) . " </li>";
                    }

                    if (!get_setting("disable_client_signup")) {
                        echo " <li class='nav-item'>" . anchor("signup", app_lang("signup"), array("class" => "nav-link")) . " </li>";
                    }
                }
                ?>
            </ul>
        </div>
    </div>
</nav>

