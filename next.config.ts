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
    No redirects. /employers used to 308 to "/" while the homepage was the firm
    pitch; it is a real route again now that "/" is the job-seeker membership
    page. Browsers that cached the old permanent redirect will keep sending
    /employers to "/" until their cache clears, which was accepted as a cost.
  */
};

export default nextConfig;
