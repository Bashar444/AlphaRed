<div class="container-fluid">
    <div class="row mb20">
        <div class="col-md-12">
            <a href="<?php echo get_uri('public_stats'); ?>" class="text-muted">&larr; Back to datasets</a>
            <h2 class="mt10"><?php echo esc($dataset->title); ?></h2>
            <span class="badge bg-secondary"><?php echo esc($dataset->category); ?></span>
            <?php if ($dataset->region) { ?>
                <span class="badge bg-info"><?php echo esc($dataset->region); ?></span>
            <?php } ?>
            <?php if ($dataset->year) { ?>
                <span class="badge bg-warning"><?php echo $dataset->year; ?></span>
            <?php } ?>
        </div>
    </div>

    <div class="row">
        <div class="col-md-8">
            <div class="card">
                <div class="card-body">
                    <p><?php echo nl2br(esc($dataset->description)); ?></p>

                    <?php
                    $data = $dataset->data ? json_decode($dataset->data, true) : null;
                    if ($data && is_array($data)) {
                    ?>
                        <div class="table-responsive mt15">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <?php if (isset($data[0]) && is_array($data[0])) {
                                            foreach (array_keys($data[0]) as $key) { ?>
                                                <th><?php echo esc($key); ?></th>
                                            <?php }
                                        } ?>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($data as $row) { ?>
                                        <tr>
                                            <?php foreach ($row as $val) { ?>
                                                <td><?php echo esc($val); ?></td>
                                            <?php } ?>
                                        </tr>
                                    <?php } ?>
                                </tbody>
                            </table>
                        </div>
                    <?php } ?>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card">
                <div class="card-header"><h6>Dataset Info</h6></div>
                <div class="card-body">
                    <?php if ($dataset->source) { ?>
                        <p><strong>Source:</strong> <?php echo esc($dataset->source); ?></p>
                    <?php } ?>
                    <p><strong>Views:</strong> <?php echo $dataset->view_count; ?></p>
                    <p><strong>Added:</strong> <?php echo format_to_date($dataset->created_at, false); ?></p>
                    <?php if ($dataset->tags) { ?>
                        <p><strong>Tags:</strong>
                            <?php foreach (explode(',', $dataset->tags) as $tag) { ?>
                                <span class="badge bg-light text-dark"><?php echo esc(trim($tag)); ?></span>
                            <?php } ?>
                        </p>
                    <?php } ?>
                </div>
            </div>
        </div>
    </div>
</div>
