# PrimoData Unified Admin — Comprehensive Build Prompt

## For: Claude Opus 4.6 (Agent Mode)

---

## 1. PROJECT CONTEXT

PrimoData Analytics is a hybrid SaaS platform built on top of **RISE CRM v3.5.2** (CodeIgniter 4 + MySQL). It currently has **two separate admin panels**:

### Panel A — RISE PHP Admin (Server-Rendered)

- **URL**: `https://dplanthasa.com/`
- **Stack**: CodeIgniter 4.3.6, PHP 8.1, jQuery, Bootstrap, Chart.js, DataTables
- **Features**: 97 PHP controllers covering 30+ CRM modules — Projects, Tasks, Invoices, Payments, Expenses, Tickets, Events, Timesheets, Attendance, Leaves, Team Members, Clients, Leads, Estimates, Messages, Announcements, Reports, Notes, Todo, Custom Fields, Labels, Contracts, Proposals, Orders, Knowledge Base, Settings, Roles, Custom Dashboards (drag-drop widgets), Left Menu Customization, Pages (CMS)
- **Dashboard**: 40+ widget types — clock in/out, attendance stats, invoice summaries, expense tracking, ticket status, project timelines, task kanban, timesheet stats, team members overview, leads overview, events, announcements, sticky notes, to-do lists, custom widgets

### Panel B — Next.js Vercel Admin (SPA)

- **URL**: `https://alpha-red-nine.vercel.app/dashboard`
- **Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui components
- **Features**: 11 pages — Dashboard (stat cards), Surveys (CRUD + builder + 9 question types + targeting + launch), Analysis (AI narrative via Claude + descriptive stats + correlations), Exports (CSV/XLS/PDF/ZIP), Subscription (Razorpay), Admin panel (respondents management, datasets publish/unpublish, revenue overview)
- **Dashboard**: 4 stat cards (Total Surveys, Active Surveys, Total Responses, Avg Quality) + Recent Surveys list

### The Goal

**Merge both panels into ONE unified Next.js 14 frontend** that replaces the RISE PHP UI entirely. The unified admin must:

1. Include ALL RISE CRM modules (Projects, Tasks, Invoices, Expenses, Tickets, Events, etc.)
2. Include ALL PrimoData features (Surveys, Analysis, Exports, Subscriptions, Admin)
3. Add a **dynamic dashboard** with statistical visual charts
4. Add a **unified users/clients overview** (researchers, respondents, staff — with subscription status)
5. Add a **CMS capability** (header menu editor, footer editor, page editor with sections)
6. Communicate exclusively with the CodeIgniter 4 REST API backend via JSON

---

## 2. TECH STACK (Actual Implementation)

### Frontend (Vercel)

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui components |
| Charts | Recharts (primary) + Chart.js via react-chartjs-2 (widget compat) |
| Icons | Lucide React |
| State | React hooks + Context API (AuthContext) |
| API Client | Custom `fetch` wrapper in `src/lib/api.ts` |
| Drag & Drop | @dnd-kit/core (for CMS section editor, menu editor) |
| Rich Text | TipTap or react-quill (for CMS page content editing) |
| Hosting | Vercel (auto-deploy from GitHub `Bashar444/AlphaRed`) |

### Backend (Hostinger)

| Component | Technology |
|-----------|-----------|
| Framework | CodeIgniter 4.3.6 |
| PHP | 8.1+ |
| Database | MySQL (`u128150905_testing`), table prefix `hdr_` |
| Auth | JWT (custom `Jwt_helper` library) |
| Payments | Razorpay (INR) |
| PDF | TCPDF |
| Excel | PHPSpreadsheet |
| AI | Claude API (narrative generation) |
| CORS | Route-level OPTIONS handler + filter |
| Hosting | Hostinger shared hosting at `https://dplanthasa.com/` |

### API Communication Pattern

All frontend pages call `${NEXT_PUBLIC_API_URL}${path}` where:

- `NEXT_PUBLIC_API_URL` = `https://dplanthasa.com/index.php/api/v1`
- JWT token stored in `localStorage` as `primo_token`
- Request headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Response envelope: `{ success: boolean, message: string, data: T }`

---

## 3. EXISTING API ENDPOINTS (42 Routes — All Working)

```
# Auth (no JWT)
POST   /auth/login                              → Auth::login
POST   /auth/register                           → Auth::register
GET    /auth/me                                 → Auth::me

# Surveys CRUD (JWT required)
GET    /surveys                                 → Surveys::index
GET    /surveys/:id                             → Surveys::show
POST   /surveys                                 → Surveys::create
PUT    /surveys/:id                             → Surveys::update
DELETE /surveys/:id                             → Surveys::delete

# Survey Questions
GET    /surveys/:id/questions                   → Surveys::questions
POST   /surveys/:id/questions                   → Surveys::add_question
PUT    /surveys/:sid/questions/:qid             → Surveys::update_question
DELETE /surveys/:sid/questions/:qid             → Surveys::delete_question

# Targeting + Launch
GET    /surveys/:id/targeting                   → Surveys::targeting
PUT    /surveys/:id/targeting                   → Surveys::save_targeting
POST   /surveys/:id/launch                      → Surveys::launch

# Responses
GET    /surveys/:id/responses                   → Responses::index
GET    /surveys/:id/responses/quality           → Responses::quality
POST   /surveys/:id/responses/score-all         → Responses::score_all
GET    /responses/:id                           → Responses::show

# Analysis
GET    /surveys/:id/analysis                    → Analysis::show
POST   /surveys/:id/analysis/run               → Analysis::run
GET    /surveys/:sid/analysis/chart/:qid        → Analysis::chart

# Exports
GET    /surveys/:id/exports                     → Exports::index
POST   /surveys/:id/exports/:format             → Exports::generate

# Subscriptions
GET    /subscriptions/plans                     → Subscriptions::plans
GET    /subscriptions/current                   → Subscriptions::current
POST   /subscriptions/checkout                  → Subscriptions::checkout
POST   /subscriptions/verify                    → Subscriptions::verify
POST   /subscriptions/cancel                    → Subscriptions::cancel

# Admin (JWT + is_admin check)
GET    /admin/dashboard                         → Admin::dashboard
GET    /admin/respondents                       → Admin::respondents
POST   /admin/respondents/:id/suspend           → Admin::suspend_respondent
GET    /admin/datasets                          → Admin::datasets
POST   /admin/datasets/:id/publish              → Admin::publish_dataset
POST   /admin/datasets/:id/unpublish            → Admin::unpublish_dataset
GET    /admin/revenue                           → Admin::revenue

# Public (no auth)
GET    /public/datasets                         → PublicApi::datasets
GET    /public/datasets/categories              → PublicApi::categories
GET    /public/datasets/:id                     → PublicApi::dataset
GET    /public/surveys/:id                      → PublicApi::survey
POST   /public/surveys/:id/submit               → PublicApi::submit_survey
GET    /public/plans                            → Subscriptions::plans
```

---

## 4. FEATURE MERGE MAP

### 4.1 PrimoData Features (Existing in Vercel — Keep & Enhance)

| Feature | Current Status | Enhancement Needed |
|---------|---------------|-------------------|
| Dashboard | 4 stat cards + recent surveys | Add charts (Recharts + Chart.js), activity feed, more widgets |
| Surveys CRUD | Working (list, create, edit, delete) | No changes |
| Survey Builder | 9 question types with add/edit/delete | No changes |
| Survey Targeting | Demographics + location filters | No changes |
| Survey Launch | Launch to respondent panel | No changes |
| Analysis | AI narrative + descriptive stats + correlations | No changes |
| Exports | CSV/XLS/PDF/ZIP generation | No changes |
| API Keys | Sidebar link exists but NO page | **Create page** |
| Subscription | Plan display + Razorpay checkout | No changes |
| Admin Overview | Stat cards + tabs (respondents, datasets) | **Split into full pages** |
| Admin Respondents | Table with suspend action | **Move to dedicated page** |
| Admin Datasets | Publish/unpublish table | **Move to dedicated page** |
| Admin Revenue | Monthly revenue display | **Move to dedicated page** |

### 4.2 RISE CRM Features (Need New Next.js Pages + API Endpoints)

