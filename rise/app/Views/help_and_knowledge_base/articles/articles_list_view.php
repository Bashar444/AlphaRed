<h2 class="mb20 pb20 b-b"> <?php echo $category_info->title; ?></h2>
<nav aria-label="breadcrumb" class="help-breadcrumb pb10">
    <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="<?php echo get_uri($category_info->type); ?>"><i data-feather='home' class='icon-14'></i></a></li>
        <li class="breadcrumb-item"><?php echo $category_info->title; ?></li>
    </ol>
</nav>


<p class="mb20"><?php echo nl2br($category_info->description ? process_images_from_content($category_info->description) : ""); ?></p>
<?php
foreach ($articles as $article) {

    echo anchor(get_uri($category_info->type . "/view/" . $article->id), "<i data-feather='arrow-right-circle' class='icon-16 mr15'></i>" . $article->title, array("class" => "list-group-item"));
}
?>
<div class="mb20"></div>
