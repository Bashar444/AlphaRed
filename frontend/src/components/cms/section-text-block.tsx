interface TextBlockContent {
    body_html?: string;
}

export function SectionTextBlock({ content }: { content: TextBlockContent }) {
    if (!content.body_html) return null;
    return (
        <section className="py-16 px-6">
            <div
                className="max-w-3xl mx-auto prose prose-slate prose-violet"
                dangerouslySetInnerHTML={{ __html: content.body_html }}
            />
        </section>
    );
}
