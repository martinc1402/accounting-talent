import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the on-screen Next.js dev indicator (the "N" badge). Compile/runtime
  // errors are still surfaced.
  devIndicators: false,
  experimental: {
    // Candidate photo uploads run through a Server Action; the default request
    // body cap is 1MB, so raise it to comfortably fit a 5MB image + multipart
    // overhead. The action itself still rejects anything over 5MB.
    serverActions: { bodySizeLimit: "6mb" },
  },

  /*
    Retired and hidden routes, after the 2026-10 simplification to a single
    product (the job-search membership on "/").

    - /apply, /employers, /faq: deleted. The redirect catches old links, ads and
      bookmarks so they land on "/" rather than a 404.
    - /accountants: code kept, page hidden.
    - /login, /candidates, /employer, /assessment: the logged-in areas, shut down
      for now. Their code is kept (a paywall will need sign-in again). Emailed
      assessment links and dashboard bookmarks now land on "/".

    TEMPORARY (307), NOT PERMANENT, deliberately. These routes may come back, and
    browsers cache a permanent 308 indefinitely: when /employers 308'd to "/"
    earlier, bringing it back meant returning visitors kept being bounced until
    their cache cleared. A 307 is re-checked on every visit.

    `/:path*` matches the bare route as well as anything beneath it. /auth/* (the
    magic-link callback and sign-out) and /api/* are left alone; with the pages
    gone nothing links to them.

    lib/content/ctas.test.ts asserts every route here stays covered and
    temporary.
  */
  async redirects() {
    const retired = [
      "/apply",
      "/employers",
      "/faq",
      "/accountants",
      "/login",
      "/candidates",
      "/employer",
      "/assessment",
    ];
    return retired.map((route) => ({
      source: `${route}/:path*`,
      destination: "/",
      permanent: false,
    }));
  },
};

export default nextConfig;
