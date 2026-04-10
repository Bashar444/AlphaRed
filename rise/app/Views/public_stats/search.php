<div class="container-fluid">
    <div class="row mb20">
        <div class="col-md-12">
            <a href="<?php echo get_uri('public_stats'); ?>" class="text-muted">&larr; Back to datasets</a>
            <h2 class="mt10">Search Results</h2>
        </div>
    </div>

    <div class="row mb20">
        <div class="col-md-8">
            <form action="<?php echo get_uri('public_stats/search'); ?>" method="get">
                <div class="input-group">
                    <input type="text" name="q" class="form-control" value="<?php echo esc($search); ?>" placeholder="Search datasets..." />
                    <button class="btn btn-primary" type="submit"><i data-feather="search" class="icon-16"></i> Search</button>
                </div>
            </form>
        </div>
        <div class="col-md-4">
            <form action="<?php echo get_uri('public_stats/search'); ?>" method="get">
                <select name="category" class="form-control" onchange="this.form.submit();">
                    <option value="">All Categories</option>
                    <?php if (isset($categories)) { foreach ($categories as $cat) { ?>
                        <option value="<?php echo esc($cat->category); ?>" <?php echo ($category === $cat->category) ? 'selected' : ''; ?>><?php echo esc($cat->category); ?></option>
                    <?php } } ?>
                </select>
            </form>
        </div>
    </div>

    <div class="row">
        <?php if (isset($results) && $results) { ?>
            <?php foreach ($results as $dataset) { ?>
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
        <?php } else { ?>
            <div class="col-md-12">
                <p class="text-muted text-center p20">No datasets found matching your search.</p>
            </div>
        <?php } ?>
    </div>
</div>
