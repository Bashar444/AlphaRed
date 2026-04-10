<?php

namespace App\Controllers;

class About extends App_Controller {

    protected $Pages_model;

    function __construct() {
        parent::__construct();
        $this->Pages_model = model('App\Models\Pages_model');
    }

    function index($slug = "") {
        if (!$slug) {
            show_404();
        }

        $options = array("slug" => $slug, "status" => "active");
        $page_info = $this->Pages_model->get_details($options)->getRow();

        if (!$page_info) {
            show_404();
        }

        if ($page_info->internal_use_only) {
            //the page should be visible on logged in user only
            $login_user_id = $this->Users_model->login_user_id();
            if (!$login_user_id) {
                show_404();
            }

            $user_info = $this->Users_model->get_one($login_user_id);

            if (!$user_info->is_admin && ($page_info->visible_to_team_members_only || $page_info->visible_to_clients_only)) {
                if ($page_info->visible_to_team_members_only && $user_info->user_type !== "staff") {
                    //the page should be visible to team members only
                    show_404();
                } else if ($page_info->visible_to_clients_only && $user_info->user_type !== "client") {
                    //the page should be visible to clients only
                    show_404();
                }
            }
        } else {
            $view_data['topbar'] = "includes/public/topbar";
            $view_data['left_menu'] = false;
        }

        $view_data["model_info"] = $page_info;

        $view_data["full_width"] = false;
        if (isset($page_info->full_width) && $page_info->full_width == 1) {
            $view_data["full_width"] = true;
        }

        if (isset($page_info->hide_topbar) && $page_info->hide_topbar == 1) {
            $view_data["topbar"] = false;
        }

        return $this->template->rander("about/index", $view_data);
    }
}

/* End of file About.php */
/* Location: ./app/controllers/About.php */