# PrimoData Analytics — Full Enterprise Application
## Master Cursor AI Build Prompt

PrimoData Analytics is a powerful SaaS platform designed to solve a critical challenge in research by providing authentic primary data collection and statistical analysis services. The vision is to build the world’s most trusted platform for research scholars, college students, industry professionals, market researchers, and political analysts, starting from Tamil Nadu and expanding globally. The core problem is that many researchers, students, and analysts often skip proper ground work or fail to collect genuine primary data, resulting in widespread use of fake data. This leads to poor research quality, unreliable analysis, and findings that offer no real value to anyone. To address this, PrimoData Analytics offers an end-to-end solution where users simply access the application, create their custom questionnaires, and launch surveys. The platform then automatically collects real primary data from a verified global respondent panel, processes it through advanced statistical analysis, and delivers clear insights via a secure user dashboard. From there, users can instantly download reports in multiple formats such as XLS, PDF, CSV, or ZIP. The main objective of the platform is to collect authentic, high-quality primary data at scale, with everything else — including analysis, dashboards, and exports — built around this goal. It targets research scholars pursuing PhD or MPhil programs, college students working on UG or PG projects, industry analysts, market researchers, political analysts, NGOs, and think tanks. The platform operates through a smooth flow: researchers register and choose a subscription plan, create their questionnaire, launch it to the global verified respondent panel, collect real responses automatically, run AI-powered statistical analysis including charts, tables, and hypothesis testing, view results in a secure dashboard, and finally download the required files. Revenue is generated through a clear subscription model with four tiers for example  — Basic at ₹499 per month for students and small projects, Advanced at ₹1,499 per month for research scholars and startups, Enterprise at ₹4,999 and above for universities and large organizations, and custom Contact Sales for corporates and government projects. Additionally, the homepage features free worldwide and India-specific statistical data similar to Statista.com, which helps attract visitors, build trust, and convert them into paying users who need customized primary data solutions.

---

## 1. PROJECT OVERVIEW & MISSION

Build **PrimoData Analytics** — a full-stack SaaS platform that solves the global fake-data crisis in academic and market research. The platform enables researchers, students, analysts, NGOs, and enterprises to create surveys, collect authentic primary data from a verified global respondent panel, run AI-powered statistical analysis, and download professional research reports.

**Core promise:** Every data point is real, verified, and traceable.

**Target users:**
- PhD / MPhil research scholars
- UG / PG college students (project work)
- Industry and market researchers
- Political analysts and campaign managers
- NGOs and think tanks
- Corporate strategy teams
- Government research departments

**Launch market:** Tamil Nadu, India → Pan-India → Global

---

## 2. TECH STACK

### Frontend
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui component library
- **State management:** Zustand (global) + React Query / TanStack Query (server state)
- **Charts:** Recharts + Chart.js for statistical visualisations
- **Forms:** React Hook Form + Zod validation
- **Drag & drop:** @dnd-kit/core (survey builder)
- **Rich text:** TipTap editor (survey instructions)
- **PDF rendering:** react-pdf
- **Internationalisation:** next-intl (Tamil, Hindi, English)
- **Animations:** Framer Motion

### Backend
- **Runtime:** Node.js with Next.js API Routes (App Router route handlers)
- **Database ORM:** Prisma
- **Primary database:** PostgreSQL (via Supabase)
- **Cache layer:** Redis (via Upstash) — session cache, rate limiting, queue
- **File storage:** Supabase Storage (report files, exports)
- **Background jobs:** Inngest (survey dispatch, analysis jobs)
- **Authentication:** NextAuth.js v5 with JWT + OAuth (Google, GitHub)
- **Email:** Resend (transactional emails)
- **Payments:** Razorpay (INR) + Stripe (international)

### AI & Analysis
- **LLM:** Anthropic Claude API (claude-sonnet-4-20250514) — narrative generation, insight summaries
- **Statistics:** mathjs + custom statistical engine (TypeScript)
- **Data export:** exceljs (XLS), pdfmake (PDF), papaparse (CSV), archiver (ZIP)

### DevOps & Infrastructure
- **Hosting:** Vercel (frontend + API routes)
- **Database:** Supabase (Postgres + Storage + Realtime)
- **Monitoring:** Sentry + Vercel Analytics
- **CI/CD:** GitHub Actions
- **Environment secrets:** Vercel Environment Variables

---

## 3. DATABASE SCHEMA (Prisma)

Create `prisma/schema.prisma` with the following models:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USERS & AUTH ───────────────────────────────────────────────

model User {
  id                String         @id @default(cuid())
  email             String         @unique
  name              String
  avatarUrl         String?
  role              UserRole       @default(RESEARCHER)
  emailVerified     DateTime?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  subscription      Subscription?
  surveys           Survey[]
  apiKeys           ApiKey[]
  teamMemberships   TeamMember[]
  accounts          Account[]
  sessions          Session[]
  usageLog          UsageLog[]
}

