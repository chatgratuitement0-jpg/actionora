import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://actionora.com";

const routes = [
  "/", "/product", "/how-it-works", "/pricing", "/security", "/about", "/contact",
  "/resources", "/tools",
  "/tools/invoice-follow-up-generator", "/tools/payment-due-calculator",
  "/tools/client-follow-up-generator", "/tools/late-payment-calculator",
  "/tools/follow-up-templates", "/templates", "/guides", "/guides/how-to-follow-up-overdue-invoice", "/guides/client-stops-responding", "/guides/task-list-vs-client-context", "/guides/simple-client-follow-up-system", "/faq", "/case-studies",
  "/try", "/privacy", "/terms", "/cookies", "/acceptable-use",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: path === "/" ? "weekly" : path.startsWith("/tools") ? "monthly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/tools/") ? 0.9 : path === "/tools" || path === "/resources" ? 0.85 : 0.7,
  }));
}
