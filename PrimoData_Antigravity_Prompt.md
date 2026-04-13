# PrimoData Analytics
## Master Build Prompt for Antigravity AI
### Version 1.0 | Tamil Nadu Launch → Global Expansion

---

> Paste this entire document into Antigravity. Work module by module. Each section is self-contained and can be handed to Antigravity as a focused sub-prompt after the initial scaffold is built.

---

## PART 1 — MISSION & PRODUCT VISION

Build **PrimoData Analytics** — a full-stack enterprise SaaS platform that eliminates the global fake-data crisis in academic and market research. The platform enables researchers, students, analysts, NGOs, corporations, and government bodies to:

1. Design professional surveys with an advanced drag-and-drop builder
2. Launch surveys to a verified global respondent panel automatically
3. Collect authentic, quality-checked primary data at scale
4. Run AI-powered statistical analysis (descriptive, inferential, regression, hypothesis testing)
5. View insights on a secure real-time dashboard
6. Download polished reports in XLS, PDF, CSV, and ZIP formats

**The admin panel architecture is modelled directly after Rise CRM** (https://rise.fairsketch.com) — a powerful, modular, fully-customizable enterprise backend. Adopt Rise's module structure, UI logic, permission system, and settings architecture, then replace its project/manufacturing modules with PrimoData-specific ones (surveys, respondents, analysis, data marketplace).

**Core promise:** Every data point is real, verified, and traceable.

**Launch market:** Tamil Nadu, India → Pan-India → Global

---

## PART 2 — TECH STACK

### Frontend (Researcher Dashboard + Marketing Site)
```
Framework:         Next.js 14 (App Router, TypeScript strict mode)
Styling:           Tailwind CSS + shadcn/ui component library
State:             Zustand (global UI) + TanStack Query (server state)
Charts:            Recharts + Chart.js (statistical visualisations)
Forms:             React Hook Form + Zod validation
Drag & drop:       @dnd-kit/core (survey builder)
Rich text:         TipTap editor (survey instructions, page builder)
Animations:        Framer Motion
PDF viewer:        react-pdf
i18n:              next-intl (English, Tamil, Hindi)
```

### Admin Panel (Rise-style)
```
Framework:         Next.js 14 (App Router) — separate /admin route group
UI library:        shadcn/ui + custom admin theme (dark sidebar, white content)
Data tables:       TanStack Table v8 (sortable, filterable, paginated)
Charts:            Recharts (admin analytics)
Rich text editor:  TipTap (email templates, page builder)
Drag & drop:       @dnd-kit (menu builder, widget order)
```

### Backend (NestJS — separate service)
```
Framework:         NestJS (Node.js, TypeScript strict mode)
Runtime:           Node.js 20 LTS
ORM:               Prisma (type-safe, migration-managed)
Database:          PostgreSQL (self-hosted on DigitalOcean OR Managed DB)
Cache/Queue:       Redis (Upstash or self-hosted on VPS) — rate limiting, sessions, job queues
File storage:      DigitalOcean Spaces (S3-compatible) — reports, exports, media library
Background jobs:   BullMQ (Redis-based queue system)
Auth:              JWT (access + refresh tokens) + NestJS Guards (RBAC)
                   OAuth optional: Google, GitHub, Microsoft
Email:             Resend (transactional + bulk notifications)
Payments:          Razorpay (INR, India) + Stripe (international)
SMS/OTP:           MSG91 (respondent verification)
Hosting:           DigitalOcean Droplet (Ubuntu 22.04) + PM2 + Nginx reverse proxy
```

### AI & Analysis
```
LLM:               Anthropic Claude API — claude-sonnet-4-20250514
Statistics:        mathjs + custom TypeScript statistical engine
NLP (word cloud):  natural (npm) + d3-cloud
```

### Exports
```
PDF:               pdfmake (structured report generation)
Excel:             exceljs (multi-sheet workbooks with conditional formatting)
CSV:               papaparse
ZIP:               archiver (bundle multiple files)
```

### DevOps
```
Frontend:          Vercel (Next.js frontend only)
Backend:           DigitalOcean Droplet + PM2 process manager + Nginx reverse proxy
Database:          PostgreSQL on DigitalOcean (self-hosted or Managed)
Cache:             Redis on DigitalOcean (or Upstash)
Storage:           DigitalOcean Spaces (S3-compatible)
Monitoring:        Sentry + Vercel Analytics + Posthog
CI/CD:             GitHub Actions
Secrets:           Vercel Env Vars (frontend) + .env on VPS (backend)
SSL:               Nginx + Let's Encrypt (auto-renew)
Domain:            primodata.io → Vercel | api.primodata.io → DigitalOcean VPS
```

---

## PART 3 — USER ROLES & PERMISSION MATRIX

### Four roles, strictly enforced via RBAC middleware:

| Capability | SuperAdmin | Manager | Agent | User (Researcher) |
|---|---|---|---|---|
| Create Manager/Agent accounts | ✅ | ❌ | ❌ | ❌ |
| Self-register | ❌ | ❌ | ❌ | ✅ |
| Full system control | ✅ | ❌ | ❌ | ❌ |
| View all surveys (global) | ✅ | ✅ (assigned) | ❌ | ❌ |
| Manage subscriptions/billing | ✅ | View only | ❌ | Own only |
| Handle Contact Sales leads | ✅ | ✅ | ✅ | ❌ |
| Create surveys | ✅ | ✅ | ❌ | ✅ |
| View own survey results | ✅ | ✅ | ❌ | ✅ |
| Download reports | ✅ | ✅ | ❌ | ✅ (by plan) |
| Manage respondent panel | ✅ | ✅ | ❌ | ❌ |
| Edit frontend (page builder) | ✅ | ❌ | ❌ | ❌ |
| Access admin panel | ✅ | ✅ | ✅ | ❌ |
| Edit application settings | ✅ | ❌ | ❌ | ❌ |
| Enable/disable modules | ✅ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | Own actions | ❌ | ❌ |

---

## PART 4 — COMPLETE DATABASE SCHEMA (Prisma)

Create `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════
// AUTH & USERS
// ═══════════════════════════════════════════

model User {
  id                  String             @id @default(cuid())
  email               String             @unique
  name                String
  avatarUrl           String?
  phone               String?
  role                UserRole           @default(USER)
  status              UserStatus         @default(ACTIVE)
  emailVerified       DateTime?
  passwordHash        String?
  organization        String?
  designation         String?
  country             String?
  state               String?
  preferredLanguage   String             @default("en")
  timezone            String             @default("Asia/Kolkata")
  lastLoginAt         DateTime?
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  subscription        Subscription?
  surveys             Survey[]
  apiKeys             ApiKey[]
  teamMemberships     TeamMember[]
  accounts            Account[]
  sessions            Session[]
  usageLogs           UsageLog[]
  auditLogs           AuditLog[]
  notifications       Notification[]
  leads               Lead[]             @relation("AgentLeads")
  assignedLeads       Lead[]             @relation("AssignedLeads")
  whiteLabel          WhiteLabel?
}

enum UserRole {
  SUPERADMIN
  MANAGER
  AGENT
  USER
  RESPONDENT
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING_VERIFICATION
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id            String   @id @default(cuid())
  sessionToken  String   @unique
  userId        String
  expires       DateTime
  ipAddress     String?
  userAgent     String?
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
}

// ═══════════════════════════════════════════
// TEAMS (Enterprise)
// ═══════════════════════════════════════════

model Team {
  id        String       @id @default(cuid())
  name      String
  slug      String       @unique
  ownerId   String
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  members   TeamMember[]
  surveys   Survey[]
}

model TeamMember {
  id        String   @id @default(cuid())
  teamId    String
  userId    String
  role      TeamRole @default(MEMBER)
  joinedAt  DateTime @default(now())
  team      Team     @relation(fields: [teamId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  @@unique([teamId, userId])
}

enum TeamRole {
  OWNER
  ADMIN
  EDITOR
  VIEWER
}

// ═══════════════════════════════════════════
// PLANS, SUBSCRIPTIONS & BILLING
// ═══════════════════════════════════════════

model Plan {
  id              String          @id @default(cuid())
  name            String          @unique    // e.g. "Starter", "Professional", "Enterprise"
  slug            String          @unique    // URL-safe key
  description     String?
  priceInr        Float           @default(0)
  priceUsd        Float           @default(0)
  billingCycle    BillingCycle    @default(MONTHLY)
  isActive        Boolean         @default(true)
  isFeatured      Boolean         @default(false)
  sortOrder       Int             @default(0)
  trialDays       Int             @default(0)
  maxSurveys      Int             @default(1)     // -1 = unlimited
  maxResponses    Int             @default(50)    // per survey
  maxQuestions    Int             @default(10)    // per survey
  maxTeamMembers  Int             @default(0)
  features        Json            // ["survey_builder","basic_analysis","pdf_export",...]
  supportLevel    String          @default("community")
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  subscriptions   Subscription[]
}

model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  planId               String
  billingCycle         BillingCycle       @default(MONTHLY)
  status               SubscriptionStatus @default(PENDING_APPROVAL)
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  trialEndsAt          DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  cancelledAt          DateTime?
  approvedBy           String?            // Admin who approved
  approvedAt           DateTime?
  razorpaySubId        String?
  razorpayCustomerId   String?
  stripeSubId          String?
  stripeCustomerId     String?
  discountCode         String?
  discountPercent      Float?
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  user                 User               @relation(fields: [userId], references: [id])
  plan                 Plan               @relation(fields: [planId], references: [id])
  invoices             Invoice[]
}

enum BillingCycle {
  MONTHLY
  ANNUAL
}

enum SubscriptionStatus {
  PENDING_APPROVAL
  ACTIVE
  TRIALING
  PAST_DUE
  CANCELLED
  PAUSED
  UNPAID
  REJECTED
}

model Invoice {
  id              String       @id @default(cuid())
  subscriptionId  String
  invoiceNumber   String       @unique
  amount          Float
  tax             Float        @default(0)
  currency        String       @default("INR")
  status          InvoiceStatus @default(PENDING)
  dueDate         DateTime?
  paidAt          DateTime?
  paymentMethod   String?
  razorpayPayId   String?
  stripePayId     String?
  invoicePdfUrl   String?
  notes           String?
  createdAt       DateTime     @default(now())
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
}

enum InvoiceStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  VOID
}

model DiscountCode {
  id          String    @id @default(cuid())
  code        String    @unique
  description String?
  type        String    @default("percent") // percent | fixed
  value       Float
  maxUses     Int?
  usedCount   Int       @default(0)
  validFrom   DateTime
  validUntil  DateTime?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
}

// ═══════════════════════════════════════════
// SURVEYS & QUESTIONS
// ═══════════════════════════════════════════

model Survey {
  id                String        @id @default(cuid())
  title             String
  description       String?
  status            SurveyStatus  @default(DRAFT)
  targetResponses   Int           @default(100)
  collectedCount    Int           @default(0)
  validCount        Int           @default(0)
  userId            String
  teamId            String?
  targeting         Json?
  estimatedMinutes  Int           @default(5)
  language          String        @default("en")
  welcomeMessage    String?
  thankYouMessage   String?
  progressBar       Boolean       @default(true)
  randomizeQuestions Boolean      @default(false)
  allowAnonymous    Boolean       @default(true)
  startsAt          DateTime?
  endsAt            DateTime?
  launchedAt        DateTime?
  completedAt       DateTime?
  category          String?
  tags              String[]
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  user              User          @relation(fields: [userId], references: [id])
  team              Team?         @relation(fields: [teamId], references: [id])
  questions         Question[]
  responses         Response[]
  analysisReports   AnalysisReport[]
  exports           Export[]
}

enum SurveyStatus {
  DRAFT
  REVIEW
  ACTIVE
  PAUSED
  COMPLETED
  ARCHIVED
}

model Question {
  id            String       @id @default(cuid())
  surveyId      String
  order         Int
  type          QuestionType
  text          String
  description   String?
  required      Boolean      @default(true)
  options       Json?
  validation    Json?
  logic         Json?
  mediaUrl      String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  survey        Survey       @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  answers       Answer[]
}

enum QuestionType {
  SHORT_TEXT
  LONG_TEXT
  SINGLE_CHOICE
  MULTIPLE_CHOICE
  RATING
  LIKERT
  MATRIX
  RANKING
  NUMBER
  DATE
  EMAIL
  DROPDOWN
  FILE_UPLOAD
  NET_PROMOTER
  SLIDER
  YES_NO
  IMAGE_CHOICE
}

// ═══════════════════════════════════════════
// RESPONDENTS & RESPONSES
// ═══════════════════════════════════════════

model Respondent {
  id              String        @id @default(cuid())
  email           String?
  phoneHash       String?
  name            String?
  status          RespondentStatus @default(PENDING)
  kycStatus       KYCStatus     @default(PENDING)
  qualityScore    Float         @default(1.0)
  totalResponses  Int           @default(0)
  acceptedCount   Int           @default(0)
  rejectedCount   Int           @default(0)
  demographics    Json
  country         String?
  state           String?
  city            String?
  verifiedAt      DateTime?
  lastActiveAt    DateTime?
  incentiveBalance Float        @default(0)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  responses       Response[]
  payouts         RespondentPayout[]
}

enum RespondentStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  BANNED
}

enum KYCStatus {
  PENDING
  OTP_VERIFIED
  FULL_VERIFIED
  REJECTED
  SUSPENDED
}

model RespondentPayout {
  id            String    @id @default(cuid())
  respondentId  String
  amount        Float
  method        String
  status        String
  processedAt   DateTime?
  createdAt     DateTime  @default(now())
  respondent    Respondent @relation(fields: [respondentId], references: [id])
}

model Response {
  id              String          @id @default(cuid())
  surveyId        String
  respondentId    String
  status          ResponseStatus  @default(PENDING)
  qualityScore    Float?
  qualityFlags    Json?
  durationSecs    Int?
  ipHash          String?
  deviceHash      String?
  userAgent       String?
  completedAt     DateTime?
  createdAt       DateTime        @default(now())

  survey          Survey          @relation(fields: [surveyId], references: [id])
  respondent      Respondent      @relation(fields: [respondentId], references: [id])
  answers         Answer[]
}

enum ResponseStatus {
  PENDING
  COMPLETED
  REJECTED
  FLAGGED
  DUPLICATE
}

model Answer {
  id          String    @id @default(cuid())
  responseId  String
  questionId  String
  value       Json
  createdAt   DateTime  @default(now())

  response    Response  @relation(fields: [responseId], references: [id], onDelete: Cascade)
  question    Question  @relation(fields: [questionId], references: [id])
}

// ═══════════════════════════════════════════
// ANALYSIS & EXPORTS
// ═══════════════════════════════════════════

model AnalysisReport {
  id            String          @id @default(cuid())
  surveyId      String
  status        AnalysisStatus  @default(PENDING)
  results       Json?
  aiNarrative   String?
  triggeredBy   String?
  createdAt     DateTime        @default(now())
  completedAt   DateTime?
  failedAt      DateTime?
  errorMessage  String?

  survey        Survey          @relation(fields: [surveyId], references: [id])
  exports       Export[]
}

enum AnalysisStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}

model Export {
  id          String       @id @default(cuid())
  surveyId    String
  reportId    String?
  userId      String
  format      ExportFormat
  fileUrl     String?
  fileName    String?
  fileSizeKb  Float?
  status      ExportStatus @default(PENDING)
  expiresAt   DateTime?
  createdAt   DateTime     @default(now())

  survey      Survey          @relation(fields: [surveyId], references: [id])
  report      AnalysisReport? @relation(fields: [reportId], references: [id])
}

enum ExportFormat {
  PDF
  XLS
  CSV
  ZIP
  JSON
}

enum ExportStatus {
  PENDING
  PROCESSING
  READY
  FAILED
  EXPIRED
}

// ═══════════════════════════════════════════
// CRM & LEADS (Agent Module)
// ═══════════════════════════════════════════

model Lead {
  id              String      @id @default(cuid())
  name            String
  email           String
  phone           String?
  organization    String?
  country         String?
  planInterest    PlanTier?
  message         String?
  status          LeadStatus  @default(NEW)
  source          String?
  assignedToId    String?
  createdById     String?
  notes           String?
  followUpAt      DateTime?
  convertedAt     DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  assignedTo      User?       @relation("AssignedLeads", fields: [assignedToId], references: [id])
  createdBy       User?       @relation("AgentLeads", fields: [createdById], references: [id])
  activities      LeadActivity[]
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  PROPOSAL_SENT
  NEGOTIATION
  CONVERTED
  LOST
}

model LeadActivity {
  id        String   @id @default(cuid())
  leadId    String
  type      String
  note      String
  createdBy String
  createdAt DateTime @default(now())
  lead      Lead     @relation(fields: [leadId], references: [id])
}

// ═══════════════════════════════════════════
// PUBLIC DATA MARKETPLACE (Statista-style)
// ═══════════════════════════════════════════

model PublicDataset {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  category    String
  subCategory String?
  region      String
  country     String?
  state       String?
  description String
  methodology String?
  data        Json
  chartType   String   @default("bar")
  source      String
  sourceUrl   String?
  year        Int
  tags        String[]
  featured    Boolean  @default(false)
  published   Boolean  @default(true)
  viewCount   Int      @default(0)
  downloadCount Int    @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ═══════════════════════════════════════════
// WHITE LABEL (Enterprise)
// ═══════════════════════════════════════════

model WhiteLabel {
  id            String   @id @default(cuid())
  userId        String   @unique
  brandName     String
  logoUrl       String?
  faviconUrl    String?
  primaryColor  String   @default("#2563eb")
  customDomain  String?
  emailFrom     String?
  footerText    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id])
}

// ═══════════════════════════════════════════
// ADMIN SETTINGS & CMS
// ═══════════════════════════════════════════

model AppSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  group     String
  label     String?
  updatedAt DateTime @updatedAt
}

model Module {
  id          String   @id @default(cuid())
  name        String   @unique
  label       String
  description String?
  isEnabled   Boolean  @default(true)
  order       Int      @default(0)
  icon        String?
  updatedAt   DateTime @updatedAt
}

model Page {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     Json
  metaTitle   String?
  metaDesc    String?
  published   Boolean  @default(false)
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model MenuItem {
  id        String     @id @default(cuid())
  menuId    String
  label     String
  url       String?
  pageId    String?
  order     Int        @default(0)
  parentId  String?
  target    String     @default("_self")
  children  MenuItem[] @relation("MenuItemChildren")
  parent    MenuItem?  @relation("MenuItemChildren", fields: [parentId], references: [id])
  menu      Menu       @relation(fields: [menuId], references: [id])
}

model Menu {
  id        String     @id @default(cuid())
  name      String     @unique
  location  String
  items     MenuItem[]
}

model MediaFile {
  id          String   @id @default(cuid())
  fileName    String
  fileUrl     String
  mimeType    String
  sizeKb      Float
  altText     String?
  uploadedBy  String
  createdAt   DateTime @default(now())
}

model EmailTemplate {
  id        String   @id @default(cuid())
  name      String   @unique
  subject   String
  body      String
  variables Json?
  isSystem  Boolean  @default(false)
  updatedAt DateTime @updatedAt
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  title     String
  message   String
  data      Json?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

// ═══════════════════════════════════════════
// API KEYS
// ═══════════════════════════════════════════

model ApiKey {
  id          String    @id @default(cuid())
  userId      String
  name        String
  keyHash     String    @unique
  keyPrefix   String
  permissions Json?
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  user        User      @relation(fields: [userId], references: [id])
}

// ═══════════════════════════════════════════
// AUDIT LOGS & USAGE
// ═══════════════════════════════════════════

model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  action      String
  entity      String
  entityId    String?
  oldValues   Json?
  newValues   Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}

model UsageLog {
  id          String   @id @default(cuid())
  userId      String
  surveyId    String?
  action      String
  quantity    Int      @default(1)
  month       String
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

---

## PART 5 — FULL FOLDER STRUCTURE (SPLIT ARCHITECTURE)

> **Two separate projects:** `frontend/` (Next.js on Vercel) and `backend/` (NestJS on DigitalOcean).
> All API endpoints are handled by NestJS controllers — **no Next.js API routes**.

```
primodata/
│
├── frontend/                               # Next.js 14 (Vercel)
│   │
│   ├── app/
│   │   ├── (marketing)/                    # Public site — SSG / ISR
│   │   │   ├── layout.tsx                  # Nav + footer wrapper
│   │   │   ├── page.tsx                    # Homepage
│   │   │   ├── pricing/page.tsx            # Pricing with toggle
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx            # Contact Sales form
│   │   │   ├── features/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   └── stats/                      # Free public data marketplace
│   │   │       ├── page.tsx                # Browse + search datasets
│   │   │       └── [slug]/page.tsx         # Dataset detail + chart
│   │   │
│   │   ├── (auth)/                         # Auth pages — no layout
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── verify-email/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── (dashboard)/                    # Researcher portal (feature-gated by subscription)
│   │   │   ├── layout.tsx                  # Sidebar + topbar + plan-feature guard
│   │   │   ├── dashboard/page.tsx          # Overview metrics (content varies by plan)
│   │   │   ├── surveys/
│   │   │   │   ├── page.tsx                # Survey list + filters
│   │   │   │   ├── new/page.tsx            # Create wizard
│   │   │   │   └── [surveyId]/
│   │   │   │       ├── page.tsx            # Survey overview
│   │   │   │       ├── builder/page.tsx    # Drag-and-drop builder
│   │   │   │       ├── targeting/page.tsx  # Audience filters
│   │   │   │       ├── launch/page.tsx     # Pre-launch checklist + distribution
│   │   │   │       ├── responses/page.tsx  # Raw response table
│   │   │   │       ├── analysis/page.tsx   # AI analysis results
│   │   │   │       └── export/page.tsx     # Download reports
│   │   │   ├── reports/page.tsx            # All generated reports
│   │   │   ├── team/page.tsx               # Team management (Enterprise only)
│   │   │   ├── billing/page.tsx            # Plan + invoices
│   │   │   ├── api-keys/page.tsx           # API access (Enterprise only)
│   │   │   ├── profile/page.tsx            # User profile + password change
│   │   │   └── settings/page.tsx           # Account settings
│   │   │
│   │   ├── (admin)/                        # Rise-style admin panel
│   │   │   ├── layout.tsx                  # Admin sidebar + topbar
│   │   │   ├── admin/page.tsx              # Admin overview dashboard
│   │   │   ├── admin/users/
│   │   │   │   ├── page.tsx                # All users table
│   │   │   │   ├── new/page.tsx            # Create Manager/Agent
│   │   │   │   └── [userId]/page.tsx       # User detail + edit + assign plan
│   │   │   ├── admin/surveys/page.tsx      # All surveys (global view)
│   │   │   ├── admin/responses/page.tsx    # All responses
│   │   │   ├── admin/respondents/
│   │   │   │   ├── page.tsx                # Panel management
│   │   │   │   └── [respondentId]/page.tsx
│   │   │   ├── admin/analysis/page.tsx     # Analysis job monitor
│   │   │   ├── admin/plans/               # ★ Admin-managed plan CRUD
│   │   │   │   ├── page.tsx                # All plans table + create
│   │   │   │   └── [planId]/page.tsx       # Edit plan: name, pricing, features, limits
│   │   │   ├── admin/subscriptions/
│   │   │   │   ├── page.tsx                # All subscriptions + approve/reject
│   │   │   │   └── [subId]/page.tsx        # Subscription detail
│   │   │   ├── admin/billing/
│   │   │   │   ├── page.tsx                # Revenue dashboard
│   │   │   │   ├── invoices/page.tsx       # All invoices
│   │   │   │   └── discounts/page.tsx      # Discount codes
│   │   │   ├── admin/leads/
│   │   │   │   ├── page.tsx                # CRM lead list
│   │   │   │   └── [leadId]/page.tsx       # Lead detail
│   │   │   ├── admin/datasets/
│   │   │   │   ├── page.tsx                # Public data marketplace admin
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [datasetId]/page.tsx
│   │   │   ├── admin/cms/
│   │   │   │   ├── pages/page.tsx          # CMS page list
│   │   │   │   ├── pages/[pageId]/page.tsx # Page editor
│   │   │   │   ├── menus/page.tsx          # Menu builder
│   │   │   │   └── media/page.tsx          # Media library
│   │   │   ├── admin/email-templates/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [templateId]/page.tsx
│   │   │   ├── admin/modules/page.tsx      # Enable/disable modules
│   │   │   ├── admin/audit-logs/page.tsx
│   │   │   ├── admin/reports/page.tsx      # System-wide reports
│   │   │   └── admin/settings/
│   │   │       ├── page.tsx                # General settings
│   │   │       ├── payment/page.tsx        # Razorpay + Stripe config
│   │   │       ├── email/page.tsx          # SMTP / Resend config
│   │   │       ├── sms/page.tsx            # MSG91 config
│   │   │       ├── theme/page.tsx          # Brand colours, logo
│   │   │       └── security/page.tsx       # Auth, 2FA, session config
│   │   │
│   │   └── (respondent)/                   # Respondent portal (separate dashboard)
│   │       ├── layout.tsx                  # Respondent-specific sidebar + topbar
│   │       ├── respondent/dashboard/page.tsx   # Available surveys + stats
│   │       ├── respondent/surveys/page.tsx     # All assigned surveys
│   │       ├── respondent/surveys/[id]/page.tsx # Take survey
│   │       ├── respondent/history/page.tsx     # Completed surveys
│   │       ├── respondent/earnings/page.tsx    # Incentive balance + payouts
│   │       └── respondent/profile/page.tsx     # Demographics + settings
│   │
│   ├── components/
│   │   ├── ui/                             # shadcn/ui base
│   │   ├── layout/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminTopbar.tsx
│   │   │   ├── DashboardSidebar.tsx        # Feature-gated nav items
│   │   │   ├── RespondentSidebar.tsx       # Respondent-specific nav
│   │   │   ├── DashboardTopbar.tsx
│   │   │   ├── MarketingNav.tsx
│   │   │   └── Footer.tsx
│   │   ├── survey/
│   │   ├── analysis/
│   │   ├── admin/
│   │   ├── billing/
│   │   ├── respondent/
│   │   └── public/
│   │
│   ├── lib/
│   │   ├── api.ts                          # REST client → api.primodata.io
│   │   ├── auth-context.tsx                # JWT auth provider
│   │   ├── plan-context.tsx                # ★ Subscription/feature context
│   │   └── utils.ts
│   │
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   ├── constants/
│   ├── middleware.ts                       # Route protection (client-side)
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── .env.local
│
├── backend/                                # NestJS (DigitalOcean)
│   │
│   ├── src/
│   │   ├── main.ts                         # Bootstrap + CORS + Swagger
│   │   ├── app.module.ts                   # Root module
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/                       # Login, register, JWT, refresh tokens
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── dto/
│   │   │   ├── users/                      # User CRUD, profile
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   └── users.service.ts
│   │   │   ├── surveys/                    # Survey CRUD, questions, launch, distribute
│   │   │   │   ├── surveys.module.ts
│   │   │   │   ├── surveys.controller.ts
│   │   │   │   ├── surveys.service.ts
│   │   │   │   └── dto/
│   │   │   ├── responses/                  # Response submission, quality scoring
│   │   │   │   ├── responses.module.ts
│   │   │   │   ├── responses.controller.ts
│   │   │   │   ├── responses.service.ts
│   │   │   │   └── quality-engine.ts
│   │   │   ├── analysis/                   # Statistical engine + AI narrative
│   │   │   │   ├── analysis.module.ts
│   │   │   │   ├── analysis.controller.ts
│   │   │   │   ├── analysis.service.ts
│   │   │   │   └── statistics/
│   │   │   │       ├── descriptive.ts
│   │   │   │       ├── inferential.ts
│   │   │   │       ├── regression.ts
│   │   │   │       ├── correlation.ts
│   │   │   │       └── index.ts
│   │   │   ├── exports/                    # PDF, Excel, CSV, ZIP generation
│   │   │   │   ├── exports.module.ts
│   │   │   │   ├── exports.controller.ts
│   │   │   │   ├── exports.service.ts
│   │   │   │   └── generators/
│   │   │   │       ├── pdf.ts
│   │   │   │       ├── excel.ts
│   │   │   │       ├── csv.ts
│   │   │   │       └── zip.ts
│   │   │   ├── plans/                      # ★ Admin-managed plan CRUD
│   │   │   │   ├── plans.module.ts
│   │   │   │   ├── plans.controller.ts     # CRUD: create, update, list, delete plans
│   │   │   │   └── plans.service.ts
│   │   │   ├── billing/                    # Subscriptions, invoices, payments
│   │   │   │   ├── billing.module.ts
│   │   │   │   ├── billing.controller.ts   # Subscribe, approve, cancel, assign
│   │   │   │   ├── billing.service.ts
│   │   │   │   ├── razorpay.service.ts
│   │   │   │   └── stripe.service.ts
│   │   │   ├── respondents/                # Respondent panel, KYC, payouts
│   │   │   │   ├── respondents.module.ts
│   │   │   │   ├── respondents.controller.ts
│   │   │   │   └── respondents.service.ts
│   │   │   ├── notifications/              # In-app + email notifications
│   │   │   │   ├── notifications.module.ts
│   │   │   │   ├── notifications.controller.ts
│   │   │   │   └── notifications.service.ts
│   │   │   ├── admin/                      # Admin dashboard, metrics, settings
│   │   │   │   ├── admin.module.ts
│   │   │   │   ├── admin.controller.ts
│   │   │   │   └── admin.service.ts
│   │   │   ├── leads/                      # CRM lead management
│   │   │   ├── datasets/                   # Public data marketplace
│   │   │   ├── cms/                        # Pages, menus, media
│   │   │   └── email-templates/            # Template CRUD + send
│   │   │
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts       # Verify Bearer token
│   │   │   │   ├── roles.guard.ts          # RBAC: ADMIN, RESEARCHER, RESPONDENT
│   │   │   │   └── plan-feature.guard.ts   # ★ Check subscription features
│   │   │   ├── decorators/
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   └── plan-feature.decorator.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── response.interceptor.ts # Wraps in { data: ... } envelope
│   │   │   │   └── audit-log.interceptor.ts
│   │   │   └── filters/
│   │   │       └── http-exception.filter.ts
│   │   │
│   │   ├── jobs/                           # BullMQ job processors
│   │   │   ├── survey-dispatch.processor.ts
│   │   │   ├── response-quality.processor.ts
│   │   │   ├── analysis-engine.processor.ts
│   │   │   ├── export-generator.processor.ts
│   │   │   ├── billing-jobs.processor.ts
│   │   │   └── notification-jobs.processor.ts
│   │   │
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── redis.config.ts
│   │   │   ├── storage.config.ts           # DigitalOcean Spaces (S3)
│   │   │   └── app.config.ts
│   │   │
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   │
│   ├── .env
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

### API Endpoints (NestJS Controllers)

> All endpoints served from `https://api.primodata.io/api/v1/`. No Next.js API routes exist.

```
AUTH
POST   /api/v1/auth/register          # Register (researcher or respondent)
POST   /api/v1/auth/login             # Login → access + refresh tokens
POST   /api/v1/auth/refresh           # Refresh access token
GET    /api/v1/auth/me                # Current user profile
PUT    /api/v1/auth/profile           # Update profile (name, avatar)
PUT    /api/v1/auth/password          # Change password
POST   /api/v1/auth/forgot-password   # Request password reset
POST   /api/v1/auth/reset-password    # Reset with token

SURVEYS (Researcher — feature-gated by plan)
GET    /api/v1/surveys                # List own surveys
POST   /api/v1/surveys                # Create survey (plan limit check)
GET    /api/v1/surveys/:id            # Get survey detail
PUT    /api/v1/surveys/:id            # Update survey
DELETE /api/v1/surveys/:id            # Delete survey
POST   /api/v1/surveys/:id/questions  # Add question (plan limit check)
PUT    /api/v1/surveys/:id/questions/:qid
DELETE /api/v1/surveys/:id/questions/:qid
GET    /api/v1/surveys/:id/targeting  # Get targeting criteria
PUT    /api/v1/surveys/:id/targeting  # Save targeting
POST   /api/v1/surveys/:id/launch     # Launch survey
POST   /api/v1/surveys/:id/pause      # Pause survey
POST   /api/v1/surveys/:id/distribute # ★ Distribute to panel + generate link
GET    /api/v1/surveys/:id/link       # ★ Get shareable public URL
GET    /api/v1/surveys/:id/responses  # List responses (owner)
GET    /api/v1/surveys/:id/responses/quality  # Quality distribution

ANALYSIS & EXPORTS (feature-gated by plan)
GET    /api/v1/analysis/:surveyId     # Get analysis report
POST   /api/v1/analysis/:surveyId/run # Trigger analysis
GET    /api/v1/exports                # List exports
POST   /api/v1/exports/:surveyId/generate  # Generate export (plan limit: format)

PUBLIC (no auth)
GET    /api/v1/public/surveys/:id     # Take survey (respondents)
POST   /api/v1/public/surveys/:id/submit  # Submit response
GET    /api/v1/public/datasets        # Browse free datasets
GET    /api/v1/public/datasets/:slug  # Dataset detail
GET    /api/v1/public/categories      # Dataset categories
GET    /api/v1/public/plans           # List active plans + pricing

RESPONDENT PORTAL (role: RESPONDENT)
GET    /api/v1/respondent/dashboard   # Stats + available surveys
GET    /api/v1/respondent/surveys     # Surveys assigned to me
GET    /api/v1/respondent/history     # Completed surveys
GET    /api/v1/respondent/earnings    # Incentive balance + payouts
PUT    /api/v1/respondent/profile     # Update demographics

SUBSCRIPTIONS (Researcher)
GET    /api/v1/subscriptions/plans    # List available plans
GET    /api/v1/subscriptions/current  # My subscription + features + usage
POST   /api/v1/subscriptions/checkout # Request subscription (Razorpay/Stripe)
POST   /api/v1/subscriptions/verify   # Verify payment callback
POST   /api/v1/subscriptions/cancel   # Cancel subscription

ADMIN — Plans (role: SUPERADMIN)
GET    /api/v1/admin/plans            # List all plans
POST   /api/v1/admin/plans            # ★ Create plan (name, features, pricing, limits)
PUT    /api/v1/admin/plans/:id        # ★ Edit plan (changes reflect immediately)
DELETE /api/v1/admin/plans/:id        # Delete plan (if no active subscribers)

ADMIN — Subscriptions (role: SUPERADMIN | MANAGER)
GET    /api/v1/admin/subscriptions    # All subscriptions
PUT    /api/v1/admin/subscriptions/:id/approve  # ★ Approve pending subscription
PUT    /api/v1/admin/subscriptions/:id/reject   # Reject
POST   /api/v1/admin/subscriptions/assign       # ★ Manually assign plan to user

ADMIN — General (role: SUPERADMIN | MANAGER | AGENT)
GET    /api/v1/admin/metrics          # Dashboard stats
GET    /api/v1/admin/users            # All users
POST   /api/v1/admin/users            # Create manager/agent
GET    /api/v1/admin/surveys          # All surveys (global)
GET    /api/v1/admin/responses        # All responses
GET    /api/v1/admin/respondents      # Panel management
GET    /api/v1/admin/billing/revenue  # Revenue dashboard
GET    /api/v1/admin/billing/invoices # All invoices
GET    /api/v1/admin/audit-logs       # Audit trail
GET    /api/v1/admin/modules          # Module list
PUT    /api/v1/admin/modules/:id      # Toggle module
GET    /api/v1/admin/settings         # All settings
PUT    /api/v1/admin/settings         # Update settings

WEBHOOKS (no auth — signature verified)
POST   /api/v1/webhooks/razorpay      # Razorpay payment events
POST   /api/v1/webhooks/stripe        # Stripe payment events
```

---

## PART 6 — HOMEPAGE (MARKETING SITE)

Build `app/(marketing)/page.tsx` — a world-class SaaS homepage:

### Section 1 — Sticky Navigation
- Logo: stylised "P" icon + "PrimoData Analytics" wordmark
- Links: Features | Pricing | Free Stats | About | Contact
- Right side: "Sign In" (ghost button) + "Start Free" (primary filled button)
- Sticky on scroll, blur-background effect

### Section 2 — Hero
- Pill badge: "Trusted by 10,000+ researchers worldwide"
- H1 (large bold): "Stop Using Fake Data. Collect the Real Thing."
- Subheadline: "Design surveys. Launch to our verified global panel. Get AI-powered analysis. Download in minutes."
- Two CTAs: "Start for free →" and "Watch how it works"
- Hero visual: Animated SVG showing Survey → Panel → Analysis → Report flow
- Trust row: "10,000+ researchers", "50 countries", "99.2% authenticity rate", "Tamil Nadu → Global"

### Section 3 — Problem Statement (the pain)
Two-column layout:
- LEFT — "The fake data crisis": Researchers fabricate or borrow data. 68% of student projects use secondary data claimed as primary. Results are meaningless.
- RIGHT — "PrimoData solves this": Verified respondents, automated collection, zero fabrication possible

### Section 4 — How It Works (3 steps)
Large numbered cards:
1. "Design your survey" — drag-and-drop builder, 15+ question types
2. "Launch to verified panel" — global respondents, automated dispatch
3. "Download AI analysis" — statistical reports in minutes

### Section 5 — Feature Grid (6 cards, 3×2)
- Verified Respondent Panel
- AI Statistical Analysis (Claude-powered)
- Real-time Dashboard
- Multi-format Exports (XLS, PDF, CSV, ZIP)
- Hypothesis Testing & Regression
- Free Public Statistics Portal

### Section 6 — Free Stats Portal Teaser
- Headline: "Explore 10,000+ free public datasets"
- 6 sample dataset cards (India GDP, population, literacy, election data)
- "Browse all datasets →" link to /stats
- Sub-text: "Free forever. No login required."

### Section 7 — Pricing Section
- Annual/Monthly toggle (20% discount on annual shown in badge)
- Four plan cards (Basic, Advanced, Enterprise, Custom)
- FAQ accordion below

### Section 8 — Testimonials
Three quote cards: PhD scholar, market researcher, NGO analyst

### Section 9 — Final CTA Banner
- "Start collecting real data today"
- "Start Free" + "Contact Sales" buttons
- "Made in Tamil Nadu 🇮🇳 — Built for the world"

### Section 10 — Footer
Logo, tagline, link columns (Product, Company, Legal), social icons, copyright

---

## PART 7 — ADMIN PANEL (RISE-STYLE)

The admin panel lives at `/admin/*` and is protected by `role === SUPERADMIN | MANAGER | AGENT`.

Model the layout after Rise CRM: dark sidebar with module icons, white content area, breadcrumbs, notification bell, user avatar top-right.

### 7.1 Admin Sidebar (Rise-style)
```
PRIMODATA                [logo]
─────────────────────────
[icon] Dashboard
[icon] Users
       ├── All Users
       ├── Managers
       └── Agents
[icon] Surveys
[icon] Responses
[icon] Respondents
[icon] Analysis
[icon] Billing
       ├── Subscriptions
       ├── Invoices
       └── Discount Codes
[icon] Leads (CRM)
[icon] Public Datasets
[icon] CMS
       ├── Pages
       ├── Menus
       └── Media Library
[icon] Email Templates
[icon] Modules
[icon] Audit Logs
[icon] Settings
       ├── General
       ├── Payment Gateways
       ├── Email / SMTP
       ├── SMS (OTP)
       ├── Plan Limits
       ├── Theme & Branding
       └── Security
─────────────────────────
[icon] View Frontend →
```

### 7.2 Admin Overview Dashboard
Rise-style grid of metric widgets (draggable, customisable):
- Total registered users (with sparkline trend)
- Active subscriptions by plan (donut chart)
- Monthly Recurring Revenue (MRR) in ₹
- Surveys launched this month
- Responses collected this month
- Respondent panel size
- Analysis reports generated
- Contact Sales leads pipeline
- Recent user registrations (table)
- Recent payments (table)

### 7.3 User Management
- Table: Name, Email, Role badge, Plan badge, Status, Join date, Last login, Actions
- Filter: role, plan, status, country, date range
- Create user (Manager/Agent): name, email, password, role, permissions
- User detail page: full profile, subscription info, survey list, billing history, audit trail, suspend/delete actions
- Bulk actions: export CSV, bulk status change

### 7.4 Survey Management (Global)
- All surveys from all users
- Filter: status, user, date, response count
- Admin can view, pause, or archive any survey
- Metrics overlay per survey card

### 7.5 Respondent Panel Management
- Table: Name (hashed), Phone (hashed), KYC status, Quality score, Country, Total surveys, Accepted/Rejected ratio, Last active
- Filter: KYC status, quality score range, country, status
- Actions: Verify KYC, Suspend, Ban, View response history
- Quality score trend chart per respondent
- Bulk payout management

### 7.6 Billing Dashboard (Rise Invoices/Payments style)
- MRR by plan tier (stacked bar chart — monthly trend)
- Churn rate, new MRR, expansion MRR (top KPI row)
- Active subscriptions table: User, Plan, Start date, Renewal date, Amount, Status, Actions
- Invoice list: searchable, filterable, PDF download per invoice
- Failed payments queue with retry action
- Discount codes: create, edit, toggle active, usage stats

### 7.7 Leads / CRM (Agent Module)
Kanban board + table view for Contact Sales inquiries:
- Columns: New → Contacted → Qualified → Proposal Sent → Negotiation → Converted / Lost
- Lead card: name, org, plan interest, assigned agent, last activity date
- Lead detail: full contact info, notes timeline, activity log, convert to user button
- Assign lead to Agent or Manager
- Follow-up reminder date picker

### 7.8 CMS — Page Builder
- List of all pages (slug, title, published status, last updated)
- "Add page" creates blank page with TipTap block editor
- System pages (Homepage sections) are editable but not deletable
- Each page supports: hero block, text block, image block, grid block, CTA block, pricing block
- Block reordering via drag-and-drop
- SEO tab: meta title, meta description, OG image

### 7.9 CMS — Menu Builder
- Visual drag-and-drop menu tree
- Add menu items: label, URL or internal page, target (same/new tab)
- Nested items (dropdown menus)
- Assign menu to location: Header, Footer Column 1/2/3

### 7.10 CMS — Media Library
- Grid view of all uploaded files (images, PDFs)
- Upload button (DigitalOcean Spaces)
- Click to copy URL
- Filter by type, search by name
- Delete with confirmation

### 7.11 Email Templates
- List of all system templates with last-edited date
- Edit template: subject line + TipTap body editor with variable hints
- Variables panel: {{user.name}}, {{survey.title}}, {{download.url}}, etc.
- Preview rendered email
- Send test email button

### 7.12 Module Manager
Grid of all platform modules as toggle cards:
- Survey Builder, Respondent Panel, AI Analysis, Hypothesis Testing, Regression Analysis, Data Export, Free Stats Portal, CRM/Leads, White Label, API Access, Team Collaboration
- Each toggle: enabled/disabled with confirmation dialog
- Description and affected plan tiers shown per module
- Disabled modules are hidden from all UIs system-wide

### 7.13 Audit Logs
- Full chronological log: Who, What, When, From where (IP), Before/After values
- Filter: user, action type, entity, date range
- Export CSV
- Retained 12 months

### 7.14 Settings

**General:**
- App name, tagline, logo, favicon
- Contact email, support email, phone
- Address (for invoices)
- Default language, timezone
- Maintenance mode toggle

**Payment Gateways:**
- Razorpay: Key ID, Secret (masked), Webhook secret, Test/Live toggle
- Stripe: Secret key (masked), Webhook secret, Test/Live toggle
- GST/VAT number for invoices

**Plan Limits Editor:**
- Editable table for each plan: responses/month, active surveys, questions/survey, features on/off
- Save updates plan limits in DB and enforce immediately

**Email / SMTP:**
- Provider selector: Resend / SMTP / SendGrid
- Credentials (masked)
- Test email button

**SMS / OTP:**
- MSG91 API key, sender ID
- Test OTP button

**Theme & Branding:**
- Primary colour picker
- Font selector
- Homepage hero background colour
- Email template brand colour + logo

**Security:**
- Session timeout (minutes)
- Max login attempts before lockout
- Password policy: min length, require special chars
- 2FA: enable/disable global enforcement
- IP whitelist for admin panel (optional)

---

## PART 8 — SURVEY BUILDER (DETAILED)

**3-panel layout:**
```
┌──────────────────────────────────────────────────────┐
│  Survey title (editable inline)    [Preview] [Save]  │
├────────────┬─────────────────────┬───────────────────┤
│  QUESTION  │   BUILDER CANVAS    │   LIVE PREVIEW    │
│  PALETTE   │                     │   (phone frame)   │
│            │  ┌──────────────┐   │                   │
│ Short text │  │ Q1 [type]    │   │  [Survey title]   │
│ Long text  │  │ Question...  │   │                   │
│ Choice     │  │ ○ ○ ○  ✎ ✕  │   │  Question 1 text  │
│ Multiple   │  └──────────────┘   │  ○ Option A       │
│ Rating     │                     │  ○ Option B       │
│ Likert     │  ┌──────────────┐   │                   │
│ Matrix     │  │ Q2 [type]    │   │  Question 2 text  │
│ Ranking    │  │ Question...  │   │  [__________]     │
│ Number     │  └──────────────┘   │                   │
│ Date       │                     │  [Next →]         │
│ Email      │  [+ Add question]   │                   │
│ Dropdown   │                     │                   │
│ NPS        │                     │   ↕ Mobile/Desktop│
└────────────┴─────────────────────┴───────────────────┘
```

**Question block interactions:**
- Drag handle on left edge (drag to reorder)
- Click anywhere to open editor drawer
- Type badge (coloured pill)
- Required toggle (star icon)
- Duplicate, delete icons (shown on hover)

**Question editor drawer (slides from right):**
- Question text (textarea, autoresize)
- Question type dropdown (with icon grid selector)
- Required toggle
- Description / helper text
- For choice types: option list with add/remove/reorder
- For rating: scale size, labels (1=Very poor, 5=Excellent)
- For Likert: statement list + scale labels
- For matrix: row questions + column options
- Skip logic: "Show this question only if [Q#] [is/is not/contains] [value]"
- Validation: min/max for number/text, pattern for email

**Survey settings tab:**
- Title, description
- Language (English, Tamil, Hindi)
- Welcome screen: toggle + message
- Thank you screen: toggle + message
- Progress bar: on/off
- Randomise question order: on/off
- One question per page: on/off
- Allow back navigation: on/off

**Auto-save:** Debounced 2s after last change → PATCH `/api/surveys/[id]` — show "Saved" indicator.

---

## PART 9 — AUDIENCE TARGETING ENGINE

Build `components/survey/TargetingFilters.tsx`:

### Demographic Filters:
- Age range: dual-handle slider (18–80)
- Gender: multi-select checkboxes
- Country: searchable multi-select (50+ countries)
- Indian State: shown when India is selected, multi-select
- City tier: Metro / Tier-2 / Tier-3 / Rural
- Occupation: Student / Working professional / Business owner / Homemaker / Retired
- Education: High school / UG / PG / PhD / Professional degree
- Monthly income range: slider in INR brackets
- Language preference: multi-select

### Research-specific Filters (Advanced plan+):
- Industry sector (dropdown: IT, Healthcare, Finance, Education, etc.)
- Job function
- Company size
- "Has prior research experience": Yes/No/Any
- "Owns a smartphone": Yes/No
- Custom screener question (typed, first question in survey)

### Panel Estimator:
Real-time API call as filters change → return estimated available respondents
- Display: "~3,200 respondents match your criteria"
- Warning if < 200: "Narrow targeting may delay collection"
- Estimated days to complete at target response count

### Audience presets:
- Save current filter set with a label
- Load preset in future surveys

---

## PART 10 — RESPONSE COLLECTION & QUALITY ENGINE

**File: `lib/quality-engine.ts`**

Every incoming response at `POST /api/surveys/[id]/responses` runs this pipeline:

### Gate 1 — Duplicate Check
Hash IP + device fingerprint. If same hash already submitted for this survey: reject as DUPLICATE.

### Gate 2 — Speed Trap
If `durationSecs < (survey.estimatedMinutes * 60 * 0.20)`: flag as too fast, reject.

### Gate 3 — Attention Check
If survey contains an attention-check question (e.g. "Select option C"): if answered incorrectly, reject.

### Gate 4 — Consistency Check
If contradictory answers detected in paired validation questions: flag for review.

### Quality Score Calculation:
```typescript
function calculateQualityScore(response: Response): number {
  let score = 1.0;
  if (speedRatioOk)         score -= 0;    else score -= 0.3;
  if (attentionCheckPassed) score -= 0;    else score -= 0.3;
  if (consistent)           score -= 0;    else score -= 0.2;
  if (completionRateOk)     score -= 0;    else score -= 0.2;
  return Math.max(0, score);
}
```

### Decision:
- qualityScore >= 0.6: Accept → `ResponseStatus.COMPLETED`, increment `survey.validCount`
- qualityScore < 0.6: Reject → `ResponseStatus.REJECTED`, decrement `respondent.qualityScore` by 0.1
- respondent.qualityScore < 0.4: auto-suspend respondent

### Auto-close:
When `survey.validCount >= survey.targetResponses`: update `survey.status = COMPLETED`, add to BullMQ `analysis-engine` queue → starts analysis job.

---

## PART 11 — STATISTICAL ANALYSIS ENGINE

**File: `lib/statistics/`**

### Step 1 — Descriptive (`descriptive.ts`)
```typescript
export function computeDescriptive(values: number[]) {
  return {
    count, mean, median, mode, stdDev, variance,
    min, max, range, skewness, kurtosis,
    p25: quantile(0.25), p75: quantile(0.75), iqr,
  };
}
```

### Step 2 — Frequency Analysis
For choice/Likert/dropdown questions:
- Count and percentage per option
- Cumulative frequency
- Mode option

### Step 3 — Cross-tabulation + Chi-Square
For any two categorical variables:
- Observed frequency table
- Expected frequency table
- Chi-square statistic (Σ (O-E)²/E)
- Degrees of freedom = (rows-1)(cols-1)
- p-value from chi-square distribution
- Cramer's V (effect size)
- Interpret: "Significant association" / "No significant association"

### Step 4 — t-Test (`inferential.ts`)
Independent samples t-test:
- t-statistic, degrees of freedom, p-value (two-tailed)
- Cohen's d (effect size)
- 95% CI for mean difference
- Result: reject / fail to reject H₀

### Step 5 — One-Way ANOVA
For 3+ groups:
- F-statistic, p-value
- Eta² (effect size)
- Post-hoc: Tukey HSD for pairwise comparisons (if significant)

### Step 6 — Correlation (`correlation.ts`)
- Pearson r (for normally distributed numeric pairs)
- Spearman ρ (for ordinal or non-normal)
- p-value, 95% CI
- Full correlation matrix for all numeric questions

### Step 7 — Linear Regression (`regression.ts`)
If user designates a dependent variable:
- Coefficients (β) for each predictor
- Standard errors, t-statistics, p-values per coefficient
- R² and adjusted R²
- F-statistic for model significance
- Predicted vs residual plot data

### Step 8 — AI Narrative (`lib/claude.ts`)
```typescript
export async function generateNarrative(
  surveyTitle: string,
  targetAudience: string,
  statisticsJson: object
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: `You are a senior research analyst. Interpret survey statistics and write 
    a structured findings report in formal academic language. Be specific about numbers. 
    Highlight statistical significance. Make it actionable.`,
    messages: [{
      role: 'user',
      content: `
Survey: "${surveyTitle}"
Audience: ${targetAudience}
Statistics: ${JSON.stringify(statisticsJson, null, 2)}

Write a structured narrative with:
1. Executive Summary (3–4 sentences, key number)
2. Key Findings (5–7 bullet points, cite exact statistics)
3. Statistical Significance (which tests were significant at p < 0.05)
4. Demographic Insights (if targeting data available)
5. Implications & Recommendations (3–4 actionable points)
6. Limitations & Notes`
    }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}
```

### Store results in `AnalysisReport.results` JSON:
```json
{
  "meta": { "totalResponses": 847, "validResponses": 821, "completionRate": 96.8, "avgDurationSecs": 312 },
  "questions": [
    {
      "questionId": "q_001",
      "text": "How satisfied are you?",
      "type": "RATING",
      "descriptive": { "mean": 3.7, "stdDev": 0.9, "median": 4 },
      "frequency": { "1": 12, "2": 45, "3": 210, "4": 380, "5": 174 },
      "chart": { "type": "bar", "data": [...] }
    }
  ],
  "crossTabs": [...],
  "hypothesisTests": [...],
  "correlationMatrix": [...],
  "regressionResults": null,
  "aiNarrative": "..."
}
```

---

## PART 12 — ANALYSIS DASHBOARD (RESEARCHER VIEW)

`app/(dashboard)/surveys/[surveyId]/analysis/page.tsx`

### Layout:
1. **Header row**: Survey title, valid responses badge, date, "Re-run analysis" button, "Export report ↓" dropdown
2. **AI Executive Summary card**: Gold accent border, "✨ AI Insights" badge, Claude narrative rendered as markdown
3. **Response overview KPI row**: Total responses, valid responses, completion rate %, avg duration
4. **Per-question result cards** (loop through questions):
   - Question text + type badge
   - Chart (Recharts):
     - Single/multiple choice → horizontal bar chart + percentages
     - Rating → distribution bar (colour-coded 1=red → 5=green)
     - Likert → stacked horizontal bar
     - Number → histogram
     - Text → word cloud
     - Matrix → grouped bar chart
     - NPS → gauge + promoter/passive/detractor breakdown
   - Descriptive stats table (mean, SD, median, mode, range) for numeric types
   - "Download chart (PNG)" button per card
5. **Hypothesis Tests section**: Table of all tests performed (test name, variables, statistic, p-value, result badge: Significant 🟢 / Not significant 🔴)
6. **Correlation Matrix**: Heatmap — blue for positive, red for negative, cell values, hover for exact r value
7. **Regression Results** (if performed): coefficient table, R² value, model equation, significance summary

---

## PART 13 — EXPORT ENGINE

`lib/exporters/`

### PDF Report (`pdf.ts` using pdfmake):
Pages in order:
1. Cover: Logo, survey title, researcher name, date, "Powered by PrimoData Analytics"
2. Table of contents
3. Executive summary (AI narrative first paragraph)
4. Methodology: collection dates, total/valid responses, targeting filters
5. Full AI narrative (all sections)
6. Per-question pages: question text, chart SVG, stats table
7. Hypothesis test results table
8. Correlation matrix table
9. Regression results (if applicable)
10. Appendix: raw frequency tables
- Brand watermark removable on Enterprise+

### Excel Workbook (`excel.ts` using exceljs):
- Sheet 1: Raw responses (row = respondent, col = question)
- Sheet 2: Frequency tables per question (with conditional colour formatting)
- Sheet 3: Descriptive statistics summary table
- Sheet 4: Hypothesis test results
- Sheet 5: Correlation matrix (heatmap cell colouring)
- Sheet 6: Regression coefficients table

### CSV (`csv.ts`):
- Single file: raw response data, UTF-8, comma-delimited

### ZIP (Enterprise+):
- `report.pdf` + `data.xlsx` + `raw_data.csv` + `charts/` folder (PNG per question)

### File storage flow:
1. Generate file in memory
2. Upload to DigitalOcean Spaces: `exports/{userId}/{surveyId}/{format}/{timestamp}.{ext}`
3. Create signed URL (7-day expiry)
4. Store in `Export` table
5. Send "Export Ready" email with download link via Resend

---

## PART 14 — BILLING & SUBSCRIPTIONS (Hybrid Flow)

> Plans are admin-managed (see PART 21). Researchers can self-serve checkout or admins can directly assign.

### Self-Serve Checkout Flow

```
Researcher browses GET /api/v1/public/plans → sees active plans
         ↓
Selects plan → POST /api/v1/subscriptions/checkout { planId, billingCycle }
         ↓
Backend creates Razorpay/Stripe order → returns checkout URL/modal params
         ↓
Researcher pays → webhook fires → POST /api/v1/webhooks/razorpay
         ↓
Subscription created as PENDING_APPROVAL (payment captured but not activated)
         ↓
Admin sees pending subscription in admin panel → clicks "Approve"
  PUT /api/v1/admin/subscriptions/:id/approve
         ↓
Subscription.status = ACTIVE, currentPeriodStart = now()
         ↓
Researcher's features[] now active → UI unlocks tools
```

### Admin Direct Assign Flow

```
Admin goes to user detail → clicks "Assign Plan"
  POST /api/v1/admin/subscriptions/assign { userId, planId, billingCycle }
         ↓
Subscription created as ACTIVE immediately (no payment required)
         ↓
Admin can set custom period or use plan defaults
```

### Razorpay (India, INR)

```typescript
// 1. Create Razorpay order via plans.service → razorpay.service
// 2. Return order_id to frontend → open Razorpay checkout modal
// 3. Webhook: payment.captured → mark payment received
// 4. Admin approval → activate subscription
// Webhooks: payment.captured, subscription.cancelled, subscription.halted
```

### Stripe (International, USD)

```typescript
// 1. Create Stripe Checkout session
// 2. Redirect to Stripe → return to success page
// 3. Webhook: checkout.session.completed → mark payment received
// 4. Admin approval → activate subscription
// Webhooks: invoice.paid, invoice.payment_failed, customer.subscription.deleted
```

### Feature Enforcement (NestJS Guard)

```typescript
// PlanFeatureGuard runs on every feature-gated endpoint
// 1. Get user's active subscription → subscription.plan.features[]
// 2. Check if required feature slug is in features array
// 3. Check usage limits (maxSurveys, maxResponses, maxQuestions)
// 4. Return 403 with clear message: "Upgrade to {plan} to access {feature}"
```

### Billing Dashboard Page (`/dashboard/billing`)

- Current plan card with usage meters (responses, surveys) — progress bars turning red at 80%
- Feature list: ✅/❌ per feature showing what current plan includes
- "Upgrade" CTA if not on max paid tier → links to pricing page
- Plan comparison table (reads from API, not hardcoded)
- Invoice history: date, amount, status, download PDF
- Payment method on file with update card button
- Cancel subscription with grace period explanation

---

## PART 15 — RESPONDENT PORTAL + AUTO-DISTRIBUTION

Separate portal at `/respondent/*` for panel members, with auto-push survey distribution.

### Registration (`/respondent/register`)

1. Name, email, phone, date of birth
2. Demographics: gender, country, state, city, occupation, education, income
3. Send OTP to phone via MSG91
4. Verify OTP → kycStatus = OTP_VERIFIED
5. Email verification → kycStatus = FULL_VERIFIED

### Respondent Dashboard (`/respondent/dashboard`)

- Available surveys (auto-matched by demographics via targeting)
- Completed surveys history
- Quality score badge (Trusted / Good / Warning)
- Incentive balance (₹) + payout history
- Total earnings + pending payouts
- Profile update form (demographics affect which surveys they receive)

### Auto-Push Distribution (BullMQ `survey-dispatch` queue)

```
Researcher launches survey with targeting criteria
         ↓
POST /api/v1/surveys/:id/distribute → adds to survey-dispatch queue
         ↓
Processor: match respondents by demographics (age, gender, location, etc.)
         ↓
Create SurveyInvitation records for each matched respondent
         ↓
Add to notification-jobs queue → send email with survey link
         ↓
Respondent sees survey in dashboard + receives email notification
         ↓
Higher plan = larger panel reach (plan.maxResponses determines target)
```

### Email Distribution (Researcher-initiated)

```
Researcher enters email list → POST /api/v1/surveys/:id/distribute
  Body: { method: "email", emails: ["a@b.com", ...] }
         ↓
Generate unique survey links per email (SurveyInvitation tokens)
         ↓
Queue email sends via BullMQ notification-jobs
         ↓
Track: sent, opened, completed per invitation
```

### Survey Taking (`/respondent/surveys/[id]`)

- Welcome screen (survey title, estimated time, incentive amount)
- One question per page (or all on one — per survey setting)
- Progress bar
- Back navigation (if enabled)
- Mobile-first, touch-friendly inputs
- Submit → thank you screen + incentive credited automatically

### Earnings & Payouts (`/respondent/earnings`)

- Total earnings breakdown: completed surveys × incentive per survey
- Pending payouts (admin-approved batch payouts)
- Payout history with status (pending, processed, paid)
- Minimum payout threshold (configurable in admin settings)

---

## PART 16 — FREE PUBLIC STATISTICS PORTAL

`app/(marketing)/stats/`

### Browse Page:
- Full-width search bar: "Search 10,000+ datasets..."
- Filter sidebar: Category, Region, Year, Source
- Dataset grid (3 cols desktop, 1 col mobile)
- Sort: Most viewed, Newest, Relevance
- Featured datasets row at top

### Dataset Cards show:
- Title, category pill, region, year, source name, chart thumbnail, view count

### Dataset Detail Page (`/stats/[slug]`):
- Title, last updated, source with link
- Methodology note
- Interactive Recharts chart (bar/line/pie based on `chartType`)
- Data table (first 10 rows expandable)
- "Download CSV" button (free, no login)
- Conversion CTA: "Need custom primary data on this topic? → Collect it with PrimoData"
- Related datasets (same category/region)
- Share: copy link, Twitter, LinkedIn

### Admin can:
- Add/edit/delete datasets via `/admin/datasets`
- Upload JSON data, set chart type, toggle featured/published

---

## PART 17 — WHITE LABEL (ENTERPRISE PLAN)

For Enterprise+ users, allow custom branding:
- Upload logo + favicon (stored in DigitalOcean Spaces)
- Set brand primary colour
- Custom domain (CNAME DNS instructions shown)
- Custom "From" email address
- Custom footer text
- Remove "Powered by PrimoData" from reports

Store in `WhiteLabel` model. Middleware checks white-label config and injects brand tokens into the UI.

---

## PART 18 — NOTIFICATIONS SYSTEM

### In-app notifications (bell icon in topbar):
Polling via `GET /api/v1/notifications` (every 30s) + BullMQ notification-jobs queue for email delivery. Each notification has: title, message, type (info/success/warning/error), read status, timestamp.

### Trigger notifications for:
- Survey reaches milestone (25%, 50%, 75%, 100% responses)
- Analysis report complete
- Export file ready
- Payment successful / failed
- Plan limit approaching (80%)
- New Contact Sales lead assigned (Agents)

### Email notifications (Resend):
Each trigger above also sends a transactional email using the matching template from `EmailTemplate` model.

---

## PART 19 — BULLMQ BACKGROUND JOBS

> **BullMQ** (Redis-based queue system) replaces Inngest. All job processors live in `backend/src/jobs/`.

### Queue: `survey-dispatch` → `survey-dispatch.processor.ts`

```
Trigger: POST /api/v1/surveys/:id/distribute (or auto on launch)

1. Fetch survey + targeting filters
2. Match respondents from panel by demographics (Panel_matcher)
3. Create SurveyInvitation records for each matched respondent
4. Add to notification-jobs queue (in-app + email per respondent)
5. Update survey.distributedCount
6. Log: "Survey distributed to {N} respondents"
```

### Queue: `response-quality` → `response-quality.processor.ts`

```
Trigger: POST /api/v1/public/surveys/:id/submit

1. Run 4-gate quality pipeline (duplicate, speed, attention, consistency)
2. Accept or reject response
3. Update survey.validCount
4. Update respondent.qualityScore
5. Check if target reached → add to analysis-engine queue
```

### Queue: `analysis-engine` → `analysis-engine.processor.ts`

```
Trigger: survey.validCount >= survey.targetResponses

1. Update survey status to COMPLETED
2. Create AnalysisReport record (PENDING)
3. Run full statistical engine (descriptive → inferential → correlation → regression)
4. Call Claude API for AI narrative
5. Update AnalysisReport (COMPLETED + results JSON)
6. Add to notification-jobs queue: "Analysis Ready"
```

### Queue: `export-generator` → `export-generator.processor.ts`

```
Trigger: POST /api/v1/exports/:surveyId/generate

1. Mark export PROCESSING
2. Run appropriate exporter (PDF/XLS/CSV/ZIP)
3. Upload to DigitalOcean Spaces
4. Store signed URL in Export record (7-day expiry)
5. Mark READY
6. Add to notification-jobs queue: "Export Ready"
```

### Queue: `notification-jobs` → `notification-jobs.processor.ts`

```
Trigger: Any event requiring user notification

1. Create in-app Notification record
2. Send email via Resend using matching EmailTemplate
3. For respondent survey invites: send email with survey link
```

### Queue: `billing-jobs` → `billing-jobs.processor.ts`

```
Trigger: Cron (1st of each month) + payment events

1. Monthly: reset usage counters for all users
2. On payment.captured: activate subscription, send confirmation
3. On payment.failed: notify user, retry logic
4. On subscription.cancelled: update status, send confirmation
```

---

## PART 20 — SECURITY & COMPLIANCE

- Passwords: bcrypt, salt rounds 12
- API keys: stored as SHA-256 hash, show once on creation, prefix-only stored (e.g. `pd_live_xxxx...`)
- CORS: NestJS CORS whitelist (Vercel frontend domain only)
- CSRF: SameSite cookies + custom header validation on mutations
- Rate limiting (Redis + NestJS ThrottlerModule): auth endpoints 5/min, API 100/min, export 10/min
- Input validation: class-validator + class-transformer on all NestJS DTOs, DOMPurify on rich text
- JWT: access token (15min) + refresh token (7d), httpOnly cookie for refresh
- Respondent PII: email and phone stored as bcrypt hash, never plaintext
- Row-level security: Prisma middleware enforces `userId` scoping on all queries
- GDPR: account deletion cascades all data; export "My Data" option in settings
- Audit logs: every sensitive action logged via AuditLogInterceptor
- HTTPS enforced: Nginx SSL termination + HSTS header
- Session timeout: configurable in admin settings (default 24h)
- Helmet: NestJS helmet middleware for HTTP security headers

---

## PART 21 — ADMIN-MANAGED SUBSCRIPTION PLANS

> **Plans are NOT hardcoded.** Admin creates and edits plans from the admin panel at any time.
> Changes to plan features reflect immediately on all active subscribers.

### Plan Prisma Model (add to schema.prisma)

```prisma
model Plan {
  id              String          @id @default(cuid())
  name            String          @unique    // e.g. "Starter", "Professional", "Enterprise"
  slug            String          @unique    // URL-safe key
  description     String?
  priceInr        Float           @default(0)
  priceUsd        Float           @default(0)
  billingCycle    BillingCycle    @default(MONTHLY)
  isActive        Boolean         @default(true)
  isFeatured      Boolean         @default(false)
  sortOrder       Int             @default(0)
  trialDays       Int             @default(0)

  // Feature flags (editable by admin)
  maxSurveys      Int             @default(1)    // -1 = unlimited
  maxResponses    Int             @default(50)   // per survey
  maxQuestions    Int             @default(10)   // per survey
  features        Json            // Array of enabled feature slugs
  // Example features JSON:
  // ["survey_builder", "basic_analysis", "pdf_export",
  //  "hypothesis_testing", "ai_narrative", "xls_export",
  //  "csv_export", "zip_export", "api_access",
  //  "team_collaboration", "white_label", "custom_branding"]

  maxTeamMembers  Int             @default(0)
  supportLevel    String          @default("community") // community, email, priority, phone, account_manager

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  subscriptions   Subscription[]
}
```

### SurveyInvitation Model (add to schema.prisma)

```prisma
model SurveyInvitation {
  id            String    @id @default(cuid())
  surveyId      String
  respondentId  String
  token         String    @unique @default(cuid())  // shareable URL token
  status        String    @default("pending")       // pending, sent, opened, completed, expired
  sentAt        DateTime?
  openedAt      DateTime?
  completedAt   DateTime?
  createdAt     DateTime  @default(now())

  survey        Survey    @relation(fields: [surveyId], references: [id])
  respondent    Respondent @relation(fields: [respondentId], references: [id])

  @@unique([surveyId, respondentId])
}
```

### Admin Plan Management Flow

```
Admin creates plan → sets name, pricing, feature toggles, limits
         ↓
Researcher browses plans → selects → pays (Razorpay/Stripe)
         ↓
Subscription created as PENDING_APPROVAL
         ↓
Admin reviews → approves → status = ACTIVE → features unlock
         ↓
Researcher dashboard dynamically renders tools based on plan.features[]
         ↓
Admin edits plan features at any time → changes reflect immediately
         ↓
Admin can also directly assign any plan to any user (override)
```

### Feature Gating Logic (Frontend)

```typescript
// lib/plan-context.tsx — wraps the app
export function usePlan() {
  // Fetches GET /api/v1/subscriptions/current
  // Returns: { plan, features: string[], limits, usage }
}

// Usage in sidebar:
const { features } = usePlan();
if (features.includes('hypothesis_testing')) showHypothesisNav();
if (features.includes('api_access')) showApiKeysNav();
if (features.includes('team_collaboration')) showTeamNav();
```

### Feature Gating Logic (Backend — NestJS Guard)

```typescript
// common/guards/plan-feature.guard.ts
@Injectable()
export class PlanFeatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.get<string>('plan_feature', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    return user.subscription?.plan?.features?.includes(requiredFeature);
  }
}

// Usage in controller:
@PlanFeature('hypothesis_testing')
@Get('hypothesis')
async getHypothesisTests() { ... }
```

### Default Seed Plans (admin can change at any time)

| Field | Starter | Professional | Enterprise |
|-------|---------|-------------|------------|
| Max surveys | 1 | 5 | 20 |
| Max responses | 50 | 1,000 | 10,000 |
| Max questions | 10 | 50 | 200 |
| Basic analysis | ✅ | ✅ | ✅ |
| Hypothesis testing | ❌ | ✅ | ✅ |
| AI narrative | ❌ | ✅ | ✅ |
| PDF export | ✅ | ✅ | ✅ |
| XLS/CSV export | ❌ | ✅ | ✅ |
| ZIP bundle | ❌ | ❌ | ✅ |
| API access | ❌ | ❌ | ✅ |
| Team members | 0 | 0 | 10 |
| White label | ❌ | ❌ | ✅ |
| Support | Community | Email | Phone |
| Price (INR/mo) | ₹0 | Admin-set | Admin-set |
| Price (USD/mo) | $0 | Admin-set | Admin-set |

---

## PART 22 — ENVIRONMENT VARIABLES

### Frontend (`frontend/.env.local`)

```env
# API
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"  # → https://api.primodata.io/api/v1 in prod
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="PrimoData Analytics"

# Payment (client-side key only)
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
NEXT_PUBLIC_STRIPE_KEY=""

# Monitoring
SENTRY_DSN=""
NEXT_PUBLIC_POSTHOG_KEY=""
```

### Backend (`backend/.env`)

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"  # CORS whitelist

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/primodata"

# Auth (JWT)
JWT_SECRET="your-jwt-secret-min-32-chars"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Redis (BullMQ + cache)
REDIS_URL="redis://localhost:6379"

# Storage (DigitalOcean Spaces — S3-compatible)
DO_SPACES_ENDPOINT="https://sgp1.digitaloceanspaces.com"
DO_SPACES_BUCKET="primodata-files"
DO_SPACES_KEY=""
DO_SPACES_SECRET=""
DO_SPACES_CDN_URL="https://primodata-files.sgp1.cdn.digitaloceanspaces.com"

# Payments
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# AI
ANTHROPIC_API_KEY=""

# Email
RESEND_API_KEY=""
EMAIL_FROM="noreply@primodata.io"

# SMS / OTP
MSG91_API_KEY=""
MSG91_SENDER_ID="PRIMDT"

# Monitoring
SENTRY_DSN=""
```

---

## PART 23 — AUTH & MIDDLEWARE

### Backend (NestJS Guards — server-side enforcement)

```typescript
// All protected endpoints use @UseGuards(JwtAuthGuard)
// Role-specific endpoints add @Roles('SUPERADMIN', 'MANAGER')
// Feature-gated endpoints add @PlanFeature('hypothesis_testing')

// Guard execution order:
// 1. JwtAuthGuard → validates Bearer token, attaches user to request
// 2. RolesGuard → checks user.role against required roles
// 3. PlanFeatureGuard → checks user.subscription.plan.features against required feature
```

### Frontend (Next.js middleware — client-side routing)

```typescript
// middleware.ts (Next.js)
// 1. Redirect unauthenticated to /login for /dashboard/*, /admin/*, /respondent/*
// 2. For /admin/*: check JWT payload role is SUPERADMIN | MANAGER | AGENT
// 3. For /respondent/*: check JWT payload role is RESPONDENT
// 4. For feature-gated pages (e.g. /dashboard/analysis): check plan context
// 5. Pass through for all /(marketing)/* routes (public)
// Note: Backend guards are the true enforcement — frontend is UX-only
```

---

## PART 24 — ANTIGRAVITY BUILD ORDER (NestJS + Next.js Split)

> Build in this exact phase order — **backend first, frontend connects after**.

```
PHASE 1 — NESTJS FOUNDATION (Days 1–3)
□ NestJS scaffold + TypeScript config + Swagger setup
□ Prisma schema + PostgreSQL migration (all models)
□ Redis + BullMQ connection + queue registration
□ Auth module: register, login, JWT (access + refresh), guards
□ RolesGuard + PlanFeatureGuard + ResponseInterceptor ({ data: ... } envelope)
□ Seed script: default admin user + 3 default plans (Starter, Professional, Enterprise)
□ Frontend: connect existing auth-context.tsx + api.ts to NestJS base URL

PHASE 2 — ADMIN PANEL + PLAN MANAGEMENT (Days 4–6)
□ Admin module: metrics, user CRUD, settings
□ Plans module: CRUD (name, pricing, features[], limits, toggles)
□ Subscriptions module: list, approve, reject, assign
□ Admin frontend pages: plans CRUD, subscription management
□ Connect admin sidebar to plan management pages

PHASE 3 — SURVEY CRUD + BUILDER (Days 7–10)
□ Surveys module: CRUD, questions, targeting, launch, pause
□ Survey builder frontend (existing components connect to NestJS)
□ Distribute endpoint: match respondents + queue survey-dispatch job
□ BullMQ: survey-dispatch processor (create invitations, send emails)
□ Public survey endpoint: GET /public/surveys/:id + POST submit

PHASE 4 — RESPONDENT SYSTEM + DISTRIBUTION (Days 11–14)
□ Respondents module: registration, KYC, panel management
□ Auto-push: BullMQ matches targeting → sends invitations → email notification
□ Email distribution: researcher enters email list → queue sends survey links
□ Respondent portal frontend: dashboard, take survey, history
□ Respondent earnings/payouts page
□ BullMQ: response-quality processor (4-gate pipeline)

PHASE 5 — ANALYSIS ENGINE + EXPORTS (Days 15–18)
□ Analysis module: statistical engine (descriptive → inferential → correlation → regression)
□ Claude AI narrative integration
□ Analysis dashboard frontend (charts + AI card)
□ Exports module: PDF, XLS, CSV, ZIP generators
□ Upload exports to DigitalOcean Spaces (signed URLs)
□ BullMQ: analysis-engine + export-generator processors

PHASE 6 — BILLING + FEATURE ENFORCEMENT (Days 19–21)
□ Billing module: Razorpay integration + webhook handler
□ Billing module: Stripe integration + webhook handler
□ Subscription checkout flow: select plan → pay → PENDING → admin approve
□ Feature enforcement: PlanFeatureGuard on all gated endpoints
□ Frontend plan-context.tsx: sidebar/components conditionally render by plan.features[]
□ Usage tracking + monthly reset (BullMQ cron job)
□ Discount code system

PHASE 7 — MARKETING SITE + PUBLIC DATASETS (Days 22–25)
□ Homepage (all sections)
□ Pricing page (reads plans from API, not hardcoded)
□ Contact page + lead capture
□ Free public statistics portal (/stats)
□ Dataset detail page with interactive charts
□ CMS module: page builder, menu builder, media library
□ Leads CRM module

PHASE 8 — POLISH + DEPLOY (Days 26–30)
□ DigitalOcean Droplet setup: Ubuntu 22.04 + PM2 + Nginx + SSL
□ PostgreSQL on DO Managed Database
□ Redis on DO (or self-hosted)
□ DigitalOcean Spaces bucket creation + CDN
□ Frontend deploy to Vercel + env vars
□ Domain mapping: primodata.io → Vercel, api.primodata.io → DO
□ Email templates (Resend transactional)
□ Notification system (in-app + email via BullMQ)
□ SEO: meta tags, OG images, sitemap.xml
□ Sentry error monitoring + Posthog analytics
□ Security audit (OWASP checklist)
□ Seed database (50 public datasets + demo accounts)
□ Performance audit (Core Web Vitals)
```

---

## DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        DNS (Cloudflare)                         │
│  primodata.io → Vercel     api.primodata.io → DO Droplet       │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
       ┌───────▼───────┐             ┌────────▼────────┐
       │    Vercel      │             │   DigitalOcean   │
       │   Next.js 14   │◄── API ───►│   Droplet (2GB)  │
       │   (Frontend)   │  requests  │   Ubuntu 22.04   │
       │                │             │   PM2 + Nginx    │
       └───────────────┘             │   NestJS         │
                                      └───┬────┬────┬───┘
                                          │    │    │
                              ┌───────────┘    │    └──────────┐
                              │                │               │
                    ┌─────────▼──┐   ┌────────▼─────┐  ┌──────▼──────┐
                    │ PostgreSQL  │   │    Redis      │  │ DO Spaces   │
                    │  (DO Mgd)   │   │  (BullMQ +   │  │ (S3 files)  │
                    │             │   │   cache)      │  │             │
                    └────────────┘   └──────────────┘  └─────────────┘
```

### Deployment Steps

1. **DO Droplet**: Create 2GB Ubuntu 22.04, install Node 20 + PM2 + Nginx
2. **PostgreSQL**: DO Managed Database (auto-backups)
3. **Redis**: Install on Droplet or DO Managed Redis
4. **DO Spaces**: Create bucket `primodata-files`, enable CDN
5. **Nginx**: Reverse proxy port 3001 → `api.primodata.io`, SSL via Let's Encrypt
6. **PM2**: `pm2 start dist/main.js --name primodata-api -i max`
7. **Vercel**: Deploy frontend, set `NEXT_PUBLIC_API_URL=https://api.primodata.io/api/v1`
8. **DNS**: A record for `api.primodata.io` → Droplet IP, CNAME for `primodata.io` → Vercel

---

## PART 25 — FOCUSED SUB-PROMPTS FOR ANTIGRAVITY

Use these targeted prompts after the initial scaffold:

**Survey Builder:**
```
Build SurveyBuilder.tsx with @dnd-kit/core. Implement a 3-panel layout:
left panel = QuestionPalette with all 15 question types as draggable tiles,
centre = canvas with droppable question list, right = SurveyPreviewPane
inside a phone frame. Each QuestionBlock shows order number, type badge,
inline-editable text, required toggle, duplicate + delete icons on hover.
Clicking a block opens QuestionEditorDrawer from the right. 
Connect to Zustand surveyBuilderStore. Auto-save via debounced PATCH 
/api/surveys/[id] 2 seconds after last change.
```

**Statistical Engine:**
```
Build lib/statistics/inferential.ts. Implement:
1. Independent samples t-test: t-statistic, df, p-value (two-tailed), Cohen's d
2. One-way ANOVA: F-statistic, p-value, eta-squared, 
   Tukey HSD post-hoc for significant results
3. Chi-square test of independence: χ², df, p-value, Cramer's V
4. Mann-Whitney U test as non-parametric alternative
All functions return { statistic, df, pValue, effectSize, significant: boolean, interpretation: string }
```

**AI Analysis Narrative:**
```
Build lib/claude.ts. Call Anthropic API (claude-sonnet-4-20250514).
System prompt: senior research analyst writing academic findings.
User message includes: survey title, target audience, full statistics JSON.
Request a structured 5-section report: Executive Summary, Key Findings,
Statistical Significance, Implications & Recommendations, Limitations.
Return the text. Handle errors gracefully with fallback message.
```

**Rise-style Admin Dashboard:**
```
Build app/(admin)/admin/page.tsx. Model layout after Rise CRM dashboard.
Dark sidebar, white content area. Show draggable metric widgets:
Total users, MRR (₹), Active subscriptions donut chart, Surveys launched,
Responses collected, Panel size. Below: Recent registrations table and
Recent payments table. Fetch data from GET /api/admin/metrics.
All metric cards show: value, trend arrow, percentage change vs last month.
```

**Razorpay Billing:**
```
Build the Razorpay subscription flow.
1. POST /api/billing/subscribe: create Razorpay subscription, return order_id
2. Frontend: open Razorpay checkout modal on plan select
3. On payment.captured webhook: update Subscription table, 
   send PlanUpgrade email, log to AuditLog
4. On subscription.cancelled webhook: set status=CANCELLED, 
   set cancelledAt, send confirmation email
5. Billing page: show current plan, usage progress bars, 
   invoice history table with PDF download
```

**Export PDF:**
```
Build lib/exporters/pdf.ts using pdfmake.
Generate a professional research report with:
- Cover page: PrimoData logo, survey title, researcher name, date
- Table of contents
- Full AI narrative (markdown rendered as formatted text)
- Per-question pages: question text, chart rendered as SVG, stats table
- Hypothesis test results table
- Correlation matrix
Upload to DigitalOcean Spaces, return 7-day signed URL.
Store in Export model. Trigger AnalysisReadyEmail via Resend.
```

---

*PrimoData Analytics — Antigravity Master Build Prompt*
*Version 1.0 | All rights reserved | Tamil Nadu launch*
