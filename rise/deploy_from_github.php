<?php
/**
 * PrimoData — One-Click Deploy from GitHub
 * 
 * Upload this single file to public_html/ via Hostinger File Manager,
 * then visit: https://dplanthasa.com/deploy_from_github.php?key=primo2026
 * 
 * It will download the latest code from GitHub and sync all files.
 * DELETE THIS FILE after deployment for security.
 */

// ── Security key — prevents unauthorized access ──
$DEPLOY_KEY = 'primo2026';

if (($_GET['key'] ?? '') !== $DEPLOY_KEY) {
    http_response_code(403);
    die('Forbidden. Append ?key=primo2026 to the URL.');
}

set_time_limit(300);
error_reporting(E_ALL);
ini_set('display_errors', 1);

$repo = 'Bashar444/AlphaRed';
$branch = 'main';
$source_dir = 'rise'; // subdirectory in repo that maps to public_html
$target_dir = __DIR__; // public_html

echo "<pre style='font-family:monospace;background:#111;color:#0f0;padding:20px;'>\n";
echo "PrimoData Deploy — " . date('Y-m-d H:i:s') . "\n";
echo str_repeat('=', 60) . "\n\n";

// Step 1: Download repo ZIP from GitHub
$zip_url = "https://github.com/$repo/archive/refs/heads/$branch.zip";
$tmp_zip = sys_get_temp_dir() . '/alphared_deploy_' . time() . '.zip';
$tmp_dir = sys_get_temp_dir() . '/alphared_deploy_' . time();

echo "[1/4] Downloading from GitHub...\n";
echo "      URL: $zip_url\n";

$ctx = stream_context_create([
    'http' => [
        'timeout' => 120,
        'user_agent' => 'PrimoData-Deployer/1.0',
    ],
]);

$data = @file_get_contents($zip_url, false, $ctx);
if (!$data) {
    die("FAILED: Could not download from GitHub. Check internet connectivity.\n");
}
file_put_contents($tmp_zip, $data);
$size_mb = round(strlen($data) / 1024 / 1024, 2);
echo "      Downloaded: {$size_mb} MB\n\n";

// Step 2: Extract
echo "[2/4] Extracting ZIP...\n";
$zip = new ZipArchive();
if ($zip->open($tmp_zip) !== true) {
    die("FAILED: Could not open ZIP file.\n");
}
$zip->extractTo($tmp_dir);
$zip->close();
unlink($tmp_zip);

// Find the extracted directory (GitHub names it repo-branch/)
$extracted = glob("$tmp_dir/AlphaRed-$branch");
if (!$extracted) {
    $extracted = glob("$tmp_dir/*");
}
$repo_root = $extracted[0] ?? '';
$source_path = "$repo_root/$source_dir";

if (!is_dir($source_path)) {
    die("FAILED: Could not find '$source_dir/' in extracted repo at $source_path\n");
}
echo "      Source: $source_path\n\n";

// Step 3: Sync files — copy from source to target
echo "[3/4] Syncing files to $target_dir ...\n";

$copied = 0;
$skipped = 0;
$errors = 0;

// Files/dirs to skip (already configured on server or dangerous to overwrite)
$skip_patterns = [
    'install/database.sql',   // Original RISE installer
    'install/do_install.php',
    'install/view/',
    'documentation/',
    'deploy_from_github.php', // Don't overwrite self
];

function should_skip($rel_path, $skip_patterns) {
    foreach ($skip_patterns as $pattern) {
        if (strpos($rel_path, $pattern) === 0) return true;
    }
    return false;
}

function sync_directory($src, $dst, $base_src, &$copied, &$skipped, &$errors, $skip_patterns) {
    if (!is_dir($dst)) {
        mkdir($dst, 0755, true);
    }
    
    $items = scandir($src);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $src_path = "$src/$item";
        $dst_path = "$dst/$item";
        $rel_path = ltrim(str_replace($base_src, '', $src_path), '/');
        
        if (should_skip($rel_path, $skip_patterns)) {
            $skipped++;
            continue;
        }
        
        if (is_dir($src_path)) {
            sync_directory($src_path, $dst_path, $base_src, $copied, $skipped, $errors, $skip_patterns);
        } else {
            if (@copy($src_path, $dst_path)) {
                $copied++;
            } else {
                echo "      ERROR copying: $rel_path\n";
                $errors++;
            }
        }
    }
}

sync_directory($source_path, $target_dir, $source_path, $copied, $skipped, $errors, $skip_patterns);

echo "      Copied: $copied files\n";
echo "      Skipped: $skipped\n";
echo "      Errors: $errors\n\n";

// Step 4: Set permissions
echo "[4/4] Setting permissions...\n";

$writable_dirs = ['writable/cache', 'writable/logs', 'writable/session', 'writable/uploads', 'writable/debugbar'];
foreach ($writable_dirs as $dir) {
    $full = "$target_dir/$dir";
    if (!is_dir($full)) {
        mkdir($full, 0777, true);
        echo "      Created: $dir/\n";
    }
    chmod($full, 0777);
}

// Ensure .env exists and has correct permissions
if (file_exists("$target_dir/.env")) {
    chmod("$target_dir/.env", 0600);
    echo "      .env: permissions set to 600\n";
}

// Clean up temp
function rrmdir($dir) {
    if (is_dir($dir)) {
        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object != "." && $object != "..") {
                if (is_dir("$dir/$object")) rrmdir("$dir/$object");
                else unlink("$dir/$object");
            }
        }
        rmdir($dir);
    }
}
rrmdir($tmp_dir);

echo "\n" . str_repeat('=', 60) . "\n";
echo "DEPLOY COMPLETE!\n\n";
echo "Files synced: $copied\n";
echo "Errors: $errors\n\n";

if ($errors === 0) {
    echo "✓ All files deployed successfully.\n";
    echo "✓ Now test: https://dplanthasa.com/index.php/api/v1/auth/login\n";
    echo "\n⚠ DELETE THIS FILE NOW for security:\n";
    echo "  Hostinger File Manager → delete deploy_from_github.php\n";
} else {
    echo "⚠ Some files had errors. Check permissions in Hostinger File Manager.\n";
}

echo "</pre>\n";
