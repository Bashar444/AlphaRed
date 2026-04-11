interface Testimonial {
    name: string;
    role?: string;
    quote: string;
    avatar?: string;
}

interface TestimonialsContent {
    items_json?: string;
    items?: Testimonial[];
}

function parse(content: TestimonialsContent): Testimonial[] {
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

export function SectionTestimonials({ content }: { content: TestimonialsContent }) {
    const items = parse(content);
    if (items.length === 0) return null;

    return (
        <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                {items.map((t, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-slate-200 p-6"
                    >
                        <p className="text-sm text-slate-600 leading-relaxed italic mb-4">
                            &ldquo;{t.quote}&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            {t.avatar ? (
                                <img
                                    src={t.avatar}
                                    alt={t.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                                    {t.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    {t.name}
                                </p>
                                {t.role && (
                                    <p className="text-xs text-slate-500">{t.role}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
