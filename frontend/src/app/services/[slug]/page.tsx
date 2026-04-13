"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
    BarChart3,
    Brain,
    Globe,
    Lock,
    Zap,
    Star,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    Code,
    Users,
    type LucideIcon,
} from "lucide-react";

/* ── Full service data ───────────────────────────── */

interface ServiceData {
    slug: string;
    icon: LucideIcon;
    title: string;
    tagline: string;
    heroDescription: string;
    sections: { heading: string; body: string; bullets?: string[] }[];
    useCases: string[];
    faqs: { q: string; a: string }[];
}

const serviceMap: Record<string, ServiceData> = {
    "advanced-analytics": {
        slug: "advanced-analytics",
        icon: BarChart3,
        title: "Advanced Analytics",
        tagline: "Publication-ready statistical analysis, automated.",
        heroDescription:
            "PrimoData computes descriptive, inferential, correlation, and regression analyses automatically from your survey responses. No SPSS license, no manual coding — just clean, reproducible results ready for your research paper.",
        sections: [
            {
                heading: "Descriptive Statistics",
                body: "Get a complete overview of your data distribution including central tendency, dispersion, and shape metrics — all computed in real time as responses arrive.",
                bullets: [
                    "Mean, median, mode for all numeric questions",
                    "Standard deviation, variance, IQR",
                    "Skewness and kurtosis for distribution shape",
                    "Frequency tables for categorical variables",
                    "Percentile rankings (P25, P50, P75, P90)",
                ],
            },
            {
                heading: "Inferential Analysis",
                body: "Test hypotheses about your data with industry-standard statistical tests. PrimoData automatically selects the appropriate test based on your variable types and sample size.",
                bullets: [
                    "Independent & paired samples t-tests",
                    "One-way and two-way ANOVA",
                    "Chi-square tests for categorical associations",
                    "Mann-Whitney U and Kruskal-Wallis for non-parametric data",
                    "Effect size calculation (Cohen's d, eta-squared)",
                ],
            },
            {
                heading: "Correlation & Regression",
                body: "Explore relationships between variables with correlation matrices, simple and multiple regression models — complete with confidence intervals and diagnostic plots.",
                bullets: [
                    "Pearson and Spearman correlation matrices",
                    "Simple and multiple linear regression",
                    "Logistic regression for binary outcomes",
                    "R-squared, adjusted R-squared, F-statistics",
                    "Residual analysis and multicollinearity checks (VIF)",
                ],
            },
            {
                heading: "Cross-Tabulation",
                body: "Analyze relationships between categorical variables with cross-tabulation tables, including observed and expected frequencies, chi-square values, and Cramér's V.",
                bullets: [
                    "Observed vs. expected frequency tables",
                    "Chi-square significance levels",
                    "Cramér's V for association strength",
                    "Column and row percentages",
                ],
            },
        ],
        useCases: [
            "Academic researchers analyzing Likert-scale survey data for journal publications",
            "Market researchers comparing customer satisfaction across demographics",
            "HR teams analyzing employee engagement survey results with significance testing",
            "Policy analysts quantifying public opinion shifts with regression models",
        ],
        faqs: [
            { q: "What statistical tests are available?", a: "T-tests, ANOVA, chi-square, Mann-Whitney U, Kruskal-Wallis, Pearson/Spearman correlations, linear regression, and logistic regression." },
            { q: "Can I export the statistical tables?", a: "Yes — all tables can be exported as CSV, Excel, or embedded in the PDF report with proper APA formatting." },
            { q: "Does it handle missing data?", a: "Yes. You can choose listwise deletion, pairwise deletion, or mean imputation for missing values." },
        ],
    },
    "ai-powered-insights": {
        slug: "ai-powered-insights",
        icon: Brain,
        title: "AI-Powered Insights",
        tagline: "Claude AI writes your analysis — you review and publish.",
        heroDescription:
            "Our AI engine reads your survey data, identifies statistically significant patterns, and generates publication-ready narrative summaries. It highlights what matters, flags anomalies, and suggests next steps — saving you hours of manual interpretation.",
        sections: [
            {
                heading: "Narrative Generation",
                body: "AI generates paragraph-form summaries of your key findings — written in academic or business style depending on your project type. Each narrative cites the underlying statistics.",
                bullets: [
                    "Academic style for journal submissions",
                    "Executive summary style for business reports",
                    "Statistical citations embedded in narrative",
                    "Automatic section structuring (Introduction, Findings, Implications)",
                ],
            },
            {
                heading: "Pattern Detection",
                body: "The AI scans for non-obvious patterns across demographic segments, time periods, and question groupings that traditional analysis might miss.",
                bullets: [
                    "Demographic sub-group analysis",
                    "Response trend detection across time",
                    "Open-ended response theme clustering",
                    "Sentiment analysis for text responses",
                ],
            },
            {
                heading: "Actionable Recommendations",
                body: "Based on detected patterns, the AI generates specific, evidence-based recommendations tied to your research objectives.",
                bullets: [
                    "Ranked recommendations by impact score",
                    "Evidence links to supporting data points",
                    "Risk flags for potential biases",
                    "Suggested follow-up research questions",
                ],
            },
        ],
        useCases: [
            "PhD researchers who need narrative analysis for dissertation chapters",
            "Consultants preparing client insight reports with minimal turnaround time",
            "NGOs analyzing program evaluation surveys for donor reports",
            "Product teams synthesizing user feedback surveys into actionable roadmap items",
        ],
        faqs: [
            { q: "Which AI model powers the insights?", a: "We use Claude AI (Anthropic) tuned for research narrative generation with statistical accuracy." },
            { q: "Can I edit the AI-generated narrative?", a: "Absolutely. The narrative is fully editable — think of it as a strong first draft that you refine." },
            { q: "Is my data used to train the AI?", a: "No. Your data is processed in real-time and not retained for model training." },
        ],
    },
    "targeted-panels": {
        slug: "targeted-panels",
        icon: Globe,
        title: "Targeted Panels",
        tagline: "Reach the right respondents, every time.",
        heroDescription:
            "Access a verified respondent pool filtered by demographics, profession, geography, and custom criteria. Our matching engine connects your survey to qualified participants — ensuring representative, high-quality data collection.",
        sections: [
            {
                heading: "Demographic Targeting",
                body: "Filter your respondent panel by age, gender, income bracket, education level, marital status, and more. Build precise audience segments for representative sampling.",
                bullets: [
                    "Age range selection (18-24, 25-34, 35-44, etc.)",
                    "Gender quotas with balanced allocation",
                    "Income and education filters",
                    "Geographic targeting (country, state, city)",
                ],
            },
            {
                heading: "Professional & Industry Filters",
                body: "Target respondents by job title, industry, company size, and years of experience. Essential for B2B research, employee engagement studies, and professional opinion surveys.",
                bullets: [
                    "Industry classification (NAICS/SIC codes)",
                    "Job role and seniority level",
                    "Company size ranges",
                    "Years of professional experience",
                ],
            },
            {
                heading: "Custom Screening",
                body: "Add custom screening questions at the start of your survey to further qualify respondents. Only those who meet your criteria proceed to the full questionnaire.",
                bullets: [
                    "Custom screener question builder",
                    "Automatic disqualification rules",
                    "Quota management per segment",
                    "Real-time panel completion tracking",
                ],
            },
        ],
        useCases: [
            "Healthcare researchers targeting specific patient demographics",
            "Consumer brands testing product concepts with target market segments",
            "Political researchers polling specific voter demographics",
            "Academic studies requiring balanced, representative samples",
        ],
        faqs: [
            { q: "How large is the respondent panel?", a: "Our panel includes 200,000+ verified respondents across 24 countries, with strongest coverage in India and Southeast Asia." },
            { q: "How are respondents verified?", a: "Through email verification, phone OTP, and periodic quality audits that check for duplicate accounts and response quality." },
            { q: "Can I bring my own respondent list?", a: "Yes. You can upload a CSV of email addresses and distribute via our platform while still using quality scoring." },
        ],
    },
    "quality-scoring": {
        slug: "quality-scoring",
        icon: Zap,
        title: "Quality Scoring",
        tagline: "Bad data out. Clean insights in.",
        heroDescription:
            "Automated quality gates analyze every response in real time — flagging rushed answers, straight-lined patterns, and inconsistent logic. Only clean, thoughtful responses reach your analysis, ensuring data integrity without manual review.",
        sections: [
            {
                heading: "Response Time Analysis",
                body: "Each response is timed question-by-question. Responses completed far below the expected reading + thinking time are automatically flagged as potentially low-effort.",
                bullets: [
                    "Per-question time tracking",
                    "Minimum threshold based on question complexity",
                    "Total survey completion time analysis",
                    "Configurable speed thresholds",
                ],
            },
            {
                heading: "Straight-Line Detection",
                body: "Our algorithm detects respondents who select the same answer for every question in a matrix or grid — a classic indicator of disengagement.",
                bullets: [
                    "Matrix/grid pattern analysis",
                    "Consecutive same-answer detection",
                    "Variance threshold per question block",
                    "Automatic flagging with manual override option",
                ],
            },
            {
                heading: "Consistency Checking",
                body: "Cross-reference trap questions and logical dependencies. If a respondent says they are 22 but later indicates 10+ years of professional experience, the system flags the inconsistency.",
                bullets: [
                    "Trap question insertion and monitoring",
                    "Logical dependency validation",
                    "Open-ended gibberish detection",
                    "Duplicate response identification (IP + fingerprint)",
                ],
            },
        ],
        useCases: [
            "Academic studies where data quality directly impacts publication acceptance",
            "Market research firms guaranteeing clean data to enterprise clients",
            "Panel surveys where respondent fatigue is a known issue",
            "Government and policy surveys requiring defensible data quality standards",
        ],
        faqs: [
            { q: "What quality score range is used?", a: "Responses are scored 0-100. Scores below 40 are auto-flagged, 40-70 are reviewed, and 70+ are accepted. Thresholds are configurable." },
            { q: "Can I adjust the quality thresholds?", a: "Yes. Each quality check has configurable sensitivity levels, and you can enable/disable individual checks." },
            { q: "What happens to flagged responses?", a: "Flagged responses are quarantined — excluded from analysis by default but visible for manual review. You can restore or permanently remove them." },
        ],
    },
    "enterprise-security": {
        slug: "enterprise-security",
        icon: Lock,
        title: "Enterprise Security",
        tagline: "Institutional-grade data protection.",
        heroDescription:
            "PrimoData is built for institutional research environments that demand strict data governance. End-to-end encryption, GDPR compliance, role-based access control, and comprehensive audit logging are built into every layer of the platform.",
        sections: [
            {
                heading: "Data Encryption",
                body: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Survey responses are encrypted before storage, and decryption keys are managed separately from data stores.",
                bullets: [
                    "AES-256 encryption at rest",
                    "TLS 1.3 for all data in transit",
                    "Separate key management system",
                    "Encrypted backups with geo-redundancy",
                ],
            },
            {
                heading: "GDPR & Privacy Compliance",
                body: "Built-in tools for data subject requests — right to access, right to erasure, data portability. Consent management and privacy impact assessments are part of the survey creation flow.",
                bullets: [
                    "Automated data subject request handling",
                    "Consent collection and tracking",
                    "Data retention policy enforcement",
                    "Privacy impact assessment templates",
                ],
            },
            {
                heading: "Role-Based Access Control",
                body: "Define who can view, edit, launch, and export surveys. Five built-in roles (Superadmin, Manager, Researcher, Agent, Respondent) with custom permission overrides.",
                bullets: [
                    "Five built-in roles with granular permissions",
                    "Custom permission overrides per project",
                    "Team-based access grouping",
                    "Invitation-only survey access",
                ],
            },
            {
                heading: "Audit Logging",
                body: "Every action on the platform is logged — survey creation, edits, data access, exports, and deletion. Logs are immutable and searchable for compliance audits.",
                bullets: [
                    "Immutable audit log for all actions",
                    "Searchable by user, action, date, resource",
                    "Export audit log as CSV for compliance",
                    "Automated alerts for sensitive actions",
                ],
            },
        ],
        useCases: [
            "Universities with IRB/ethics board requirements for data handling",
            "Healthcare organizations conducting patient experience surveys under HIPAA",
            "EU-based institutions requiring full GDPR compliance for research data",
            "Government agencies with strict data sovereignty requirements",
        ],
        faqs: [
            { q: "Where is data stored?", a: "Primary storage is in AWS Mumbai (ap-south-1) with encrypted backups in AWS Singapore. We can discuss dedicated instances for enterprise clients." },
            { q: "Is PrimoData SOC 2 compliant?", a: "We follow SOC 2 Type II controls. Formal certification is in progress and expected Q3 2026." },
            { q: "Can we get a DPA (Data Processing Agreement)?", a: "Yes. We provide a standard DPA for all institutional clients. Custom DPAs are negotiable for enterprise accounts." },
        ],
    },
    "multi-format-export": {
        slug: "multi-format-export",
        icon: Star,
        title: "Multi-Format Export",
        tagline: "Your data, your format, your pipeline.",
        heroDescription:
            "Export survey results as raw CSV, formatted Excel workbooks, PDF reports with embedded charts, or full ZIP bundles. For automated workflows, use our API to pipe data directly into your systems.",
        sections: [
            {
                heading: "CSV Export",
                body: "Raw, machine-readable data with one row per response and one column per question. Clean headers, UTF-8 encoding, and proper handling of multi-select and matrix questions.",
                bullets: [
                    "One row per response, one column per question",
                    "UTF-8 encoding with BOM for Excel compatibility",
                    "Multi-select questions split into separate columns",
                    "Metadata columns (response ID, timestamp, quality score)",
                ],
            },
            {
                heading: "Excel Export",
                body: "Formatted workbooks with multiple sheets — raw data, summary statistics, frequency tables, and cross-tabulations. Conditional formatting highlights key findings.",
                bullets: [
                    "Multi-sheet workbook (data, stats, frequencies, crosstabs)",
                    "Conditional formatting for significant values",
                    "Embedded charts for visual summaries",
                    "Pivot-table-ready data structure",
                ],
            },
            {
                heading: "PDF Reports",
                body: "Publication-ready PDF reports with executive summary, methodology section, findings with embedded charts, and appendices. Branded with your organization's logo and colors.",
                bullets: [
                    "Executive summary + methodology + findings structure",
                    "Embedded bar charts, pie charts, and tables",
                    "APA-formatted statistical citations",
                    "Custom branding (logo, colors, fonts)",
                ],
            },
            {
                heading: "API Access",
                body: "Use our RESTful API to programmatically access survey data, trigger exports, and build automated data pipelines. API key authentication with generous rate limits.",
                bullets: [
                    "RESTful API with JSON responses",
                    "API key authentication",
                    "Webhook notifications for new responses",
                    "Rate limit: 1,000 requests/minute (enterprise tier)",
                ],
            },
        ],
        useCases: [
            "Research teams that need to share raw data with collaborators in different tools",
            "Consultancies delivering branded PDF reports to multiple clients",
            "Data engineers building automated survey-to-dashboard pipelines",
            "Academic departments archiving survey data in institutional repositories",
        ],
        faqs: [
            { q: "Can I schedule automatic exports?", a: "Yes. Set up recurring exports (daily, weekly, monthly) that are emailed to your team or pushed to an S3 bucket via webhook." },
            { q: "Is there a limit on export size?", a: "No hard limit. Exports with 100,000+ responses are streamed to avoid timeout issues." },
            { q: "Can I customize the PDF report layout?", a: "Yes. You can choose which sections to include, set branding, and select chart types for each question." },
        ],
    },
    "api-documentation": {
        slug: "api-documentation",
        icon: Code,
        title: "API Documentation",
        tagline: "Integrate PrimoData into your applications.",
        heroDescription:
            "Our RESTful API lets you create surveys, manage respondents, collect responses, trigger analyses, and export results — all programmatically. Build automated research pipelines, embed surveys in your products, or connect PrimoData to your data warehouse.",
        sections: [
            {
                heading: "Authentication",
                body: "All API requests require an API key passed in the Authorization header. Generate API keys from your dashboard under Settings > API Keys. Keys can have scoped permissions (read-only, create, full access).",
                bullets: [
                    "Header: Authorization: Bearer pk_live_xxxxxxxx",
                    "Scoped permissions: read, create, full",
                    "Multiple keys per account for different integrations",
                    "Key rotation and revocation from dashboard",
                ],
            },
            {
                heading: "Core Endpoints",
                body: "The API follows RESTful conventions with JSON request/response bodies. All responses include standard pagination, error codes, and rate limit headers.",
                bullets: [
                    "POST /api/v1/surveys — Create a new survey",
                    "GET /api/v1/surveys/:id — Get survey details",
                    "POST /api/v1/surveys/:id/launch — Launch survey to panel",
                    "GET /api/v1/surveys/:id/responses — Get responses (paginated)",
                    "POST /api/v1/surveys/:id/analyze — Trigger statistical analysis",
                    "GET /api/v1/surveys/:id/export/:format — Export results",
                ],
            },
            {
                heading: "Webhooks",
                body: "Register webhook URLs to receive real-time notifications when new responses arrive, when analysis completes, or when a survey reaches its quota.",
                bullets: [
                    "POST /api/v1/webhooks — Register a webhook endpoint",
                    "Events: response.created, analysis.completed, survey.quota_reached",
                    "HMAC-SHA256 signature verification for security",
                    "Automatic retry with exponential backoff (3 attempts)",
                ],
            },
            {
                heading: "Rate Limits & Errors",
                body: "API rate limits are per-key and vary by plan. All errors follow RFC 7807 format with human-readable messages and machine-parseable error codes.",
                bullets: [
                    "Standard tier: 100 requests/minute",
                    "Enterprise tier: 1,000 requests/minute",
                    "Rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining",
                    "Error format: { type, title, status, detail, instance }",
                ],
            },
        ],
        useCases: [
            "SaaS platforms embedding survey capabilities into their product",
            "Data engineering teams building automated survey-to-BigQuery pipelines",
            "Research departments automating recurring survey deployments",
            "Mobile app teams collecting in-app feedback via API",
        ],
        faqs: [
            { q: "Is there an SDK or client library?", a: "Not yet — but our API is straightforward REST with JSON. We plan to release Python and JavaScript SDKs in Q3 2026." },
            { q: "Can I test without affecting live data?", a: "Yes. Use your sandbox API key (pk_test_...) which operates on isolated test data." },
            { q: "What&apos;s the API uptime SLA?", a: "We target 99.9% uptime. Enterprise clients get a formal SLA with compensation for downtime." },
        ],
    },
};

