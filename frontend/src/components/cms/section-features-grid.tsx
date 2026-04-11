interface Feature {
    icon?: string;
    title: string;
    description: string;
}

interface FeaturesGridContent {
    features_json?: string;
    features?: Feature[];
}

function parse(content: FeaturesGridContent): Feature[] {
    if (Array.isArray(content.features)) return content.features;
    if (content.features_json) {
        try {
            return JSON.parse(content.features_json);
        } catch {
            return [];
        }
    }
    return [];
}

export function SectionFeaturesGrid({ content }: { content: FeaturesGridContent }) {
    const features = parse(content);
    if (features.length === 0) return null;

    return (
        <section className="py-16 px-6 bg-slate-50">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                {features.map((f, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                    >
                        {f.icon && (
                            <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 mb-4 text-xl">
                                {f.icon}
                            </div>
                        )}
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {f.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {f.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
