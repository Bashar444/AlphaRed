"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Brain,
  Globe,
  Lock,
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  Menu,
  X,
  ChevronRight,
  Shield,
  Layers,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";

/* ── CMS types ──────────────────────────────────── */

interface CmsMenuItem {
  id: string;
  label: string;
  url: string;
  target: "_self" | "_blank";
  status: string;
}

interface FooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

interface SocialLink {
  platform: string;
  url: string;
}

interface FooterConfig {
  columns: FooterColumn[];
  copyright: string;
  social_links: SocialLink[];
}

/* ── Service features — each links to /services/[slug] ── */

const services = [
  {
    slug: "advanced-analytics",
    icon: BarChart3,
    title: "Advanced Analytics",
    summary: "Descriptive, inferential, correlation and regression analysis — computed automatically from your survey responses.",
    highlights: ["Descriptive stats (mean, median, mode, SD)", "Inferential analysis (t-tests, ANOVA, chi-square)", "Correlation matrices & regression", "Cross-tabulation with significance"],
  },
  {
    slug: "ai-powered-insights",
    icon: Brain,
    title: "AI-Powered Insights",
    summary: "Claude AI generates publication-ready narrative summaries, identifies patterns, and recommends actions from your data.",
    highlights: ["Natural language summaries", "Pattern & anomaly detection", "Actionable recommendations", "Publication-ready narrative export"],
  },
  {
    slug: "targeted-panels",
    icon: Globe,
    title: "Targeted Panels",
    summary: "Reach specific demographics through our respondent matching engine. Filter by age, location, profession, and custom criteria.",
    highlights: ["Demographic targeting (age, gender, location)", "Professional & industry filters", "Custom screening questions", "Quality-scored respondent pool"],
  },
  {
    slug: "quality-scoring",
    icon: Zap,
    title: "Quality Scoring",
    summary: "Automated quality gates filter rushed, straight-lined, and inconsistent responses before they reach your analysis.",
    highlights: ["Response time analysis", "Straight-line detection", "Consistency checking", "Automated flag & filter system"],
  },
  {
    slug: "enterprise-security",
    icon: Lock,
    title: "Enterprise Security",
    summary: "End-to-end encryption, GDPR compliance, role-based access control, and audit logging for institutional research.",
    highlights: ["End-to-end data encryption", "GDPR & data privacy compliance", "Role-based access control (RBAC)", "Full audit trail & logging"],
  },
  {
    slug: "multi-format-export",
    icon: Star,
    title: "Multi-Format Export",
    summary: "Download results as CSV, Excel, PDF reports, or full ZIP bundles. Integrate via API for automated data pipelines.",
    highlights: ["CSV (raw data)", "Excel with formatted sheets", "PDF reports with charts", "API access for automation"],
  },
];

/* ── Stats (social proof) ────────────────────────── */

const socialStats = [
  { label: "Surveys Created", value: "10,000+" },
  { label: "Responses Collected", value: "2M+" },
  { label: "Research Institutions", value: "500+" },
  { label: "Countries", value: "24" },
];

/* ── How it works ────────────────────────────────── */

const howItWorks = [
  { step: "01", title: "Design Your Survey", desc: "Use our drag-and-drop builder with 14 question types, logic branching, and multi-language support." },
  { step: "02", title: "Target & Launch", desc: "Define your audience criteria and launch to our verified respondent panel or distribute via shareable link." },
  { step: "03", title: "Collect Quality Data", desc: "Automated quality scoring filters out low-effort responses in real time as they come in." },
  { step: "04", title: "Analyze & Export", desc: "Run statistical analysis with one click. Export publication-ready reports or pipe data via API." },
];

