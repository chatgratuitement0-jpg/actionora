import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://actionora.com";
const siteName = "Actionora";
const description =
  "Actionora helps freelancers and small teams stay on top of client follow-ups, payments and the next action that needs attention.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Actionora — Know what needs your attention",
    template: "%s — Actionora",
  },
  description,
  applicationName: siteName,
  category: "business",
  creator: siteName,
  publisher: siteName,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    siteName,
    title: "Actionora — Know what needs your attention",
    description,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Actionora — Know what needs your attention",
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
  };

  return (
    <html lang="en" dir="ltr">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organization, website, software]),
          }}
        />
      </body>
    </html>
  );
}
