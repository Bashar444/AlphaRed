<?php echo form_open(get_uri("filters/save"), array("id" => "filter-form", "class" => "general-form", "role" => "form")); ?>

<div class="modal-body clearfix">
    <div class="container-fluid">
        <input type="hidden" name="id" value="<?php echo $id; ?>" />
        <input type="hidden" name="context" value="<?php echo $context; ?>" />
        <input type="hidden" name="change_filter" value="<?php echo $change_filter; ?>" />
        <div class="form-group">
            <div class="row">
                <label for="title" class=" col-md-3"><?php echo app_lang('title'); ?></label>
                <div class=" col-md-9">
                    <?php
                    echo form_input(array(
                        "name" => "title",
                        "value" => $title,
                        "class" => "form-control",
                        "placeholder" => app_lang('title'),
                        "autofocus" => true,
                        "data-rule-required" => true,
                        "data-msg-required" => app_lang("field_required"),
                    ));
                    ?>
                </div>
            </div>
        </div>

        <div class="form-group">
            <div class="row">
                <label for="bookmark_input" class=" col-md-3"><?php echo app_lang('bookmark'); ?></label>
                <div class=" col-md-9">
                    <?php
                    echo form_checkbox("bookmark", "1", $bookmark ? true : false, "id='bookmark_input' class='form-check-input'");
                    ?>
                </div>
            </div>

        </div>

        <div class="form-group">
            <div class="row">
                <div class="col-md-12">
                    <?php
                    echo view("includes/icon_plate", array("selected_icon" => $icon, "resetable" => true));
                    ?>
                </div>
            </div>
        </div>

    </div>
</div>

<div class="modal-footer">
    <button type="button" class="btn btn-default" data-bs-dismiss="modal"><span data-feather="x" class="icon-16"></span> <?php echo app_lang('close'); ?></button>
    <button type="submit" class="btn btn-primary"><span data-feather="check-circle" class="icon-16"></span> <?php echo app_lang('save'); ?></button>
</div>

<?php echo form_close(); ?>

<script type="text/javascript">
    $(document).ready(function () {
        var instance_id = "<?php echo $instance_id; ?>";
        var context = "<?php echo $context; ?>";
        var context_id = "<?php echo $context_id; ?>";


        function  cleanFilterParams(obj) {
            Object.keys(obj).forEach((key) => {
                if (obj[key] && typeof obj[key] === "object") {
                    cleanFilterParams(obj[key]);
                } else if (obj[key] === "" || obj[key] === null || obj[key] === undefined || key === "datatable" || key === "") {
                    delete obj[key];
                }
            });
            return obj;
        }

        function hasContextDependentFilter(filterParams, dependencies) {
            var hasDependency = false;
            if (!dependencies) {
                dependencies = [];
            }
            Object.keys(filterParams || {}).forEach((key) => {
                if (dependencies.includes(key)) {
                    hasDependency = true;
                }
            });
            return hasDependency;
        }


        $("#filter-form").appForm({
            beforeAjaxSubmit: function (data, self, options) {

                var hasBookmark = false;
                $.each(data, function (index, obj) {
                    if (obj.name === "icon" && !obj.value) {
                        obj.value = "_remove";
                    }

                    if (obj.name === "bookmark" && obj.value) {
                        hasBookmark = true;
                    }
                });


                if (!hasBookmark) { //add bookmark remove value manually 
                    data[data.length] = {name: "bookmark", value: "_remove"};
                }

                if (window.InstanceCollection) {
                    var instanceSettings = window.InstanceCollection[instance_id];
                    if (instanceSettings) {
                        var filterParams = cleanFilterParams(instanceSettings.filterParams);
                        if (filterParams) {
                            delete filterParams[""]; //remove empty value
                            data[data.length] = {name: "filter_params", value: JSON.stringify(filterParams)};


                            //save context wise ONLY if there is any depenedent filter 
                            if (window.Filters && window.Filters[context]) {
                                var filter = window.Filters[context],
                                        depndencies = filter.getContextDependencies(),
                                        hasDependency = hasContextDependentFilter(filterParams, depndencies);

                                if (hasDependency) {
                                    data[data.length] = {name: "context_id", value: context_id};
                                }
                            }
                        }
                    }
                }



            },
            onSuccess: function (result) {
                if (result.filters) {
                    AppHelper.settings.filters = result.filters;

                    if (window.Filters && window.Filters[context]) {
                        var filter = window.Filters[context];
                        filter.refreshFilterDropdown();
                        filter.refreshBookmarkFilterButtons();
                        filter.hideFilterForm();
                    }

                }
            }
        });

    });
</script>