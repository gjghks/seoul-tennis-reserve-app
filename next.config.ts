import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
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

export default withSerwist(nextConfig);
