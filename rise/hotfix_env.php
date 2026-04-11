<?php
/**
 * HOTFIX: Patch server .env with JWT_SECRET, CORS, and correct settings.
 * Upload to public_html/ → visit https://dplanthasa.com/hotfix_env.php?key=primo2026
 * DELETE THIS FILE immediately after running.
 */
if (($_GET['key'] ?? '') !== 'primo2026') {
    http_response_code(404);
    exit;
}

header('Content-Type: text/plain; charset=utf-8');

$envFile = __DIR__ . '/.env';

if (!file_exists($envFile)) {
    die("ERROR: .env not found");
}

$content = file_get_contents($envFile);
$changes = [];

// Add JWT_SECRET if missing
if (strpos($content, 'JWT_SECRET') === false) {
    $content .= "\n\n#--------------------------------------------------------------------\n";
    $content .= "# JWT AUTH\n";
    $content .= "#--------------------------------------------------------------------\n";
    $content .= "JWT_SECRET = ce15bf01d60d12d02ea718cb26d372912fcb491d6cbce1b2c1a732d795401b63\n";
    $content .= "JWT_TTL    = 86400\n";
    $changes[] = "Added JWT_SECRET and JWT_TTL";
} else {
    $changes[] = "JWT_SECRET already exists (skipped)";
}

// Add CORS if missing
if (strpos($content, 'CORS_ALLOWED_ORIGIN') === false) {
    $content .= "\n#--------------------------------------------------------------------\n";
    $content .= "# CORS — Vercel frontend + localhost dev\n";
    $content .= "#--------------------------------------------------------------------\n";
    $content .= "CORS_ALLOWED_ORIGIN = https://alpha-red-nine.vercel.app,http://localhost:3000\n";
    $changes[] = "Added CORS_ALLOWED_ORIGIN";
} else {
    $changes[] = "CORS_ALLOWED_ORIGIN already exists (skipped)";
}

file_put_contents($envFile, $content);

// Show current DB prefix
preg_match('/database\.default\.DBPrefix\s*=\s*(.+)/', $content, $m);
$prefix = trim($m[1] ?? 'NOT FOUND');

echo "ENV PATCHED!\n";
echo "Changes:\n";
foreach ($changes as $c) {
    echo "  - $c\n";
}
echo "\nDB Prefix on server: $prefix\n";
echo "\nIMPORTANT: Use SQL file with prefix '{$prefix}' when importing tables in phpMyAdmin.\n";
echo "\n⚠ DELETE THIS FILE NOW for security.\n";
