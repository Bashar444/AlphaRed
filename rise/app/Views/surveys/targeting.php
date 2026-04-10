<div class="card">
    <div class="card-header">
        <h4><?php echo $survey_info->title; ?> — Audience Targeting</h4>
    </div>
    <div class="card-body">
        <div class="row">
            <div class="col-md-8">
                <?php echo form_open(get_uri("surveys/save_targeting"), array("id" => "targeting-form", "class" => "general-form")); ?>
                <input type="hidden" name="survey_id" value="<?php echo $survey_info->id; ?>" />

                <?php
                $targeting = $survey_info->targeting ? json_decode($survey_info->targeting, true) : array();
                ?>

                <div class="form-group mb15">
                    <label>Age Range</label>
                    <div class="row">
                        <div class="col-md-6">
                            <input type="number" name="age_min" class="form-control" placeholder="Min age" 
                                value="<?php echo isset($targeting['age_min']) ? $targeting['age_min'] : ''; ?>" min="18" max="100" />
                        </div>
                        <div class="col-md-6">
                            <input type="number" name="age_max" class="form-control" placeholder="Max age" 
                                value="<?php echo isset($targeting['age_max']) ? $targeting['age_max'] : ''; ?>" min="18" max="100" />
                        </div>
                    </div>
                </div>

                <div class="form-group mb15">
                    <label>Gender</label>
                    <select name="gender" class="form-control">
                        <option value="any" <?php echo (!isset($targeting['gender']) || $targeting['gender'] === 'any') ? 'selected' : ''; ?>>Any</option>
                        <option value="male" <?php echo (isset($targeting['gender']) && $targeting['gender'] === 'male') ? 'selected' : ''; ?>>Male</option>
                        <option value="female" <?php echo (isset($targeting['gender']) && $targeting['gender'] === 'female') ? 'selected' : ''; ?>>Female</option>
                    </select>
                </div>

                <div class="form-group mb15">
                    <label>Region</label>
                    <input type="text" name="region" class="form-control" placeholder="e.g. Tamil Nadu, Maharashtra" 
                        value="<?php echo isset($targeting['region']) ? esc($targeting['region']) : ''; ?>" />
                </div>

                <hr>
                <div class="form-group mb15">
                    <label><input type="checkbox" name="save_preset" value="1" /> Save as preset</label>
                    <input type="text" name="preset_name" class="form-control mt5" placeholder="Preset name" />
                </div>

                <?php if (isset($presets) && $presets) { ?>
                    <div class="form-group mb15">
                        <label>Load from preset</label>
                        <select id="preset-select" class="form-control">
                            <option value="">Select a preset...</option>
                            <?php foreach ($presets as $preset) { ?>
                                <option value="<?php echo esc($preset->filters); ?>"><?php echo esc($preset->name); ?></option>
                            <?php } ?>
                        </select>
                    </div>
                <?php } ?>

                <button type="submit" class="btn btn-primary">Save Targeting</button>
                <?php echo form_close(); ?>
            </div>
            <div class="col-md-4">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h3 id="reach-count"><?php echo $estimated_reach; ?></h3>
                        <p class="text-muted">Estimated Reach</p>
                        <small>Verified respondents matching your criteria</small>
                    </div>
                </div>
                <a href="<?php echo get_uri('surveys/launch/' . $survey_info->id); ?>" class="btn btn-success w-100 mt10">
                    Proceed to Launch →
                </a>
            </div>
        </div>
    </div>
</div>

<script>
$(function() {
    $("#targeting-form").appForm({
        onSuccess: function(result) {
            appAlert.success(result.message);
        }
    });

    $("#preset-select").change(function() {
        var filters = $(this).val();
        if (filters) {
            var f = JSON.parse(filters);
            $("input[name=age_min]").val(f.age_min || "");
            $("input[name=age_max]").val(f.age_max || "");
            $("select[name=gender]").val(f.gender || "any");
            $("input[name=region]").val(f.region || "");
        }
    });
});
</script>
