<div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h4><?php echo $survey->title; ?> — <?php echo app_lang("analysis"); ?></h4>
        <div>
            <?php if ($response_count > 0) { ?>
                <button id="btn-run-analysis" class="btn btn-primary"><i class="fa fa-chart-bar"></i> <?php echo app_lang("run_analysis"); ?></button>
                <div class="btn-group ml-2">
                    <button class="btn btn-default dropdown-toggle" data-bs-toggle="dropdown"><?php echo app_lang("export"); ?></button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="<?php echo get_uri("exports/download/$survey->id/csv"); ?>"><?php echo app_lang("csv"); ?></a></li>
                        <li><a class="dropdown-item" href="<?php echo get_uri("exports/download/$survey->id/xls"); ?>"><?php echo app_lang("xls"); ?></a></li>
                        <li><a class="dropdown-item" href="<?php echo get_uri("exports/download/$survey->id/pdf"); ?>"><?php echo app_lang("pdf"); ?></a></li>
                        <li><a class="dropdown-item" href="<?php echo get_uri("exports/download/$survey->id/zip"); ?>"><?php echo app_lang("zip"); ?></a></li>
                    </ul>
                </div>
            <?php } ?>
        </div>
    </div>
    <div class="card-body">
        <!-- Summary counts -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-light text-center p-3">
                    <h3><?php echo $response_count; ?></h3>
                    <small><?php echo app_lang("completed_responses"); ?></small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light text-center p-3">
                    <h3><?php echo count($questions); ?></h3>
                    <small><?php echo app_lang("questions"); ?></small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light text-center p-3">
                    <h3><?php echo $survey->status; ?></h3>
                    <small><?php echo app_lang("status"); ?></small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light text-center p-3">
                    <h3 id="quality-avg">—</h3>
                    <small><?php echo app_lang("avg_quality_score"); ?></small>
                </div>
            </div>
        </div>

        <!-- Charts container -->
        <div id="charts-container" class="row">
            <?php foreach ($questions as $index => $question) { ?>
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header"><strong>Q<?php echo $index + 1; ?>.</strong> <?php echo esc($question->text); ?></div>
                        <div class="card-body">
                            <canvas id="chart-q-<?php echo $question->id; ?>" height="200"></canvas>
                        </div>
                    </div>
                </div>
            <?php } ?>
        </div>

        <!-- Descriptive stats table -->
        <div id="desc-stats-section" class="d-none mt-4">
            <h5><?php echo app_lang("descriptive_statistics"); ?></h5>
            <div class="table-responsive">
                <table class="table table-bordered table-sm" id="desc-stats-table">
                    <thead>
                        <tr><th><?php echo app_lang("question"); ?></th><th>Mean</th><th>Median</th><th>SD</th><th>Min</th><th>Max</th></tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>

        <!-- Correlation matrix -->
        <div id="corr-section" class="d-none mt-4">
            <h5><?php echo app_lang("correlation_matrix"); ?></h5>
            <div class="table-responsive" id="corr-table-container"></div>
        </div>

        <!-- AI Narrative -->
        <div id="narrative-section" class="d-none mt-4">
            <h5><i class="fa fa-robot"></i> <?php echo app_lang("ai_narrative"); ?></h5>
            <div class="card card-body bg-light" id="narrative-content"></div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<script>
    $(document).ready(function () {
        var surveyId = <?php echo $survey->id; ?>;
        var chartColors = ['#4e73df','#1cc88a','#36b9cc','#f6c23e','#e74a3b','#858796','#5a5c69','#2e59d9','#17a673','#2c9faf'];

        // Load charts for each question
        <?php foreach ($questions as $question) { ?>
        $.getJSON("<?php echo get_uri("analysis/chart_data/$survey->id/$question->id"); ?>", function(data){
            if(data.success){
                var ctx = document.getElementById('chart-q-<?php echo $question->id; ?>').getContext('2d');
                var type = data.values.length > 6 ? 'bar' : 'doughnut';
                new Chart(ctx, {
                    type: type,
                    data: {
                        labels: data.labels,
                        datasets: [{
                            data: data.values,
                            backgroundColor: chartColors.slice(0, data.labels.length),
                            borderWidth: 1
                        }]
                    },
                    options: { responsive: true, plugins: { legend: { display: type === 'doughnut' } } }
                });
            }
        });
        <?php } ?>

        // Run analysis
        $("#btn-run-analysis").click(function(){
            var $btn = $(this);
            $btn.prop("disabled", true).html('<i class="fa fa-spinner fa-spin"></i> Analyzing...');

            $.post("<?php echo get_uri("analysis/run/$survey->id"); ?>", function(result){
                $btn.prop("disabled", false).html('<i class="fa fa-chart-bar"></i> <?php echo app_lang("run_analysis"); ?>');
                if(result.success){
                    // Show descriptive stats
                    if(result.data.descriptive){
                        var tbody = '';
                        $.each(result.data.descriptive, function(q, stats){
                            tbody += '<tr><td>'+q+'</td><td>'+(stats.mean||'—')+'</td><td>'+(stats.median||'—')+'</td><td>'+(stats.std_dev||'—')+'</td><td>'+(stats.min||'—')+'</td><td>'+(stats.max||'—')+'</td></tr>';
                        });
                        $("#desc-stats-table tbody").html(tbody);
                        $("#desc-stats-section").removeClass("d-none");
                    }
                    // Show correlations
                    if(result.data.correlations){
                        var html = '<table class="table table-bordered table-sm"><thead><tr><th></th>';
                        var vars = Object.keys(result.data.correlations);
                        $.each(vars, function(i, v){ html += '<th>'+v+'</th>'; });
                        html += '</tr></thead><tbody>';
                        $.each(vars, function(i, v1){
                            html += '<tr><td><strong>'+v1+'</strong></td>';
                            $.each(vars, function(j, v2){
                                var val = result.data.correlations[v1] ? (result.data.correlations[v1][v2] || '—') : '—';
                                html += '<td>'+val+'</td>';
                            });
                            html += '</tr>';
                        });
                        html += '</tbody></table>';
                        $("#corr-table-container").html(html);
                        $("#corr-section").removeClass("d-none");
                    }
                    // Show narrative
                    if(result.narrative){
                        $("#narrative-content").html(result.narrative.replace(/\n/g, '<br>'));
                        $("#narrative-section").removeClass("d-none");
                    }
                    appAlert(result.message, {duration: 3000});
                } else {
                    appAlert(result.message, {type: "error"});
                }
            }, "json");
        });
    });
</script>
