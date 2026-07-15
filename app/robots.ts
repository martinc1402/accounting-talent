import type { MetadataRoute } from "next";

/*
  The public site is crawlable; everything invitation-only or machine-facing is
  disallowed. /assessment is tokenised and must never be indexed; /api is the
  server surface (submit + admin); /apply is a paid-ad landing page that is
  already noindex at the page level. There is no sitemap yet, so there is nothing
  to leak an assessment URL through.
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/assessment/", "/api/", "/apply"],
    },
  };
}
