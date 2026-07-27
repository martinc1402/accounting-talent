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
};

export default nextConfig;