| RISE Module | Controller | DB Tables (already exist) | Priority |
|-------------|-----------|--------------------------|----------|
| Projects | `Projects.php` | `hdr_projects`, `hdr_project_members`, `hdr_milestones` | HIGH |
| Tasks | `Tasks.php` | `hdr_tasks`, `hdr_task_status` | HIGH |
| Invoices | `Invoices.php` | `hdr_invoices`, `hdr_invoice_items`, `hdr_invoice_payments` | HIGH |
| Clients | `Clients.php` | `hdr_users` (user_type=client), `hdr_client_groups` | HIGH |
| Leads | `Leads.php` | `hdr_leads`, `hdr_lead_status`, `hdr_lead_source` | HIGH |
| Expenses | `Expenses.php` | `hdr_expenses`, `hdr_expense_categories` | MEDIUM |
| Tickets | `Tickets.php` | `hdr_tickets`, `hdr_ticket_types`, `hdr_ticket_comments` | MEDIUM |
| Events | `Events.php` | `hdr_events` | MEDIUM |
| Team Members | `Team_members.php` | `hdr_users` (user_type=staff) | MEDIUM |
| Timesheets | `Timesheets.php` (in Team controller) | `hdr_timesheets` | MEDIUM |
| Attendance | `Attendance.php` | `hdr_attendance` | MEDIUM |
| Leaves | `Leaves.php` | `hdr_leave_applications`, `hdr_leave_types` | MEDIUM |
| Estimates | `Estimates.php` | `hdr_estimates`, `hdr_estimate_items` | LOW |
| Contracts | `Contracts.php` | `hdr_contracts`, `hdr_contract_items` | LOW |
| Proposals | `Proposals.php` | `hdr_proposals`, `hdr_proposal_items` | LOW |
| Orders | `Orders.php` | `hdr_orders`, `hdr_order_items`, `hdr_order_status` | LOW |
| Messages | `Messages.php` | `hdr_messages` | LOW |
| Announcements | `Announcements.php` | `hdr_announcements` | LOW |
| Notes | `Notes.php` | `hdr_notes` | LOW |
| Todo | `Todo.php` | `hdr_todo` | LOW |
| Reports | `Reports.php` | Aggregation queries on existing tables | LOW |
| Custom Fields | `Custom_fields.php` | `hdr_custom_fields`, `hdr_custom_field_values` | LOW |
| Labels | `Labels.php` | `hdr_labels` | LOW |
| Knowledge Base | `Knowledge_base.php` | `hdr_knowledge_base` (if exists) | LOW |
| Roles & Permissions | `Roles.php` | `hdr_roles` | LOW |
| Settings | `Settings.php` | `hdr_settings` | LOW |

### 4.3 NEW Features (Build from Scratch)

| Feature | Description |
|---------|------------|
| Dynamic Dashboard | Recharts + Chart.js widgets, activity feed, customizable layout |
| Unified Users Overview | Combined table: researchers + respondents + staff + clients |
| CMS: Header Menu | Admin creates/edits/reorders header navigation items |
| CMS: Footer | Admin manages footer columns, links, social icons, copyright |
| CMS: Pages | CRUD for content pages with slug, SEO meta, rich text |
| CMS: Page Sections | Ordered typed blocks per page (hero, text, features, CTA, FAQ, gallery) |

---

## 5. DYNAMIC DASHBOARD SPECIFICATION

### 5.1 Layout

```
┌────────────────────────────────────────────────────────────┐
│  Welcome back, {first_name}                                │
│  Here's an overview of your platform analytics             │
├────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Total    │ │ Active   │ │ Total    │ │ Avg      │      │
│  │ Surveys  │ │ Surveys  │ │Responses │ │ Quality  │      │
│  │   12     │ │    3     │ │   847    │ │  92.4%   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Total    │ │ Active   │ │ Monthly  │ │ Team     │      │
│  │ Revenue  │ │ Subs     │ │ Revenue  │ │ Members  │      │
│  │ ₹47,500  │ │   28     │ │ ₹12,300  │ │   8      │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
├──────────────────────────┬─────────────────────────────────┤
│  Responses Over Time     │  Revenue by Plan Tier           │
│  ┌───────────────────┐   │  ┌──────────────────────┐      │
│  │  📈 Line Chart    │   │  │  🍕 Pie Chart        │      │
│  │  (last 30 days)   │   │  │  Basic / Adv / Ent   │      │
│  └───────────────────┘   │  └──────────────────────┘      │
├──────────────────────────┼─────────────────────────────────┤
│  Response Quality Dist.  │  Recent Activity                │
│  ┌───────────────────┐   │  ┌──────────────────────┐      │
│  │  📊 Bar Chart     │   │  │  • Survey "X" created│      │
│  │  (quality ranges) │   │  │  • 23 responses rcvd │      │
│  └───────────────────┘   │  │  • Export generated   │      │
│                          │  └──────────────────────┘      │
└──────────────────────────┴─────────────────────────────────┘
```

### 5.2 Stat Cards (Top Row — All Users)

| Card | API Source | Calculation |
|------|-----------|-------------|
| Total Surveys | `GET /surveys` | `surveys.length` |
| Active Surveys | `GET /surveys` | `surveys.filter(s => s.status === 'live').length` |
| Total Responses | `GET /surveys` | `sum(survey.response_count)` |
| Avg Quality | `GET /admin/dashboard` | `avg quality score` |

### 5.3 Stat Cards (Bottom Row — Admin Only)

| Card | API Source | Calculation |
|------|-----------|-------------|
| Total Revenue | `GET /admin/dashboard` | `data.total_revenue` |
| Active Subscriptions | `GET /admin/dashboard` | `data.active_subscriptions` |
| Monthly Revenue | `GET /admin/revenue` | Latest month's total |
| Team Members | **NEW** `GET /admin/dashboard/stats` | Count of staff users |

### 5.4 Chart Widgets

| Chart | Type | Library | Data Source |
|-------|------|---------|-------------|
| Responses Over Time | Line chart | Recharts `<LineChart>` | **NEW** `GET /admin/dashboard/charts?type=responses_timeline` |
| Revenue by Plan Tier | Pie chart | Recharts `<PieChart>` | `GET /admin/dashboard` → `mrr_by_tier` |
| Quality Distribution | Bar chart | Chart.js `<Bar>` | **NEW** `GET /admin/dashboard/charts?type=quality_distribution` |
| Survey Status Breakdown | Doughnut | Chart.js `<Doughnut>` | Computed from `GET /surveys` status field |
| Expenses by Category | Bar chart | Chart.js `<Bar>` | **NEW** `GET /admin/dashboard/charts?type=expenses_by_category` |
| Task Status Overview | Stacked bar | Recharts `<BarChart>` | **NEW** `GET /admin/dashboard/charts?type=task_status` |

### 5.5 Activity Feed

A chronological list of recent platform events:

```typescript
interface ActivityItem {
    id: number;
    type: 'survey_created' | 'response_received' | 'export_generated' |
          'user_registered' | 'subscription_started' | 'invoice_paid' |
          'task_completed' | 'ticket_resolved';
    description: string;
    user_name: string;
    created_at: string;
}
```

**NEW** API endpoint: `GET /admin/dashboard/activity` → returns last 20 events.

---

## 6. UNIFIED USERS/CLIENTS OVERVIEW

### 6.1 Page Layout

Located at `/dashboard/admin/users`.

```
┌────────────────────────────────────────────────────────────┐
│  Users & Clients Overview                                  │
├──────────┬──────────┬──────────┬──────────┬───────────────┤
│ Total    │ Active   │ Active   │ Subscribed│ Overdue      │
│ Users    │ Research.│ Respond. │          │              │
│   156    │   42     │   89     │   32     │   5          │
├──────────┴──────────┴──────────┴──────────┴───────────────┤
│  [All] [Researchers] [Respondents] [Staff] [Clients]      │
│  [Subscribed] [Unsubscribed] [Overdue] [Suspended]        │
├────────────────────────────────────────────────────────────┤
│  Search: [_______________]   Sort: [Name ▼]               │
├────┬──────────┬───────────────┬──────┬────────┬──────┬────┤
│ #  │ Name     │ Email         │ Type │Sub Stat│Joined│Act │
├────┼──────────┼───────────────┼──────┼────────┼──────┼────┤
│ 1  │ John Doe │ john@mail.com │ Res. │Active  │01/24 │ ⋮  │
│ 2  │ Jane S.  │ jane@mail.com │ Resp.│None    │02/24 │ ⋮  │
│ 3  │ Admin    │ admin@co.com  │ Staff│—       │01/23 │ ⋮  │
└────┴──────────┴───────────────┴──────┴────────┴──────┴────┘
```

### 6.2 Columns

| Column | Source | Notes |
|--------|--------|-------|
| Name | `first_name + last_name` | Link to user detail |
| Email | `email` | — |
| Type | `user_type` | researcher, respondent, staff, client |
| Subscription Status | Join with `primo_subscriptions` | active, expired, overdue, cancelled, none |
| Joined | `created_at` | Formatted date |
| Last Active | `last_online` or `updated_at` | Relative time |
| Actions | — | Suspend, Activate, View, Send Notification |

### 6.3 API Endpoint

**NEW**: `GET /api/v1/admin/users`

