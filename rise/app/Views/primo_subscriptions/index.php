<div class="card">
    <div class="card-header">
        <h4><?php echo app_lang("subscription_plans"); ?></h4>
    </div>
    <div class="card-body">
        <div class="row justify-content-center">
            <?php foreach ($plans as $key => $plan) { ?>
                <div class="col-md-4 mb-4">
                    <div class="card <?php echo $current_plan === $key ? 'border-primary' : ''; ?>">
                        <div class="card-header text-center <?php echo $current_plan === $key ? 'bg-primary text-white' : ''; ?>">
                            <h5 class="mb-0"><?php echo $plan['name']; ?></h5>
                            <?php if ($current_plan === $key) { ?>
                                <span class="badge bg-light text-primary"><?php echo app_lang("current_plan"); ?></span>
                            <?php } ?>
                        </div>
                        <div class="card-body text-center">
                            <h2 class="mb-0">₹<?php echo number_format($plan['price_inr']); ?></h2>
                            <small class="text-muted">/<?php echo app_lang("month"); ?></small>

                            <hr>
                            <ul class="list-unstyled text-start">
                                <li><i class="fa fa-check text-success"></i> <?php echo $plan['max_surveys'] ?: '∞'; ?> <?php echo app_lang("surveys"); ?></li>
                                <li><i class="fa fa-check text-success"></i> <?php echo $plan['max_responses_per_survey'] ?: '∞'; ?> <?php echo app_lang("responses_per_survey"); ?></li>
                                <li><i class="fa fa-check text-success"></i> <?php echo $plan['max_questions_per_survey'] ?: '∞'; ?> <?php echo app_lang("questions_per_survey"); ?></li>
                                <li><i class="fa fa-check text-success"></i> <?php echo strtoupper(implode(', ', $plan['export_formats'])); ?> <?php echo app_lang("export"); ?></li>
                                <li>
                                    <?php echo $plan['ai_narrative'] ? '<i class="fa fa-check text-success"></i>' : '<i class="fa fa-times text-muted"></i>'; ?>
                                    <?php echo app_lang("ai_narrative"); ?>
                                </li>
                                <li>
                                    <?php echo $plan['api_access'] ? '<i class="fa fa-check text-success"></i>' : '<i class="fa fa-times text-muted"></i>'; ?>
                                    <?php echo app_lang("api_access"); ?>
                                </li>
                                <li><i class="fa fa-check text-success"></i> <?php echo $plan['team_members'] ?: '∞'; ?> <?php echo app_lang("team_members"); ?></li>
                            </ul>
                        </div>
                        <div class="card-footer text-center">
                            <?php if ($current_plan === $key) { ?>
                                <button class="btn btn-outline-secondary" disabled><?php echo app_lang("current_plan"); ?></button>
                            <?php } else { ?>
                                <button class="btn btn-primary btn-subscribe" data-plan="<?php echo $key; ?>">
                                    <?php echo app_lang("subscribe"); ?>
                                </button>
                            <?php } ?>
                        </div>
                    </div>
                </div>
            <?php } ?>
        </div>
    </div>
</div>

<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
    $(document).ready(function () {
        $(".btn-subscribe").click(function () {
            var plan = $(this).data("plan");
            var $btn = $(this);
            $btn.prop("disabled", true).html('<i class="fa fa-spinner fa-spin"></i>');

            $.post("<?php echo get_uri("primo_subscriptions/checkout/"); ?>" + plan, function (result) {
                if (result.success) {
                    var options = {
                        key: result.key_id,
                        amount: result.amount,
                        currency: result.currency,
                        name: "PrimoData Analytics",
                        description: result.plan_name + " Plan",
                        order_id: result.order_id,
                        handler: function (response) {
                            // Verify payment on server
                            $.post("<?php echo get_uri("primo_subscriptions/verify_payment"); ?>", {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                plan_key: plan
                            }, function (verifyResult) {
                                if (verifyResult.success) {
                                    appAlert(verifyResult.message, {duration: 3000});
                                    location.reload();
                                } else {
                                    appAlert(verifyResult.message, {type: "error"});
                                }
                            }, "json");
                        },
                        prefill: {
                            email: result.user_email,
                            name: result.user_name
                        },
                        theme: {color: "#4e73df"}
                    };
                    var rzp = new Razorpay(options);
                    rzp.open();
                } else {
                    appAlert(result.message, {type: "error"});
                }
                $btn.prop("disabled", false).html('<?php echo app_lang("subscribe"); ?>');
            }, "json");
        });
    });
</script>
