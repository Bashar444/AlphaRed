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
} from "lucide-react";

const features = [
  {
    icon: "BarChart3",
    title: "Advanced Analytics",
    desc: "Descriptive, inferential, correlation & regression analysis all built in.",
  },
  {
    icon: "Brain",
    title: "AI-Powered Insights",
    desc: "Claude AI generates publication-ready narrative summaries of your findings.",
  },
  {
    icon: "Globe",
    title: "Targeted Panels",
    desc: "Reach specific demographics with our respondent matching engine.",
  },
  {
    icon: "Zap",
    title: "Quality Scoring",
    desc: "Automated quality gates filter rushed and inconsistent responses.",
  },
  {
    icon: "Lock",
    title: "Enterprise Security",
    desc: "End-to-end encryption, GDPR compliance, and role-based access control.",
  },
  {
    icon: "Star",
    title: "Multi-Format Export",
    desc: "Download results as CSV, Excel, PDF reports, or full ZIP bundles.",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  BarChart3: <BarChart3 className="w-6 h-6" />,
  Brain: <Brain className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Lock: <Lock className="w-6 h-6" />,
  Star: <Star className="w-6 h-6" />,
};

const plans = [
  {
    name: "Basic",
    price: "\u20B9499",
    period: "/month",
    features: ["5 surveys", "10 questions each", "100 responses/survey", "CSV export", "Basic analytics"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Advanced",
    price: "\u20B91,499",
    period: "/month",
    features: ["25 surveys", "30 questions each", "500 responses/survey", "All export formats", "AI narrative", "Advanced statistics"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "\u20B94,999",
    period: "/month",
    features: ["Unlimited surveys", "Unlimited questions", "2000 responses/survey", "API access", "Priority support", "Custom branding"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
              P
            </div>
            <span className="text-lg font-bold text-slate-900">PrimoData</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Sign in</Link>
            <Link
              href="/register"
              className="h-9 px-4 inline-flex items-center rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 to-white pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" /> Trusted by 500+ researchers across India
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Survey analytics that drives{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              real decisions
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Create targeted surveys, collect quality-scored responses, and generate
            publication-ready statistical analysis — all powered by AI.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="h-12 px-6 inline-flex items-center gap-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/public/datasets"
              className="h-12 px-6 inline-flex items-center gap-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Explore Free Data
            </Link>
          </div>

          {/* Dashboard preview */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-2 shadow-2xl">
              <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 min-h-[400px] flex items-center justify-center">
                <div className="grid grid-cols-3 gap-6 w-full">
                  <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-6">
                    <p className="text-xs text-slate-400">Total Surveys</p>
                    <p className="text-3xl font-bold text-white mt-1">24</p>
                    <p className="text-xs text-emerald-400 mt-2">&uarr; 12% this month</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-6">
                    <p className="text-xs text-slate-400">Responses</p>
                    <p className="text-3xl font-bold text-white mt-1">3,847</p>
                    <p className="text-xs text-emerald-400 mt-2">&uarr; 23% this month</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-6">
                    <p className="text-xs text-slate-400">Quality Score</p>
                    <p className="text-3xl font-bold text-white mt-1">94.2</p>
                    <p className="text-xs text-emerald-400 mt-2">&uarr; 3.1 pts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-violet-600 mb-2">CAPABILITIES</p>
            <h2 className="text-3xl font-bold text-slate-900">
              Everything you need for research-grade surveys
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 mb-4">
                  {iconMap[f.icon]}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-violet-600 mb-2">PRICING</p>
            <h2 className="text-3xl font-bold text-slate-900">Plans for every research need</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-8 flex flex-col ${
                  p.popular
                    ? "border-violet-300 bg-violet-50/30 shadow-xl shadow-violet-100 ring-1 ring-violet-200 relative"
                    : "border-slate-200 bg-white"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-600 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">{p.price}</span>
                  <span className="text-slate-500 text-sm">{p.period}</span>
                </div>
                <ul className="mt-8 space-y-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 h-11 flex items-center justify-center rounded-lg font-medium text-sm transition-colors ${
                    p.popular
                      ? "bg-violet-600 text-white hover:bg-violet-700"
                      : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your research?
          </h2>
          <p className="text-slate-400 mb-8">
            Join hundreds of researchers using PrimoData for publication-quality survey analytics.
          </p>
          <Link
            href="/register"
            className="h-12 px-8 inline-flex items-center gap-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">
              P
            </div>
            <span className="text-sm font-semibold text-slate-900">PrimoData Analytics</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; 2025 PrimoData Analytics. Built for Indian researchers.
          </p>
        </div>
      </footer>
    </div>
  );
}
