<div class="container" style="max-width: 400px; margin: 80px auto;">
    <div class="card">
        <div class="card-header text-center">
            <h4>Verify Your Phone</h4>
            <p class="text-muted">Enter the 6-digit OTP sent to your phone</p>
        </div>
        <div class="card-body">
            <?php echo form_open(get_uri("respondents/verify_otp"), array("id" => "otp-form", "class" => "general-form")); ?>
            <input type="hidden" name="user_id" id="user_id" value="" />
            <div class="form-group mb15 text-center">
                <input type="text" name="otp" class="form-control form-control-lg text-center" 
                    maxlength="6" placeholder="000000" style="letter-spacing: 0.5em; font-size: 1.5em;"
                    data-rule-required="true" data-rule-exactlength="6" autocomplete="one-time-code" />
            </div>
            <button type="submit" class="btn btn-primary btn-lg w-100">Verify</button>
            <?php echo form_close(); ?>

            <div class="text-center mt15">
                <button type="button" id="resend-btn" class="btn btn-link">Resend OTP</button>
            </div>
        </div>
    </div>
</div>

<script>
$(function() {
    $("#otp-form").appForm({
        onSuccess: function(result) {
            if (result.success) {
                appAlert.success(result.message);
                setTimeout(function() { window.location = "<?php echo get_uri('signin'); ?>"; }, 2000);
            }
        }
    });

    $("#resend-btn").click(function() {
        var userId = $("#user_id").val();
        if (userId) {
            $.post("<?php echo get_uri('respondents/resend_otp'); ?>", {user_id: userId}, function(result) {
                appAlert.success("OTP resent.");
            }, "json");
        }
    });
});
</script>
