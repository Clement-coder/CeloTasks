import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "mdpdtmtfoepvffredqgw.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  webpack(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@farcaster/mini-app-solana": false,
      "@metamask/connect-evm": false,
    };
    return config;
  },
};

export default nextConfig;
