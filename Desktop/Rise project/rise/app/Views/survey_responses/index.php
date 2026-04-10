<div class="card">
    <div class="card-header">
        <h4><?php echo $survey_info->title; ?> — Responses</h4>
        <div class="mt10">
            <a href="<?php echo get_uri('surveys/builder/' . $survey_info->id); ?>" class="btn btn-sm btn-default">Builder</a>
            <button type="button" class="btn btn-sm btn-info" id="score-all-btn">Score All Responses</button>
        </div>
    </div>
    <div class="card-body">
        <div class="row mb15" id="quality-stats">
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 id="stat-total">—</h5>
                        <small class="text-muted">Completed</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 id="stat-high" class="text-success">—</h5>
                        <small class="text-muted">High Quality</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 id="stat-medium" class="text-warning">—</h5>
                        <small class="text-muted">Medium Quality</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h5 id="stat-low" class="text-danger">—</h5>
                        <small class="text-muted">Low Quality</small>
                    </div>
                </div>
            </div>
        </div>

        <table id="response-table" class="display" cellspacing="0" width="100%"></table>
    </div>
</div>

<script>
$(function() {
    var surveyId = <?php echo $survey_info->id; ?>;

    $("#response-table").appTable({
        source: '<?php echo get_uri("survey_responses/list_data/" . $survey_info->id); ?>',
        columns: [
            {title: "Respondent"},
            {title: "Status"},
            {title: "Quality"},
            {title: "Duration"},
            {title: "Completed"},
            {title: "<i data-feather='menu' class='icon-16'></i>", class: "text-center option w100"}
        ]
    });

    // Load quality stats
    function loadStats() {
        $.getJSON("<?php echo get_uri('survey_responses/quality_stats/' . $survey_info->id); ?>", function(result) {
            if (result.success) {
                var d = result.data;
                $("#stat-total").text(d.total_completed);
                $("#stat-high").text(d.quality_high);
                $("#stat-medium").text(d.quality_medium);
                $("#stat-low").text(d.quality_low);
            }
        });
    }
    loadStats();

    // Score all button
    $("#score-all-btn").click(function() {
        var $btn = $(this);
        $btn.prop("disabled", true).text("Scoring...");
        $.post("<?php echo get_uri('survey_responses/score_all/' . $survey_info->id); ?>", {}, function(result) {
            $btn.prop("disabled", false).text("Score All Responses");
            if (result.success) {
                appAlert.success("Scored " + result.data.total + " responses. Avg: " + result.data.avg_score);
                loadStats();
                $("#response-table").appTable({reload: true});
            }
        }, "json");
    });
});
</script>
