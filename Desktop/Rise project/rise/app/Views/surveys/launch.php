<div class="card">
    <div class="card-header">
        <h4>Launch Survey: <?php echo esc($survey_info->title); ?></h4>
    </div>
    <div class="card-body">
        <?php if ($errors) { ?>
            <div class="alert alert-danger">
                <strong>Cannot launch yet:</strong>
                <ul class="mb-0 mt5">
                    <?php foreach ($errors as $err) { ?>
                        <li><?php echo $err; ?></li>
                    <?php } ?>
                </ul>
            </div>
        <?php } ?>

        <div class="row">
            <div class="col-md-8">
                <!-- Launch Checklist -->
                <div class="card bg-light mb15">
                    <div class="card-body">
                        <h6>Pre-launch Checklist</h6>
                        <ul class="list-unstyled">
                            <li>
                                <?php echo $questions_count > 0 ? '✅' : '❌'; ?>
                                Questions: <strong><?php echo $questions_count; ?></strong>
                            </li>
                            <li>
                                <?php echo $survey_info->target_responses > 0 ? '✅' : '❌'; ?>
                                Target responses: <strong><?php echo $survey_info->target_responses; ?></strong>
                            </li>
                            <li>
                                <?php echo $estimated_reach > 0 ? '✅' : '⚠️'; ?>
                                Estimated panel reach: <strong><?php echo $estimated_reach; ?></strong> respondents
                            </li>
                            <li>
                                <?php echo $survey_info->status === 'draft' ? '✅' : '❌'; ?>
                                Status: <strong><?php echo $survey_info->status; ?></strong>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Schedule -->
                <?php echo form_open(get_uri("surveys/do_launch"), array("id" => "launch-form", "class" => "general-form")); ?>
                <input type="hidden" name="survey_id" value="<?php echo $survey_info->id; ?>" />

                <div class="form-group mb15">
                    <label>Start Date/Time</label>
                    <input type="datetime-local" name="starts_at" class="form-control" 
                        value="<?php echo date('Y-m-d\TH:i'); ?>" />
                    <small class="text-muted">Leave as now to launch immediately</small>
                </div>

                <div class="form-group mb15">
                    <label>End Date/Time (optional)</label>
                    <input type="datetime-local" name="ends_at" class="form-control" />
                    <small class="text-muted">Survey auto-closes at this time, or when target is reached</small>
                </div>

                <?php if (empty($errors)) { ?>
                    <button type="submit" class="btn btn-success btn-lg">
                        <i data-feather="send" class="icon-16"></i> Launch Survey Now
                    </button>
                <?php } else { ?>
                    <button type="button" class="btn btn-secondary btn-lg" disabled>Fix errors above to launch</button>
                <?php } ?>
                <?php echo form_close(); ?>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header"><h6>Survey Summary</h6></div>
                    <div class="card-body">
                        <p><strong>Title:</strong> <?php echo esc($survey_info->title); ?></p>
                        <p><strong>Language:</strong> <?php echo $survey_info->language; ?></p>
                        <p><strong>Target:</strong> <?php echo $survey_info->target_responses; ?> responses</p>
                        <p><strong>Questions:</strong> <?php echo $questions_count; ?></p>
                    </div>
                </div>
                <div class="mt10">
                    <a href="<?php echo get_uri('surveys/builder/' . $survey_info->id); ?>" class="btn btn-default btn-sm w-100 mb5">← Back to Builder</a>
                    <a href="<?php echo get_uri('surveys/targeting/' . $survey_info->id); ?>" class="btn btn-default btn-sm w-100">← Back to Targeting</a>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
$(function() {
    $("#launch-form").appForm({
        onSuccess: function(result) {
            appAlert.success(result.message);
            setTimeout(function() {
                window.location = "<?php echo get_uri('surveys'); ?>";
            }, 2000);
        }
    });
});
</script>
