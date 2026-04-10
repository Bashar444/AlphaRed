<?php

$selected_icon = $model_info->icon ? $model_info->icon : "bookmark";
echo view("includes/icon_plate", array("selected_icon" => $selected_icon));