export default function LandingPage() {
  const [menuItems, setMenuItems] = useState<CmsMenuItem[]>([]);
  const [footer, setFooter] = useState<FooterConfig | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    api.publicCms.menus().then((data) => {
      if (Array.isArray(data)) setMenuItems(data.filter((m: CmsMenuItem) => m.status === "active"));
    }).catch(() => { });
    api.publicCms.footer().then((data) => {
      if (data && typeof data === "object") setFooter(data as FooterConfig);
    }).catch(() => { });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ━━ NAVBAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-violet-200">P</div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">PrimoData</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Services</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            <Link href="/services/api-documentation" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">API</Link>
            {menuItems.map((item) => (
              <Link key={item.id} href={item.url} target={item.target} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">{item.label}</Link>
            ))}
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Sign in</Link>
            <Link href="/register" className="h-9 px-5 inline-flex items-center rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors shadow-md shadow-violet-200">
              Get Started
            </Link>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3">
            <a href="#services" className="block text-sm text-slate-700 py-1.5" onClick={() => setMobileMenu(false)}>Services</a>
            <a href="#how-it-works" className="block text-sm text-slate-700 py-1.5" onClick={() => setMobileMenu(false)}>How It Works</a>
            <a href="#pricing" className="block text-sm text-slate-700 py-1.5" onClick={() => setMobileMenu(false)}>Pricing</a>
            <Link href="/services/api-documentation" className="block text-sm text-slate-700 py-1.5">API Docs</Link>
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1 h-10 flex items-center justify-center rounded-lg border border-slate-300 text-sm font-medium text-slate-700">Sign in</Link>
              <Link href="/register" className="flex-1 h-10 flex items-center justify-center rounded-lg bg-violet-600 text-white text-sm font-medium">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/60 via-white to-white pointer-events-none" />
        <div className="absolute top-20 -left-40 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -right-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold mb-8 border border-violet-100">
            <Zap className="w-3.5 h-3.5" /> Enterprise Survey Analytics Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-5xl mx-auto">
            Research-grade surveys.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600">
              Enterprise results.
            </span>
          </h1>
          <p className="mt-8 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Design targeted surveys, collect quality-scored responses, and generate publication-ready statistical analysis — all powered by AI.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="h-13 px-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 text-white font-semibold text-base hover:bg-violet-700 transition-all shadow-xl shadow-violet-200/60 hover:shadow-violet-300/60 py-3.5">
              Start Your Research <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#services" className="h-13 px-8 inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-base hover:border-slate-300 hover:bg-slate-50 transition-all py-3.5">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* ━━ SOCIAL PROOF STATS ━━━━━━━━━━━━━━━━━━━ */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {socialStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ SERVICES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="services" className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-violet-600 tracking-widest uppercase mb-3">Our Services</p>
            <h2 className="text-4xl font-bold text-slate-900">Everything you need for enterprise research</h2>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">Each service is built for institutional-grade research. Click any service to learn more about how it works and what&apos;s included.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-xl hover:border-violet-200 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 mb-5 group-hover:bg-violet-100 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-violet-700 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{svc.summary}</p>
                  <ul className="space-y-1.5 mb-5">
                    {svc.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-xs text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />{h}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 group-hover:gap-2 transition-all">
                    Learn more <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="how-it-works" className="py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-violet-600 tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="text-4xl font-bold text-slate-900">From survey to insight in four steps</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-black text-violet-100 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ PRICING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="pricing" className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-violet-600 tracking-widest uppercase mb-3">Pricing</p>
            <h2 className="text-4xl font-bold text-slate-900">Flexible pricing based on your needs</h2>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">
              Our pricing is request-based — you pay based on the scope and complexity of your research project. Plans are customized by our team to match your exact requirements.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl border border-violet-100 p-10 md:p-14">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Custom Research Plans</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Every research project is unique. Our admin team designs a custom plan based on your survey volume, respondent requirements, and analysis depth. Pricing is per-request and scales with your needs.
                  </p>
                  <ul className="space-y-3">
                    {["Pay per research project — no wasted subscriptions", "Admin-configured based on your exact requirements", "Scale up or down as your research evolves", "Volume discounts for institutional accounts", "Dedicated support for enterprise clients"].map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />{feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
                  <p className="text-sm font-medium text-violet-600 mb-2">Starting from</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-slate-900">₹499</span>
                    <span className="text-slate-500">/request</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-3 mb-6">Based on project scope & complexity</p>
                  <Link href="/register" className="w-full h-12 flex items-center justify-center rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200">
                    Get a Custom Quote
                  </Link>
                  <p className="text-xs text-slate-400 mt-3">No credit card required. Talk to our team first.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ API SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-28 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-violet-400 tracking-widest uppercase mb-3">Developer API</p>
              <h2 className="text-3xl font-bold text-white mb-6">Build on top of PrimoData</h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Integrate survey creation, response collection, and analytics into your own applications using our RESTful API. Automate your entire research pipeline.
              </p>
              <ul className="space-y-3 mb-8">
                {["RESTful API with JSON responses", "API key authentication", "Webhook notifications for new responses", "Rate-limited with generous quotas"].map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />{feat}
                  </li>
                ))}
              </ul>
              <Link href="/services/api-documentation" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors">
                Read API Documentation <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 font-mono text-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <pre className="text-slate-300 overflow-x-auto"><code>{`curl -X POST /api/v1/surveys \\
  -H "Authorization: Bearer pk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Customer Satisfaction Q4",
    "questions": [
      {
        "type": "RATING",
        "text": "How satisfied are you?",
        "required": true
      }
    ]
  }'`}</code></pre>
              <div className="mt-4 pt-4 border-t border-slate-800 text-emerald-400 text-xs">
                {`// → 201 Created { "id": "srv_abc123", "status": "DRAFT" }`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ TRUST / WHY PRIMODATA ━━━━━━━━━━━━━━━━ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-600 tracking-widest uppercase mb-3">Why PrimoData</p>
            <h2 className="text-4xl font-bold text-slate-900">Built for serious research</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Institutional Grade", desc: "Built for universities, think tanks, and enterprise research teams. GDPR compliant with full audit trails." },
              { icon: TrendingUp, title: "Publication Ready", desc: "Statistical outputs formatted for academic journals. AI-generated narratives save hours of analysis writing." },
              { icon: Layers, title: "Full Stack Platform", desc: "Survey design, respondent management, data collection, analysis, and export — all in one platform." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="text-center px-4">
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 mx-auto mb-5">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━ CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-28 bg-gradient-to-br from-violet-600 to-indigo-700">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-5">Ready to elevate your research?</h2>
          <p className="text-violet-100 text-lg mb-10">Join hundreds of researchers and institutions using PrimoData for enterprise-grade survey analytics.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="h-13 px-8 inline-flex items-center gap-2 rounded-xl bg-white text-violet-700 font-semibold hover:bg-violet-50 transition-colors shadow-xl py-3.5">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/services/api-documentation" className="h-13 px-8 inline-flex items-center gap-2 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors py-3.5">
              View API Docs
            </Link>
          </div>
        </div>
      </section>

      {/* ━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-5 gap-10 mb-12">
            {/* Brand column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">P</div>
                <span className="text-lg font-bold text-slate-900">PrimoData</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Enterprise survey analytics platform. Design, collect, analyze, and export — all in one place.
              </p>
            </div>
            {/* Services column */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Services</h4>
              <ul className="space-y-2.5">
                {services.map((svc) => (
                  <li key={svc.slug}><Link href={`/services/${svc.slug}`} className="text-sm text-slate-500 hover:text-violet-600 transition-colors">{svc.title}</Link></li>
                ))}
              </ul>
            </div>
            {/* Platform column */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li><Link href="/services/api-documentation" className="text-sm text-slate-500 hover:text-violet-600 transition-colors">API Documentation</Link></li>
                <li><Link href="/register" className="text-sm text-slate-500 hover:text-violet-600 transition-colors">Create Account</Link></li>
                <li><Link href="/login" className="text-sm text-slate-500 hover:text-violet-600 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            {/* CMS footer columns + social */}
            <div>
              {footer && footer.columns.length > 0 && (
                <>
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">{footer.columns[0]?.title || "Links"}</h4>
                  <ul className="space-y-2.5">
                    {footer.columns[0]?.links.map((link, j) => (
                      <li key={j}><Link href={link.url} className="text-sm text-slate-500 hover:text-violet-600 transition-colors">{link.label}</Link></li>
                    ))}
                  </ul>
                </>
              )}
              {footer && footer.social_links && footer.social_links.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Social</h4>
                  <div className="flex items-center gap-3">
                    {footer.social_links.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-violet-600 capitalize transition-colors">{s.platform}</a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">{footer?.copyright || "© 2026 PrimoData Analytics Pvt. Ltd. All rights reserved."}</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}