import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
    const cfg = await getSiteConfig();
    const sys = cfg.system;

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="max-w-md w-full text-center space-y-6">
                {sys.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sys.logoUrl} alt={sys.siteName} className="h-12 mx-auto" />
                )}
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl">
                    ⚒
                </div>
                <h1 className="text-2xl font-bold text-slate-900">We&apos;ll be right back</h1>
                <p className="text-slate-600">
                    {sys.maintenanceMessage ||
                        `${sys.siteName} is undergoing scheduled maintenance. Please check back shortly.`}
                </p>
                {sys.supportUrl && (
                    <a
                        href={sys.supportUrl}
                        className="inline-block text-sm text-violet-600 hover:underline"
                    >
                        Contact support
                    </a>
                )}
            </div>
        </main>
    );
}
