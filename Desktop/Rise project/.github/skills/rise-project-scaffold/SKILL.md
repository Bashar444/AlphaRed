---
name: rise-project-scaffold
description: "Scaffold a new hybrid web analytics SaaS project on top of RISE CRM v3.5.2 (CodeIgniter 4 + MySQL). Use when: starting a new project from RISE base, removing purchase code, upgrading versions, mapping features to RISE modules, creating new controllers/models/views, planning phased builds. Triggers: new project, scaffold, RISE base, purchase code removal, version upgrade, PrimoData, module creation."
argument-hint: "What SaaS project do you want to scaffold on top of RISE?"
---

# RISE Project Scaffold

Build new hybrid web analytics SaaS applications on top of the RISE CRM v3.5.2 codebase (CodeIgniter 4 + MySQL). This skill guides you through every step from clean base preparation to production-ready deployment.

## When to Use

- Starting a new project using RISE CRM as the base
- Removing purchase code / license verification from RISE
- Upgrading PHP, CI4, MySQL, or library versions
- Mapping new SaaS features to existing RISE modules
- Creating new controllers, models, views, and DB tables
- Planning a phased build following the PrimoData prompt pattern

## Prerequisites

- RISE CRM v3.5.2 source code in `rise/` directory
- A project prompt file (e.g., `PrimoData_CursorAI_Prompt.md`) in root
- Git remote `origin` set to `https://github.com/Bashar444/AlphaRed.git`
- PHP 8.2+, MySQL 8.0+, Composer installed

---

## Step 1 — Root Analysis

Before making any changes, scan the RISE codebase to understand what you are working with.

### 1.1 Controller Hierarchy

```
CodeIgniter\Controller
  └── App_Controller          (base: loads models, settings, template, helpers)
        ├── Security_Controller   (auth + RBAC + permission checks)
        │     └── [83 feature controllers]
        ├── Signin / Signup       (public auth — no login required)
        ├── Cron                  (scheduled jobs — no auth)
        ├── Pay_invoice           (public invoice payment)
        ├── External_tickets      (embedded ticket form)
        ├── Collect_leads         (embedded lead form)
        ├── Webhooks_listener     (Bitbucket/GitHub/Stripe webhooks)
        └── Knowledge_base        (public/optional auth)
```

**Key files to read:**

- `rise/app/Controllers/App_Controller.php` — base constructor, model loading, helpers, template
- `rise/app/Controllers/Security_Controller.php` — `access_only_admin()`, `init_permission_checker()`, `check_module_availability()`

### 1.2 Model Layer

- **85 models** auto-loaded in `App_Controller.__construct()`
- All extend `Crud_model` (generic CRUD operations)
- Key models: `Users_model`, `Settings_model`, `Clients_model`, `Projects_model`, `Tasks_model`, `Invoices_model`, `Subscriptions_model`

### 1.3 Libraries

| Library | Purpose |
|---------|---------|
| `Template` | View rendering with layout wrapping |
| `Hooks` | Internal hook handlers |
| `Cron_job` | Recurring invoices, IMAP, Calendar sync |
| `Pdf` | PDF generation (via TCPDF) |
| `Excel_import` | Excel/CSV import trait |
| `Paypal` / `Paytm` / `Stripe` | Payment gateways |
| `Google` / `Google_calendar` | Google Drive + Calendar |
| `Imap` / `Outlook_imap` | Email integration |

### 1.4 ThirdParty Catalog

| Package | Purpose |
|---------|---------|
| `Stripe/` | Stripe PHP SDK |
| `Pusher/` | Real-time notifications |
| `tcpdf/` | PDF generation |
| `PHPOffice-PhpSpreadsheet/` | Excel import/export |
| `nelexa-php-zip/` | ZIP creation |
| `PHP-Hooks/` | WordPress-style hooks (add_action, add_filter, do_action, apply_filters) |
| `scssphp/` | SCSS compiler |
| `recaptcha/` | Google reCAPTCHA |

### 1.5 Frontend Stack

