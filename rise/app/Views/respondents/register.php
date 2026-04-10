<div class="container" style="max-width: 600px; margin: 50px auto;">
    <div class="card">
        <div class="card-header text-center">
            <h3>Join as a Survey Respondent</h3>
            <p class="text-muted">Earn rewards by participating in research surveys</p>
        </div>
        <div class="card-body">
            <?php echo form_open(get_uri("respondents/do_register"), array("id" => "register-form", "class" => "general-form")); ?>

            <div class="form-group mb15">
                <label>First Name *</label>
                <input type="text" name="first_name" class="form-control" required data-rule-required="true" />
            </div>
            <div class="form-group mb15">
                <label>Last Name *</label>
                <input type="text" name="last_name" class="form-control" required data-rule-required="true" />
            </div>
            <div class="form-group mb15">
                <label>Email *</label>
                <input type="email" name="email" class="form-control" required data-rule-required="true" data-rule-email="true" />
            </div>
            <div class="form-group mb15">
                <label>Phone *</label>
                <input type="tel" name="phone" class="form-control" required data-rule-required="true" placeholder="+91..." />
            </div>
            <div class="form-group mb15">
                <label>Password *</label>
                <input type="password" name="password" class="form-control" required data-rule-required="true" data-rule-minlength="8" />
            </div>

            <hr>
            <h5>Demographics (optional — helps match you with surveys)</h5>

            <div class="row">
                <div class="col-md-6 form-group mb15">
                    <label>Age</label>
                    <input type="number" name="age" class="form-control" min="18" max="100" />
                </div>
                <div class="col-md-6 form-group mb15">
                    <label>Gender</label>
                    <select name="gender" class="form-control">
                        <option value="">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 form-group mb15">
                    <label>Region / State</label>
                    <input type="text" name="region" class="form-control" placeholder="e.g. Tamil Nadu" />
                </div>
                <div class="col-md-6 form-group mb15">
                    <label>Education</label>
                    <select name="education" class="form-control">
                        <option value="">Select</option>
                        <option value="high_school">High School</option>
                        <option value="bachelors">Bachelor's</option>
                        <option value="masters">Master's</option>
                        <option value="phd">PhD</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
            <div class="form-group mb15">
                <label>Occupation</label>
                <input type="text" name="occupation" class="form-control" placeholder="e.g. Student, Engineer, Teacher" />
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-100 mt10">Register</button>
            <?php echo form_close(); ?>
        </div>
    </div>
</div>

<script>
$(function() {
    $("#register-form").appForm({
        onSuccess: function(result) {
            if (result.success) {
                appAlert.success(result.message);
                setTimeout(function() { window.location = "<?php echo get_uri('respondents/verify'); ?>"; }, 2000);
            }
        }
    });
});
</script>
