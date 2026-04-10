# PrimoData Analytics — Integration Feasibility Analysis
## Into Existing RISE CRM Codebase (CodeIgniter 4 + MySQL)

---

## ✅ SHORT ANSWER: IT IS POSSIBLE

> The integration is **fully achievable** without changing the tech stack. Every PrimoData module can be built as new Controllers, Models, Views, and DB tables layered on top of the existing RISE codebase. Zero code in RISE needs to be deleted — only additions.

---

## 1. Tech Stack Compatibility Map

| PrimoData Requirement | RISE Already Has | Gap / What to Add |
|----------------------|-----------------|-------------------|
| User authentication | ✅ Full auth system (Signin/Signup/Roles) | Add `RESEARCHER` / `RESPONDENT` user types |
| Role-based access | ✅ Security_Controller RBAC | Extend roles for `respondent`, `researcher` |
| Subscription billing | ✅ Subscriptions + Stripe library | Add Razorpay library (INR billing) |
| Email sending | ✅ SMTP + Outlook mail system | New email templates for PrimoData events |
| File export (PDF) | ✅ TCPDF library | Reuse for research report PDFs |
| File export (XLS) | ✅ PHPSpreadsheet library | Reuse for raw data XLS export |
| File export (CSV) | ✅ General helper patterns | New CSV exporter function |
| File export (ZIP) | ✅ nelexa-php-zip library | Reuse for ZIP bundle export |
| Dashboard widgets | ✅ Widget system + Dashboard controller | New PrimoData-specific widgets |
| Notifications | ✅ Full notification engine | New notification events (survey launched, analysis ready) |
| Custom fields | ✅ Custom Fields engine | Use for survey question metadata |
| Cron jobs | ✅ Cron_job library | Add survey dispatch + quality scoring cron |
| Admin panel | ✅ Full Settings controller (1499 lines) | Add sections for respondent management, datasets |
| Plugin system | ✅ PHP-Hooks plugin architecture | PrimoData could be a plugin module |
| IMAP email piping | ✅ Imap library | Can receive survey responses via email if needed |
| Push notifications | ✅ Pusher library | Real-time response count updates |
| Labels/Tags | ✅ Labels system | Tag surveys by discipline, region |
| CMS Pages | ✅ Pages controller | Free stats portal pages |
| Multi-language | ✅ 12 languages built-in | Add Tamil (`ta`) language file |
| Google OAuth | ✅ Google API library | Reuse for researcher login |
| reCAPTCHA | ✅ recaptcha library | Protect respondent registration |

---

## 2. What Maps DIRECTLY to Existing RISE Modules

```
PrimoData Concept          →  RISE Equivalent (reuse/extend)
──────────────────────────────────────────────────────────────
Researcher account         →  Users (user_type = "researcher")
Respondent account         →  Users (user_type = "respondent") + new demographics table
Subscription plans         →  Subscriptions module (extend with plan limits)
Invoice history            →  Invoices module (reuse completely)
Payment (Stripe)           →  Stripe library (already in ThirdParty/)
Team management            →  Team module (Enterprise plan feature)
Email notifications        →  Email templates + notification engine
File exports (PDF/XLS/ZIP) →  TCPDF + PHPSpreadsheet + nelexa-php-zip
Admin dashboard            →  Settings + Dashboard (new sections)
Activity feed              →  Timeline controller
Custom data fields         →  Custom_fields engine
Public CMS pages (Stats)   →  Pages controller (CMS)
Cron background jobs       →  Cron_job library
Pusher real-time updates   →  Push notification library (already integrated)
```

---

## 3. New Modules to Build (CodeIgniter 4 Style)

All new code follows **existing RISE patterns**:
- New `app/Controllers/` files extending `Security_Controller`
- New `app/Models/` files extending `Crud_model`
- New `app/Views/` directories
- New DB tables via SQL migration scripts

### 🆕 MODULE 1: Survey Builder
```
Controller:  app/Controllers/Surveys.php
Model:       app/Models/Surveys_model.php
Model:       app/Models/Questions_model.php
Views:       app/Views/surveys/ (builder, list, settings, targeting, launch, responses)
DB Tables:   primo_surveys, primo_questions
```