enum UserRole {
  RESEARCHER
  ADMIN
  SUPERADMIN
  RESPONDENT
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
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ─── SUBSCRIPTIONS & BILLING ────────────────────────────────────

model Subscription {
  id                String             @id @default(cuid())
  userId            String             @unique
  plan              PlanTier
  status            SubscriptionStatus @default(ACTIVE)
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  razorpaySubId     String?
  stripeSubId       String?
  cancelAtPeriodEnd Boolean            @default(false)
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  user              User               @relation(fields: [userId], references: [id])
  invoices          Invoice[]
}

enum PlanTier {
  FREE
  BASIC
  ADVANCED
  ENTERPRISE
  CUSTOM
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  TRIALING
  PAUSED
}

model Invoice {
  id             String       @id @default(cuid())
  subscriptionId String
  amount         Float
  currency       String       @default("INR")
  status         String
  paidAt         DateTime?
  invoiceUrl     String?
  createdAt      DateTime     @default(now())
  subscription   Subscription @relation(fields: [subscriptionId], references: [id])
}

// ─── TEAMS ──────────────────────────────────────────────────────

model Team {
  id        String       @id @default(cuid())
  name      String
  slug      String       @unique
  createdAt DateTime     @default(now())
  members   TeamMember[]
  surveys   Survey[]
}

model TeamMember {
  id       String   @id @default(cuid())
  teamId   String
  userId   String
  role     TeamRole @default(MEMBER)
  joinedAt DateTime @default(now())
  team     Team     @relation(fields: [teamId], references: [id])
  user     User     @relation(fields: [userId], references: [id])
  @@unique([teamId, userId])
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// ─── SURVEYS ────────────────────────────────────────────────────

model Survey {
  id               String        @id @default(cuid())
  title            String
  description      String?
  status           SurveyStatus  @default(DRAFT)
  targetResponses  Int           @default(100)
  collectedCount   Int           @default(0)
  userId           String
  teamId           String?
  targeting        Json?
  estimatedMinutes Int           @default(5)
  language         String        @default("en")
  startsAt         DateTime?
  endsAt           DateTime?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  user             User          @relation(fields: [userId], references: [id])
  team             Team?         @relation(fields: [teamId], references: [id])
  questions        Question[]
  responses        Response[]
  analysisReports  AnalysisReport[]
  exports          Export[]
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
  id           String       @id @default(cuid())
  surveyId     String
  order        Int
  type         QuestionType
  text         String
  description  String?
  required     Boolean      @default(true)
  options      Json?
  validation   Json?
  logic        Json?
  createdAt    DateTime     @default(now())

  survey       Survey       @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  answers      Answer[]
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
}

// ─── RESPONDENTS & RESPONSES ────────────────────────────────────

model Respondent {
  id             String       @id @default(cuid())
  email          String?
  phoneHash      String?
  verifiedAt     DateTime?
  kycStatus      KYCStatus    @default(PENDING)
  demographics   Json
  qualityScore   Float        @default(1.0)
  totalSurveys   Int          @default(0)
  rejectedCount  Int          @default(0)
  country        String?
  region         String?
  createdAt      DateTime     @default(now())
  responses      Response[]
}

enum KYCStatus {
  PENDING
  VERIFIED
  REJECTED
  SUSPENDED
}

model Response {
  id            String      @id @default(cuid())
  surveyId      String
  respondentId  String
  status        ResponseStatus @default(PENDING)
  qualityFlags  Json?
  completedAt   DateTime?
  durationSecs  Int?
  ipHash        String?
  deviceHash    String?
  createdAt     DateTime    @default(now())

  survey        Survey      @relation(fields: [surveyId], references: [id])
  respondent    Respondent  @relation(fields: [respondentId], references: [id])
  answers       Answer[]
}

enum ResponseStatus {
  PENDING
  COMPLETED
  REJECTED
  FLAGGED
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

// ─── ANALYSIS ───────────────────────────────────────────────────

model AnalysisReport {
  id            String         @id @default(cuid())
  surveyId      String
  status        AnalysisStatus @default(PENDING)
  results       Json?
  aiNarrative   String?
  createdAt     DateTime       @default(now())
  completedAt   DateTime?

  survey        Survey         @relation(fields: [surveyId], references: [id])
  exports       Export[]
}

enum AnalysisStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}

// ─── EXPORTS ────────────────────────────────────────────────────

model Export {
  id          String       @id @default(cuid())
  surveyId    String
  reportId    String?
  format      ExportFormat
  fileUrl     String?
  status      ExportStatus @default(PENDING)
  createdAt   DateTime     @default(now())

  survey      Survey       @relation(fields: [surveyId], references: [id])
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
}

// ─── FREE PUBLIC STATS PORTAL ───────────────────────────────────

model PublicDataset {
  id          String   @id @default(cuid())
  title       String
  category    String
  region      String
  description String
  data        Json
  source      String
  year        Int
  tags        String[]
  featured    Boolean  @default(false)
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ─── API KEYS ───────────────────────────────────────────────────

model ApiKey {
  id          String    @id @default(cuid())
  userId      String
  name        String
  keyHash     String    @unique
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())
  user        User      @relation(fields: [userId], references: [id])
}

// ─── USAGE & AUDIT ──────────────────────────────────────────────

model UsageLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  metadata  Json?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## 4. PROJECT FOLDER STRUCTURE

```
primodata/
├── app/
│   ├── (marketing)/                  # Public marketing site
│   │   ├── page.tsx                  # Homepage with hero, features, pricing
│   │   ├── pricing/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── stats/                    # Free public statistics portal
│   │       ├── page.tsx              # Browse datasets (Statista-like)
│   │       └── [datasetId]/page.tsx  # Individual dataset viewer
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── verify-email/page.tsx
│   │   └── forgot-password/page.tsx
│   │
│   ├── (dashboard)/                  # Protected researcher dashboard
│   │   ├── layout.tsx                # Sidebar + topbar layout
│   │   ├── dashboard/page.tsx        # Overview: surveys, responses, usage
│   │   ├── surveys/
│   │   │   ├── page.tsx              # Survey list
│   │   │   ├── new/page.tsx          # Create survey wizard
│   │   │   └── [surveyId]/
│   │   │       ├── page.tsx          # Survey overview + live stats
│   │   │       ├── builder/page.tsx  # Drag-and-drop question builder
│   │   │       ├── targeting/page.tsx # Audience targeting filters
│   │   │       ├── launch/page.tsx   # Review & launch to panel
│   │   │       ├── responses/page.tsx # Raw response viewer
│   │   │       ├── analysis/page.tsx  # AI statistical analysis results
│   │   │       └── export/page.tsx   # Download reports
│   │   ├── reports/page.tsx          # All generated reports
│   │   ├── team/page.tsx             # Team management (Enterprise)
│   │   ├── billing/page.tsx          # Subscription + invoices
│   │   ├── api-keys/page.tsx         # API key management
│   │   └── settings/page.tsx         # Profile + preferences
│   │
│   ├── (admin)/                      # Superadmin panel
│   │   ├── layout.tsx
│   │   ├── admin/page.tsx
│   │   ├── admin/users/page.tsx
│   │   ├── admin/respondents/page.tsx
│   │   ├── admin/surveys/page.tsx
│   │   ├── admin/datasets/page.tsx
│   │   └── admin/revenue/page.tsx
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── surveys/
│       │   ├── route.ts              # GET list, POST create
│       │   └── [surveyId]/
│       │       ├── route.ts          # GET, PATCH, DELETE
│       │       ├── questions/route.ts
│       │       ├── launch/route.ts
│       │       ├── responses/route.ts
│       │       ├── analysis/route.ts # Trigger AI analysis job
│       │       └── export/route.ts
│       ├── respondents/
│       │   ├── route.ts
│       │   └── [respondentId]/verify/route.ts
│       ├── billing/
│       │   ├── subscribe/route.ts
│       │   ├── portal/route.ts
│       │   └── webhook/route.ts      # Razorpay + Stripe webhooks
│       ├── datasets/route.ts         # Public stats datasets
│       ├── admin/route.ts
│       └── inngest/route.ts          # Background job handler
│
├── components/
│   ├── ui/                           # shadcn/ui base components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── MarketingNav.tsx
│   │   └── Footer.tsx
│   ├── survey/
│   │   ├── SurveyBuilder.tsx         # Main drag-and-drop builder
│   │   ├── QuestionBlock.tsx         # Individual question card
│   │   ├── QuestionEditor.tsx        # Edit question properties
│   │   ├── QuestionTypeSelector.tsx  # Grid of question types
│   │   ├── LogicBranchEditor.tsx     # Conditional display logic
│   │   ├── SurveyPreview.tsx         # Live mobile preview
│   │   └── TargetingFilters.tsx      # Audience demographic filters
│   ├── analysis/
│   │   ├── AnalysisDashboard.tsx     # Full analysis results view
│   │   ├── DescriptiveStats.tsx      # Mean, median, SD cards
│   │   ├── FrequencyChart.tsx        # Bar/pie for choice questions
│   │   ├── HypothesisResult.tsx      # t-test / ANOVA result card
│   │   ├── CorrelationMatrix.tsx     # Heatmap grid
│   │   ├── CrossTabulation.tsx       # Chi-square table
│   │   ├── AIInsightCard.tsx         # Claude-generated narrative
│   │   └── WordCloud.tsx             # Open-text word cloud
│   ├── dashboard/
│   │   ├── StatsOverview.tsx         # Response count, completion rate
│   │   ├── SurveyCard.tsx
│   │   ├── UsageGauge.tsx            # Plan limits gauge
│   │   └── RecentActivity.tsx
│   ├── billing/
│   │   ├── PricingTable.tsx          # Public pricing cards
│   │   ├── PlanBadge.tsx
│   │   └── InvoiceList.tsx
│   └── public/
│       ├── DatasetCard.tsx
│       ├── DatasetViewer.tsx          # Chart viewer for free datasets
│       └── SearchBar.tsx
│
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # NextAuth config
│   ├── redis.ts                      # Upstash Redis client
│   ├── supabase.ts                   # Supabase storage client
│   ├── razorpay.ts                   # Razorpay client
│   ├── stripe.ts                     # Stripe client
│   ├── resend.ts                     # Email client
│   ├── claude.ts                     # Anthropic Claude client
│   ├── inngest.ts                    # Inngest client + functions
│   └── statistics/
│       ├── descriptive.ts            # Mean, median, SD, mode, skew
│       ├── inferential.ts            # t-test, ANOVA, chi-square
│       ├── regression.ts             # Linear, logistic regression
│       ├── correlation.ts            # Pearson, Spearman
│       └── index.ts                  # Orchestrator
│
├── hooks/
│   ├── useSurvey.ts
│   ├── useAnalysis.ts
│   ├── useSubscription.ts
│   └── useExport.ts
│
├── stores/
│   ├── surveyBuilderStore.ts         # Zustand store for builder state
│   └── uiStore.ts
│
├── types/
│   ├── survey.ts
│   ├── analysis.ts
│   ├── billing.ts
│   └── respondent.ts
│
├── emails/                           # Resend email templates (React Email)
│   ├── WelcomeEmail.tsx
│   ├── SurveyLaunchedEmail.tsx
│   ├── AnalysisReadyEmail.tsx
│   └── InvoiceEmail.tsx
│
├── constants/
│   ├── plans.ts                      # Plan limits and feature flags
│   ├── questionTypes.ts
│   └── targetingOptions.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── middleware.ts                     # Auth + plan gating middleware
├── next.config.ts
├── tailwind.config.ts
└── .env.local
```

---

## 5. ENVIRONMENT VARIABLES

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Supabase
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Payments
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""

# AI
ANTHROPIC_API_KEY=""

# Email
RESEND_API_KEY=""
EMAIL_FROM="noreply@primodata.io"

# Background Jobs
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="PrimoData Analytics"
```

---

## 6. PLAN LIMITS & FEATURE FLAGS

Create `constants/plans.ts`:

```typescript
export const PLAN_LIMITS = {
  FREE: {
    maxActiveSurveys: 1,
    maxResponsesPerMonth: 50,
    maxQuestionsPerSurvey: 10,
    hypothesisTesting: false,
    regressionAnalysis: false,
    aiNarrative: false,
    exportFormats: ['PDF'],
    teamMembers: 0,
    apiAccess: false,
    whiteLabel: false,
    targetingFilters: 'basic',
    support: 'community',
    price_inr: 0,
    price_usd: 0,
    label: 'Free',
  },
  BASIC: {
    maxActiveSurveys: 1,
    maxResponsesPerMonth: 200,
    maxQuestionsPerSurvey: 20,
    hypothesisTesting: false,
    regressionAnalysis: false,
    aiNarrative: false,
    exportFormats: ['PDF'],
    teamMembers: 0,
    apiAccess: false,
    whiteLabel: false,
    targetingFilters: 'basic',
    support: 'email',
    price_inr: 499,
    price_usd: 6,
    label: 'Basic',
  },
  ADVANCED: {
    maxActiveSurveys: 5,
    maxResponsesPerMonth: 1000,
    maxQuestionsPerSurvey: 50,
    hypothesisTesting: true,
    regressionAnalysis: true,
    aiNarrative: true,
    exportFormats: ['PDF', 'XLS', 'CSV'],
    teamMembers: 0,
    apiAccess: false,
    whiteLabel: false,
    targetingFilters: 'advanced',
    support: 'priority_email',
    price_inr: 1499,
    price_usd: 18,
    label: 'Advanced',
  },
  ENTERPRISE: {
    maxActiveSurveys: 20,
    maxResponsesPerMonth: 10000,
    maxQuestionsPerSurvey: 200,
    hypothesisTesting: true,
    regressionAnalysis: true,
    aiNarrative: true,
    exportFormats: ['PDF', 'XLS', 'CSV', 'ZIP'],
    teamMembers: 10,
    apiAccess: false,
    whiteLabel: true,
    targetingFilters: 'full',
    support: 'phone_email',
    price_inr: 4999,
    price_usd: 60,
    label: 'Enterprise',
  },
  CUSTOM: {
    maxActiveSurveys: -1,
    maxResponsesPerMonth: -1,
    maxQuestionsPerSurvey: -1,
    hypothesisTesting: true,
    regressionAnalysis: true,
    aiNarrative: true,
    exportFormats: ['PDF', 'XLS', 'CSV', 'ZIP', 'JSON'],
    teamMembers: -1,
    apiAccess: true,
    whiteLabel: true,
    targetingFilters: 'custom',
    support: 'account_manager',
    price_inr: -1,
    price_usd: -1,
    label: 'Custom',
  },
} as const;
```

---

## 7. HOMEPAGE (Marketing Site)

**File: `app/(marketing)/page.tsx`**

Build a world-class SaaS marketing homepage with these sections in order:

### 7.1 Navigation
- Logo: "PrimoData Analytics" with a data-wave SVG icon
- Nav links: Features, Pricing, Free Stats, About, Contact
- CTA buttons: "Sign In" (ghost) and "Start Free" (primary, filled)
- Sticky on scroll, white background with border-bottom

### 7.2 Hero Section
- Badge: "Trusted primary data for serious research"
- Headline (large, bold): "The world's most trusted platform for authentic research data"
- Sub-headline: "Create surveys. Collect real verified responses from our global panel. Get AI-powered statistical analysis. Download in minutes."
- Two CTAs: "Start for free" and "See how it works →"
- Hero illustration: Abstract diagram of survey → panel → analysis → report flow (use SVG shapes, not images)
- Trust indicators row: "10,000+ researchers", "50+ countries", "99.2% data authenticity rate"

### 7.3 Problem → Solution
- Left side: "The fake data crisis" — describe how 68% of student research uses fabricated or borrowed data
- Right side: PrimoData's verified panel solution with a 4-step visual

### 7.4 How It Works (3 steps)
1. Design your survey (drag-and-drop builder)
2. Launch to verified global panel (automated collection)
3. Download AI-powered analysis report (PDF/XLS/CSV)

### 7.5 Feature Grid (6 cards)
- Verified Respondent Panel
- AI Statistical Analysis (Claude-powered)
- Real-time Dashboard
- Multi-format Report Export
- Hypothesis Testing & Regression
- Free Public Statistics Portal

### 7.6 Free Stats Portal CTA
- "Explore 10,000+ free datasets" section
- Grid of 6 sample dataset cards (India GDP, population, election data etc.)
- Link to /stats portal

### 7.7 Pricing Section
- Render the `<PricingTable />` component
- Annual/monthly toggle (20% annual discount)
- FAQ accordion below pricing

### 7.8 Testimonials
- 3 quote cards: PhD scholar, market researcher, NGO analyst

### 7.9 CTA Footer Banner
- "Start collecting real data today. Free forever plan available."
- "Start Free" and "Contact Sales" buttons

### 7.10 Footer
- Logo, description, links (Features, Pricing, Blog, Docs, Privacy, Terms)
- Social links, "Made in Tamil Nadu" badge

---

## 8. FREE PUBLIC STATISTICS PORTAL

**File: `app/(marketing)/stats/page.tsx`**

This is the organic traffic engine. Build a Statista-style public data portal:

### Features:
- Search bar (full-text search across dataset titles, tags, categories)
- Filter sidebar: Category (Economics, Demographics, Education, Health, Politics, Agriculture), Region (India, Tamil Nadu, World, Asia), Year
- Dataset grid cards showing: title, category badge, region, year, source, chart thumbnail, view count
- Sort: Most viewed, Newest, Alphabetical
- Featured datasets highlighted at top
- No login required to browse

### Dataset Detail Page (`/stats/[datasetId]`):
- Dataset title, source citation, methodology note
- Interactive chart (bar, line, pie depending on data type) using Recharts
- Download raw CSV button (free, no login)
- "Need custom primary data for your research? →" CTA banner linking to registration
- Related datasets section
- Share buttons

### Data:
- Seed 50+ real public datasets using data from RBI, Census India, WHO, World Bank
- Store in `PublicDataset` model as JSON
- API route: `GET /api/datasets?category=&region=&search=&page=`

---

## 9. AUTHENTICATION

**File: `lib/auth.ts`**

Configure NextAuth v5:
- Providers: Google OAuth, GitHub OAuth, Email/Password (Credentials)
- Adapter: Prisma adapter
- Session strategy: JWT
- Callbacks: populate session with user role and subscription plan
- After login: check if email is verified, redirect to dashboard or onboarding

**Registration flow:**
1. User submits email + password + name
2. Hash password with bcrypt
3. Send verification email via Resend
4. On email click, set `emailVerified` timestamp
5. Redirect to onboarding: choose plan → payment → dashboard

**Middleware (`middleware.ts`):**
- Protect all `/dashboard/*` and `/admin/*` routes
- Check session exists and email is verified
- Check plan limits for feature-gated routes (e.g. block `/analysis` if on Basic)
- Redirect unauthenticated users to `/login`

---

## 10. SURVEY BUILDER

**File: `app/(dashboard)/surveys/[surveyId]/builder/page.tsx`**
**Component: `components/survey/SurveyBuilder.tsx`**

### 10.1 Layout (3-panel)
```
[ Question palette | Builder canvas | Live preview ]
     200px         |    flexible    |    320px
```

### 10.2 Question Palette (left panel)
Grid of question type icons that can be dragged onto the canvas:
- Short text, Long text, Single choice, Multiple choice, Rating (1-5), Likert scale, Matrix, Ranking, Number, Date, Email, Dropdown, Net Promoter Score

### 10.3 Builder Canvas (centre)
- Drag-and-drop reordering using @dnd-kit
- Each question shows: order number, question text (editable inline), type badge, required toggle, edit/delete icons
- Click a question to open the editor in a right drawer
- "Add question" button at bottom
- Survey title and description editable at top

### 10.4 Question Editor Drawer
When a question is clicked, show a drawer with:
- Question text (textarea)
- Question type selector
- Required toggle
- For choice questions: option list (add/remove/reorder options)
- For rating: min/max labels, scale size
- For matrix: row and column definition
- Conditional logic: "Show this question only if [question] [equals/contains] [value]"
- Validation rules: min/max length, number range, regex

### 10.5 Live Preview (right panel)
- Mobile phone frame
- Renders the survey exactly as respondents will see it
- Scrolls to selected question
- Toggle: Mobile / Desktop view

### 10.6 Survey Settings
Above the builder, tabs for: Questions | Settings | Targeting | Launch

**Settings tab:**
- Survey title, description
- Estimated completion time
- Language selector (English, Tamil, Hindi)
- Welcome screen message
- Thank you screen message
- Progress bar on/off

**State management:**
Use Zustand store `surveyBuilderStore` to hold all draft state. Auto-save to API every 30 seconds using React Query mutation.

---

## 11. AUDIENCE TARGETING

**File: `components/survey/TargetingFilters.tsx`**

Researchers specify who they want to respond. Build a targeting filter UI:

### Demographic Filters:
- Age range (slider: 18–80)
- Gender (checkboxes: Male, Female, Non-binary, Prefer not to say)
- Country (multi-select searchable dropdown — 50+ countries)
- Indian state (multi-select, shown when India is selected)
- Occupation (checkboxes: Student, Professional, Business owner, Retired, Other)
- Education level (checkboxes: High school, UG, PG, PhD, Other)
- Monthly income range (slider in INR)
- Language preference

### Advanced Filters (Advanced plan+):
- Industry sector
- Job function
- Company size
- Research-specific: "Has experience with [topic]"

### Panel Size Estimator:
- Show estimated available respondents as filters are applied
- "~2,400 respondents match your criteria"
- Estimated cost and timeline based on target response count

### Save as:
- Target audience preset (reusable across surveys)

---

## 12. SURVEY LAUNCH FLOW

**File: `app/(dashboard)/surveys/[surveyId]/launch/page.tsx`**

A 4-step wizard before going live:

**Step 1 — Review**
- Preview all questions
- Check for errors (required fields, logic conflicts)
- Show completion time estimate

**Step 2 — Targeting summary**
- Selected demographic filters
- Estimated available panel size
- Target response count (editable)

**Step 3 — Schedule**
- Start immediately OR schedule start date/time
- End date (optional)
- Max responses cap

**Step 4 — Confirm & Launch**
- Plan usage check (will not exceed monthly limit)
- "Launch survey to panel" button
- On submit: call `POST /api/surveys/[id]/launch`
- Trigger Inngest background job to begin dispatching to respondent panel
- Show success screen with live response counter

---

## 13. RESPONSE COLLECTION ENGINE

**File: `lib/inngest.ts`**
**Inngest function: `survey-dispatch`**

When a survey is launched, run this background job:

```typescript
// Pseudocode for the dispatch job
export const surveyDispatchJob = inngest.createFunction(
  { id: 'survey-dispatch' },
  { event: 'survey/launched' },
  async ({ event, step }) => {
    const survey = await step.run('fetch-survey', () => getSurvey(event.data.surveyId));
    const panel = await step.run('match-panel', () => matchRespondents(survey.targeting));
    
    // Send invitations in batches of 50
    for (const batch of chunkArray(panel, 50)) {
      await step.run(`invite-batch-${batch[0].id}`, () => sendInvitations(batch, survey));
      await step.sleep('rate-limit', '2s');
    }
  }
);
```

### Quality Control Pipeline:
When a response comes in (`POST /api/surveys/[id]/responses`):
1. Check response time (reject if < 20% of estimated time = speed trap)
2. Validate attention-check questions if present
3. Check IP/device fingerprint (reject duplicates)
4. Score response quality (0.0–1.0)
5. If quality score < 0.6: mark as FLAGGED, penalise respondent quality score
6. If quality score >= 0.6: mark as COMPLETED, add to clean dataset
7. Update `survey.collectedCount`
8. If `collectedCount >= targetResponses`: auto-close survey, trigger analysis job

---

## 14. AI STATISTICAL ANALYSIS ENGINE

**File: `lib/statistics/`**
**File: `app/api/surveys/[surveyId]/analysis/route.ts`**

When analysis is triggered, run this pipeline:

### Step 1 — Descriptive Statistics (for each question)
```typescript
// lib/statistics/descriptive.ts
export function computeDescriptive(values: number[]) {
  return {
    count: values.length,
    mean: mean(values),
    median: median(values),
    mode: mode(values),
    stdDev: std(values),
    variance: variance(values),
    min: Math.min(...values),
    max: Math.max(...values),
    range: Math.max(...values) - Math.min(...values),
    skewness: skewness(values),
    kurtosis: kurtosis(values),
    percentiles: { p25: quantile(values, 0.25), p75: quantile(values, 0.75) },
  };
}
```

### Step 2 — Frequency Analysis
For choice/dropdown/rating questions: compute frequency and percentage for each option.

### Step 3 — Cross-tabulation
For any two categorical questions: compute chi-square statistic, p-value, Cramer's V.

### Step 4 — Hypothesis Testing (Advanced plan+)
```typescript
// lib/statistics/inferential.ts
// t-test: compare means between two groups
// One-way ANOVA: compare means across 3+ groups
// Chi-square: independence test between two categorical variables
// Mann-Whitney U: non-parametric alternative to t-test
```
Return: test statistic, p-value, effect size, reject/fail-to-reject null hypothesis.

### Step 5 — Correlation (Advanced plan+)
For numeric questions: Pearson and Spearman correlation matrix.

### Step 6 — Regression (Advanced plan+)
If user sets a dependent variable: compute linear or logistic regression with coefficients, R², p-values.

### Step 7 — AI Narrative Generation (Advanced plan+)
Call Claude API to generate plain-language insights:

```typescript
// lib/claude.ts
export async function generateAnalysisNarrative(
  surveyTitle: string,
  statisticsResults: object,
  targetAudience: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: `You are a professional research analyst. You interpret statistical results 
    from survey data and write clear, concise, actionable narratives for researchers. 
    Write in formal academic tone. Highlight key findings, statistical significance, 
    and practical implications. Avoid jargon where plain language works better.`,
    messages: [{
      role: 'user',
      content: `Survey: "${surveyTitle}"
Target audience: ${targetAudience}
Statistical results: ${JSON.stringify(statisticsResults, null, 2)}

Write a structured research findings narrative with sections:
1. Executive Summary (3-4 sentences)
2. Key Findings (bullet points with statistics cited)
3. Statistical Significance (which results are significant at p<0.05)
4. Implications & Recommendations
5. Limitations`,
    }],
  });
  
  return response.content[0].type === 'text' ? response.content[0].text : '';
}
```

### Store results in `AnalysisReport.results` as JSON:
```json
{
  "summary": { "totalResponses": 847, "validResponses": 821, "completionRate": 96.8 },
  "questions": [
    {
      "questionId": "...",
      "questionText": "...",
      "type": "RATING",
      "descriptive": { "mean": 3.7, "stdDev": 0.9, ... },
      "frequency": { "1": 12, "2": 45, "3": 210, "4": 380, "5": 174 },
      "chart": { "type": "bar", "data": [...] }
    }
  ],
  "crossTabs": [...],
  "hypothesisTests": [...],
  "correlationMatrix": [...],
  "regressionResults": [...],
  "aiNarrative": "..."
}
```

---

## 15. ANALYSIS DASHBOARD

**File: `app/(dashboard)/surveys/[surveyId]/analysis/page.tsx`**

Display analysis results with these sections:

### 15.1 Header Strip
- Survey title, response count, analysis date
- Status badge (Running / Completed / Failed)
- "Re-run analysis" and "Export report" buttons

### 15.2 AI Executive Summary Card
- Claude-generated narrative in a highlighted card
- Gold border, "AI Insights" badge
- Full text with section headings rendered as markdown

### 15.3 Response Overview Cards
- Total responses, valid responses, completion rate, avg duration

### 15.4 Per-Question Results
For each question, show a result card with:
- Question text and type badge
- Relevant visualisation:
  - Single/multiple choice → horizontal bar chart with percentages
  - Rating/Likert → star rating distribution bar
  - Number → histogram
  - Text → word cloud + top 10 words
  - Matrix → grouped bar chart
- Descriptive stats table (mean, SD, etc.) for numeric questions
- Export individual chart as PNG button

### 15.5 Hypothesis Testing Section
Table showing each test with columns:
- Test name, variables tested, statistic, p-value, result (Significant / Not significant), effect size

### 15.6 Correlation Matrix
Heatmap grid showing correlations between numeric variables (green = positive, red = negative).

### 15.7 Regression Results
If performed: coefficient table, R² value, model equation, interpretation.

---

## 16. EXPORT ENGINE

**File: `app/api/surveys/[surveyId]/export/route.ts`**
**File: `lib/exporters/`**

### POST /api/surveys/[id]/export
Body: `{ format: 'PDF' | 'XLS' | 'CSV' | 'ZIP' }`

**PDF Export (pdfmake):**
- Cover page: survey title, researcher name, date, PrimoData logo
- Executive summary page
- AI narrative section
- Per-question chart pages (embed chart as SVG)
- Statistical tables
- Methodology appendix
- PrimoData watermark (removable on Enterprise+)

**XLS Export (exceljs):**
- Sheet 1: Raw responses (one row per respondent, one column per question)
- Sheet 2: Frequency tables for each choice question
- Sheet 3: Descriptive statistics summary
- Sheet 4: Hypothesis test results
- Sheet 5: Correlation matrix (conditional colour formatting)

**CSV Export:**
- Single file: raw response data, UTF-8 encoded

**ZIP Export (Enterprise+):**
- Contains: PDF report + XLS workbook + CSV data + chart images folder

**File storage:**
- Generate file, upload to Supabase Storage at `exports/{userId}/{surveyId}/{format}/{timestamp}.{ext}`
- Store signed URL in `Export.fileUrl` (expires 7 days)
- Email user when ready via Resend

---

## 17. RESPONDENT MANAGEMENT (Admin)

**File: `app/(admin)/admin/respondents/page.tsx`**

### Respondent verification flow:
1. Respondent signs up at `/respondent/register`
2. Submits: name, email, phone, location, demographics (age, gender, occupation, education, income)
3. Phone OTP verification via SMS (use Twilio or MSG91)
4. Email verification
5. KYC status set to VERIFIED
6. Quality score initialised at 1.0

### Respondent dashboard (separate from researcher dashboard):
- `/respondent/dashboard` — available surveys, earnings history
- `/respondent/profile` — update demographics
- `/respondent/surveys/[id]` — take survey

### Quality scoring:
- Each accepted response: qualityScore unchanged
- Each flagged/rejected response: qualityScore -= 0.1
- qualityScore < 0.5: suspend from panel
- qualityScore > 0.9: mark as "trusted", weight responses higher

---

## 18. BILLING & SUBSCRIPTIONS

**File: `app/(dashboard)/billing/page.tsx`**

### Razorpay integration (India):
```typescript
// lib/razorpay.ts
// Create subscription on plan select
// Handle recurring billing
// Webhook: subscription.activated, payment.captured, subscription.cancelled
```

### Stripe integration (International):
```typescript
// lib/stripe.ts
// Stripe Checkout for international users
// Webhook: checkout.session.completed, invoice.paid, customer.subscription.deleted
```

### Billing page sections:
- Current plan badge with usage meter (responses used / limit)
- "Upgrade plan" button if not on highest paid tier
- Plan comparison cards (use `<PricingTable />`)
- Invoice history table: date, amount, status, download PDF
- Payment method management (card on file)
- Cancel subscription with confirmation dialog

### Upgrade/downgrade:
- Upgrade: immediate, pro-rate billing
- Downgrade: effective at end of current period
- Cancellation: effective at end of period, retain access until then

---

## 19. DASHBOARD OVERVIEW

**File: `app/(dashboard)/dashboard/page.tsx`**

### Top metric cards row:
- Active surveys (count / plan limit)
- Total responses this month (count / plan limit)
- Surveys completed this month
- AI reports generated

### Recent surveys table:
Columns: Title, Status badge, Responses (progress bar), Created date, Actions (View, Analysis, Export)

### Usage gauge:
Circular gauge showing responses used this month vs plan limit. Red when > 80%.

### Quick actions:
- "Create new survey" (large CTA card)
- "Browse free datasets"
- "Upgrade plan" (shown if near limit)

### Activity feed:
- Recent events: "Survey X received 50 new responses", "Analysis report ready for Y", "Export downloaded"

---

## 20. ADMIN PANEL

**File: `app/(admin)/admin/page.tsx`**

Superadmin-only. Protect with `role === 'SUPERADMIN'` middleware check.

### Admin overview metrics:
- Total users, active subscribers by tier, MRR (monthly recurring revenue)
- Respondent panel size, verified respondents count
- Surveys launched this month, responses collected, analysis reports generated

### Admin users table:
- Search by email/name
- Filter by plan, join date
- Actions: View details, Change plan, Suspend, Delete

### Admin respondents table:
- Filter by KYC status, quality score, country
- Actions: Verify, Suspend, View response history

### Admin datasets panel:
- Add/edit/delete public datasets for the free stats portal
- JSON editor for dataset data
- Toggle featured status

### Revenue dashboard:
- MRR by plan tier (bar chart)
- Churn rate, new signups, conversions from free
- Payment failure tracking

---

## 21. API REFERENCE (for Enterprise/Custom users)

**File: `app/api/` (all route handlers)**

Document and implement these REST endpoints:

```
Authentication: Bearer token (API key)

GET    /api/v1/surveys              List all surveys
POST   /api/v1/surveys              Create survey
GET    /api/v1/surveys/:id          Get survey details
PATCH  /api/v1/surveys/:id          Update survey
DELETE /api/v1/surveys/:id          Delete survey
POST   /api/v1/surveys/:id/launch   Launch survey to panel
GET    /api/v1/surveys/:id/responses  Get all responses (paginated)
GET    /api/v1/surveys/:id/analysis  Get analysis results
POST   /api/v1/surveys/:id/export   Trigger export, get download URL

GET    /api/v1/datasets             List public datasets
GET    /api/v1/datasets/:id         Get dataset with data
```

Rate limiting via Redis: 100 requests/minute per API key.

---

## 22. EMAIL TEMPLATES

**Folder: `emails/`** (using React Email)

Build these transactional email templates:

1. **WelcomeEmail** — onboarding, verify email button, 3 quick start tips
2. **EmailVerification** — OTP or magic link to verify
3. **SurveyLaunched** — confirmation that survey is live, link to dashboard
4. **MilestoneEmail** — "Your survey hit 100 responses!", link to analysis
5. **AnalysisReady** — analysis complete, preview snippet, download link
6. **ExportReady** — report is ready to download, file info, download button
7. **PlanUpgrade** — welcome to new plan, feature unlocked list
8. **PaymentFailed** — action required, retry link
9. **MonthlyUsageReport** — usage stats for the month, upgrade prompt if near limit
10. **InvoiceEmail** — invoice PDF attached, payment confirmation

---

## 23. INTERNATIONALISATION

**Config: `next-intl`**

Support three languages:
- English (default)
- Tamil (`ta`)
- Hindi (`hi`)

Create `/messages/en.json`, `/messages/ta.json`, `/messages/hi.json` with all UI string keys.

Survey questions and responses are stored in their original language. The platform UI switches language. Statistical outputs remain in English.

Language selector in: navigation (marketing site), settings page (dashboard).

---

## 24. RESPONSIVE DESIGN & ACCESSIBILITY

All pages must be:
- Fully responsive (mobile 375px → desktop 1440px+)
- WCAG 2.1 AA compliant
- Keyboard navigable
- Screen reader friendly (proper ARIA labels)
- Dark mode supported (Tailwind dark: prefix + system preference)
- Loading skeletons for all data-fetching states
- Error states with retry for all API calls
- Empty states with helpful CTAs when no data

---

## 25. PERFORMANCE & SEO

- All marketing pages use Next.js SSG (generateStaticParams)
- Dashboard pages use ISR or SSR with 60s revalidation
- Images: next/image with lazy loading
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, FID < 100ms
- OpenGraph meta tags on all marketing pages
- Structured data (JSON-LD) for organisation and datasets
- Sitemap at `/sitemap.xml`
- robots.txt configured (index marketing, noindex dashboard)

---

## 26. SECURITY REQUIREMENTS

- All passwords hashed with bcrypt (salt rounds: 12)
- CSRF protection on all POST endpoints
- Rate limiting: auth endpoints (5/min), API endpoints (100/min)
- Input sanitisation on all user inputs (DOMPurify for HTML, parameterised queries via Prisma)
- SQL injection impossible (Prisma ORM)
- XSS prevention via Next.js default escaping
- API keys stored as SHA-256 hashes, never in plaintext
- HTTPS only (enforce in next.config)
- Supabase Row Level Security (RLS) policies
- Respondent PII (email, phone) stored hashed, not plaintext
- GDPR-compliant data deletion on account deletion

---

## 27. CURSOR AI BUILD ORDER

Work through these modules in this order to avoid dependency issues:

```
Phase 1 — Foundation
□ 1. Prisma schema + migrations
□ 2. NextAuth setup + auth pages (login, register, verify)
□ 3. Base layout: marketing nav + dashboard sidebar
□ 4. Homepage (marketing site)
□ 5. Middleware (auth protection + plan gating)

Phase 2 — Core Product
□ 6. Survey list page + create survey
□ 7. Survey builder (drag-and-drop + question editor)
□ 8. Targeting filters
□ 9. Survey launch wizard
□ 10. Response collection API + quality gates

Phase 3 — Analysis & Reports
□ 11. Statistical engine (descriptive + frequency)
□ 12. Hypothesis testing + regression
□ 13. Claude API integration (AI narrative)
□ 14. Analysis dashboard (all chart types)
□ 15. Export engine (PDF, XLS, CSV, ZIP)

Phase 4 — Business Layer
□ 16. Razorpay + Stripe billing
□ 17. Subscription plan gating
□ 18. Usage tracking + limits enforcement
□ 19. Email templates (Resend)
□ 20. Inngest background jobs

Phase 5 — Public & Admin
□ 21. Free stats portal (/stats)
□ 22. Admin panel (users, respondents, revenue)
□ 23. API key management
□ 24. Respondent portal (register, take surveys)

Phase 6 — Polish
□ 25. i18n (Tamil, Hindi)
□ 26. Dark mode
□ 27. SEO + sitemap
□ 28. Error monitoring (Sentry)
□ 29. Performance audit
□ 30. Security audit
```

---

## 28. KEY CURSOR AI PROMPTS TO USE

After pasting this master prompt, use these targeted follow-up prompts in Cursor:

**Survey Builder:**
```
Build the SurveyBuilder component using @dnd-kit/core for drag-and-drop. 
Implement the 3-panel layout (palette | canvas | preview). 
Each QuestionBlock should show type badge, inline text editing, 
and a settings drawer. Connect to the Zustand surveyBuilderStore. 
Auto-save to PATCH /api/surveys/[id] every 30 seconds.
```

**Statistical Engine:**
```
Build lib/statistics/descriptive.ts using mathjs. 
Compute mean, median, mode, stdDev, variance, skewness, kurtosis, 
quartiles, and percentiles. Build inferential.ts with 
independent samples t-test, one-way ANOVA, and chi-square test. 
Return p-values, test statistics, and effect sizes.
```

**Analysis Dashboard:**
```
Build the analysis dashboard page. 
Fetch analysis results from GET /api/surveys/[id]/analysis. 
For each question, render the appropriate Recharts chart: 
bar chart for choice questions, histogram for numeric, 
star distribution for ratings. 
Show the AI narrative card at top with markdown rendering.
```

**Export PDF:**
```
Build the PDF export using pdfmake. 
Include: cover page with survey title and date, 
AI narrative section, one page per question with embedded chart, 
descriptive statistics table, hypothesis test results table. 
Upload to Supabase Storage and return a signed download URL.
```

**Billing with Razorpay:**
```
Implement Razorpay subscription integration. 
On plan selection, create a Razorpay subscription via API, 
open Razorpay checkout modal, on success update Subscription table via webhook. 
Handle payment.captured, subscription.cancelled webhooks. 
Build the billing page showing current plan, usage meter, and invoice history.
```

---

*End of PrimoData Analytics — Cursor AI Master Build Prompt*
*Version 1.0 | Build target: Q2 2026 | Launch: Tamil Nadu*
