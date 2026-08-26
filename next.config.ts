import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack filesystem caching (default-on since Next 16.1) keeps
    // restoring stale globals.css chunks after edits in this project, so
    // fresh CSS rules disappear on every full reload. Disable it for dev.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
