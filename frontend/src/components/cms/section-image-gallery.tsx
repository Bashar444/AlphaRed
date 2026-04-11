interface GalleryImage {
    url: string;
    alt?: string;
    caption?: string;
}

interface ImageGalleryContent {
    images_json?: string;
    images?: GalleryImage[];
}

function parse(content: ImageGalleryContent): GalleryImage[] {
    if (Array.isArray(content.images)) return content.images;
    if (content.images_json) {
        try {
            return JSON.parse(content.images_json);
        } catch {
            return [];
        }
    }
    return [];
}

export function SectionImageGallery({ content }: { content: ImageGalleryContent }) {
    const images = parse(content);
    if (images.length === 0) return null;

    return (
        <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, i) => (
                    <figure key={i} className="group overflow-hidden rounded-xl">
                        <img
                            src={img.url}
                            alt={img.alt || ""}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {img.caption && (
                            <figcaption className="mt-2 text-xs text-slate-500 text-center">
                                {img.caption}
                            </figcaption>
                        )}
                    </figure>
                ))}
            </div>
        </section>
    );
}
