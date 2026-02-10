import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/my',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://adservice.google.com https://tpc.googlesyndication.com https://*.kakao.com https://*.daumcdn.net${process.env.NODE_ENV === 'development' ? ' http://*.kakao.com http://*.daumcdn.net' : ''}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.daumcdn.net",
              `img-src 'self' data: blob: https:${process.env.NODE_ENV === 'development' ? ' http://*.daumcdn.net http://*.kakao.com' : ''}`,
              "font-src 'self' https://fonts.gstatic.com",
              `connect-src 'self' https://*.supabase.co https://pagead2.googlesyndication.com https://www.google-analytics.com https://openAPI.seoul.go.kr:8088 https://apihub.kma.go.kr https://*.kakao.com https://*.daumcdn.net wss://*.supabase.co${process.env.NODE_ENV === 'development' ? ' http://*.kakao.com http://*.daumcdn.net ws://localhost:*' : ''}`,
              "frame-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.seoul.go.kr',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default withSerwist(nextConfig);
