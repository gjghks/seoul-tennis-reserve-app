import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.seoul.go.kr',
      },
      {
        protocol: 'http',
        hostname: '**.seoul.go.kr',
      },
      {
        protocol: 'https',
        hostname: 'yeyak.seoul.go.kr',
      },
    ],
  },
};

export default nextConfig;