const serviceOrder = [
    "advanced-analytics",
    "ai-powered-insights",
    "targeted-panels",
    "quality-scoring",
    "enterprise-security",
    "multi-format-export",
    "api-documentation",
];

export default function ServiceDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const service = serviceMap[slug];

    if (!service) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Service not found</h1>
                    <p className="text-slate-500 mb-6">The service you are looking for does not exist.</p>
                    <Link href="/" className="text-violet-600 font-medium hover:underline">Return to Home</Link>
                </div>
            </div>
        );
    }

    const currentIndex = serviceOrder.indexOf(slug);
    const prevService = currentIndex > 0 ? serviceMap[serviceOrder[currentIndex - 1]] : null;
    const nextService = currentIndex < serviceOrder.length - 1 ? serviceMap[serviceOrder[currentIndex + 1]] : null;

    const Icon = service.icon;

    return (
        <div className="min-h-screen bg-white">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-violet-200">P</div>
                        <span className="text-lg font-bold text-slate-900 tracking-tight">PrimoData</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#services" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">All Services</Link>
                        <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">Sign in</Link>
                        <Link href="/register" className="h-9 px-5 inline-flex items-center rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 shadow-md shadow-violet-200">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href="/#services" className="hover:text-slate-600 transition-colors">Services</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-slate-700 font-medium">{service.title}</span>
                </div>
            </div>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-50/40 to-white pointer-events-none" />
                <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-20">
                    <div className="max-w-3xl">
                        <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 mb-6">
                            <Icon className="w-7 h-7" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                            {service.title}
                        </h1>
                        <p className="text-xl text-violet-600 font-medium mb-6">{service.tagline}</p>
                        <p className="text-lg text-slate-600 leading-relaxed mb-8">{service.heroDescription}</p>
                        <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200">
                            Start Using {service.title} <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Content sections */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="space-y-20">
                        {service.sections.map((section, idx) => (
                            <div key={idx} className={`grid md:grid-cols-2 gap-12 items-start ${idx % 2 !== 0 ? "md:direction-rtl" : ""}`}>
                                <div className={idx % 2 !== 0 ? "md:order-2" : ""}>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold mb-4">
                                        {String(idx + 1).padStart(2, "0")}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{section.heading}</h2>
                                    <p className="text-slate-600 leading-relaxed mb-6">{section.body}</p>
                                    {section.bullets && (
                                        <ul className="space-y-2.5">
                                            {section.bullets.map((b) => (
                                                <li key={b} className="flex items-start gap-2.5 text-sm text-slate-700">
                                                    <CheckCircle2 className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />{b}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className={`rounded-2xl bg-gradient-to-br from-slate-50 to-violet-50/30 border border-slate-100 p-8 min-h-[280px] flex items-center justify-center ${idx % 2 !== 0 ? "md:order-1" : ""}`}>
                                    <div className="text-center opacity-60">
                                        <Icon className="w-16 h-16 text-violet-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-400 font-medium">{section.heading}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-10 text-center">Who uses {service.title}?</h2>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {service.useCases.map((uc) => (
                            <div key={uc} className="flex items-start gap-3 bg-white rounded-xl border border-slate-200 p-5">
                                <Users className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-slate-700 leading-relaxed">{uc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-10 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {service.faqs.map((faq, idx) => (
                            <div key={idx} className="border-b border-slate-100 pb-6 last:border-0">
                                <h3 className="text-base font-semibold text-slate-900 mb-2">{faq.q}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Navigation between services */}
            <section className="border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {prevService ? (
                        <Link href={`/services/${prevService.slug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-violet-600 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> {prevService.title}
                        </Link>
                    ) : <div />}
                    {nextService ? (
                        <Link href={`/services/${nextService.slug}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-violet-600 transition-colors">
                            {nextService.title} <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : <div />}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-br from-violet-600 to-indigo-700">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to use {service.title}?</h2>
                    <p className="text-violet-100 mb-8">Create your account and start your first research project in minutes.</p>
                    <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-violet-700 font-semibold hover:bg-violet-50 transition-colors shadow-xl">
                        Get Started Free <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-slate-50 py-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">P</div>
                        <span className="text-sm font-bold text-slate-900">PrimoData</span>
                    </div>
                    <p className="text-xs text-slate-500">© 2026 PrimoData Analytics Pvt. Ltd. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
