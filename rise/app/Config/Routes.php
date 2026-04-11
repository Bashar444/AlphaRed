<?php

namespace Config;

// Create a new instance of our RouteCollection class.
$routes = Services::routes();

/*
 * --------------------------------------------------------------------
 * Router Setup
 * --------------------------------------------------------------------
 */
$routes->setDefaultNamespace('App\Controllers');
$routes->setDefaultController('Dashboard');
$routes->setDefaultMethod('index');
$routes->setTranslateURIDashes(false);
$routes->set404Override();
// The Auto Routing (Legacy) is very dangerous. It is easy to create vulnerable apps
// where controller filters or CSRF protection are bypassed.
// If you don't want to define all routes, please use the Auto Routing (Improved).
// Set `$autoRoutesImproved` to true in `app/Config/Feature.php` and set the following to true.
// $routes->setAutoRoute(false);

/*
 * --------------------------------------------------------------------
 * Route Definitions
 * --------------------------------------------------------------------
 */

// We get a performance increase by specifying the default
// route since we don't have to scan directories.
$routes->get('/', 'Dashboard::index');

//custom routing for custom pages
//this route will move 'about/any-text' to 'domain.com/about/index/any-text'
$routes->add('about/(:any)', 'About::index/$1');

//add routing for controllers
$excluded_controllers = array("About", "App_Controller", "Security_Controller");
$controller_dropdown = array();
$dir = "./app/Controllers/";
if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
        while (($file = readdir($dh)) !== false) {
            // Skip directories (e.g. Api/), dotfiles, and non-PHP files
            if (is_dir($dir . $file) || !str_ends_with($file, '.php')) {
                continue;
            }
            $controller_name = substr($file, 0, -4);
            if ($file && $file != "." && $file != ".." && $file != "index.html" && $file != ".gitkeep" && !in_array($controller_name, $excluded_controllers)) {
                $controller_dropdown[] = $controller_name;
            }
        }
        closedir($dh);
    }
}

foreach ($controller_dropdown as $controller) {
    $routes->get(strtolower($controller), "$controller::index");
    $routes->get(strtolower($controller) . '/(:any)', "$controller::$1");
    $routes->post(strtolower($controller) . '/(:any)', "$controller::$1");
}

//add uppercase links
$routes->get("Plugins", "Plugins::index");
$routes->get("Plugins/(:any)", "Plugins::$1");
$routes->post("Plugins/(:any)", "Plugins::$1");

$routes->get("Updates", "Updates::index");
$routes->get("Updates/(:any)", "Updates::$1");
$routes->post("Updates/(:any)", "Updates::$1");

/*
 * --------------------------------------------------------------------
 * Additional Routing
 * --------------------------------------------------------------------
 *
 * There will often be times that you need additional routing and you
 * need it to be able to override any defaults in this file. Environment
 * based routes is one such time. require() additional route files here
 * to make that happen.
 *
 * You will have access to the $routes object within that file without
 * needing to reload it.
 */

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

// ── PrimoData REST API v1 ────────────────────────────────────────────
$routes->group('api/v1', ['namespace' => 'App\Controllers\Api'], function ($routes) {

    // Auth (no JWT required for login/register)
    $routes->post('auth/login', 'Auth::login');
    $routes->post('auth/register', 'Auth::register');
    $routes->get('auth/me', 'Auth::me');

    // Surveys CRUD
    $routes->get('surveys', 'Surveys::index');
    $routes->get('surveys/(:num)', 'Surveys::show/$1');
    $routes->post('surveys', 'Surveys::create');
    $routes->put('surveys/(:num)', 'Surveys::update/$1');
    $routes->delete('surveys/(:num)', 'Surveys::delete/$1');

    // Survey questions
    $routes->get('surveys/(:num)/questions', 'Surveys::questions/$1');
    $routes->post('surveys/(:num)/questions', 'Surveys::add_question/$1');
    $routes->put('surveys/(:num)/questions/(:num)', 'Surveys::update_question/$1/$2');
    $routes->delete('surveys/(:num)/questions/(:num)', 'Surveys::delete_question/$1/$2');

    // Targeting + launch
    $routes->get('surveys/(:num)/targeting', 'Surveys::targeting/$1');
    $routes->put('surveys/(:num)/targeting', 'Surveys::save_targeting/$1');
    $routes->post('surveys/(:num)/launch', 'Surveys::launch/$1');

    // Responses
    $routes->get('surveys/(:num)/responses', 'Responses::index/$1');
    $routes->get('surveys/(:num)/responses/quality', 'Responses::quality/$1');
    $routes->post('surveys/(:num)/responses/score-all', 'Responses::score_all/$1');
    $routes->get('responses/(:num)', 'Responses::show/$1');

    // Analysis
    $routes->get('surveys/(:num)/analysis', 'Analysis::show/$1');
    $routes->post('surveys/(:num)/analysis/run', 'Analysis::run/$1');
    $routes->get('surveys/(:num)/analysis/chart/(:num)', 'Analysis::chart/$1/$2');

    // Exports
    $routes->get('surveys/(:num)/exports', 'Exports::index/$1');
    $routes->post('surveys/(:num)/exports/(:alpha)', 'Exports::generate/$1/$2');

    // Subscriptions
    $routes->get('subscriptions/plans', 'Subscriptions::plans');
    $routes->get('subscriptions/current', 'Subscriptions::current');
    $routes->post('subscriptions/checkout', 'Subscriptions::checkout');
    $routes->post('subscriptions/verify', 'Subscriptions::verify');
    $routes->post('subscriptions/cancel', 'Subscriptions::cancel');

    // Admin
    $routes->get('admin/dashboard', 'Admin::dashboard');
    $routes->get('admin/respondents', 'Admin::respondents');
    $routes->post('admin/respondents/(:num)/suspend', 'Admin::suspend_respondent/$1');
    $routes->get('admin/datasets', 'Admin::datasets');
    $routes->post('admin/datasets/(:num)/publish', 'Admin::publish_dataset/$1');
    $routes->post('admin/datasets/(:num)/unpublish', 'Admin::unpublish_dataset/$1');
    $routes->get('admin/revenue', 'Admin::revenue');

    // Public (no auth)
    $routes->get('public/datasets', 'PublicApi::datasets');
    $routes->get('public/datasets/categories', 'PublicApi::categories');
    $routes->get('public/datasets/(:num)', 'PublicApi::dataset/$1');
    $routes->get('public/surveys/(:num)', 'PublicApi::survey/$1');
    $routes->post('public/surveys/(:num)/submit', 'PublicApi::submit_survey/$1');

    // Plans (public, no auth)
    $routes->get('public/plans', 'Subscriptions::plans');
});

if (is_file(APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php')) {
    require APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php';
}
