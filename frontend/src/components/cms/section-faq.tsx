import { ChevronDown } from "lucide-react";

interface FaqItem {
    question: string;
    answer: string;
}

interface FaqContent {
    items_json?: string;
    items?: FaqItem[];
}

function parse(content: FaqContent): FaqItem[] {
    if (Array.isArray(content.items)) return content.items;
    if (content.items_json) {
        try {
            return JSON.parse(content.items_json);
        } catch {
            return [];
        }
    }
    return [];
}

export function SectionFaq({ content }: { content: FaqContent }) {
    const items = parse(content);
    if (items.length === 0) return null;

    return (
        <section className="py-16 px-6">
            <div className="max-w-3xl mx-auto space-y-4">
                {items.map((faq, i) => (
                    <details
                        key={i}
                        className="group border border-slate-200 rounded-lg overflow-hidden"
                    >
                        <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50">
                            <span className="text-sm font-medium text-slate-900">
                                {faq.question}
                            </span>
                            <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="px-6 pb-4">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {faq.answer}
                            </p>
                        </div>
                    </details>
                ))}
            </div>
        </section>
    );
}
