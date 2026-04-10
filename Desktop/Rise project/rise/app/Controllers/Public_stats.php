<?php

namespace App\Controllers;

class Public_stats extends App_Controller {

    function __construct() {
        parent::__construct();
    }

    function index() {
        $view_data["page_title"] = "Free Statistics Portal";
        $view_data["featured"] = $this->Primo_public_datasets_model->get_details(array("featured" => 1))->getResult();
        $view_data["categories"] = $this->Primo_public_datasets_model->get_categories()->getResult();
        return $this->template->rander("public_stats/index", $view_data);
    }

    function view($id = 0) {
        if (!$id) {
            show_404();
        }

        $dataset = $this->Primo_public_datasets_model->get_details(array("id" => $id))->getRow();
        if (!$dataset) {
            show_404();
        }

        $this->Primo_public_datasets_model->increment_view_count($id);

        $view_data["dataset"] = $dataset;
        $view_data["page_title"] = $dataset->title;
        return $this->template->rander("public_stats/view", $view_data);
    }

    function search() {
        $search = $this->request->getGet('q');
        $category = $this->request->getGet('category');

        $options = array();
        if ($search) $options["search"] = $search;
        if ($category) $options["category"] = $category;

        $view_data["results"] = $this->Primo_public_datasets_model->get_details($options)->getResult();
        $view_data["search"] = $search;
        $view_data["category"] = $category;
        $view_data["categories"] = $this->Primo_public_datasets_model->get_categories()->getResult();
        $view_data["page_title"] = "Search Statistics";
        return $this->template->rander("public_stats/search", $view_data);
    }
}
