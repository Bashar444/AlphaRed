# PrimoData Analytics

> **Hybrid Web Analytics SaaS** — Survey creation, verified respondent panel, AI-powered statistical analysis, and multi-format report exports.

[![PHP](https://img.shields.io/badge/Backend-PHP%208.3%20%2F%20CodeIgniter%204-blue)](rise/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)](frontend/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#)

---

## Architecture

```
┌─────────────────┐       REST / JSON        ┌──────────────────────┐
│   Next.js 14    │ ◄──────────────────────► │   CodeIgniter 4      │
│   (Vercel)      │                           │   (cPanel / PHP)     │
│                 │                           │                      │
│  - App Router   │    /api/primo/*           │  - 15 Controllers    │
│  - Tailwind CSS │    CORS + JWT             │  - 12 Models         │
│  - shadcn/ui    │                           │  - 10 Libraries      │
│  - Chart.js     │                           │  - MySQL 8.0        │
│  - Zustand      │                           │  - Razorpay          │
└─────────────────┘                           └──────────────────────┘
```

## Quick Start

### Backend (CI4)

```bash
# 1. Copy env template
cp rise/.env.example rise/.env

# 2. Configure database in rise/.env
# database.default.hostname = localhost
# database.default.database = primodata
# database.default.username = root
# database.default.password = ...

# 3. Import database
mysql -u root -p primodata < rise/install/database.sql
mysql -u root -p primodata < rise/install/primo_tables.sql
mysql -u root -p primodata < rise/install/primo_phase4_tables.sql

# 4. Run PHP dev server
cd rise && php spark serve --port 8080
```

### Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8080
npm run dev
```

## Project Structure

```
.
├── .github/              # CI/CD workflows, Copilot instructions & skills
├── rise/                 # CodeIgniter 4 backend
│   ├── app/
│   │   ├── Controllers/  # 83 RISE + 15 PrimoData controllers
│   │   ├── Models/       # 85 RISE + 12 PrimoData models
│   │   ├── Libraries/    # Statistics, AI, exports, payments
│   │   ├── Views/        # Server-rendered views (legacy)
│   │   ├── Config/       # PrimoData.php plan config
│   │   └── Language/     # English + Tamil
│   └── install/          # SQL schemas
├── frontend/             # Next.js 14 (App Router)
│   ├── app/              # Pages: marketing, dashboard, admin
│   ├── components/       # UI components
│   └── lib/              # API client, auth, utils
└── docs/                 # Specifications & documentation
```

## Backend Capabilities

| Module | Controller | Status |
|--------|-----------|--------|
| Survey CRUD + Builder | `Surveys` | ✅ Complete |
| Audience Targeting | `Surveys::targeting` | ✅ Complete |
| Survey Launch | `Surveys::launch` | ✅ Complete |
| Respondent Registration | `Respondents` | ✅ Complete |
| Survey Taking (Public) | `Survey_take` | ✅ Complete |
| Response Collection | `Survey_responses` | ✅ Complete |
| Quality Scoring | `Quality_scorer` lib | ✅ Complete |
| Descriptive Statistics | `Descriptive_stats` lib | ✅ Complete |
| Inferential Statistics | `Inferential_stats` lib | ✅ Complete |
| Correlation Analysis | `Correlation` lib | ✅ Complete |
| Regression Analysis | `Regression` lib | ✅ Complete |
| AI Narrative (Claude) | `Claude_api` lib | ✅ Complete |
| Analysis Dashboard | `Analysis` | ✅ Complete |
| Export (PDF/XLS/CSV/ZIP) | `Exports` | ✅ Complete |
| Razorpay Billing | `Primo_subscriptions` | ✅ Complete |
| API Key Management | `Api_keys` | ✅ Complete |
| Rate Limiting | `Primo_rate_limiter` filter | ✅ Complete |
| Free Stats Portal | `Public_stats` | ✅ Complete |
| Admin Dashboard | `Primo_admin` | ✅ Complete |
| Tamil i18n | Language files | ✅ Complete |
| SEO Meta + Sitemap | `Primo_seo` lib | ✅ Complete |

## Subscription Plans

| Plan | Price (INR) | Surveys | Responses | AI | API |
|------|------------|---------|-----------|-----|-----|
| Basic | ₹499/mo | 1 | 200 | ❌ | ❌ |
| Advanced | ₹1,499/mo | 5 | 1,000 | ✅ | ❌ |
| Enterprise | ₹4,999/mo | 20 | 10,000 | ✅ | ✅ |

## Tech Stack

- **Backend:** PHP 8.3, CodeIgniter 4.5, MySQL 8.0
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Payments:** Razorpay (INR)
- **AI:** Anthropic Claude API
- **Statistics:** Pure PHP engine (t-test, ANOVA, chi-square, regression)
- **Exports:** TCPDF, PHPSpreadsheet, nelexa-php-zip

## License

Proprietary — AlphaRed / PrimoData Analytics © 2026
