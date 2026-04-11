import Link from "next/link";

interface CtaContent {
    heading?: string;
    description?: string;
    button_text?: string;
    button_url?: string;
    style?: "dark" | "light" | "violet";
}

export function SectionCta({ content }: { content: CtaContent }) {
    const style = content.style || "dark";
    const bg =
        style === "dark"
            ? "bg-slate-950 text-white"
            : style === "violet"
                ? "bg-violet-600 text-white"
                : "bg-slate-50 text-slate-900";

    return (
        <section className={`py-20 px-6 ${bg}`}>
            <div className="max-w-3xl mx-auto text-center">
                {content.heading && (
                    <h2 className="text-3xl font-bold mb-4">{content.heading}</h2>
                )}
                {content.description && (
                    <p
                        className={`mb-8 ${style === "light" ? "text-slate-600" : "text-slate-300"
                            }`}
                    >
                        {content.description}
                    </p>
                )}
                {content.button_text && content.button_url && (
                    <Link
                        href={content.button_url}
                        className={`inline-flex items-center h-12 px-8 rounded-lg font-medium transition-colors ${style === "light"
                                ? "bg-violet-600 text-white hover:bg-violet-700"
                                : "bg-white text-slate-900 hover:bg-slate-100"
                            }`}
                    >
                        {content.button_text}
                    </Link>
                )}
            </div>
        </section>
    );
}
