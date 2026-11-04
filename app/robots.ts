import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gabvia.app").replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/translator", "/support", "/privacy", "/terms", "/delete-account"],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/chat",
          "/login",
          "/register",
          "/forgot-password",
        ],
      },
      // Explicitly allow leading AI search engines and search retrieval crawlers
      {
        userAgent: [
          "Google-Extended",
          "GPTBot",
          "ClaudeBot",
          "PerplexityBot",
          "Applebot",
          "Bingbot",
        ],
        allow: ["/", "/translator", "/support", "/privacy", "/terms"],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/chat",
          "/login",
          "/register",
          "/forgot-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
