import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gabvia.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/translator", "/privacy", "/terms"],
        disallow: ["/admin", "/admin/*", "/api/*"],
      },
      // Explicitly allow modern AI Search & Retrieval Crawlers for AI Citation indexing
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Applebot", "Google-Extended", "Bingbot"],
        allow: ["/", "/translator"],
        disallow: ["/admin", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
