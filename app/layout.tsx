import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://actionora.com"),
  title: { default: "Actionora — Know what needs your attention.", template: "%s — Actionora" },
  description: "Stay ahead of clients, payments and follow-ups with clear next actions.",
  keywords: ["client follow-up","client management","payment follow-up","invoice follow-up","next action","freelancer workflow"],
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    siteName: "Actionora",
    title: "Actionora — Know what needs your attention.",
    description: "Stay ahead of clients, payments and follow-ups with clear next actions.",
    url: "https://actionora.com",
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Actionora",
    applicationCategory: "BusinessApplication",
    description: "Client operations software focused on next actions, follow-ups and payment context.",
  };
  return <html lang="en"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} /></body></html>;
}