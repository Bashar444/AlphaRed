interface FormField {
    label: string;
    type: string;
    required?: boolean;
}

interface ContactFormContent {
    fields_json?: string;
    fields?: FormField[];
    submit_url?: string;
}

function parse(content: ContactFormContent): FormField[] {
    if (Array.isArray(content.fields)) return content.fields;
    if (content.fields_json) {
        try {
            return JSON.parse(content.fields_json);
        } catch {
            return [];
        }
    }
    return [
        { label: "Name", type: "text", required: true },
        { label: "Email", type: "email", required: true },
        { label: "Message", type: "textarea", required: true },
    ];
}

export function SectionContactForm({ content }: { content: ContactFormContent }) {
    const fields = parse(content);

    return (
        <section className="py-16 px-6">
            <div className="max-w-xl mx-auto">
                <form
                    action={content.submit_url || "#"}
                    method="POST"
                    className="space-y-4"
                >
                    {fields.map((field, i) => (
                        <div key={i}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {field.label}
                                {field.required && (
                                    <span className="text-red-500 ml-1">*</span>
                                )}
                            </label>
                            {field.type === "textarea" ? (
                                <textarea
                                    name={field.label.toLowerCase().replace(/\s+/g, "_")}
                                    required={field.required}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            ) : (
                                <input
                                    type={field.type || "text"}
                                    name={field.label.toLowerCase().replace(/\s+/g, "_")}
                                    required={field.required}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            )}
                        </div>
                    ))}
                    <button
                        type="submit"
                        className="w-full h-11 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors"
                    >
                        Send Message
                    </button>
                </form>
            </div>
        </section>
    );
}
