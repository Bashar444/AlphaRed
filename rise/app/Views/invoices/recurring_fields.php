<input type="hidden" name="id" value="<?php echo $model_info->id; ?>" />
<div class="form-group">
    <div class="row">
        <label for="invoice_recurring" class=" col-md-3"><?php echo app_lang('recurring'); ?>  <span class="help" data-bs-toggle="tooltip" title="<?php echo app_lang('cron_job_required'); ?>"><i data-feather="help-circle" class="icon-16"></i></span></label>
        <div class=" col-md-9">
            <?php
            echo form_checkbox("recurring", "1", $model_info->recurring ? true : false, "id='invoice_recurring' class='form-check-input'");
            ?>                       
        </div>
    </div>
</div>    
<div id="recurring_fields" class="<?php if (!$model_info->recurring) echo "hide"; ?>"> 
    <div class="form-group">
        <div class="row">
            <label for="repeat_every" class=" col-md-3"><?php echo app_lang('repeat_every'); ?></label>
            <div class="col-md-4">
                <?php
                echo form_input(array(
                    "id" => "repeat_every",
                    "name" => "repeat_every",
                    "type" => "number",
                    "value" => $model_info->repeat_every ? $model_info->repeat_every : 1,
                    "min" => 1,
                    "class" => "form-control recurring_element",
                    "placeholder" => app_lang('repeat_every'),
                    "data-rule-required" => true,
                    "data-msg-required" => app_lang("field_required")
                ));
                ?>
            </div>
            <div class="col-md-5">
                <?php
                echo form_dropdown(
                        "repeat_type", array(
                    "days" => app_lang("interval_days"),
                    "weeks" => app_lang("interval_weeks"),
                    "months" => app_lang("interval_months"),
                    "years" => app_lang("interval_years"),
                        ), $model_info->repeat_type ? $model_info->repeat_type : "months", "class='select2 recurring_element' id='repeat_type'"
                );
                ?>
            </div>
        </div>
    </div>    

    <div class="form-group">
        <div class="row">
            <label for="no_of_cycles" class=" col-md-3"><?php echo app_lang('cycles'); ?></label>
            <div class="col-md-4">
                <?php
                echo form_input(array(
                    "id" => "no_of_cycles",
                    "name" => "no_of_cycles",
                    "type" => "number",
                    "min" => 1,
                    "value" => $model_info->no_of_cycles ? $model_info->no_of_cycles : "",
                    "class" => "form-control",
                    "placeholder" => app_lang('cycles')
                ));
                ?>
            </div>
            <div class="col-md-5 mt5">
                <span class="help" data-bs-toggle="tooltip" title="<?php echo app_lang('recurring_cycle_instructions'); ?>"><i data-feather="help-circle" class="icon-16"></i></span>
            </div>
        </div>
    </div>  



    <div class = "form-group hide" id = "next_recurring_date_container" >
        <div class="row">
            <label for = "next_recurring_date" class = " col-md-3"><?php echo app_lang('next_recurring_date'); ?>  </label>
            <div class=" col-md-9">
                <?php
                echo form_input(array(
                    "id" => "next_recurring_date",
                    "name" => "next_recurring_date",
                    "class" => "form-control",
                    "placeholder" => app_lang('next_recurring_date'),
                    "autocomplete" => "off",
                    "data-rule-required" => true,
                    "data-msg-required" => app_lang("field_required"),
                ));
                ?>
            </div>
        </div>
    </div>

</div>  


<script type="text/javascript">
    $(document).ready(function () {

        $("#repeat_type").select2();

        //show/hide recurring fields
        $("#invoice_recurring").click(function () {
            if ($(this).is(":checked")) {
                $("#recurring_fields").removeClass("hide");
            } else {
                $("#recurring_fields").addClass("hide");
            }
        });

        setDatePicker("#next_recurring_date", {
            startDate: moment().add(1, 'days').format("YYYY-MM-DD") //set min date = tomorrow
        });

        $('[data-bs-toggle="tooltip"]').tooltip();
    });
</script>