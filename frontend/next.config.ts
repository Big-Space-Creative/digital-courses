import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    proxyClientMaxBodySize: "100mb",
  },
  images: {
    domains: ["images.unsplash.com"],
    remotePatterns: [{ protocol: "https", hostname: "example.com" }],
  },
};

export default nextConfig;