```
Query params:
  ?type=researcher|respondent|staff|client
  &subscription=active|expired|overdue|cancelled|none
  &status=active|suspended
  &search=<name or email>
  &page=1&per_page=25
  &sort=name|email|created_at|last_active
  &order=asc|desc

Response:
{
  "success": true,
  "data": {
    "users": [ ... ],
    "pagination": { "total": 156, "page": 1, "per_page": 25, "pages": 7 },
    "summary": {
      "total": 156,
      "researchers": 42,
      "respondents": 89,
      "staff": 15,
      "clients": 10,
      "subscribed": 32,
      "unsubscribed": 119,
      "overdue": 5,
      "suspended": 3
    }
  }
}
```

**NEW**: `POST /api/v1/admin/users/:id/suspend`
**NEW**: `POST /api/v1/admin/users/:id/activate`

---

## 7. SURVEY MICROSERVICES — FULL LIFECYCLE

The survey lifecycle is already built end-to-end. Here is the complete flow for reference:

```
┌─────────┐    ┌──────────┐    ┌───────────┐    ┌────────┐
│ CREATE   │───>│  BUILD   │───>│  TARGET   │───>│ LAUNCH │
│ Survey   │    │ Questions│    │ Audience  │    │ to     │
│          │    │ (9 types)│    │ (demog +  │    │ Panel  │
│ POST     │    │ POST/PUT │    │  location)│    │ POST   │
│ /surveys │    │ /questions│   │ PUT       │    │ /launch│
└─────────┘    └──────────┘    │ /targeting │    └────┬───┘
                                └───────────┘         │
                                                      ▼
┌─────────┐    ┌──────────┐    ┌───────────┐    ┌────────┐
│ EXPORT   │<──│ ANALYZE  │<──│  SCORE    │<──│COLLECT │
│ Reports  │    │ Stats +  │    │ Quality   │    │Responses│
│ CSV/XLS/ │    │ AI Narr. │    │ per resp. │    │ via    │
│ PDF/ZIP  │    │ POST     │    │ POST      │    │ Public │
│ POST     │    │ /analysis│    │ /score-all│    │ API    │
│ /exports │    │  /run    │    └───────────┘    │ POST   │
└─────────┘    └──────────┘                      │ /submit│
                                                  └────────┘
```

### Question Types Supported

1. `text` — Short text input
2. `textarea` — Long text input
3. `single_choice` — Radio buttons
4. `multiple_choice` — Checkboxes
5. `dropdown` — Select dropdown
6. `rating` — 1-5 star rating
7. `scale` — Likert scale (1-10)
8. `number` — Numeric input
9. `date` — Date picker

### Quality Scoring

Each response is scored automatically on:

- Duration (too fast = suspicious)
- Completeness (% of required questions answered)
- Pattern detection (straight-lining, random clicking)
- IP/device deduplication via SHA-256 hash

---

## 8. CMS FEATURE SPECIFICATION (NEW)

### 8.1 Header Menu Manager

**Admin page**: `/dashboard/admin/cms/menus`

Admin can create and manage the site header navigation:

```typescript
interface MenuItem {
    id: string;
    label: string;
    url: string;
    icon?: string;          // Lucide icon name
    target: '_self' | '_blank';
    parent_id: string | null;  // For dropdown submenus
    sort_order: number;
    status: 'active' | 'hidden';
}
```

**UI**: Drag-and-drop sortable list with nested children (max 2 levels). Each item has: label input, URL input, icon picker, target toggle, active/hidden toggle.

**Storage**: `hdr_primo_menus` table with `items` JSON column.

### 8.2 Footer Manager

**Admin page**: `/dashboard/admin/cms/footer`

Admin edits the footer layout:

```typescript
interface FooterConfig {
    columns: FooterColumn[];
    copyright: string;         // e.g., "© 2026 PrimoData Analytics"
    social_links: SocialLink[];
}

interface FooterColumn {
    title: string;
    links: { label: string; url: string }[];
}

interface SocialLink {
    platform: 'twitter' | 'linkedin' | 'github' | 'facebook' | 'instagram';
    url: string;
}
```

**Storage**: `hdr_primo_site_settings` table, key = `footer_config`, value = JSON.

### 8.3 Page Manager

**Admin page**: `/dashboard/admin/cms/pages`

CRUD for content pages:

```typescript
interface CmsPage {
    id: number;
    title: string;
    slug: string;              // URL-friendly, unique
    meta_title?: string;       // SEO
    meta_description?: string; // SEO
    status: 'draft' | 'published';
    full_width: boolean;
    hide_topbar: boolean;
    created_at: string;
    updated_at: string;
}
```

**Reference**: RISE already has a `Pages` controller (`rise/app/Controllers/Pages.php`) and `Pages_model` we can extend.

### 8.4 Page Sections

**Admin page**: `/dashboard/admin/cms/pages/[id]` (section editor tab)

Each page has ordered sections:

```typescript
interface PageSection {
    id: number;
    page_id: number;
    type: 'hero' | 'text_block' | 'features_grid' | 'cta' | 'testimonials' |
          'faq' | 'image_gallery' | 'pricing' | 'stats' | 'contact_form';
    title: string;
    content: Record<string, unknown>;  // Type-specific JSON
    sort_order: number;
    status: 'active' | 'hidden';
}
```

**Section type content schemas**:

| Type | Content JSON Structure |
|------|----------------------|
| `hero` | `{ heading, subheading, cta_text, cta_url, background_image }` |
| `text_block` | `{ body_html }` (rich text) |
| `features_grid` | `{ features: [{ icon, title, description }] }` |
| `cta` | `{ heading, description, button_text, button_url, style }` |
| `testimonials` | `{ items: [{ name, role, quote, avatar }] }` |
| `faq` | `{ items: [{ question, answer }] }` |
| `image_gallery` | `{ images: [{ url, alt, caption }] }` |
| `pricing` | `{ plans: [{ name, price, features, cta_url }] }` |
| `stats` | `{ items: [{ value, label, icon }] }` |
| `contact_form` | `{ fields: [{ label, type, required }], submit_url }` |

### 8.5 Public Rendering

- `GET /api/v1/public/cms/menus` — returns active header menu items
- `GET /api/v1/public/cms/footer` — returns footer config
- `GET /api/v1/public/cms/pages/:slug` — returns page with sections

The landing page (`/`) and public pages (`/about/:slug`) read CMS data for header navigation, footer, and page content.

---

## 9. NEW API ENDPOINTS REQUIRED

### 9.1 Admin — Users Management

```
GET    /api/v1/admin/users                         → AdminUsers::index
GET    /api/v1/admin/users/:id                     → AdminUsers::show
POST   /api/v1/admin/users/:id/suspend             → AdminUsers::suspend
POST   /api/v1/admin/users/:id/activate            → AdminUsers::activate
```

### 9.2 Admin — Dashboard Charts & Activity

```
GET    /api/v1/admin/dashboard/charts              → Admin::charts
GET    /api/v1/admin/dashboard/activity            → Admin::activity
GET    /api/v1/admin/dashboard/stats               → Admin::stats
```

### 9.3 Admin — CMS

```
GET    /api/v1/admin/cms/menus                     → AdminCms::menus
POST   /api/v1/admin/cms/menus                     → AdminCms::save_menus
GET    /api/v1/admin/cms/pages                     → AdminCms::pages
POST   /api/v1/admin/cms/pages                     → AdminCms::create_page
GET    /api/v1/admin/cms/pages/:id                 → AdminCms::get_page
PUT    /api/v1/admin/cms/pages/:id                 → AdminCms::update_page
DELETE /api/v1/admin/cms/pages/:id                 → AdminCms::delete_page
GET    /api/v1/admin/cms/pages/:id/sections        → AdminCms::get_sections
POST   /api/v1/admin/cms/pages/:id/sections        → AdminCms::save_sections
GET    /api/v1/admin/cms/footer                    → AdminCms::get_footer
POST   /api/v1/admin/cms/footer                    → AdminCms::save_footer
```

### 9.4 Public — CMS (No Auth)

```
GET    /api/v1/public/cms/menus                    → PublicApi::cms_menus
GET    /api/v1/public/cms/footer                   → PublicApi::cms_footer
GET    /api/v1/public/cms/pages/:slug              → PublicApi::cms_page
```

### 9.5 RISE CRM Module APIs (New REST Wrappers)

Each module follows the same pattern. Here is the **full list** of endpoints needed:

#### Projects

```
GET    /api/v1/projects                            → ApiProjects::index
GET    /api/v1/projects/:id                        → ApiProjects::show
POST   /api/v1/projects                            → ApiProjects::create
PUT    /api/v1/projects/:id                        → ApiProjects::update
DELETE /api/v1/projects/:id                        → ApiProjects::delete
GET    /api/v1/projects/:id/members                → ApiProjects::members
POST   /api/v1/projects/:id/members                → ApiProjects::add_member
GET    /api/v1/projects/:id/milestones             → ApiProjects::milestones
```

#### Tasks

