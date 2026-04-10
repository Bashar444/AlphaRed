<script type="text/javascript">

    $(document).ready(function () {

        var scrollLeft = 0;
        $("#kanban-filters").appFilters({
            source: '<?php echo_uri("tasks/all_tasks_kanban_data") ?>',
            targetSelector: '#load-kanban',
            reloadSelector: "#reload-kanban-button",
            smartFilterIdentity: "all_tasks_kanban", //a to z and _ only. should be unique to avoid conflicts 
            search: {name: "search"},
            filterDropdown: [
                {name: "quick_filter", class: "w200", showHtml: true, options: <?php echo view("tasks/quick_filters_dropdown"); ?>},
                {name: "context", class: "w200", options: <?php echo $contexts_dropdown; ?>, onChangeCallback: function (value, filterParams) {
                        var $tableWrapper = $("#js-kanban-filter-container");
                        if (!(value == "" || value == "project")) {

                            var $milestoneSelector = $tableWrapper.find("select[name=milestone_id]");
                            var $milestoneFirstOption = $milestoneSelector.find("option:first");
                            $milestoneSelector.html("<option value='" + $milestoneFirstOption.val() + "'>" + $milestoneFirstOption.html() + "</option>");
                            $milestoneSelector.select2("val", $milestoneFirstOption.val());

                            var $projectSelector = $tableWrapper.find("select[name=project_id]");
                            $projectSelector.select2("val", "");

                            filterParams.project_id = "";
                            filterParams.milestone_id = "";
                            if (typeof showHideTheBatchUpdateButton !== "undefined") {
                                showHideTheBatchUpdateButton();
                            }
                            $tableWrapper.find("[name='project_id']").closest(".filter-item-box").addClass("hide");
                            $tableWrapper.find("[name='milestone_id']").closest(".filter-item-box").addClass("hide");
                        } else {
                            $tableWrapper.find("[name='project_id']").closest(".filter-item-box").removeClass("hide");
                            $tableWrapper.find("[name='milestone_id']").closest(".filter-item-box").removeClass("hide");
                        }
                    }
                },
                {name: "project_id", class: "w200", options: <?php echo $projects_dropdown; ?>, dependent: ["milestone_id"]}, //reset milestone on changing of project  
                {name: "milestone_id", class: "w200", options: [{id: "", text: "- <?php echo app_lang('milestone'); ?> -"}], dependency: ["project_id"], dataSource: '<?php echo_uri("tasks/get_milestones_for_filter") ?>'}, //milestone is dependent on project
                {name: "specific_user_id", class: "w200", options: <?php echo $team_members_dropdown; ?>},
                {name: "priority_id", class: "w200", options: <?php echo $priorities_dropdown; ?>},
                {name: "label_id", class: "w200", options: <?php echo $labels_dropdown; ?>}
                , <?php echo $custom_field_filters; ?>
            ],
            singleDatepicker: [{name: "deadline", class: "w200", defaultText: "<?php echo app_lang('deadline') ?>",
                    options: [
                        {value: "expired", text: "<?php echo app_lang('expired') ?>"},
                        {value: moment().format("YYYY-MM-DD"), text: "<?php echo app_lang('today') ?>"},
                        {value: moment().add(1, 'days').format("YYYY-MM-DD"), text: "<?php echo app_lang('tomorrow') ?>"},
                        {value: moment().add(7, 'days').format("YYYY-MM-DD"), text: "<?php echo sprintf(app_lang('in_number_of_days'), 7); ?>"},
                        {value: moment().add(15, 'days').format("YYYY-MM-DD"), text: "<?php echo sprintf(app_lang('in_number_of_days'), 15); ?>"}
                    ]}],
            beforeRelaodCallback: function () {
                scrollLeft = $("#kanban-wrapper").scrollLeft();
            },
            afterRelaodCallback: function () {
                setTimeout(function () {
                    $("#kanban-wrapper").animate({scrollLeft: scrollLeft}, 'slow');
                }, 500);
                hideBatchTasksBtn();
            }
        });

        $("body").on("change", "[name='context']", function () {

            //hide projects and milestones filter if the context is not project
            var context = $(this).val();
            if (context && context !== "project") {
                $("#js-kanban-filter-container").find("[name='project_id']").closest(".filter-item-box").addClass("hide");
                $("#js-kanban-filter-container").find("[name='milestone_id']").closest(".filter-item-box").addClass("hide");
            } else {
                $("#js-kanban-filter-container").find("[name='project_id']").closest(".filter-item-box").removeClass("hide");
                $("#js-kanban-filter-container").find("[name='milestone_id']").closest(".filter-item-box").removeClass("hide");
            }
        });

    });

</script>

<?php echo view("tasks/sub_tasks_helper_js"); ?>