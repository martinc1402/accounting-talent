import type { MetadataRoute } from "next";

/*
  The public site is crawlable; everything invitation-only or machine-facing is
  disallowed. /api is the server surface. The other paths below are retired or
  shut down and redirect to "/" (next.config.ts); they stay disallowed so a
  crawler never indexes them if one is ever brought back. There is no sitemap
  yet.
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/assessment/", "/apply", "/candidates/", "/login", "/employer"],
    },
  };
}