```
GET    /api/v1/tasks                               → ApiTasks::index
GET    /api/v1/tasks/:id                           → ApiTasks::show
POST   /api/v1/tasks                               → ApiTasks::create
PUT    /api/v1/tasks/:id                           → ApiTasks::update
DELETE /api/v1/tasks/:id                           → ApiTasks::delete
GET    /api/v1/tasks/statuses                      → ApiTasks::statuses
PUT    /api/v1/tasks/:id/status                    → ApiTasks::update_status
```

#### Invoices

```
GET    /api/v1/invoices                            → ApiInvoices::index
GET    /api/v1/invoices/:id                        → ApiInvoices::show
POST   /api/v1/invoices                            → ApiInvoices::create
PUT    /api/v1/invoices/:id                        → ApiInvoices::update
DELETE /api/v1/invoices/:id                        → ApiInvoices::delete
GET    /api/v1/invoices/:id/payments               → ApiInvoices::payments
POST   /api/v1/invoices/:id/payments               → ApiInvoices::add_payment
```

#### Clients

```
GET    /api/v1/clients                             → ApiClients::index
GET    /api/v1/clients/:id                         → ApiClients::show
POST   /api/v1/clients                             → ApiClients::create
PUT    /api/v1/clients/:id                         → ApiClients::update
DELETE /api/v1/clients/:id                         → ApiClients::delete
GET    /api/v1/clients/:id/contacts                → ApiClients::contacts
```

#### Leads

```
GET    /api/v1/leads                               → ApiLeads::index
GET    /api/v1/leads/:id                           → ApiLeads::show
POST   /api/v1/leads                               → ApiLeads::create
PUT    /api/v1/leads/:id                           → ApiLeads::update
DELETE /api/v1/leads/:id                           → ApiLeads::delete
GET    /api/v1/leads/statuses                      → ApiLeads::statuses
GET    /api/v1/leads/sources                       → ApiLeads::sources
```

#### Expenses

```
GET    /api/v1/expenses                            → ApiExpenses::index
GET    /api/v1/expenses/:id                        → ApiExpenses::show
POST   /api/v1/expenses                            → ApiExpenses::create
PUT    /api/v1/expenses/:id                        → ApiExpenses::update
DELETE /api/v1/expenses/:id                        → ApiExpenses::delete
GET    /api/v1/expenses/categories                 → ApiExpenses::categories
```

#### Tickets

```
GET    /api/v1/tickets                             → ApiTickets::index
GET    /api/v1/tickets/:id                         → ApiTickets::show
POST   /api/v1/tickets                             → ApiTickets::create
PUT    /api/v1/tickets/:id                         → ApiTickets::update
DELETE /api/v1/tickets/:id                         → ApiTickets::delete
GET    /api/v1/tickets/:id/comments                → ApiTickets::comments
POST   /api/v1/tickets/:id/comments                → ApiTickets::add_comment
```

#### Events

```
GET    /api/v1/events                              → ApiEvents::index
GET    /api/v1/events/:id                          → ApiEvents::show
POST   /api/v1/events                              → ApiEvents::create
PUT    /api/v1/events/:id                          → ApiEvents::update
DELETE /api/v1/events/:id                          → ApiEvents::delete
```

#### Team Members

```
GET    /api/v1/team                                → ApiTeam::index
GET    /api/v1/team/:id                            → ApiTeam::show
POST   /api/v1/team                                → ApiTeam::create
PUT    /api/v1/team/:id                            → ApiTeam::update
DELETE /api/v1/team/:id                            → ApiTeam::delete
```

#### Timesheets

```
GET    /api/v1/timesheets                          → ApiTimesheets::index
POST   /api/v1/timesheets                          → ApiTimesheets::create
PUT    /api/v1/timesheets/:id                      → ApiTimesheets::update
DELETE /api/v1/timesheets/:id                      → ApiTimesheets::delete
```

#### Attendance

```
GET    /api/v1/attendance                          → ApiAttendance::index
POST   /api/v1/attendance/clock-in                 → ApiAttendance::clock_in
POST   /api/v1/attendance/clock-out                → ApiAttendance::clock_out
GET    /api/v1/attendance/status                   → ApiAttendance::status
```

#### Leaves

```
GET    /api/v1/leaves                              → ApiLeaves::index
POST   /api/v1/leaves                              → ApiLeaves::create
PUT    /api/v1/leaves/:id/approve                  → ApiLeaves::approve
PUT    /api/v1/leaves/:id/reject                   → ApiLeaves::reject
GET    /api/v1/leaves/types                        → ApiLeaves::types
```

#### Estimates

```
GET    /api/v1/estimates                           → ApiEstimates::index
GET    /api/v1/estimates/:id                       → ApiEstimates::show
POST   /api/v1/estimates                           → ApiEstimates::create
PUT    /api/v1/estimates/:id                       → ApiEstimates::update
DELETE /api/v1/estimates/:id                       → ApiEstimates::delete
```

#### Contracts

```
GET    /api/v1/contracts                           → ApiContracts::index
GET    /api/v1/contracts/:id                       → ApiContracts::show
POST   /api/v1/contracts                           → ApiContracts::create
PUT    /api/v1/contracts/:id                       → ApiContracts::update
DELETE /api/v1/contracts/:id                       → ApiContracts::delete
```

#### Proposals

```
GET    /api/v1/proposals                           → ApiProposals::index
GET    /api/v1/proposals/:id                       → ApiProposals::show
POST   /api/v1/proposals                           → ApiProposals::create
PUT    /api/v1/proposals/:id                       → ApiProposals::update
DELETE /api/v1/proposals/:id                       → ApiProposals::delete
```

#### Orders

```
GET    /api/v1/orders                              → ApiOrders::index
GET    /api/v1/orders/:id                          → ApiOrders::show
POST   /api/v1/orders                              → ApiOrders::create
PUT    /api/v1/orders/:id                          → ApiOrders::update
DELETE /api/v1/orders/:id                          → ApiOrders::delete
```

#### Messages

```
GET    /api/v1/messages                            → ApiMessages::index
GET    /api/v1/messages/:id                        → ApiMessages::show
POST   /api/v1/messages                            → ApiMessages::send
DELETE /api/v1/messages/:id                        → ApiMessages::delete
```

#### Announcements

```
GET    /api/v1/announcements                       → ApiAnnouncements::index
GET    /api/v1/announcements/:id                   → ApiAnnouncements::show
POST   /api/v1/announcements                       → ApiAnnouncements::create
PUT    /api/v1/announcements/:id                   → ApiAnnouncements::update
DELETE /api/v1/announcements/:id                   → ApiAnnouncements::delete
```

#### Notes & Todo

```
GET    /api/v1/notes                               → ApiNotes::index
POST   /api/v1/notes                               → ApiNotes::create
PUT    /api/v1/notes/:id                           → ApiNotes::update
DELETE /api/v1/notes/:id                           → ApiNotes::delete

GET    /api/v1/todos                               → ApiTodo::index
POST   /api/v1/todos                               → ApiTodo::create
PUT    /api/v1/todos/:id                           → ApiTodo::update
DELETE /api/v1/todos/:id                           → ApiTodo::delete
PUT    /api/v1/todos/:id/toggle                    → ApiTodo::toggle
```

#### Reports

```
GET    /api/v1/reports/summary                     → ApiReports::summary
GET    /api/v1/reports/income-vs-expenses           → ApiReports::income_vs_expenses
GET    /api/v1/reports/invoices                    → ApiReports::invoices
GET    /api/v1/reports/payments                    → ApiReports::payments
GET    /api/v1/reports/timesheets                  → ApiReports::timesheets
```

#### Settings & Roles

```
GET    /api/v1/settings                            → ApiSettings::index
PUT    /api/v1/settings                            → ApiSettings::update
GET    /api/v1/roles                               → ApiRoles::index
GET    /api/v1/roles/:id                           → ApiRoles::show
POST   /api/v1/roles                               → ApiRoles::create
PUT    /api/v1/roles/:id                           → ApiRoles::update
DELETE /api/v1/roles/:id                           → ApiRoles::delete
```

---

## 10. NEW DATABASE TABLES

Only 3 new tables are needed (all CRM tables already exist in RISE):

### 10.1 `hdr_primo_menus`

```sql
CREATE TABLE `hdr_primo_menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT 'Main Menu',
  `location` enum('header','footer') NOT NULL DEFAULT 'header',
  `items` longtext DEFAULT NULL COMMENT 'JSON array of menu items',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_by` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
```

### 10.2 `hdr_primo_page_sections`

```sql
CREATE TABLE `hdr_primo_page_sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_id` int(11) NOT NULL COMMENT 'FK to pages table',
  `type` enum('hero','text_block','features_grid','cta','testimonials','faq','image_gallery','pricing','stats','contact_form') NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` longtext DEFAULT NULL COMMENT 'JSON type-specific content',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('active','hidden') NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_page_sort` (`page_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
