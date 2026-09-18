import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["youtube-dl-exec"],
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/youtube-dl-exec/bin/**/*'],
  },
};

export default nextConfig;
