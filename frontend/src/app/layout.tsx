import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { getSiteConfig } from "@/lib/site-config";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export async function generateMetadata(): Promise<Metadata> {
  const cfg = await getSiteConfig();
  const seo = cfg.seo;
  const sys = cfg.system;
  const titleTemplate = seo.titleTemplate?.includes("%s")
    ? seo.titleTemplate
    : `%s | ${sys.siteName || "PrimoData"}`;

  return {
    title: { default: seo.title || sys.siteName || "PrimoData", template: titleTemplate },
    description: seo.description || sys.tagline || undefined,
    keywords: seo.keywords ? seo.keywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
    icons: sys.faviconUrl ? { icon: sys.faviconUrl } : undefined,
    metadataBase: seo.canonicalUrl ? new URL(seo.canonicalUrl) : undefined,
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: seo.robotsIndex
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: seo.title || sys.siteName,
      description: seo.description || undefined,
      siteName: seo.ogSiteName || sys.siteName,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
      url: seo.canonicalUrl || undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: seo.twitterHandle || undefined,
      title: seo.title || sys.siteName,
      description: seo.description || undefined,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
    verification: {
      google: seo.googleVerification || undefined,
      other: seo.bingVerification ? { "msvalidate.01": seo.bingVerification } : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cfg = await getSiteConfig();
  const primary = cfg.system.primaryColor || "#7C3AED";
  const themeAttr = cfg.system.theme === "dark" ? "dark" : "light";

  return (
    <html lang={cfg.system.language || "en"} data-theme={themeAttr} style={{ ["--brand-primary" as never]: primary }}>
      <body
        className={`${poppins.variable} ${geistMono.variable} font-poppins antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