```

### 10.3 `hdr_primo_site_settings`

```sql
CREATE TABLE `hdr_primo_site_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` longtext DEFAULT NULL COMMENT 'JSON value',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Default data
INSERT INTO `hdr_primo_site_settings` (`setting_key`, `setting_value`) VALUES
('footer_config', '{"columns":[],"copyright":"© 2026 PrimoData Analytics. All rights reserved.","social_links":[]}'),
('site_name', '"PrimoData Analytics"'),
('site_tagline', '"Authentic Primary Data Collection & Analysis"');
```

### 10.4 Existing PrimoData Tables (13 — Import Pending)

These are defined in `rise/install/primo_import_hdr_prefix.sql` and must be imported via phpMyAdmin:

```
hdr_primo_surveys
hdr_primo_questions
hdr_primo_respondents
hdr_primo_responses
hdr_primo_answers
hdr_primo_targeting_presets
hdr_primo_analysis_reports
hdr_primo_exports
hdr_primo_subscriptions
hdr_primo_usage_logs
hdr_primo_api_keys
hdr_primo_public_datasets
hdr_primo_plans (config-driven, may not be a table)
```

**⚠️ PREREQUISITE**: Import `primo_import_hdr_prefix.sql` on Hostinger before any data-dependent testing.

---

## 11. FRONTEND PAGE TREE (Complete)

### 11.1 Public Pages

```
/                                          Landing page (reads CMS menus + footer)
/login                                     Login form
/register                                  Registration (researcher/respondent)
/about/:slug                               CMS dynamic pages
```

### 11.2 Dashboard — Platform Section

```
/dashboard                                 Dynamic dashboard with charts
/dashboard/surveys                         Survey list (grid)
/dashboard/surveys/[id]                    Survey builder (questions)
/dashboard/surveys/[id]/targeting          Audience targeting
/dashboard/analysis                        Analysis (select survey → run)
/dashboard/exports                         Export center
/dashboard/api-keys                        API key management ★ NEW
/dashboard/subscription                    Plan management
```

### 11.3 Dashboard — Business Section (RISE CRM)

```
/dashboard/projects                        Project list + kanban view ★ NEW
/dashboard/projects/[id]                   Project detail (tasks, milestones, files) ★ NEW
/dashboard/tasks                           Task list + board view ★ NEW
/dashboard/invoices                        Invoice list ★ NEW
/dashboard/invoices/[id]                   Invoice detail + payments ★ NEW
/dashboard/expenses                        Expense list ★ NEW
/dashboard/tickets                         Ticket list ★ NEW
/dashboard/tickets/[id]                    Ticket detail + comments ★ NEW
/dashboard/clients                         Client list ★ NEW
/dashboard/clients/[id]                    Client detail + contacts ★ NEW
/dashboard/leads                           Lead pipeline ★ NEW
/dashboard/estimates                       Estimate list ★ NEW
/dashboard/contracts                       Contract list ★ NEW
/dashboard/proposals                       Proposal list ★ NEW
/dashboard/orders                          Order list ★ NEW
```

### 11.4 Dashboard — Team Section

```
/dashboard/team                            Team member list ★ NEW
/dashboard/attendance                      Attendance log + clock in/out ★ NEW
/dashboard/timesheets                      Timesheet list ★ NEW
/dashboard/leaves                          Leave applications ★ NEW
/dashboard/events                          Event calendar ★ NEW
/dashboard/messages                        Message inbox ★ NEW
/dashboard/announcements                   Announcement list ★ NEW
```

### 11.5 Dashboard — Administration Section

```
/dashboard/admin                           Admin overview (enhanced)
/dashboard/admin/users                     Unified users/clients ★ NEW
/dashboard/admin/respondents               Respondent management (full page) ★ NEW
/dashboard/admin/datasets                  Dataset management (full page) ★ NEW
/dashboard/admin/revenue                   Revenue analytics (full page) ★ NEW
/dashboard/admin/reports                   Reports center ★ NEW
/dashboard/admin/cms                       CMS overview ★ NEW
/dashboard/admin/cms/menus                 Header menu editor ★ NEW
/dashboard/admin/cms/pages                 Page list ★ NEW
/dashboard/admin/cms/pages/[id]            Page editor + sections ★ NEW
/dashboard/admin/cms/footer                Footer editor ★ NEW
/dashboard/admin/settings                  Platform settings ★ NEW
/dashboard/admin/roles                     Role & permission manager ★ NEW
```

### 11.6 Utility Pages

```
/dashboard/notes                           Personal notes ★ NEW
/dashboard/todo                            Todo list ★ NEW
```

**Total: ~50 pages** (11 existing + ~39 new)

---

## 12. SIDEBAR NAVIGATION (Updated)

Update `frontend/src/components/layout/sidebar.tsx`:

```typescript
const platformNav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/surveys", label: "Surveys", icon: ClipboardList },
    { href: "/dashboard/analysis", label: "Analysis", icon: BarChart3 },
    { href: "/dashboard/exports", label: "Exports", icon: Download },
    { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
    { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
];

const businessNav = [
    { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
    { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
    { href: "/dashboard/expenses", label: "Expenses", icon: Wallet },
    { href: "/dashboard/tickets", label: "Tickets", icon: LifeBuoy },
    { href: "/dashboard/clients", label: "Clients", icon: Building2 },
    { href: "/dashboard/leads", label: "Leads", icon: Target },
    { href: "/dashboard/estimates", label: "Estimates", icon: FileText },
    { href: "/dashboard/contracts", label: "Contracts", icon: FileSignature },
    { href: "/dashboard/proposals", label: "Proposals", icon: FileBox },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
];

const teamNav = [
    { href: "/dashboard/team", label: "Team", icon: Users },
    { href: "/dashboard/attendance", label: "Attendance", icon: Clock },
    { href: "/dashboard/timesheets", label: "Timesheets", icon: Timer },
    { href: "/dashboard/leaves", label: "Leaves", icon: CalendarOff },
    { href: "/dashboard/events", label: "Events", icon: Calendar },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
];

const adminNav = [
    { href: "/dashboard/admin", label: "Admin Home", icon: Shield },
    { href: "/dashboard/admin/users", label: "Users", icon: UserCog },
    { href: "/dashboard/admin/respondents", label: "Respondents", icon: Users },
    { href: "/dashboard/admin/datasets", label: "Datasets", icon: Database },
    { href: "/dashboard/admin/revenue", label: "Revenue", icon: DollarSign },
    { href: "/dashboard/admin/reports", label: "Reports", icon: PieChart },
    { href: "/dashboard/admin/cms", label: "CMS", icon: Globe },
    { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/admin/roles", label: "Roles", icon: ShieldCheck },
];

const utilityNav = [
    { href: "/dashboard/notes", label: "Notes", icon: StickyNote },
    { href: "/dashboard/todo", label: "Todo", icon: ListTodo },
];
```

Section headers in sidebar: **PLATFORM**, **BUSINESS**, **TEAM**, **ADMINISTRATION** (admin only), **PERSONAL**.

---

## 13. BACKEND IMPLEMENTATION PATTERNS

### 13.1 API Controller Pattern

Every new API controller follows this pattern (reference: `rise/app/Controllers/Api/Api_base.php`):

```php
<?php
namespace App\Controllers\Api;

class ApiProjects extends Api_base
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * GET /api/v1/projects
     */
    public function index()
    {
        // Use existing RISE model methods — they already handle soft delete, permissions
        $options = ['user_id' => $this->api_user_id];
        // For admin, can see all:
        // if ($this->api_is_admin) unset($options['user_id']);

        $rows = $this->Projects_model->get_details($options)->getResult();

        $list = array_map(fn($r) => [
            'id'          => (int) $r->id,
            'title'       => $r->title,
            'status'      => $r->status,
            'start_date'  => $r->start_date,
            'deadline'    => $r->deadline,
            'client_id'   => (int) $r->client_id,
            'created_at'  => $r->created_at,
        ], $rows);

        return $this->ok($list);
    }

    public function show($id = 0)
    {
        $project = $this->Projects_model->get_details(['id' => $id])->getRow();
        if (!$project) return $this->notFound();
        return $this->ok($this->_dto($project));
    }

    public function create()
    {
        $body = $this->request->getJSON(true) ?? [];
        // Validate required fields
        // Use $this->Projects_model->ci_save($data);
        // Return $this->created($dto);
    }

    // ... update, delete follow same pattern
}
```

### 13.2 Model Reuse

All 85 RISE models are **already auto-loaded** in `App_Controller.__construct()`. The API controllers inherit from `Api_base` → `App_Controller`, so every model is already available as `$this->Projects_model`, `$this->Tasks_model`, etc.

**No new models needed for CRM modules** — just API controllers that call existing models.

New models needed only for CMS:

- `Primo_menus_model` (extends `Crud_model`, table `hdr_primo_menus`)
- `Primo_page_sections_model` (extends `Crud_model`, table `hdr_primo_page_sections`)
- `Primo_site_settings_model` (extends `Crud_model`, table `hdr_primo_site_settings`)

### 13.3 Route Registration

Add all new routes in `rise/app/Config/Routes.php` inside the existing `api/v1` group:

```php
$routes->group('api/v1', ['namespace' => 'App\Controllers\Api'], function ($routes) {
    // ... existing 42 routes ...

    // Admin — Users
    $routes->get('admin/users', 'AdminUsers::index');
    $routes->get('admin/users/(:num)', 'AdminUsers::show/$1');
    $routes->post('admin/users/(:num)/suspend', 'AdminUsers::suspend/$1');
    $routes->post('admin/users/(:num)/activate', 'AdminUsers::activate/$1');

    // Admin — Dashboard extensions
    $routes->get('admin/dashboard/charts', 'Admin::charts');
    $routes->get('admin/dashboard/activity', 'Admin::activity');
    $routes->get('admin/dashboard/stats', 'Admin::stats');

    // Admin — CMS
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

    // Public CMS
    $routes->get('public/cms/menus', 'PublicApi::cms_menus');
    $routes->get('public/cms/footer', 'PublicApi::cms_footer');
    $routes->get('public/cms/pages/(:any)', 'PublicApi::cms_page/$1');

    // CRM Module APIs
    // Projects
    $routes->get('projects', 'ApiProjects::index');
    $routes->get('projects/(:num)', 'ApiProjects::show/$1');
    $routes->post('projects', 'ApiProjects::create');
    $routes->put('projects/(:num)', 'ApiProjects::update/$1');
    $routes->delete('projects/(:num)', 'ApiProjects::delete/$1');
    $routes->get('projects/(:num)/members', 'ApiProjects::members/$1');
    $routes->post('projects/(:num)/members', 'ApiProjects::add_member/$1');
    $routes->get('projects/(:num)/milestones', 'ApiProjects::milestones/$1');

    // Tasks
    $routes->get('tasks', 'ApiTasks::index');
    $routes->get('tasks/(:num)', 'ApiTasks::show/$1');
    $routes->post('tasks', 'ApiTasks::create');
    $routes->put('tasks/(:num)', 'ApiTasks::update/$1');
    $routes->delete('tasks/(:num)', 'ApiTasks::delete/$1');
    $routes->get('tasks/statuses', 'ApiTasks::statuses');
    $routes->put('tasks/(:num)/status', 'ApiTasks::update_status/$1');

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
    $routes->get('clients/(:num)', 'ApiClients::show/$1');
    $routes->post('clients', 'ApiClients::create');
    $routes->put('clients/(:num)', 'ApiClients::update/$1');
    $routes->delete('clients/(:num)', 'ApiClients::delete/$1');
    $routes->get('clients/(:num)/contacts', 'ApiClients::contacts/$1');

    // Leads
    $routes->get('leads', 'ApiLeads::index');
    $routes->get('leads/(:num)', 'ApiLeads::show/$1');
    $routes->post('leads', 'ApiLeads::create');
    $routes->put('leads/(:num)', 'ApiLeads::update/$1');
    $routes->delete('leads/(:num)', 'ApiLeads::delete/$1');
    $routes->get('leads/statuses', 'ApiLeads::statuses');
    $routes->get('leads/sources', 'ApiLeads::sources');

    // Expenses
    $routes->get('expenses', 'ApiExpenses::index');
    $routes->get('expenses/(:num)', 'ApiExpenses::show/$1');
    $routes->post('expenses', 'ApiExpenses::create');
    $routes->put('expenses/(:num)', 'ApiExpenses::update/$1');
    $routes->delete('expenses/(:num)', 'ApiExpenses::delete/$1');
    $routes->get('expenses/categories', 'ApiExpenses::categories');

    // Tickets
    $routes->get('tickets', 'ApiTickets::index');
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
    $routes->post('timesheets', 'ApiTimesheets::create');
    $routes->put('timesheets/(:num)', 'ApiTimesheets::update/$1');
    $routes->delete('timesheets/(:num)', 'ApiTimesheets::delete/$1');

    // Attendance
    $routes->get('attendance', 'ApiAttendance::index');
    $routes->post('attendance/clock-in', 'ApiAttendance::clock_in');
    $routes->post('attendance/clock-out', 'ApiAttendance::clock_out');
    $routes->get('attendance/status', 'ApiAttendance::status');

    // Leaves
    $routes->get('leaves', 'ApiLeaves::index');
    $routes->post('leaves', 'ApiLeaves::create');
    $routes->put('leaves/(:num)/approve', 'ApiLeaves::approve/$1');
    $routes->put('leaves/(:num)/reject', 'ApiLeaves::reject/$1');
    $routes->get('leaves/types', 'ApiLeaves::types');

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
    $routes->get('orders/(:num)', 'ApiOrders::show/$1');
    $routes->post('orders', 'ApiOrders::create');
    $routes->put('orders/(:num)', 'ApiOrders::update/$1');
    $routes->delete('orders/(:num)', 'ApiOrders::delete/$1');

    // Messages
    $routes->get('messages', 'ApiMessages::index');
    $routes->get('messages/(:num)', 'ApiMessages::show/$1');
    $routes->post('messages', 'ApiMessages::send');
    $routes->delete('messages/(:num)', 'ApiMessages::delete/$1');

    // Announcements
    $routes->get('announcements', 'ApiAnnouncements::index');
    $routes->get('announcements/(:num)', 'ApiAnnouncements::show/$1');
    $routes->post('announcements', 'ApiAnnouncements::create');
    $routes->put('announcements/(:num)', 'ApiAnnouncements::update/$1');
    $routes->delete('announcements/(:num)', 'ApiAnnouncements::delete/$1');

    // Notes & Todo
    $routes->get('notes', 'ApiNotes::index');
    $routes->post('notes', 'ApiNotes::create');
    $routes->put('notes/(:num)', 'ApiNotes::update/$1');
    $routes->delete('notes/(:num)', 'ApiNotes::delete/$1');

    $routes->get('todos', 'ApiTodo::index');
    $routes->post('todos', 'ApiTodo::create');
    $routes->put('todos/(:num)', 'ApiTodo::update/$1');
    $routes->delete('todos/(:num)', 'ApiTodo::delete/$1');
    $routes->put('todos/(:num)/toggle', 'ApiTodo::toggle/$1');

    // Reports
    $routes->get('reports/summary', 'ApiReports::summary');
    $routes->get('reports/income-vs-expenses', 'ApiReports::income_vs_expenses');
    $routes->get('reports/invoices', 'ApiReports::invoices');
    $routes->get('reports/payments', 'ApiReports::payments');
    $routes->get('reports/timesheets', 'ApiReports::timesheets');

    // Settings & Roles
    $routes->get('settings', 'ApiSettings::index');
    $routes->put('settings', 'ApiSettings::update');
    $routes->get('roles', 'ApiRoles::index');
    $routes->get('roles/(:num)', 'ApiRoles::show/$1');
    $routes->post('roles', 'ApiRoles::create');
    $routes->put('roles/(:num)', 'ApiRoles::update/$1');
    $routes->delete('roles/(:num)', 'ApiRoles::delete/$1');
});
```

### 13.4 Frontend API Client Extension

Add to `frontend/src/lib/api.ts`:

```typescript
// ── CRM Modules ─────────────────────────────────
export const projects = {
    list: () => request("GET", "/projects"),
    get: (id: number) => request("GET", `/projects/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/projects", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/projects/${id}`, data),
    delete: (id: number) => request("DELETE", `/projects/${id}`),
    members: (id: number) => request("GET", `/projects/${id}/members`),
    addMember: (id: number, data: Record<string, unknown>) => request("POST", `/projects/${id}/members`, data),
    milestones: (id: number) => request("GET", `/projects/${id}/milestones`),
};

export const tasks = {
    list: () => request("GET", "/tasks"),
    get: (id: number) => request("GET", `/tasks/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/tasks", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/tasks/${id}`, data),
    delete: (id: number) => request("DELETE", `/tasks/${id}`),
    statuses: () => request("GET", "/tasks/statuses"),
    updateStatus: (id: number, status: string) => request("PUT", `/tasks/${id}/status`, { status }),
};

export const invoices = {
    list: () => request("GET", "/invoices"),
    get: (id: number) => request("GET", `/invoices/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/invoices", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/invoices/${id}`, data),
    delete: (id: number) => request("DELETE", `/invoices/${id}`),
    payments: (id: number) => request("GET", `/invoices/${id}/payments`),
    addPayment: (id: number, data: Record<string, unknown>) => request("POST", `/invoices/${id}/payments`, data),
};

export const clients = {
    list: () => request("GET", "/clients"),
    get: (id: number) => request("GET", `/clients/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/clients", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/clients/${id}`, data),
    delete: (id: number) => request("DELETE", `/clients/${id}`),
    contacts: (id: number) => request("GET", `/clients/${id}/contacts`),
};

export const leads = {
    list: () => request("GET", "/leads"),
    get: (id: number) => request("GET", `/leads/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/leads", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/leads/${id}`, data),
    delete: (id: number) => request("DELETE", `/leads/${id}`),
    statuses: () => request("GET", "/leads/statuses"),
    sources: () => request("GET", "/leads/sources"),
};

export const expenses = {
    list: () => request("GET", "/expenses"),
    get: (id: number) => request("GET", `/expenses/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/expenses", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/expenses/${id}`, data),
    delete: (id: number) => request("DELETE", `/expenses/${id}`),
    categories: () => request("GET", "/expenses/categories"),
};

export const tickets = {
    list: () => request("GET", "/tickets"),
    get: (id: number) => request("GET", `/tickets/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/tickets", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/tickets/${id}`, data),
    delete: (id: number) => request("DELETE", `/tickets/${id}`),
    comments: (id: number) => request("GET", `/tickets/${id}/comments`),
    addComment: (id: number, data: Record<string, unknown>) => request("POST", `/tickets/${id}/comments`, data),
};

export const events = {
    list: () => request("GET", "/events"),
    get: (id: number) => request("GET", `/events/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/events", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/events/${id}`, data),
    delete: (id: number) => request("DELETE", `/events/${id}`),
};

export const team = {
    list: () => request("GET", "/team"),
    get: (id: number) => request("GET", `/team/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/team", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/team/${id}`, data),
    delete: (id: number) => request("DELETE", `/team/${id}`),
};

export const timesheets = {
    list: () => request("GET", "/timesheets"),
    create: (data: Record<string, unknown>) => request("POST", "/timesheets", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/timesheets/${id}`, data),
    delete: (id: number) => request("DELETE", `/timesheets/${id}`),
};

export const attendance = {
    list: () => request("GET", "/attendance"),
    clockIn: () => request("POST", "/attendance/clock-in"),
    clockOut: () => request("POST", "/attendance/clock-out"),
    status: () => request("GET", "/attendance/status"),
};

export const leaves = {
    list: () => request("GET", "/leaves"),
    create: (data: Record<string, unknown>) => request("POST", "/leaves", data),
    approve: (id: number) => request("PUT", `/leaves/${id}/approve`),
    reject: (id: number) => request("PUT", `/leaves/${id}/reject`),
    types: () => request("GET", "/leaves/types"),
};

export const estimates = {
    list: () => request("GET", "/estimates"),
    get: (id: number) => request("GET", `/estimates/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/estimates", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/estimates/${id}`, data),
    delete: (id: number) => request("DELETE", `/estimates/${id}`),
};

export const contracts = {
    list: () => request("GET", "/contracts"),
    get: (id: number) => request("GET", `/contracts/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/contracts", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/contracts/${id}`, data),
    delete: (id: number) => request("DELETE", `/contracts/${id}`),
};

export const proposals = {
    list: () => request("GET", "/proposals"),
    get: (id: number) => request("GET", `/proposals/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/proposals", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/proposals/${id}`, data),
    delete: (id: number) => request("DELETE", `/proposals/${id}`),
};

export const orders = {
    list: () => request("GET", "/orders"),
    get: (id: number) => request("GET", `/orders/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/orders", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/orders/${id}`, data),
    delete: (id: number) => request("DELETE", `/orders/${id}`),
};

export const messages = {
    list: () => request("GET", "/messages"),
    get: (id: number) => request("GET", `/messages/${id}`),
    send: (data: Record<string, unknown>) => request("POST", "/messages", data),
    delete: (id: number) => request("DELETE", `/messages/${id}`),
};

export const announcements = {
    list: () => request("GET", "/announcements"),
    get: (id: number) => request("GET", `/announcements/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/announcements", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/announcements/${id}`, data),
    delete: (id: number) => request("DELETE", `/announcements/${id}`),
};

export const notes = {
    list: () => request("GET", "/notes"),
    create: (data: Record<string, unknown>) => request("POST", "/notes", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/notes/${id}`, data),
    delete: (id: number) => request("DELETE", `/notes/${id}`),
};

export const todos = {
    list: () => request("GET", "/todos"),
    create: (data: Record<string, unknown>) => request("POST", "/todos", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/todos/${id}`, data),
    delete: (id: number) => request("DELETE", `/todos/${id}`),
    toggle: (id: number) => request("PUT", `/todos/${id}/toggle`),
};

export const reports = {
    summary: () => request("GET", "/reports/summary"),
    incomeVsExpenses: () => request("GET", "/reports/income-vs-expenses"),
    invoices: () => request("GET", "/reports/invoices"),
    payments: () => request("GET", "/reports/payments"),
    timesheets: () => request("GET", "/reports/timesheets"),
};

export const cms = {
    menus: () => request("GET", "/admin/cms/menus"),
    saveMenus: (data: Record<string, unknown>) => request("POST", "/admin/cms/menus", data),
    pages: () => request("GET", "/admin/cms/pages"),
    createPage: (data: Record<string, unknown>) => request("POST", "/admin/cms/pages", data),
    getPage: (id: number) => request("GET", `/admin/cms/pages/${id}`),
    updatePage: (id: number, data: Record<string, unknown>) => request("PUT", `/admin/cms/pages/${id}`, data),
    deletePage: (id: number) => request("DELETE", `/admin/cms/pages/${id}`),
    getSections: (pageId: number) => request("GET", `/admin/cms/pages/${pageId}/sections`),
    saveSections: (pageId: number, data: Record<string, unknown>) => request("POST", `/admin/cms/pages/${pageId}/sections`, data),
    getFooter: () => request("GET", "/admin/cms/footer"),
    saveFooter: (data: Record<string, unknown>) => request("POST", "/admin/cms/footer", data),
};

export const adminUsers = {
    list: (params?: Record<string, string>) => {
        const qs = params ? "?" + new URLSearchParams(params).toString() : "";
        return request("GET", `/admin/users${qs}`);
    },
    get: (id: number) => request("GET", `/admin/users/${id}`),
    suspend: (id: number) => request("POST", `/admin/users/${id}/suspend`),
    activate: (id: number) => request("POST", `/admin/users/${id}/activate`),
};

export const dashboardCharts = {
    charts: (type: string) => request("GET", `/admin/dashboard/charts?type=${type}`),
    activity: () => request("GET", "/admin/dashboard/activity"),
    stats: () => request("GET", "/admin/dashboard/stats"),
};

export const settings = {
    get: () => request("GET", "/settings"),
    update: (data: Record<string, unknown>) => request("PUT", "/settings", data),
};

export const roles = {
    list: () => request("GET", "/roles"),
    get: (id: number) => request("GET", `/roles/${id}`),
    create: (data: Record<string, unknown>) => request("POST", "/roles", data),
    update: (id: number, data: Record<string, unknown>) => request("PUT", `/roles/${id}`, data),
    delete: (id: number) => request("DELETE", `/roles/${id}`),
};

// ── Unified API Object ──────────────────────────
export const api = {
    auth, surveys, responses, analysis, exports: exports_,
    subscriptions, admin, publicApi,
    // CRM modules
    projects, tasks, invoices, clients, leads, expenses,
    tickets, events, team, timesheets, attendance, leaves,
    estimates, contracts, proposals, orders, messages,
    announcements, notes, todos, reports,
    // Admin extensions
    adminUsers, dashboardCharts, cms, settings, roles,
};
```

---

## 14. PHASED IMPLEMENTATION ORDER

### Phase A — Dashboard Enhancement (Priority: CRITICAL)

**Goal**: Replace the static 4-card dashboard with a dynamic chart-rich dashboard.

**Backend tasks**:

1. Add `charts()` method to `rise/app/Controllers/Api/Admin.php` — returns time-series data (responses over time, revenue trend)
2. Add `activity()` method — returns last 20 activity log entries
3. Add `stats()` method — returns extended stat counts (team members, clients, projects, tasks)

**Frontend tasks**:

1. Install Recharts: `npm install recharts`
2. Install react-chartjs-2: `npm install react-chartjs-2 chart.js`
3. Enhance `/dashboard/page.tsx` — add 8 stat cards, 4 chart widgets, activity feed
4. Create reusable chart components: `<LineChartWidget>`, `<PieChartWidget>`, `<BarChartWidget>`, `<DoughnutWidget>`

### Phase B — Users Overview (Priority: HIGH)

**Backend tasks**:

1. Create `rise/app/Controllers/Api/AdminUsers.php` controller
2. Implement `index()` with filtering, pagination, subscription status join

**Frontend tasks**:

1. Create `/dashboard/admin/users/page.tsx`
2. Build user table with filters, search, pagination
3. Add stat summary cards

### Phase C — Missing & Split Pages (Priority: HIGH)

**Frontend tasks**:

1. Create `/dashboard/api-keys/page.tsx` (API key management)
2. Create `/dashboard/admin/respondents/page.tsx` (extracted from admin tabs)
3. Create `/dashboard/admin/datasets/page.tsx` (extracted from admin tabs)
4. Create `/dashboard/admin/revenue/page.tsx` (extracted from admin tabs)
5. Update sidebar navigation with new structure

### Phase D — CMS Backend (Priority: MEDIUM)

**Backend tasks**:

1. Create 3 new DB tables (run SQL on Hostinger)
2. Create models: `Primo_menus_model`, `Primo_page_sections_model`, `Primo_site_settings_model`
3. Register models in `App_Controller.php` model array
4. Create `rise/app/Controllers/Api/AdminCms.php` controller
5. Add CMS public endpoints to `PublicApi.php`
6. Register all CMS routes in `Routes.php`

### Phase E — CMS Frontend (Priority: MEDIUM)

**Frontend tasks**:

1. Create `/dashboard/admin/cms/page.tsx` — overview
2. Create `/dashboard/admin/cms/menus/page.tsx` — drag-drop menu editor
3. Create `/dashboard/admin/cms/pages/page.tsx` — page list
4. Create `/dashboard/admin/cms/pages/[id]/page.tsx` — page editor with section manager
5. Create `/dashboard/admin/cms/footer/page.tsx` — footer editor
6. Install `@dnd-kit/core @dnd-kit/sortable` for drag-drop
7. Install TipTap or react-quill for rich text editing

### Phase F — CMS Public Rendering (Priority: MEDIUM)

**Frontend tasks**:

1. Update `/page.tsx` (landing) — fetch CMS menus + footer, render dynamically
2. Create `/about/[slug]/page.tsx` — fetch CMS page + sections, render type-specific components
3. Create section renderer components for each type (hero, text_block, features_grid, etc.)

### Phase G — RISE CRM API Layer (Priority: HIGH — Largest Phase)

**Backend tasks** (create one API controller per module, all in `rise/app/Controllers/Api/`):

1. `ApiProjects.php` — Projects CRUD + members + milestones
2. `ApiTasks.php` — Tasks CRUD + status management
3. `ApiInvoices.php` — Invoices CRUD + payments
4. `ApiClients.php` — Clients CRUD + contacts
5. `ApiLeads.php` — Leads CRUD + statuses + sources
6. `ApiExpenses.php` — Expenses CRUD + categories
7. `ApiTickets.php` — Tickets CRUD + comments
8. `ApiEvents.php` — Events CRUD
9. `ApiTeam.php` — Team members CRUD
10. `ApiTimesheets.php` — Timesheets CRUD
11. `ApiAttendance.php` — Clock in/out + status
12. `ApiLeaves.php` — Leave applications + approve/reject
13. `ApiEstimates.php` — Estimates CRUD
14. `ApiContracts.php` — Contracts CRUD
15. `ApiProposals.php` — Proposals CRUD
16. `ApiOrders.php` — Orders CRUD
17. `ApiMessages.php` — Messages
18. `ApiAnnouncements.php` — Announcements CRUD
19. `ApiNotes.php` — Notes CRUD
20. `ApiTodo.php` — Todo CRUD + toggle
21. `ApiReports.php` — Report aggregation endpoints
22. `ApiSettings.php` — Settings get/update
23. `ApiRoles.php` — Roles CRUD

Register ALL routes in `Routes.php`.

### Phase H — RISE CRM Frontend Pages (Priority: HIGH)

**Frontend tasks** (create one page per module in `frontend/src/app/dashboard/`):

1. Projects — list page + `[id]` detail page with tabs (tasks, milestones, files)
2. Tasks — list page with board/list toggle using status columns
3. Invoices — list page + `[id]` detail with payment recording
4. Clients — list page + `[id]` detail with contacts and projects
5. Leads — pipeline view (status columns, drag to advance)
6. Expenses — list page with category filter + totals
7. Tickets — list page + `[id]` detail with comment thread
8. Events — calendar view (use a simple calendar component or @fullcalendar/react)
9. Team — member grid/list with roles
10. Attendance — log table + clock in/out button
11. Timesheets — list with time totals
12. Leaves — application list with approve/reject actions
13. Estimates, Contracts, Proposals, Orders — list pages with standard CRUD
14. Messages — inbox with thread view
15. Announcements — list with read/unread
16. Notes — grid of note cards
17. Todo — checklist with toggle

Create shared components:

- `<DataTable>` — reusable table with search, sort, pagination, actions
- `<Modal>` — reusable modal for create/edit forms
- `<StatusBadge>` — reusable status indicator
- `<EmptyState>` — "no data" placeholder

### Phase I — Integration, Polish & E2E Testing (Priority: FINAL)

1. Wire all sidebar navigation sections
2. Ensure RBAC: hide Business/Team sections for non-staff users
3. Ensure admin-only visibility for Administration section
4. Test all 42 existing + ~140 new API endpoints
5. Test all ~50 frontend pages load correctly
6. Test CMS: create menu → visible on landing page, create page → accessible at `/about/slug`
7. Test dashboard: all charts render with real data
8. Test full survey lifecycle end-to-end
9. Run security review: JWT on all protected endpoints, admin guard on admin endpoints
10. Performance check: ensure no N+1 queries in API list endpoints

---

## 15. CONSTRAINTS & RULES

### Backend Rules

1. All API controllers MUST extend `Api_base` (which extends `App_Controller`)
2. Use `$this->ok()`, `$this->created()`, `$this->fail()`, `$this->notFound()`, `$this->forbidden()` for responses
3. All admin endpoints MUST check `$this->api_is_admin` — return 403 if false
4. Use existing RISE models (auto-loaded) — do NOT create duplicate models
5. New CMS models extend `Crud_model` like all RISE models
6. Table prefix is `hdr_` — use `$this->db->prefixTable('tablename')` for raw queries
7. Soft delete: all DELETE endpoints set `deleted=1`, never `DROP` rows
8. Follow RISE naming: snake_case methods, `ci_save()` for insert/update, `get_details()` for filtered queries
9. Add ALL new routes inside the existing `$routes->group('api/v1', ...)` block in `Routes.php`
10. CSRF is excluded for `api/v1/*` — already configured in `Rise.php`

### Frontend Rules

1. Use Next.js 14 App Router — all pages in `src/app/`
2. All dashboard pages use `"use client"` directive
3. Use shadcn/ui components (Card, Button, Badge, Input, etc.)
4. Use Tailwind CSS — no custom CSS files
5. Use the existing `api.ts` request wrapper — extend it, don't replace it
6. Use `useAuth()` hook for user context and logout
7. Charts: Recharts for line/area/bar, Chart.js for pie/doughnut
8. Icons: Lucide React exclusively
9. No `any` type — use proper TypeScript interfaces
10. Pages follow pattern: load → loading spinner → render data or empty state

### Security Rules

1. Every protected API endpoint validates JWT token (via `Api_auth_filter`)
2. Admin endpoints check `$this->api_is_admin` flag from JWT payload
3. User-specific data filtered by `$this->api_user_id` — users cannot see others' data
4. CMS save endpoints are admin-only; CMS read endpoints are public
5. No raw SQL with user input — use parameterized queries or model methods
6. Rate limiting on auth endpoints (login, register)

### Git Rules

Follow commit format:

```
[Phase X - Step Y] Brief description
```

Tag after each phase:

```bash
git tag -a vN.M.0 -m "Phase X complete — description"
git push origin main; git push origin --tags
```

---

## 16. PREREQUISITES BEFORE STARTING

1. **Import database tables**: Run `primo_import_hdr_prefix.sql` on Hostinger via phpMyAdmin (13 tables with `hdr_` prefix)
2. **Run the 3 new CMS table SQL statements** from Section 10 on Hostinger
3. **Verify API is working**: `curl https://dplanthasa.com/index.php/api/v1/public/plans` should return plan data
4. **Verify frontend connects**: `https://alpha-red-nine.vercel.app/login` should reach the login form

---

## 17. SUMMARY

| Metric | Count |
|--------|-------|
| Existing API routes | 42 |
| New API routes | ~140 |
| Total API routes | ~182 |
| Existing frontend pages | 11 |
| New frontend pages | ~39 |
| Total frontend pages | ~50 |
| New backend API controllers | ~26 |
| New backend models | 3 (CMS only) |
| New database tables | 3 (CMS only) |
| Implementation phases | 9 (A through I) |

**This prompt provides everything needed to build the complete unified admin panel. Start with Phase A (Dashboard Enhancement) and proceed sequentially through Phase I.**
