interface StatItem {
    value: string;
    label: string;
    icon?: string;
}

interface StatsContent {
    items_json?: string;
    items?: StatItem[];
}

function parse(content: StatsContent): StatItem[] {
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

export function SectionStats({ content }: { content: StatsContent }) {
    const items = parse(content);
    if (items.length === 0) return null;

    return (
        <section className="py-16 px-6 bg-violet-50">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                {items.map((stat, i) => (
                    <div key={i} className="text-center">
                        {stat.icon && (
                            <div className="text-2xl mb-2">{stat.icon}</div>
                        )}
                        <div className="text-3xl font-bold text-slate-900">
                            {stat.value}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