- jQuery 3.5.1, Bootstrap (CSS+JS)
- Chart.js, DataTables, Select2, Summernote (WYSIWYG)
- FullCalendar, Sortable (drag-and-drop), Dropzone (uploads)
- Feather Icons, Bootstrap date/time pickers
- Push notifications via service worker

### 1.6 Database Patterns

- **Soft delete**: Every table has `deleted` column (tinyint, default 0)
- **Audit fields**: `created_by`, `created_at` on most tables
- **EAV custom fields**: `custom_fields` → `custom_field_values` (via `related_to_type` + `related_to_id`)
- **Serialized data**: `serialize()` for `files`, `permissions`, `share_with`
- **Engine**: InnoDB, charset utf8/utf8_unicode_ci
- **Settings**: Key-value in `settings` table via `get_setting()` helper

### 1.7 Plugin System

- WordPress-style hooks via `ThirdParty/PHP-Hooks/`
- Global accessor: `app_hooks()` from `plugin_helper.php`
- Provides: `add_action()`, `add_filter()`, `do_action()`, `apply_filters()`
- Plugin directory: `rise/plugins/` — activated via `activated_plugins.json`
- Built-in hooks: `app_hook_before_app_access`, `app_hook_after_cron_run`, `app_filter_get_file_content`

---

## Step 2 — Purchase Code Full Removal

Remove ALL purchase code / license verification traces. This is a **complete deletion**, not a bypass.

### 2.1 Removal Checklist

| # | File | Lines | What to Remove |
|---|------|-------|----------------|
| 1 | `rise/install/do_install.php` | L19 | `$purchase_code = $_POST["purchase_code"]` — POST read |
| 2 | `rise/install/do_install.php` | L22 | Purchase code in non-empty field check |
| 3 | `rise/install/do_install.php` | L41-44 | `verify_rise_purchase_code()` call + error exit |
| 4 | `rise/install/do_install.php` | L91 | `str_replace('ITEM-PURCHASE-CODE', $purchase_code, $sql)` |
| 5 | `rise/install/do_install.php` | L142-170 | Entire `verify_rise_purchase_code()` function |
| 6 | `rise/install/view/index.php` | L384-386 | Purchase code label + input field |
| 7 | `rise/install/database.sql` | L1501 | `('item_purchase_code', 'ITEM-PURCHASE-CODE', 'app', 0)` seed row |
| 8 | `rise/app/Controllers/Settings.php` | L24 | `item_purchase_code` from saveable settings array |
| 9 | `rise/app/Controllers/Settings.php` | L39-40 | Masked-value preservation logic for purchase code |
| 10 | `rise/app/Views/settings/general.php` | L238-248 | Purchase code form field block |
| 11 | `rise/app/Views/settings/general.php` | L325 | `AppHelper.code = "..."` JS exposure |
| 12 | `rise/app/Controllers/Updates.php` | L80-82 | `_get_support_info()` — fairsketch.com API call |
| 13 | `rise/app/Controllers/Updates.php` | L94-96 | `_get_updates_info()` — fairsketch.com API call |
| 14 | `rise/app/Controllers/Updates.php` | L112 | `varification_failed` check |
| 15 | `rise/app/Controllers/Updates.php` | L172-176 | `download_updates()` fairsketch download |
| 16 | `rise/app/Config/Rise.php` | L13 | `app_update_url` pointing to `releases.fairsketch.com` |
| 17 | `rise/app/Controllers/Plugins.php` | L222-223 | Plugin purchase code passthrough + hook |
| 18 | `rise/app/Views/plugins/modal_form.php` | L10,13,39 | Envato purchase code fields + JS |
| 19 | `rise/app/Views/updates/index.php` | L72-73 | CodeCanyon renewal link |
| 20 | All `rise/app/Language/*/default_lang.php` | L246 | `item_purchase_code` translation key |
| 21 | `rise/app/Language/english/default_lang.php` | L266 | `varification_failed_message` key |

### 2.2 Post-Removal Verification

