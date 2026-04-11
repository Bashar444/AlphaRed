import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroContent {
    heading?: string;
    subheading?: string;
    cta_text?: string;
    cta_url?: string;
    background_image?: string;
}

export function SectionHero({ content }: { content: HeroContent }) {
    return (
        <section
            className="relative py-24 px-6 text-center overflow-hidden"
            style={
                content.background_image
                    ? {
                        backgroundImage: `url(${content.background_image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }
                    : undefined
            }
        >
            {content.background_image && (
                <div className="absolute inset-0 bg-slate-900/60" />
            )}
            <div className="relative max-w-4xl mx-auto">
                {content.heading && (
                    <h1
                        className={`text-4xl md:text-5xl font-bold tracking-tight ${content.background_image ? "text-white" : "text-slate-900"
                            }`}
                    >
                        {content.heading}
                    </h1>
                )}
                {content.subheading && (
                    <p
                        className={`mt-6 text-lg leading-relaxed max-w-2xl mx-auto ${content.background_image ? "text-slate-200" : "text-slate-600"
                            }`}
                    >
                        {content.subheading}
                    </p>
                )}
                {content.cta_text && content.cta_url && (
                    <div className="mt-10">
                        <Link
                            href={content.cta_url}
                            className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
                        >
                            {content.cta_text}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