### 🆕 MODULE 2: Respondent Panel
```
Controller:  app/Controllers/Respondents.php
Controller:  app/Controllers/Respondent_portal.php
Model:       app/Models/Respondents_model.php
Views:       app/Views/respondents/ (register, dashboard, take_survey)
DB Tables:   primo_respondents, primo_respondent_demographics
```

### 🆕 MODULE 3: Response Collection Engine
```
Controller:  app/Controllers/Survey_responses.php
Model:       app/Models/Responses_model.php
Model:       app/Models/Answers_model.php
Library:     app/Libraries/Quality_scorer.php  (quality gate logic)
DB Tables:   primo_responses, primo_answers
Cron:        Add survey_dispatch() to existing Cron_job library
```

### 🆕 MODULE 4: Statistical Analysis Engine
```
Library:     app/Libraries/Descriptive_stats.php  (mean, median, SD, skewness...)
Library:     app/Libraries/Inferential_stats.php  (t-test, ANOVA, chi-square)
Library:     app/Libraries/Correlation.php        (Pearson, Spearman)
Library:     app/Libraries/Regression.php         (linear, logistic)
Controller:  app/Controllers/Analysis.php
Model:       app/Models/Analysis_reports_model.php
DB Table:    primo_analysis_reports
```

> [!NOTE]
> PHP has excellent math libraries. Use **php-math** or port the statistics functions in pure PHP. No external AI dependency is mandatory for Phase 1 — you can add Claude/Anthropic API calls as an optional library later via a simple cURL wrapper (same pattern as the Stripe library already in RISE).

### 🆕 MODULE 5: Export Engine
```
Library:     app/Libraries/Report_exporter.php
  ↳ Uses existing TCPDF      → PDF reports
  ↳ Uses existing PHPSpreadsheet → XLS workbooks
  ↳ New CSV writer function
  ↳ Uses existing nelexa-php-zip → ZIP bundles
Controller:  app/Controllers/Exports.php (extends existing file patterns)
DB Table:    primo_exports
```

### 🆕 MODULE 6: Free Public Statistics Portal
```
Controller:  app/Controllers/Public_stats.php  (no auth required)
Model:       app/Models/Public_datasets_model.php
Views:       app/Views/public_stats/ (browse, detail, search)
DB Table:    primo_public_datasets
```
> Route accessible without login — use `App_Controller` (not `Security_Controller`) as base.

### 🆕 MODULE 7: Audience Targeting Engine
```
Model:       app/Models/Targeting_presets_model.php
Library:     app/Libraries/Panel_matcher.php (matches respondent demographics to researcher filters)
DB Table:    primo_targeting_presets
```

### 🆕 MODULE 8: API Key Manager (Enterprise)
```
Controller:  app/Controllers/Api_keys.php
Model:       app/Models/Api_keys_model.php
DB Table:    primo_api_keys
Middleware:  Add API Bearer token check to Security_Controller
```

### 🆕 MODULE 9: Plan Limits & Feature Gating
```
Library:     app/Libraries/Plan_limits.php
  ↳ Checks user's active subscription plan
  ↳ Enforces survey count, response count, feature access
  ↳ Plugs into Security_Controller::check_module_availability()
Config:      app/Config/PrimoData.php  (plan tier definitions)
```

---

## 4. Database — New Tables Required

All tables prefixed `primo_` to avoid clash with existing RISE tables.

```sql
-- Surveys
primo_surveys          (id, user_id, title, description, status, target_responses, collected_count, targeting JSON, language, starts_at, ends_at)
primo_questions        (id, survey_id, order, type, text, options JSON, logic JSON, validation JSON, required)
primo_targeting_presets(id, user_id, name, filters JSON)

-- Respondents
primo_respondents      (id, user_id, kyc_status, quality_score, total_surveys, rejected_count, demographics JSON, verified_at)
primo_respondent_otp   (id, respondent_id, otp_hash, expires_at)

-- Responses
primo_responses        (id, survey_id, respondent_id, status, quality_score, quality_flags JSON, completed_at, duration_secs, ip_hash, device_hash)
primo_answers          (id, response_id, question_id, value JSON)

-- Analysis
primo_analysis_reports (id, survey_id, status, results JSON, ai_narrative TEXT, created_at, completed_at)

-- Exports
primo_exports          (id, survey_id, report_id, format, file_path, file_url, status, created_at)

-- Public Stats Portal
primo_public_datasets  (id, title, category, region, description, data JSON, source, year, tags, featured, view_count)

-- API Keys
primo_api_keys         (id, user_id, name, key_hash, last_used_at, expires_at)

-- Usage Logs
primo_usage_logs       (id, user_id, action, metadata JSON, created_at)
```