Run this grep to confirm zero remnants:

```bash
grep -r "purchase_code\|fairsketch\|codecanyon\|envato\|ITEM-PURCHASE-CODE\|varification_failed" rise/
```

Expected output: **no matches**.

### 2.3 Git Milestone

```bash
git add -A
git commit -m "[Phase 0] Remove purchase code — clean base"
git tag -a v0.1.0 -m "Phase 0 complete — clean base, purchase code removed"
git push origin main
git push origin --tags
```

---

## Step 3 — Version Upgrades

Upgrade components without changing the tech stack. No new frameworks, no new DB engines.

### 3.1 Upgrade Matrix

| Component | Current | Target | Reason |
|-----------|---------|--------|--------|
| PHP | 8.1+ | **8.3** | Enums, readonly properties, typed class constants |
| CodeIgniter 4 | 4.x | **4.5+** | JSON column query builder, improved routing |
| MySQL | 5.7+ | **8.0+** | JSON column indexing for targeting/results queries |
| PHPSpreadsheet | bundled | **≥ 1.29** | Conditional formatting for XLS exports |

### 3.2 Upgrade Steps

1. **PHP 8.3**: Update `composer.json` platform requirement, test for deprecation warnings
2. **CI4 4.5+**: Run `composer update codeigniter4/framework`, test routes and filters
3. **MySQL 8.0**: Verify JSON functions work (`JSON_EXTRACT`, `JSON_CONTAINS`), update any raw queries
4. **PHPSpreadsheet**: Run `composer update phpoffice/phpspreadsheet` in ThirdParty context

### 3.3 Git Milestone

After each upgrade:

```bash
git add -A
git commit -m "[Phase 0 - Upgrade] PHP 8.3 / CI4 4.5 / MySQL 8.0 compatibility"
git push origin main
```

---

## Step 4 — RISE Reuse Map

These existing RISE modules map directly to common SaaS features — **zero extra work**:

| SaaS Feature | RISE Module | How to Reuse |
|--------------|-------------|-------------|
| User auth (login/register) | `Signin` / `Signup` controllers | Extend with new user types |
| Role-based access | `Security_Controller` RBAC | Add new roles via `Roles` controller |
| Subscription billing (Stripe) | `Subscriptions` controller + `Stripe` lib | Extend plans, add Razorpay |
| Invoice generation + PDF | `Invoices` controller + `TCPDF` | Reuse for research report billing |
| Excel export | `PHPSpreadsheet` in ThirdParty | Reuse for raw data XLS export |
| ZIP download | `nelexa-php-zip` in ThirdParty | Reuse for bundle export |
| PDF export | `Pdf` library (TCPDF wrapper) | Reuse for analysis report PDFs |
| Email notifications | Notification engine + `Email_templates` | Add new event templates |
| Push notifications | `Pusher` library | Real-time response counters |
| CMS pages | `Pages` controller | Free stats portal pages |
| Cron jobs | `Cron_job` library | Survey dispatch, auto-close, quality scoring |
| Admin panel | `Settings` controller (1499 lines) | Add new admin sections |
| File upload/storage | `app_files_helper` | Survey attachments, exports |
| Audit trail | `activity_logs_helper` | Track survey events |
| Custom fields | `Custom_fields` engine (EAV) | Survey question metadata |
| Plugin hooks | `PHP-Hooks` system | Module extensibility |
| Multi-language | Language directory (12 langs) | Add Tamil (`ta`) file |
| Google OAuth | `Google` API library | Researcher login |
| reCAPTCHA | `recaptcha` library | Protect respondent registration |
| Team management | `Team` controller | Enterprise plan feature |
| Labels/tags | `Labels` system | Tag surveys by discipline, region |
| Webhooks | `Webhooks_listener` controller | Payment gateway callbacks |

---

## Step 5 — New Module Template

Every new module follows this exact pattern. Replace `{Module}` with your module name and `{prefix}` with your project table prefix.

### 5.1 Controller

