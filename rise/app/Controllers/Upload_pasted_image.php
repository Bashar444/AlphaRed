<?php

namespace App\Controllers;

class Upload_pasted_image extends App_Controller {

    function __construct() {
        parent::__construct();
    }

    function index() {
        show_404();
    }

    function save() {
        if (!(isset($_FILES['file']) && $_FILES['file']['error'] == 0)) {
            //no file found
            return false;
        }

        $file = get_array_value($_FILES, "file");
        $temp_file = get_array_value($file, "tmp_name");
        $file_name = get_array_value($file, "name");
        $file_size = get_array_value($file, "size");

        if (!is_viewable_image_file($file_name)) {
            //not an image file
            return false;
        }

        $image_name = "image_" . make_random_string(5) . ".png";
        $timeline_file_path = get_setting("timeline_file_path");

        $file_info = move_temp_file($image_name, $timeline_file_path, "pasted_image", $temp_file, "", "", false, $file_size);
        if (!$file_info) {
            // couldn't upload it
            return false;
        }

        $new_file_name = get_array_value($file_info, 'file_name');
        $url = get_source_url_of_file($file_info, $timeline_file_path, "thumbnail");

        echo "<span class='timeline-images inline-block'><img class='pasted-image' src='$url' alt='$new_file_name'/></span>";
    }

}
