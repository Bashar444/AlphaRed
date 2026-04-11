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
    $routes->get('admin/dashboard/stats', 'Admin::stats');
    $routes->get('admin/dashboard/charts', 'Admin::charts');
    $routes->get('admin/dashboard/activity', 'Admin::activity');
    $routes->get('admin/respondents', 'Admin::respondents');
    $routes->post('admin/respondents/(:num)/suspend', 'Admin::suspend_respondent/$1');
    $routes->get('admin/datasets', 'Admin::datasets');
    $routes->post('admin/datasets/(:num)/publish', 'Admin::publish_dataset/$1');
    $routes->post('admin/datasets/(:num)/unpublish', 'Admin::unpublish_dataset/$1');
    $routes->get('admin/revenue', 'Admin::revenue');

    // Admin — Users Management
    $routes->get('admin/users', 'AdminUsers::index');
    $routes->get('admin/users/(:num)', 'AdminUsers::show/$1');
    $routes->post('admin/users/(:num)/suspend', 'AdminUsers::suspend/$1');
    $routes->post('admin/users/(:num)/activate', 'AdminUsers::activate/$1');

    // API Keys
    $routes->get('api-keys', 'ApiKeys::index');
    $routes->post('api-keys', 'ApiKeys::create');
    $routes->post('api-keys/(:num)/revoke', 'ApiKeys::revoke/$1');
    $routes->delete('api-keys/(:num)', 'ApiKeys::delete/$1');

    // Admin CMS
    $routes->get('admin/cms/menus', 'AdminCms::menus');
    $routes->post('admin/cms/menus', 'AdminCms::save_menus');
    $routes->get('admin/cms/pages', 'AdminCms::pages');
    $routes->post('admin/cms/pages', 'AdminCms::create_page');
    $routes->get('admin/cms/pages/(:num)', 'AdminCms::get_page/$1');
    $routes->put('admin/cms/pages/(:num)', 'AdminCms::update_page/$1');
    $routes->delete('admin/cms/pages/(:num)', 'AdminCms::delete_page/$1');
    $routes->get('admin/cms/pages/(:num)/sections', 'AdminCms::get_sections/$1');
    $routes->post('admin/cms/pages/(:num)/sections', 'AdminCms::save_sections/$1');
    $routes->get('admin/cms/footer', 'AdminCms::get_footer');
    $routes->post('admin/cms/footer', 'AdminCms::save_footer');

    // Public (no auth)
    $routes->get('public/datasets', 'PublicApi::datasets');
    $routes->get('public/datasets/categories', 'PublicApi::categories');
    $routes->get('public/datasets/(:num)', 'PublicApi::dataset/$1');
    $routes->get('public/surveys/(:num)', 'PublicApi::survey/$1');
    $routes->post('public/surveys/(:num)/submit', 'PublicApi::submit_survey/$1');

    // Public CMS (no auth)
    $routes->get('public/cms/menus', 'PublicApi::cms_menus');
    $routes->get('public/cms/footer', 'PublicApi::cms_footer');
    $routes->get('public/cms/pages/(:segment)', 'PublicApi::cms_page/$1');

    // Plans (public, no auth)
    $routes->get('public/plans', 'Subscriptions::plans');

    // ── RISE CRM API Layer (Phase G) ─────────────────────────────────

    // Projects
    $routes->get('projects', 'ApiProjects::index');
    $routes->get('projects/(:num)', 'ApiProjects::show/$1');
    $routes->post('projects', 'ApiProjects::create');
    $routes->put('projects/(:num)', 'ApiProjects::update/$1');
    $routes->delete('projects/(:num)', 'ApiProjects::delete/$1');
    $routes->get('projects/(:num)/members', 'ApiProjects::members/$1');
    $routes->get('projects/(:num)/milestones', 'ApiProjects::milestones/$1');

    // Tasks
    $routes->get('tasks', 'ApiTasks::index');
    $routes->get('tasks/statuses', 'ApiTasks::statuses');
    $routes->get('tasks/(:num)', 'ApiTasks::show/$1');
    $routes->post('tasks', 'ApiTasks::create');
    $routes->put('tasks/(:num)', 'ApiTasks::update/$1');
    $routes->delete('tasks/(:num)', 'ApiTasks::delete/$1');
    $routes->post('tasks/(:num)/status', 'ApiTasks::change_status/$1');

    // Invoices
    $routes->get('invoices', 'ApiInvoices::index');
    $routes->get('invoices/(:num)', 'ApiInvoices::show/$1');
    $routes->post('invoices', 'ApiInvoices::create');
    $routes->put('invoices/(:num)', 'ApiInvoices::update/$1');
    $routes->delete('invoices/(:num)', 'ApiInvoices::delete/$1');
    $routes->get('invoices/(:num)/payments', 'ApiInvoices::payments/$1');
    $routes->post('invoices/(:num)/payments', 'ApiInvoices::add_payment/$1');

    // Clients
    $routes->get('clients', 'ApiClients::index');
    $routes->get('clients/groups', 'ApiClients::groups');
    $routes->get('clients/(:num)', 'ApiClients::show/$1');
    $routes->post('clients', 'ApiClients::create');
    $routes->put('clients/(:num)', 'ApiClients::update/$1');
    $routes->delete('clients/(:num)', 'ApiClients::delete/$1');
    $routes->get('clients/(:num)/contacts', 'ApiClients::contacts/$1');

    // Leads
    $routes->get('leads', 'ApiLeads::index');
    $routes->get('leads/statuses', 'ApiLeads::statuses');
    $routes->get('leads/sources', 'ApiLeads::sources');
    $routes->get('leads/(:num)', 'ApiLeads::show/$1');
    $routes->post('leads', 'ApiLeads::create');
    $routes->put('leads/(:num)', 'ApiLeads::update/$1');
    $routes->delete('leads/(:num)', 'ApiLeads::delete/$1');

    // Expenses
    $routes->get('expenses', 'ApiExpenses::index');
    $routes->get('expenses/categories', 'ApiExpenses::categories');
    $routes->get('expenses/(:num)', 'ApiExpenses::show/$1');
    $routes->post('expenses', 'ApiExpenses::create');
    $routes->put('expenses/(:num)', 'ApiExpenses::update/$1');
    $routes->delete('expenses/(:num)', 'ApiExpenses::delete/$1');

    // Tickets
    $routes->get('tickets', 'ApiTickets::index');
    $routes->get('tickets/types', 'ApiTickets::types');
    $routes->get('tickets/(:num)', 'ApiTickets::show/$1');
    $routes->post('tickets', 'ApiTickets::create');
    $routes->put('tickets/(:num)', 'ApiTickets::update/$1');
    $routes->delete('tickets/(:num)', 'ApiTickets::delete/$1');
    $routes->get('tickets/(:num)/comments', 'ApiTickets::comments/$1');
    $routes->post('tickets/(:num)/comments', 'ApiTickets::add_comment/$1');

    // Events
    $routes->get('events', 'ApiEvents::index');
    $routes->get('events/(:num)', 'ApiEvents::show/$1');
    $routes->post('events', 'ApiEvents::create');
    $routes->put('events/(:num)', 'ApiEvents::update/$1');
    $routes->delete('events/(:num)', 'ApiEvents::delete/$1');

    // Team
    $routes->get('team', 'ApiTeam::index');
    $routes->get('team/(:num)', 'ApiTeam::show/$1');
    $routes->post('team', 'ApiTeam::create');
    $routes->put('team/(:num)', 'ApiTeam::update/$1');
    $routes->delete('team/(:num)', 'ApiTeam::delete/$1');

    // Timesheets
    $routes->get('timesheets', 'ApiTimesheets::index');
    $routes->get('timesheets/(:num)', 'ApiTimesheets::show/$1');
    $routes->post('timesheets', 'ApiTimesheets::create');
    $routes->put('timesheets/(:num)', 'ApiTimesheets::update/$1');
    $routes->delete('timesheets/(:num)', 'ApiTimesheets::delete/$1');

    // Attendance
    $routes->get('attendance', 'ApiAttendance::index');
    $routes->get('attendance/status', 'ApiAttendance::status');
    $routes->post('attendance/clock-in', 'ApiAttendance::clock_in');
    $routes->post('attendance/clock-out', 'ApiAttendance::clock_out');

    // Leaves
    $routes->get('leaves', 'ApiLeaves::index');
    $routes->get('leaves/types', 'ApiLeaves::types');
    $routes->get('leaves/(:num)', 'ApiLeaves::show/$1');
    $routes->post('leaves', 'ApiLeaves::create');
    $routes->post('leaves/(:num)/approve', 'ApiLeaves::approve/$1');
    $routes->post('leaves/(:num)/reject', 'ApiLeaves::reject/$1');

    // Estimates
    $routes->get('estimates', 'ApiEstimates::index');
    $routes->get('estimates/(:num)', 'ApiEstimates::show/$1');
    $routes->post('estimates', 'ApiEstimates::create');
    $routes->put('estimates/(:num)', 'ApiEstimates::update/$1');
    $routes->delete('estimates/(:num)', 'ApiEstimates::delete/$1');

    // Contracts
    $routes->get('contracts', 'ApiContracts::index');
    $routes->get('contracts/(:num)', 'ApiContracts::show/$1');
    $routes->post('contracts', 'ApiContracts::create');
    $routes->put('contracts/(:num)', 'ApiContracts::update/$1');
    $routes->delete('contracts/(:num)', 'ApiContracts::delete/$1');

    // Proposals
    $routes->get('proposals', 'ApiProposals::index');
    $routes->get('proposals/(:num)', 'ApiProposals::show/$1');
    $routes->post('proposals', 'ApiProposals::create');
    $routes->put('proposals/(:num)', 'ApiProposals::update/$1');
    $routes->delete('proposals/(:num)', 'ApiProposals::delete/$1');

    // Orders
    $routes->get('orders', 'ApiOrders::index');
    $routes->get('orders/statuses', 'ApiOrders::statuses');
    $routes->get('orders/(:num)', 'ApiOrders::show/$1');
    $routes->post('orders', 'ApiOrders::create');
    $routes->put('orders/(:num)', 'ApiOrders::update/$1');
    $routes->delete('orders/(:num)', 'ApiOrders::delete/$1');

    // Messages
    $routes->get('messages', 'ApiMessages::index');
    $routes->get('messages/(:num)', 'ApiMessages::show/$1');
    $routes->post('messages', 'ApiMessages::create');
    $routes->delete('messages/(:num)', 'ApiMessages::delete/$1');

    // Announcements
    $routes->get('announcements', 'ApiAnnouncements::index');
    $routes->get('announcements/(:num)', 'ApiAnnouncements::show/$1');
    $routes->post('announcements', 'ApiAnnouncements::create');
    $routes->put('announcements/(:num)', 'ApiAnnouncements::update/$1');
    $routes->delete('announcements/(:num)', 'ApiAnnouncements::delete/$1');

    // Notes
    $routes->get('notes', 'ApiNotes::index');
    $routes->get('notes/(:num)', 'ApiNotes::show/$1');
    $routes->post('notes', 'ApiNotes::create');
    $routes->put('notes/(:num)', 'ApiNotes::update/$1');
    $routes->delete('notes/(:num)', 'ApiNotes::delete/$1');

    // Todo
    $routes->get('todo', 'ApiTodo::index');
    $routes->post('todo', 'ApiTodo::create');
    $routes->put('todo/(:num)', 'ApiTodo::update/$1');
    $routes->post('todo/(:num)/toggle', 'ApiTodo::toggle/$1');
    $routes->delete('todo/(:num)', 'ApiTodo::delete/$1');

    // Reports (admin)
    $routes->get('reports/overview', 'ApiReports::overview');
    $routes->get('reports/revenue', 'ApiReports::revenue');
    $routes->get('reports/project-status', 'ApiReports::project_status');
    $routes->get('reports/task-summary', 'ApiReports::task_summary');

    // Settings (admin)
    $routes->get('settings', 'ApiSettings::index');
    $routes->get('settings/(:segment)', 'ApiSettings::show/$1');
    $routes->put('settings/(:segment)', 'ApiSettings::update/$1');
    $routes->put('settings', 'ApiSettings::batch_update');

    // Roles (admin)
    $routes->get('roles', 'ApiRoles::index');
    $routes->get('roles/(:num)', 'ApiRoles::show/$1');
    $routes->post('roles', 'ApiRoles::create');
    $routes->put('roles/(:num)', 'ApiRoles::update/$1');
    $routes->delete('roles/(:num)', 'ApiRoles::delete/$1');
});

if (is_file(APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php')) {
    require APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php';
}
