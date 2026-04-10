<?php
$view_class = "view-container";
$page_wrapper_class = "page-wrapper";
$page_id = "page-content";

if ($full_width) {
    $view_class = "";
    $page_wrapper_class = "";
}

if (isset($topbar) && $topbar === false) {
    $page_wrapper_class = "";
    $page_id = "";
}
?>
<div id="<?php echo $page_id; ?>" class="<?php echo $page_wrapper_class; ?> clearfix">
    <div class="<?php echo $view_class; ?>">
        <?php
        $content = $model_info->content ? $model_info->content : "";
        if ($content == strip_tags($content)) {
            $content = nl2br($content); //don't have any html tag. Convert new line to br.
        }
        echo $content;
        ?>
    </div>
</div>