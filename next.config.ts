import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Vercel sets VERCEL_GIT_COMMIT_SHA automatically on every build (no
    // dashboard config needed) but doesn't expose it to the client bundle
    // on its own — re-exporting it under NEXT_PUBLIC_ is what makes it
    // readable in BestNextRouteCard's debug panel (?debugRoute=1), so a
    // "still not fixed" report can be checked against which commit the
    // live deployment actually built from.
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? "",
  },
};

export default nextConfig;
