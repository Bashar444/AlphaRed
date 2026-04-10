

<script>
    var selectedTabURL = getCookie("selected_report_" + "<?php echo $login_user->id; ?>");
    if (selectedTabURL) {
        window.location.href = selectedTabURL;
    } else {
        window.location.href = "<?php echo_uri($redirect_to); ?>";
    }
</script>