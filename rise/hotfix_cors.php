<?php
/**
 * HOTFIX: Fix CORS preflight (OPTIONS) returning 404.
 * Upload to public_html/ → visit https://dplanthasa.com/hotfix_cors.php?key=primo2026
 * DELETE THIS FILE immediately after running.
 */
if (($_GET['key'] ?? '') !== 'primo2026') {
    http_response_code(404);
    exit;
}

header('Content-Type: text/plain; charset=utf-8');
$changes = [];

// ── 1. Patch .htaccess: Add CORS preflight handling ──
$htaccess = __DIR__ . '/.htaccess';
$htContent = file_get_contents($htaccess);

if (strpos($htContent, 'OPTIONS') === false) {
    // Insert CORS preflight block before the main rewrite rules
    $old = '<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # If the request is for a real file or directory, serve it directly
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d

    # Route everything else through index.php
    RewriteRule ^(.*)$ index.php/$1 [QSA,L]
</IfModule>';

    $new = '<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # CORS preflight: answer OPTIONS immediately at server level
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(api/.*)$ - [R=204,L]
</IfModule>

<IfModule mod_headers.c>
    # CORS headers for API routes
    <If "%{REQUEST_URI} =~ m#^/(index\\.php/)?api/#">
        Header always set Access-Control-Allow-Origin "https://alpha-red-nine.vercel.app"
        Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header always set Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With"
        Header always set Access-Control-Max-Age "86400"
    </If>
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # If the request is for a real file or directory, serve it directly
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d

    # Route everything else through index.php
    RewriteRule ^(.*)$ index.php/$1 [QSA,L]
</IfModule>';

    if (strpos($htContent, $old) !== false) {
        $htContent = str_replace($old, $new, $htContent);
        file_put_contents($htaccess, $htContent);
        $changes[] = ".htaccess: Added CORS preflight handling";
    } else {
        $changes[] = ".htaccess: Could NOT find the original rewrite block — MANUAL EDIT NEEDED";
    }
} else {
    $changes[] = ".htaccess: CORS preflight already present (skipped)";
}

// ── 2. Patch Routes.php: Add OPTIONS catch-all before API group ──
$routesFile = __DIR__ . '/app/Config/Routes.php';
$routesContent = file_get_contents($routesFile);

if (strpos($routesContent, "options('api/v1/") === false) {
    $optionsRoute = <<<'PHP'
// ── CORS preflight catch-all (must be BEFORE the API group) ──────────
$routes->options('api/v1/(:any)', static function () {
    $allowed = getenv('CORS_ALLOWED_ORIGIN') ?: '*';
    $origins = array_map('trim', explode(',', $allowed));
    $reqOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $origin = in_array($reqOrigin, $origins, true) ? $reqOrigin : $origins[0];

    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    header('Content-Length: 0');
    http_response_code(204);
    exit;
});


PHP;

    $marker = "// ── PrimoData REST API v1";
    if (strpos($routesContent, $marker) !== false) {
        $routesContent = str_replace($marker, $optionsRoute . $marker, $routesContent);
        file_put_contents($routesFile, $routesContent);
        $changes[] = "Routes.php: Added OPTIONS catch-all route for api/v1/*";
    } else {
        $changes[] = "Routes.php: Could NOT find API group marker — MANUAL EDIT NEEDED";
    }
} else {
    $changes[] = "Routes.php: OPTIONS catch-all already present (skipped)";
}

// ── 3. Also patch .env if JWT/CORS missing ──
$envFile = __DIR__ . '/.env';
$envContent = file_get_contents($envFile);

if (strpos($envContent, 'JWT_SECRET') === false) {
    $envContent .= "\n\nJWT_SECRET = ce15bf01d60d12d02ea718cb26d372912fcb491d6cbce1b2c1a732d795401b63\nJWT_TTL = 86400\n";
    file_put_contents($envFile, $envContent);
    $changes[] = ".env: Added JWT_SECRET + JWT_TTL";
} else {
    $changes[] = ".env: JWT_SECRET exists (skipped)";
}

if (strpos($envContent, 'CORS_ALLOWED_ORIGIN') === false) {
    $envContent .= "\nCORS_ALLOWED_ORIGIN = https://alpha-red-nine.vercel.app,http://localhost:3000\n";
    file_put_contents($envFile, $envContent);
    $changes[] = ".env: Added CORS_ALLOWED_ORIGIN";
} else {
    $changes[] = ".env: CORS_ALLOWED_ORIGIN exists (skipped)";
}

echo "CORS HOTFIX COMPLETE!\n";
echo "======================\n";
foreach ($changes as $c) {
    echo "  ✓ $c\n";
}

// Verify
echo "\nVerification:\n";
$ht2 = file_get_contents($htaccess);
echo "  .htaccess has OPTIONS rule: " . (strpos($ht2, 'OPTIONS') !== false ? 'YES' : 'NO') . "\n";
$rt2 = file_get_contents($routesFile);
echo "  Routes.php has options() catch-all: " . (strpos($rt2, "options('api/v1/") !== false ? 'YES' : 'NO') . "\n";
$ev2 = file_get_contents($envFile);
echo "  .env has JWT_SECRET: " . (strpos($ev2, 'JWT_SECRET') !== false ? 'YES' : 'NO') . "\n";
echo "  .env has CORS_ALLOWED_ORIGIN: " . (strpos($ev2, 'CORS_ALLOWED_ORIGIN') !== false ? 'YES' : 'NO') . "\n";

echo "\n⚠ DELETE THIS FILE NOW for security.\n";