---

## 5. What Needs a Version Upgrade (Minimal)

> [!IMPORTANT]
> These are the ONLY changes needed to the existing RISE stack — no new framework, no new database engine.

| Component | Current in RISE | Recommended Upgrade | Reason |
|-----------|----------------|---------------------|--------|
| PHP | 8.1+ required | **PHP 8.2 or 8.3** | Better enums, readonly properties useful for plan limits |
| PHPSpreadsheet | Already in ThirdParty | Confirm it's ≥ 1.29 | Needed for conditional formatting in XLS |
| CodeIgniter 4 | 4.x | **CI 4.5+** (if not already) | Better query builder for JSON column queries |
| MySQL | Any | **MySQL 8.0+** | JSON column indexing for targeting/results queries |

**No new framework. No Node.js. No PostgreSQL. No Redis needed for Phase 1.**

---

## 6. New Libraries to Add (Small Additions)

These are standalone PHP files/packages dropped into `app/ThirdParty/` or `app/Libraries/`:

| Library | Purpose | Size |
|---------|---------|------|
| `razorpay-php` | Razorpay payment gateway (INR billing) | Small |
| `anthropic-php` (or cURL wrapper) | Claude AI narrative generation | Tiny cURL wrapper |
| `php-simple-statistics` or custom | Statistical math (mean, SD, t-test) | Small custom class |
| MSG91 / Twilio PHP SDK | OTP SMS for respondent verification | Small |
| Simple chart SVG generator | Server-side chart generation for PDF reports | Can use existing TCPDF drawing |

---

## 7. Routing Plan

New routes added to existing `app/Config/Routes.php`:

```php
// PrimoData — Public (no auth)
$routes->get('stats', 'Public_stats::index');
$routes->get('stats/(:num)', 'Public_stats::view/$1');
$routes->get('stats/search', 'Public_stats::search');
$routes->get('respondent/register', 'Respondents::register');
$routes->post('respondent/verify_otp', 'Respondents::verify_otp');

// PrimoData — Researcher (auth required via Security_Controller)
$routes->get('surveys', 'Surveys::index');
$routes->get('surveys/new', 'Surveys::create');
$routes->get('surveys/(:num)/builder', 'Surveys::builder/$1');
$routes->get('surveys/(:num)/targeting', 'Surveys::targeting/$1');
$routes->get('surveys/(:num)/launch', 'Surveys::launch/$1');
$routes->get('surveys/(:num)/responses', 'Survey_responses::index/$1');
$routes->get('surveys/(:num)/analysis', 'Analysis::view/$1');
$routes->get('surveys/(:num)/export', 'Exports::index/$1');

// PrimoData — API (Bearer token)
$routes->group('api/v1', function($routes) {
    $routes->get('surveys', 'Api_surveys::index');
    $routes->post('surveys', 'Api_surveys::create');
    $routes->get('surveys/(:num)', 'Api_surveys::view/$1');
    $routes->get('surveys/(:num)/analysis', 'Api_surveys::analysis/$1');
    $routes->post('surveys/(:num)/export', 'Api_surveys::export/$1');
    $routes->get('datasets', 'Api_datasets::index');
});
```

---

## 8. What RISE Already Gives You FOR FREE

By building inside RISE, you inherit these immediately — **zero extra work**:

| Feature | How RISE Provides It |
|---------|---------------------|
| User registration + login | Signup/Signin controllers |
| Email verification | Verification_model + email helper |
| Google OAuth | Google API library already integrated |
| reCAPTCHA on forms | Already in ThirdParty + Settings |
| Subscription billing (Stripe) | Stripe library + Subscriptions controller |
| Invoice generation + PDF | Invoices controller + TCPDF |
| PDF export | TCPDF library |
| Excel export | PHPSpreadsheet |
| ZIP download | nelexa-php-zip |
| Email notifications | Notification engine + 10 email templates |
| Push notifications (real-time) | Pusher library + push_notification settings |
| CMS page builder | Pages controller |
| Admin panel | Settings controller (1499 lines) |
| Multi-language (Tamil via addition) | 12-language engine — just add `ta` file |
| File upload + storage | app_files_helper |
| Audit log | activity_logs_helper |
| CSRF protection | Built-in CI4 CSRF |
| Custom roles | Roles controller |
| Team management | Team controller (Enterprise feature) |
| Cron jobs | Cron_job library |
| IP restriction | Settings → ip_restriction |
| Webhook listener | Webhooks_listener controller |
| Plugin hooks | PHP-Hooks system |

---

## 9. What's NOT Possible Without External Service Dependency

These features from the PrimoData spec **require 3rd party API keys** (not a stack change):

| Feature | External Dependency | Integration Method |
|---------|--------------------|--------------------|
| Claude AI narrative | Anthropic API key | Simple cURL lib |
| Razorpay billing | Razorpay account | PHP SDK in ThirdParty |
| SMS OTP verification | MSG91 / Twilio | Simple cURL lib |
| Real-time response counter | Pusher (already in RISE) ✅ | Already done |
| Google OAuth | Google (already in RISE) ✅ | Already done |

---

## 10. Phased Build Plan

### ✅ Phase 1 — Foundation (2–3 weeks)
- [ ] Add `researcher` & `respondent` user types to existing Users model
- [ ] Add plan limits config (`app/Config/PrimoData.php`)
- [ ] Plan_limits library (feature gating)
- [ ] New DB tables (`primo_surveys`, `primo_questions`, etc.)
- [ ] Surveys controller + model (CRUD, list, create)
- [ ] Survey builder UI (drag-and-drop questions using existing drag lib or JS)
- [ ] Public_stats controller + model (free dataset portal)

### ✅ Phase 2 — Core Product (3–4 weeks)
- [ ] Respondents controller + model (register, KYC, OTP)
- [ ] Audience targeting engine (Panel_matcher library)
- [ ] Survey launch wizard (4-step form)
- [ ] Survey_responses controller + quality scoring pipeline
- [ ] Real-time response counter via Pusher (already integrated)
- [ ] Cron job for survey dispatch + auto-close

### ✅ Phase 3 — Analysis & Reports (3–4 weeks)
- [ ] Descriptive_stats library (pure PHP)
- [ ] Inferential_stats library (t-test, ANOVA, chi-square)
- [ ] Correlation + Regression libraries
- [ ] Analysis controller + dashboard view
- [ ] Chart rendering (server-side SVG for PDF, JS charts for UI)
- [ ] Claude AI narrative (cURL wrapper)
- [ ] Export engine (PDF/XLS/CSV/ZIP — all libraries already present)

### ✅ Phase 4 — Business Layer (2 weeks)
- [ ] Razorpay library + subscription integration (INR)
- [ ] Billing page (extend existing Subscriptions controller)
- [ ] Usage tracking + monthly limit enforcement
- [ ] New email templates (survey launched, analysis ready, export ready)
- [ ] API key manager (Enterprise tier)

### ✅ Phase 5 — Admin & Polish (2 weeks)
- [ ] Admin sections for respondent management
- [ ] Admin section for public datasets
- [ ] Revenue dashboard widgets
- [ ] Tamil language file (`app/Language/tamil/default_lang.php`)
- [ ] SEO: public_stats pages with meta tags, sitemap entries

---

## 11. Summary Verdict

| Question | Answer |
|----------|--------|
| Is it possible? | **YES — 100% possible** |
| Do we change tech stack? | **NO — CodeIgniter 4 + MySQL stays** |
| Do we break existing RISE features? | **NO — purely additive** |
| Do we need a new framework? | **NO** |
| Estimated total dev effort | **12–16 weeks** for full PrimoData feature set |
| Highest risk area | Statistical engine accuracy (pure PHP math) |
| Biggest reuse win | Export stack (TCPDF + PHPSpreadsheet + nelexa-php-zip all already there) |

> [!TIP]
> Start with **Phase 1** immediately. The Surveys + Public Stats modules are completely self-contained and have zero dependency on the analysis or respondent engines. You'll have a working survey creator + public data portal in under 3 weeks.
