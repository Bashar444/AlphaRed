<div class="card">
    <div class="card-header">
        <h4><?php echo app_lang("primo_admin_dashboard"); ?></h4>
    </div>
    <div class="card-body">
        <!-- Key metrics row -->
        <div class="row mb-4">
            <div class="col-md-2">
                <div class="card bg-primary text-white text-center p-3">
                    <h3>₹<?php echo number_format($total_revenue); ?></h3>
                    <small><?php echo app_lang("total_revenue"); ?></small>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card bg-success text-white text-center p-3">
                    <h3><?php echo $active_subscriptions; ?></h3>
                    <small><?php echo app_lang("active_subscriptions"); ?></small>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card bg-info text-white text-center p-3">
                    <h3><?php echo $total_surveys; ?></h3>
                    <small><?php echo app_lang("total_surveys"); ?></small>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card bg-warning text-dark text-center p-3">
                    <h3><?php echo $total_responses; ?></h3>
                    <small><?php echo app_lang("total_responses"); ?></small>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card bg-secondary text-white text-center p-3">
                    <h3><?php echo $total_respondents; ?></h3>
                    <small><?php echo app_lang("total_respondents"); ?></small>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card bg-dark text-white text-center p-3">
                    <h3><?php echo count($mrr_by_tier); ?></h3>
                    <small><?php echo app_lang("plan_tiers"); ?></small>
                </div>
            </div>
        </div>

        <!-- MRR by tier -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header"><strong><?php echo app_lang("mrr_by_tier"); ?></strong></div>
                    <div class="card-body">
                        <canvas id="chart-mrr" height="200"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header"><strong><?php echo app_lang("usage_summary"); ?></strong></div>
                    <div class="card-body">
                        <table class="table table-sm">
                            <thead><tr><th><?php echo app_lang("metric"); ?></th><th><?php echo app_lang("total"); ?></th></tr></thead>
                            <tbody>
                                <?php foreach ($usage_summary as $u) { ?>
                                    <tr><td><?php echo ucfirst(str_replace('_', ' ', $u->metric)); ?></td><td><?php echo number_format($u->total); ?></td></tr>
                                <?php } ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick links -->
        <div class="row">
            <div class="col-md-4">
                <a href="<?php echo get_uri("primo_admin/respondents"); ?>" class="card p-3 text-center text-decoration-none">
                    <i class="fa fa-users fa-2x text-primary mb-2"></i>
                    <strong><?php echo app_lang("manage_respondents"); ?></strong>
                </a>
            </div>
            <div class="col-md-4">
                <a href="<?php echo get_uri("primo_admin/datasets"); ?>" class="card p-3 text-center text-decoration-none">
                    <i class="fa fa-database fa-2x text-success mb-2"></i>
                    <strong><?php echo app_lang("manage_datasets"); ?></strong>
                </a>
            </div>
            <div class="col-md-4">
                <a href="<?php echo get_uri("primo_admin/revenue"); ?>" class="card p-3 text-center text-decoration-none">
                    <i class="fa fa-chart-line fa-2x text-warning mb-2"></i>
                    <strong><?php echo app_lang("revenue_dashboard"); ?></strong>
                </a>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<script>
    $(document).ready(function () {
        var mrrData = <?php echo json_encode($mrr_by_tier); ?>;
        if (mrrData.length) {
            new Chart(document.getElementById('chart-mrr').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: mrrData.map(function(d){ return d.plan_key.charAt(0).toUpperCase() + d.plan_key.slice(1); }),
                    datasets: [{
                        data: mrrData.map(function(d){ return d.total; }),
                        backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e']
                    }]
                },
                options: { responsive: true }
            });
        }
    });
</script>
