<?php if (isset($questions) && $questions) { ?>
    <?php foreach ($questions as $question) { ?>
        <div class="card question-card mb10" data-id="<?php echo $question->id; ?>">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-fill">
                        <strong>Q<?php echo $question->sort + 1; ?>.</strong>
                        <span class="question-text-display"><?php echo esc($question->text); ?></span>
                        <span class="badge bg-info ml5"><?php echo str_replace('_', ' ', $question->type); ?></span>
                        <?php if ($question->required) { ?>
                            <span class="text-danger">*</span>
                        <?php } ?>
                    </div>
                    <div class="ml10">
                        <span class="drag-handle cursor-move"><i data-feather="move" class="icon-16"></i></span>
                        <button type="button" class="btn btn-sm btn-outline-danger delete-question-btn ml5">
                            <i data-feather="trash-2" class="icon-16"></i>
                        </button>
                    </div>
                </div>
                <?php
                    $options = $question->options ? json_decode($question->options, true) : array();
                    if ($options && is_array($options)) {
                ?>
                    <div class="options-display mt5 ml20">
                        <?php foreach ($options as $opt) { ?>
                            <div class="text-muted"><i data-feather="circle" class="icon-12"></i> <?php echo esc($opt); ?></div>
                        <?php } ?>
                    </div>
                <?php } ?>
            </div>
        </div>
    <?php } ?>
<?php } else { ?>
    <div class="text-center text-muted p20">
        <p>No questions yet. Click a button below to add your first question.</p>
    </div>
<?php } ?>
