import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://actionora.com"),
  title: {
    default: "Actionora — Know what needs your attention.",
    template: "%s — Actionora",
  },
  description:
    "Stay ahead of clients, payments and follow-ups with clear next actions.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}