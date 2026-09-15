import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
  },

  images: {
    domains: ["192.168.15.84"],
  },
};

export default nextConfig;