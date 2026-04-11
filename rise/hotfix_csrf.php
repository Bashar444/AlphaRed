<?php
/**
 * HOTFIX: Add API routes to CSRF exclusion list.
 * Upload to public_html/ → visit https://dplanthasa.com/hotfix_csrf.php?key=primo2026
 * DELETE THIS FILE immediately after running.
 */
if (($_GET['key'] ?? '') !== 'primo2026') {
    http_response_code(404);
    exit;
}

$riseConfig = __DIR__ . '/app/Config/Rise.php';

if (!file_exists($riseConfig)) {
    die("ERROR: Rise.php not found at $riseConfig");
}

$content = file_get_contents($riseConfig);

// Check if already patched
if (strpos($content, 'api/v1/*') !== false) {
    echo "Already patched! api/v1/* is in CSRF exclusions.\n";
} else {
    // Add API exclusions
    $old = '"microsoft_api/save_outlook_smtp_access_token"
    );';
    $new = '"microsoft_api/save_outlook_smtp_access_token",
        "api/v1/*", "api/v1/auth/*", "api/v1/surveys/*", "api/v1/responses/*",
        "api/v1/analysis/*", "api/v1/exports/*", "api/v1/subscriptions/*",
        "api/v1/admin/*", "api/v1/public/*"
    );';

    $content = str_replace($old, $new, $content);
    file_put_contents($riseConfig, $content);
    echo "PATCHED! Added api/v1/* to CSRF exclusions.\n";
}

// Verify
$verify = file_get_contents($riseConfig);
if (strpos($verify, 'api/v1/*') !== false) {
    echo "Verified: Rise.php contains api/v1/* exclusion.\n";
} else {
    echo "WARNING: Patch may not have applied correctly. Check Rise.php manually.\n";
}

echo "\n⚠ DELETE THIS FILE NOW: Hostinger File Manager → delete hotfix_csrf.php\n";
