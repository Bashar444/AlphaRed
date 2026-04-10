<div class="card">
    <div class="card-header">
        <h4><?php echo $survey_info->title; ?> — Question Builder</h4>
        <p class="text-muted"><?php echo $survey_info->description; ?></p>
    </div>
    <div class="card-body">
        <div class="row">
            <div class="col-md-8">
                <div id="questions-container" class="sortable-list">
                    <!-- Questions loaded via AJAX -->
                </div>
                <div class="mt15">
                    <button type="button" class="btn btn-default add-question-btn" data-type="single_choice">
                        <i data-feather="plus-circle" class="icon-16"></i> Single Choice
                    </button>
                    <button type="button" class="btn btn-default add-question-btn" data-type="multiple_choice">
                        <i data-feather="plus-circle" class="icon-16"></i> Multiple Choice
                    </button>
                    <button type="button" class="btn btn-default add-question-btn" data-type="text">
                        <i data-feather="plus-circle" class="icon-16"></i> Text
                    </button>
                    <button type="button" class="btn btn-default add-question-btn" data-type="number">
                        <i data-feather="plus-circle" class="icon-16"></i> Number
                    </button>
                    <button type="button" class="btn btn-default add-question-btn" data-type="rating">
                        <i data-feather="plus-circle" class="icon-16"></i> Rating
                    </button>
                    <button type="button" class="btn btn-default add-question-btn" data-type="scale">
                        <i data-feather="plus-circle" class="icon-16"></i> Scale
                    </button>
                    <button type="button" class="btn btn-default add-question-btn" data-type="dropdown">
                        <i data-feather="plus-circle" class="icon-16"></i> Dropdown
                    </button>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-white">
                    <div class="card-header"><h6>Survey Settings</h6></div>
                    <div class="card-body">
                        <p><strong>Status:</strong> <span class="badge bg-secondary"><?php echo $survey_info->status; ?></span></p>
                        <p><strong>Target:</strong> <?php echo $survey_info->target_responses; ?> responses</p>
                        <p><strong>Collected:</strong> <?php echo $survey_info->collected_count; ?></p>
                        <p><strong>Language:</strong> <?php echo $survey_info->language; ?></p>
                        <?php if ($survey_info->status === 'draft') { ?>
                            <button type="button" class="btn btn-primary btn-sm launch-survey-btn mt10">
                                <i data-feather="send" class="icon-16"></i> Launch Survey
                            </button>
                        <?php } ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Question Edit Modal Template -->
<div id="question-edit-template" class="hide">
    <div class="card question-card mb10">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-fill">
                    <input type="text" class="form-control question-text mb5" placeholder="Enter your question..." />
                    <span class="badge bg-info question-type-badge"></span>
                </div>
                <div class="ml10">
                    <span class="drag-handle cursor-move"><i data-feather="move" class="icon-16"></i></span>
                    <button type="button" class="btn btn-sm btn-outline-danger delete-question-btn ml5">
                        <i data-feather="trash-2" class="icon-16"></i>
                    </button>
                </div>
            </div>
            <div class="options-container mt10"></div>
            <div class="mt5">
                <label><input type="checkbox" class="question-required" checked /> Required</label>
            </div>
            <button type="button" class="btn btn-sm btn-primary save-question-btn mt5">Save</button>
        </div>
    </div>
</div>

<script type="text/javascript">
    $(document).ready(function () {
        var surveyId = <?php echo $survey_info->id; ?>;

        // Load existing questions
        function loadQuestions() {
            $.get("<?php echo get_uri('surveys/get_questions_list/'); ?>" + surveyId, function (data) {
                $("#questions-container").html(data);
                feather.replace();
            });
        }
        loadQuestions();

        // Add question
        $(".add-question-btn").click(function () {
            var type = $(this).data("type");
            $.ajax({
                url: "<?php echo get_uri('surveys/save_question'); ?>",
                type: "POST",
                data: {survey_id: surveyId, text: "New Question", type: type, required: 1},
                dataType: "json",
                success: function (result) {
                    if (result.success) {
                        loadQuestions();
                    } else {
                        appAlert.error(result.message);
                    }
                }
            });
        });

        // Delete question
        $(document).on("click", ".delete-question-btn", function () {
            var questionId = $(this).closest(".question-card").data("id");
            $.ajax({
                url: "<?php echo get_uri('surveys/delete_question'); ?>",
                type: "POST",
                data: {id: questionId},
                dataType: "json",
                success: function (result) {
                    if (result.success) {
                        loadQuestions();
                    }
                }
            });
        });

        // Make sortable
        if (typeof Sortable !== "undefined") {
            new Sortable(document.getElementById("questions-container"), {
                handle: ".drag-handle",
                animation: 150,
                onEnd: function () {
                    var sortValues = {};
                    $("#questions-container .question-card").each(function (index) {
                        sortValues[index] = $(this).data("id");
                    });
                    $.post("<?php echo get_uri('surveys/sort_questions'); ?>", {sort_values: sortValues});
                }
            });
        }
    });
</script>