```php
// app/Controllers/{Module}.php
<?php
namespace App\Controllers;

class {Module} extends Security_Controller {

    function __construct() {
        parent::__construct();
        $this->check_module_availability("module_{module}");
    }

    function index() {
        // list view
        $view_data["page_title"] = app_lang("{module}");
        return $this->template->rander("views/{module}/index", $view_data);
    }

    function save() {
        $this->validate_submitted_data(array(
            "id" => "numeric",
            "title" => "required",
        ));
        // save logic using $this->{Module}_model->ci_save()
    }
}
```

### 5.2 Model

```php
// app/Models/{Module}_model.php
<?php
namespace App\Models;

class {Module}_model extends Crud_model {

    protected $table = '{prefix}_{module}';

    function __construct() {
        $this->table = '{prefix}_{module}';
        parent::__construct($this->table);
    }
}
```

### 5.3 Views

```
app/Views/{module}/
  ├── index.php          # List view with DataTable
  ├── modal_form.php     # Create/edit modal
  ├── view.php           # Detail view
  └── settings.php       # Module settings (if needed)
```

### 5.4 Database Table

```sql
CREATE TABLE `{prefix}_{module}` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` enum('active','inactive','archived') DEFAULT 'active',
  `user_id` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
```

### 5.5 Routes

Add to `app/Config/Routes.php` (auto-routing handles most, but explicit routes for clarity):

```php
$routes->get('{module}', '{Module}::index');
$routes->post('{module}/save', '{Module}::save');
$routes->get('{module}/view/(:num)', '{Module}::view/$1');
```

### 5.6 Library (for business logic)

```php
// app/Libraries/{Module}_engine.php
<?php
namespace App\Libraries;

