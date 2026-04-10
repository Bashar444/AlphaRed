<div class="card">
    <div class="card-header">
        <h4><?php echo app_lang("revenue_dashboard"); ?></h4>
    </div>
    <div class="card-body">
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card bg-primary text-white text-center p-3">
                    <h2>₹<?php echo number_format($total_revenue); ?></h2>
                    <small><?php echo app_lang("total_revenue"); ?></small>
                </div>
            </div>
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header"><strong><?php echo app_lang("mrr_by_tier"); ?></strong></div>
                    <div class="card-body">
                        <table class="table table-sm">
                            <thead><tr><th><?php echo app_lang("plan"); ?></th><th><?php echo app_lang("subscribers"); ?></th><th><?php echo app_lang("revenue"); ?></th></tr></thead>
                            <tbody>
                                <?php foreach ($mrr_by_tier as $tier) { ?>
                                    <tr>
                                        <td><span class="badge bg-primary"><?php echo ucfirst($tier->plan_key); ?></span></td>
                                        <td><?php echo $tier->count; ?></td>
                                        <td>₹<?php echo number_format($tier->total); ?></td>
                                    </tr>
                                <?php } ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Monthly revenue chart -->
        <div class="card">
            <div class="card-header"><strong><?php echo app_lang("monthly_revenue"); ?></strong></div>
            <div class="card-body">
                <canvas id="chart-monthly-revenue" height="100"></canvas>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<script>
    $(document).ready(function () {
        var monthlyData = <?php echo json_encode(array_reverse($monthly_revenue)); ?>;
        if (monthlyData.length) {
            new Chart(document.getElementById('chart-monthly-revenue').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: monthlyData.map(function(d){ return d.month; }),
                    datasets: [{
                        label: 'Revenue (₹)',
                        data: monthlyData.map(function(d){ return d.total; }),
                        backgroundColor: '#4e73df'
                    }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true } } }
            });
        }
    });
</script>
