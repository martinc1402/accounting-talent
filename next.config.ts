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
    /employers was the firm-facing page until the homepage itself became one.
    There is no second employer page to send people to, so the route redirects
    rather than lingering as a duplicate pitch.

    Permanent (308, not 301: Next uses 308 so the request method survives) because
    the destination is not coming back, and the ad spend, inbound links and link
    equity pointing at /employers should all follow. Redirects are checked before
    the filesystem, so this wins even if the route is ever recreated by accident.

    The fragment is not sent to the server, so /employers#faq lands on "/" and the
    browser resolves #faq against the new page. That anchor still exists.
  */
  async redirects() {
    return [{ source: "/employers", destination: "/", permanent: true }];
  },
};

export default nextConfig;
