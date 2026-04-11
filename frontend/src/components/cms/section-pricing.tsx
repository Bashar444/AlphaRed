import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface Plan {
    name: string;
    price: string;
    features: string[];
    cta_url?: string;
}

interface PricingContent {
    plans_json?: string;
    plans?: Plan[];
}

function parse(content: PricingContent): Plan[] {
    if (Array.isArray(content.plans)) return content.plans;
    if (content.plans_json) {
        try {
            return JSON.parse(content.plans_json);
        } catch {
            return [];
        }
    }
    return [];
}

export function SectionPricing({ content }: { content: PricingContent }) {
    const plans = parse(content);
    if (plans.length === 0) return null;

    return (
        <section className="py-16 px-6">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col"
                    >
                        <h3 className="text-lg font-semibold text-slate-900">
                            {plan.name}
                        </h3>
                        <div className="mt-4 text-3xl font-bold text-slate-900">
                            {plan.price}
                        </div>
                        <ul className="mt-6 space-y-3 flex-1">
                            {plan.features.map((feat, j) => (
                                <li
                                    key={j}
                                    className="flex items-center gap-2 text-sm text-slate-600"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" />
                                    {feat}
                                </li>
                            ))}
                        </ul>
                        {plan.cta_url && (
                            <Link
                                href={plan.cta_url}
                                className="mt-8 h-11 flex items-center justify-center rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                            >
                                Get Started
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
