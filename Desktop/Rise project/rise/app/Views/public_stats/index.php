<div class="container-fluid">
    <div class="row mb20">
        <div class="col-md-12">
            <h2>Free Statistics Portal</h2>
            <p class="text-muted">Browse worldwide and India-specific statistical data — free for everyone.</p>
        </div>
    </div>

    <!-- Search Bar -->
    <div class="row mb20">
        <div class="col-md-8">
            <form action="<?php echo get_uri('public_stats/search'); ?>" method="get">
                <div class="input-group">
                    <input type="text" name="q" class="form-control" placeholder="Search datasets..." />
                    <button class="btn btn-primary" type="submit"><i data-feather="search" class="icon-16"></i> Search</button>
                </div>
            </form>
        </div>
        <div class="col-md-4">
            <select class="form-control" onchange="if(this.value) window.location='<?php echo get_uri('public_stats/search'); ?>?category='+this.value;">
                <option value="">All Categories</option>
                <?php if (isset($categories)) { foreach ($categories as $cat) { ?>
                    <option value="<?php echo esc($cat->category); ?>"><?php echo esc($cat->category); ?></option>
                <?php } } ?>
            </select>
        </div>
    </div>

    <!-- Featured Datasets -->
    <?php if (isset($featured) && $featured) { ?>
        <div class="row mb20">
            <div class="col-md-12">
                <h4>Featured Datasets</h4>
            </div>
            <?php foreach ($featured as $dataset) { ?>
                <div class="col-md-4 mb15">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5><a href="<?php echo get_uri('public_stats/view/' . $dataset->id); ?>"><?php echo esc($dataset->title); ?></a></h5>
                            <span class="badge bg-secondary"><?php echo esc($dataset->category); ?></span>
                            <?php if ($dataset->region) { ?>
                                <span class="badge bg-info"><?php echo esc($dataset->region); ?></span>
                            <?php } ?>
                            <p class="text-muted mt10"><?php echo esc(substr($dataset->description, 0, 150)); ?>...</p>
                            <small class="text-muted"><?php echo $dataset->view_count; ?> views</small>
                        </div>
                    </div>
                </div>
            <?php } ?>
        </div>
    <?php } ?>
</div>
