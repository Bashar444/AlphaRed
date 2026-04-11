import { SectionHero } from "./section-hero";
import { SectionTextBlock } from "./section-text-block";
import { SectionFeaturesGrid } from "./section-features-grid";
import { SectionCta } from "./section-cta";
import { SectionTestimonials } from "./section-testimonials";
import { SectionFaq } from "./section-faq";
import { SectionImageGallery } from "./section-image-gallery";
import { SectionPricing } from "./section-pricing";
import { SectionStats } from "./section-stats";
import { SectionContactForm } from "./section-contact-form";

interface CmsSection {
    id?: number;
    type: string;
    title: string;
    content: Record<string, unknown>;
    sort_order: number;
    status: string;
}

const renderers: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.ComponentType<{ content: any }>
> = {
    hero: SectionHero,
    text_block: SectionTextBlock,
    features_grid: SectionFeaturesGrid,
    cta: SectionCta,
    testimonials: SectionTestimonials,
    faq: SectionFaq,
    image_gallery: SectionImageGallery,
    pricing: SectionPricing,
    stats: SectionStats,
    contact_form: SectionContactForm,
};

export function SectionRenderer({ sections }: { sections: CmsSection[] }) {
    return (
        <>
        {
            sections
                .filter((s) => s.status === "active")
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((section) => {
                    const Component = renderers[section.type];
                    if (!Component) return null;
                    return (
                        <Component
                            key={section.id || section.sort_order }
                    content={section.content }
                        />
                    );
        })
}
</>
    );
}

export {
    SectionHero,
    SectionTextBlock,
    SectionFeaturesGrid,
    SectionCta,
    SectionTestimonials,
    SectionFaq,
    SectionImageGallery,
    SectionPricing,
    SectionStats,
    SectionContactForm,
};
