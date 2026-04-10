<?php
/**
 * One-time script to fix writable/ folder permissions on Hostinger.
 * Upload to public_html/ or public_html/rise/, visit in browser, then DELETE this file.
 */

echo "<h2>Diagnosing paths...</h2><pre>";
echo "Script location: " . __DIR__ . "\n";
echo "Document root:   " . $_SERVER['DOCUMENT_ROOT'] . "\n\n";

// Check both possible locations
$locations = [
    __DIR__ . '/writable',
    dirname(__DIR__) . '/writable',
    $_SERVER['DOCUMENT_ROOT'] . '/writable',
    $_SERVER['DOCUMENT_ROOT'] . '/rise/writable',
];

$found = null;
foreach ($locations as $loc) {
    $exists = is_dir($loc) ? 'EXISTS' : 'NOT FOUND';
    echo "Check: $loc — $exists\n";
    if (is_dir($loc) && !$found) {
        $found = $loc;
    }
}

if (!$found) {
    // Create at the most likely location (same dir as this script)
    $found = __DIR__ . '/writable';
    mkdir($found, 0755, true);
    echo "\nCreated: $found\n";
}

echo "\n<h2>Fixing permissions on: $found</h2>\n";

$dirs = [
    $found,
    $found . '/cache',
    $found . '/logs',
    $found . '/session',
    $found . '/uploads',
    $found . '/debugbar',
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
        echo "CREATED: $dir\n";
    }
    chmod($dir, 0777);
    $perms = substr(sprintf('%o', fileperms($dir)), -4);
    echo "SET 777 ($perms): $dir\n";
}

// Test write access
$test_file = $found . '/cache/test_write.tmp';
if (file_put_contents($test_file, 'test')) {
    unlink($test_file);
    echo "\n✅ SUCCESS — cache is now writable!\n";
} else {
    echo "\n❌ STILL NOT WRITABLE\n";
    echo "Owner: " . posix_getpwuid(fileowner($found))['name'] . "\n";
    echo "Current user: " . get_current_user() . " / " . exec('whoami') . "\n";
}

echo "\n⚠️  DELETE THIS FILE NOW! (fix_permissions.php)\n";
echo "</pre>";
