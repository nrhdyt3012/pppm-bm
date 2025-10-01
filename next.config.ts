import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
  images: {
    domains: [
      "https://znfggwvdcmdhqtmvjcln.supabase.co",
      "https://znfggwvdcmdhqtmvjcln.storage.supabase.co",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "znfggwvdcmdhqtmvjcln.storage.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "znfggwvdcmdhqtmvjcln.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
