<?php
if (!isset($contexts)) {
    $contexts = array();
}
?>

<script>
    $(document).ready(function () {

        var relatedToDropdowns = <?php echo json_encode($related_to_dropdowns); ?>;

        var dropdowns = {};
        dropdowns.milestones_dropdown = <?php echo json_encode($milestones_dropdown); ?>;
        dropdowns.assign_to_dropdown = <?php echo json_encode($assign_to_dropdown); ?>;
        dropdowns.collaborators_dropdown = <?php echo json_encode($collaborators_dropdown); ?>;
        dropdowns.label_suggestions = <?php echo json_encode($label_suggestions); ?>;
        dropdowns.statuses_dropdown = <?php echo json_encode($statuses_dropdown); ?>;


        showHideRelatedToDropdowns = function (selectedContext) {
            var contexts = <?php echo json_encode($contexts); ?>;

            $.each(contexts, function (index, context) {
                var $element = $("#" + context + "-dropdown");
                var $select2Element = $("#" + context + "_id");

                if (selectedContext === context) {
                    $element.removeClass("hide");
                    $element.find(".task-context-options").addClass("validate-hidden").attr("data-rule-required", true);
                    if (context !== "project") { //define the projec differntly since there is a change event. Define only once.
                        $select2Element.select2({data: relatedToDropdowns[context]});
                    }
                } else {
                    $select2Element.val(""); //reset selected value
                    $element.addClass("hide");
                    $element.find(".task-context-options").removeClass("validate-hidden").removeAttr("data-rule-required");
                }
            });
        };



        function resetRequiredTaskModalDropdowns(url, context, reload_context) {
            $('#milestone_id').select2("destroy");
            $("#milestone_id").hide();
            $('#assigned_to').select2("destroy");
            $("#assigned_to").hide();
            $('#collaborators').select2("destroy");
            $("#collaborators").hide();
            $('#project_labels').select2("destroy");
            $("#project_labels").hide();
            $('#task_status_id').select2("destroy");
            $("#task_status_id").hide();
            if (context && reload_context) {
                $("#" + context + "_id").select2("destroy");
            }

            appLoader.show({container: "#dropdown-apploader-section", zIndex: 1});
            $.ajax({
                url: url,
                dataType: "json",
                success: function (result) {

                    initializeTaskModalCommonDropdowns(result, true);
                    if (context && reload_context) {
                        $("#" + context + "_id").show().val("");
                        $("#" + context + "_id").select2({data: result[context + "s_dropdown"]});
                    }

                    appLoader.hide();
                }
            });
        }

        function showRelatedDropdowns(context, reload_context) {

            var contextId = $("#" + context + "_id").val();
            if (context) {
                var findContext = reload_context ? 0 : 1;
                resetRequiredTaskModalDropdowns("<?php echo get_uri('tasks/get_dropdowns') ?>" + "/" + context + "/" + contextId + "/" + findContext, context, reload_context);
                if (context === "project") {
                    $("#milestones-dropdown").removeClass("hide");
                } else {
                    $("#milestones-dropdown").addClass("hide");
                }

                showHideRelatedToDropdowns(context);
            }
        }

        function showHideDropdowns(context, dropdowns) {
            if (context) {
                if (context === "project") {
                    $("#milestones-dropdown").removeClass("hide");
                } else {
                    $("#milestones-dropdown").addClass("hide");
                }
                showHideRelatedToDropdowns(context);
                initializeTaskModalCommonDropdowns(dropdowns);
            }
        }

        function initializeTaskModalCommonDropdowns(result, resetValue) {
            if (resetValue) {
                $("#milestone_id").show().val("");
                $("#assigned_to").show().val("");
                $("#collaborators").show().val("");
                $("#project_labels").show().val("");
                $("#task_status_id").show().val(result.statuses_dropdown[0].id);
            }

            $('#milestone_id').select2({data: result.milestones_dropdown});
            $('#assigned_to').select2({data: result.assign_to_dropdown});
            $('#collaborators').select2({multiple: true, data: result.collaborators_dropdown});
            $('#project_labels').select2({multiple: true, data: result.label_suggestions});
            $('#task_status_id').select2({data: result.statuses_dropdown});
        }


        var context = $("#task-context").val();
        showHideDropdowns(context, dropdowns);

        $('#priority_id').select2({data: <?php echo json_encode($priorities_dropdown); ?>});



        //load all related data of the selected context
        if ($("#task-context").hasClass("select2")) {
            $("#task-context").select2().on("change", function () {
                var context = $(this).val();
                showRelatedDropdowns(context, true);
            });
        }

        if ($("#project_id").length) {
            $("#project_id").select2({data: relatedToDropdowns[context]}).on("change", function () {
                showRelatedDropdowns("project", false);
            });
        }




    });
</script>