class {Module}_engine {
    // Domain-specific logic separated from controller
}
```

---

## Step 6 — Phased Build Template

Every project follows this 5-phase structure. Each phase ends with a git push to AlphaRed.

### Phase 1 — Foundation (2–3 weeks)

- [ ] Add new user types to existing Users model (e.g., `researcher`, `respondent`)
- [ ] Create plan limits config (`app/Config/{Project}.php`)
- [ ] Build `Plan_limits` library (feature gating via `check_module_availability()`)
- [ ] Create all new DB tables with `{prefix}_` namespace
- [ ] Build core CRUD controllers + models (main module)
- [ ] Build primary UI (builder/editor using existing JS: Sortable, Summernote)
- [ ] Build public portal controller (extends `App_Controller`, no auth)

**Git milestone:**

```bash
git commit -m "[Phase 1] Foundation — user types, DB tables, core CRUD, public portal"
git tag -a v0.2.0 -m "Phase 1 complete — foundation layer"
git push origin main; git push origin --tags
```

### Phase 2 — Core Product (3–4 weeks)

- [ ] Secondary entity management (e.g., respondents: register, KYC, OTP)
- [ ] Targeting/matching engine (`app/Libraries/Panel_matcher.php`)
- [ ] Launch/activation wizard (multi-step form)
- [ ] Data collection controller + quality scoring pipeline
- [ ] Real-time updates via Pusher (already integrated)
- [ ] Cron job for automated dispatch + auto-close

**Git milestone:**

```bash
git commit -m "[Phase 2] Core product — data collection, targeting, quality gates"
git tag -a v0.3.0 -m "Phase 2 complete — core product"
git push origin main; git push origin --tags
```

### Phase 3 — Analysis & Reports (3–4 weeks)

- [ ] `Descriptive_stats` library (pure PHP: mean, median, SD, skewness, kurtosis)
- [ ] `Inferential_stats` library (t-test, ANOVA, chi-square, Mann-Whitney U)
- [ ] `Correlation` library (Pearson, Spearman)
- [ ] `Regression` library (linear, logistic)
- [ ] Analysis controller + dashboard view (Chart.js for visualizations)
- [ ] AI narrative generation (Claude API via cURL wrapper library)
- [ ] Export engine: PDF (TCPDF), XLS (PHPSpreadsheet), CSV, ZIP (nelexa-php-zip)

**Git milestone:**

```bash
git commit -m "[Phase 3] Analysis and reports — statistics, AI narrative, export engine"
git tag -a v0.4.0 -m "Phase 3 complete — analysis and reports"
git push origin main; git push origin --tags
```

### Phase 4 — Business Layer (2 weeks)

- [ ] Razorpay library + subscription integration (INR billing)
- [ ] Extend existing Subscriptions controller for new plans
- [ ] Usage tracking + monthly limit enforcement via `Plan_limits` library
- [ ] New email templates (launched, analysis ready, export ready)
- [ ] API key management controller (Enterprise tier)
- [ ] Rate limiting middleware for API endpoints

**Git milestone:**

```bash
git commit -m "[Phase 4] Business layer — billing, usage limits, API keys, emails"
git tag -a v0.5.0 -m "Phase 4 complete — business layer"
git push origin main; git push origin --tags
```

### Phase 5 — Admin & Polish (2 weeks)

- [ ] Admin sections for entity management (respondents, datasets, revenue)
- [ ] Revenue dashboard widgets (MRR by tier, churn, conversions)
- [ ] Tamil language file (`app/Language/tamil/default_lang.php`)
- [ ] SEO: public pages with meta tags, sitemap entries
- [ ] Security audit: CSRF, input sanitization, XSS checks
- [ ] Performance audit: query optimization, cache where needed

**Git milestone:**

```bash
git commit -m "[Phase 5] Admin and polish — admin panels, i18n, SEO, security audit"
git tag -a v1.0.0 -m "Phase 5 complete — production ready"
git push origin main; git push origin --tags
```

---

## Step 7 — New Libraries to Add

Small standalone additions dropped into `app/ThirdParty/` or `app/Libraries/`:

| Library | Purpose | Integration |
|---------|---------|-------------|
| `razorpay-php` | Razorpay payment gateway (INR) | `app/ThirdParty/Razorpay/` |
| Anthropic cURL wrapper | Claude AI narrative generation | `app/Libraries/Claude_api.php` |
| Custom statistics classes | Mean, SD, t-test, ANOVA, chi-square | `app/Libraries/Descriptive_stats.php` etc. |
| MSG91 or Twilio SDK | OTP SMS for respondent verification | `app/Libraries/Sms_gateway.php` |

---

## Step 8 — Quality Checks

Before marking any phase complete, verify:

- [ ] **Zero purchase code remnants**: `grep -r "purchase_code\|fairsketch\|codecanyon" rise/` returns nothing
- [ ] **All new tables prefixed**: e.g., `primo_surveys`, `primo_questions` — no collision with RISE's ~60 core tables
- [ ] **Auth routes use Security_Controller**: Every protected route's controller extends `Security_Controller`
- [ ] **Public routes use App_Controller**: Free portal, webhook, and registration controllers extend `App_Controller`
- [ ] **Soft delete pattern**: Every new table has `deleted tinyint(1) NOT NULL DEFAULT '0'`
- [ ] **Non-destructive**: All existing RISE features still work — zero core files deleted
- [ ] **Routes registered**: New routes added to `app/Config/Routes.php`
- [ ] **Language keys added**: New UI strings in `app/Language/english/default_lang.php` (and `tamil/` if applicable)
- [ ] **Git pushed**: Phase commit + tag pushed to `https://github.com/Bashar444/AlphaRed.git`

---

## Reference Files

- `PrimoData_CursorAI_Prompt.md` — canonical project prompt structure (use as template for new projects)
- `primodata_feasibility.md` — example feasibility analysis output
- `rise/app/Controllers/App_Controller.php` — base controller to extend
- `rise/app/Controllers/Security_Controller.php` — auth/RBAC to extend
- `rise/system/BaseModel.php` + `rise/app/Models/Crud_model.php` — model patterns
- `rise/app/Config/Routes.php` — route registration
- `rise/app/Config/Rise.php` — app config
- `.github/instructions/version-push.instructions.md` — git push rules
