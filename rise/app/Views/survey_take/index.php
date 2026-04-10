<div class="container" style="max-width: 700px; margin: 30px auto;">
    <div class="card">
        <div class="card-header">
            <h3><?php echo esc($survey->title); ?></h3>
            <?php if ($survey->description) { ?>
                <p class="text-muted"><?php echo esc($survey->description); ?></p>
            <?php } ?>
        </div>
        <div class="card-body">
            <form id="survey-form">
                <input type="hidden" name="survey_id" value="<?php echo $survey->id; ?>" />
                <input type="hidden" name="respondent_id" value="<?php echo isset($respondent_id) ? $respondent_id : ''; ?>" />
                <input type="hidden" name="start_time" value="<?php echo time(); ?>" />

                <?php if (isset($questions) && $questions) { ?>
                    <?php foreach ($questions as $i => $q) { ?>
                        <div class="question-block mb20 p15 border rounded">
                            <label class="fw-bold">
                                Q<?php echo $i + 1; ?>. <?php echo esc($q->text); ?>
                                <?php if ($q->required) { ?><span class="text-danger">*</span><?php } ?>
                            </label>

                            <?php
                            $options = $q->options ? json_decode($q->options, true) : array();
                            switch ($q->type) {
                                case 'single_choice':
                                    foreach ($options as $opt) { ?>
                                        <div class="form-check mt5">
                                            <input type="radio" name="answers[<?php echo $q->id; ?>]" 
                                                value="<?php echo esc($opt); ?>" class="form-check-input"
                                                <?php echo $q->required ? 'required' : ''; ?> />
                                            <label class="form-check-label"><?php echo esc($opt); ?></label>
                                        </div>
                                    <?php }
                                    break;

                                case 'multiple_choice':
                                    foreach ($options as $opt) { ?>
                                        <div class="form-check mt5">
                                            <input type="checkbox" name="answers[<?php echo $q->id; ?>][]" 
                                                value="<?php echo esc($opt); ?>" class="form-check-input" />
                                            <label class="form-check-label"><?php echo esc($opt); ?></label>
                                        </div>
                                    <?php }
                                    break;

                                case 'text': ?>
                                    <textarea name="answers[<?php echo $q->id; ?>]" class="form-control mt5" 
                                        rows="3" <?php echo $q->required ? 'required' : ''; ?>></textarea>
                                    <?php break;

                                case 'number': ?>
                                    <input type="number" name="answers[<?php echo $q->id; ?>]" class="form-control mt5" 
                                        <?php echo $q->required ? 'required' : ''; ?> />
                                    <?php break;

                                case 'rating': ?>
                                    <div class="mt5">
                                        <?php for ($r = 1; $r <= 5; $r++) { ?>
                                            <label class="btn btn-outline-warning me-1">
                                                <input type="radio" name="answers[<?php echo $q->id; ?>]" value="<?php echo $r; ?>"
                                                    <?php echo $q->required ? 'required' : ''; ?> style="display:none;" />
                                                <?php echo str_repeat('★', $r); ?>
                                            </label>
                                        <?php } ?>
                                    </div>
                                    <?php break;

                                case 'scale': ?>
                                    <div class="mt5 d-flex align-items-center">
                                        <span class="me-2">1</span>
                                        <input type="range" name="answers[<?php echo $q->id; ?>]" 
                                            class="form-range flex-fill" min="1" max="10" value="5" />
                                        <span class="ms-2">10</span>
                                    </div>
                                    <?php break;

                                case 'dropdown': ?>
                                    <select name="answers[<?php echo $q->id; ?>]" class="form-control mt5"
                                        <?php echo $q->required ? 'required' : ''; ?>>
                                        <option value="">Select...</option>
                                        <?php foreach ($options as $opt) { ?>
                                            <option value="<?php echo esc($opt); ?>"><?php echo esc($opt); ?></option>
                                        <?php } ?>
                                    </select>
                                    <?php break;
                            }
                            ?>
                        </div>
                    <?php } ?>
                <?php } ?>

                <button type="submit" class="btn btn-primary btn-lg w-100">Submit Response</button>
            </form>
        </div>
    </div>
</div>

<script>
$(function() {
    $("#survey-form").on("submit", function(e) {
        e.preventDefault();
        var $btn = $(this).find("button[type=submit]");
        $btn.prop("disabled", true).text("Submitting...");

        $.ajax({
            url: "<?php echo get_uri('survey_take/submit'); ?>",
            type: "POST",
            data: $(this).serialize(),
            dataType: "json",
            success: function(result) {
                if (result.success) {
                    $("#survey-form").html('<div class="text-center p30"><h3 class="text-success">✓ ' + result.message + '</h3></div>');
                } else {
                    $btn.prop("disabled", false).text("Submit Response");
                    alert(result.message);
                }
            },
            error: function() {
                $btn.prop("disabled", false).text("Submit Response");
                alert("An error occurred. Please try again.");
            }
        });
    });
});
</script>
