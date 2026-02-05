import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAdSense from "@/components/GoogleAdSense";

const geist = Geist({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#22c55e",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://seoul-tennis.com'),
  title: {
    default: "서울 테니스 | 공공 테니스장 예약",
    template: "%s | 서울 테니스",
  },
  description: "서울시 공공 테니스장 예약 현황을 실시간으로 확인하세요. 25개 자치구 공공 테니스장 예약 가능 시간을 한눈에.",
  keywords: ["서울", "테니스장", "예약", "공공시설", "테니스", "스포츠", "예약현황"],
  authors: [{ name: "서울 테니스" }],
  creator: "서울 테니스",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "서울테니스",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://seoul-tennis.com",
    siteName: "서울 테니스",
    title: "서울 테니스 | 공공 테니스장 예약",
    description: "서울시 공공 테니스장 예약 현황을 실시간으로 확인하세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "서울 테니스 - 공공 테니스장 예약",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "서울 테니스 | 공공 테니스장 예약",
    description: "서울시 공공 테니스장 예약 현황을 실시간으로 확인하세요.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "KhPvMRs7o6viKGnlXAESgPhUuUZmtd5p8Z_gEOOyyI8",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "서울 테니스",
  "url": "https://seoul-tennis.com",
  "description": "서울시 공공 테니스장 예약 현황을 실시간으로 확인하세요. 25개 자치구 공공 테니스장 예약 가능 시간을 한눈에.",
  "inLanguage": "ko-KR",
  "publisher": {
    "@type": "Organization",
    "name": "서울 테니스",
    "url": "https://seoul-tennis.com"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://seoul-tennis.com/{district}"
    },
    "query-input": "required name=district"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={geist.className}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded-lg">
          메인 콘텐츠로 이동
        </a>
        <GoogleAnalytics />
        <GoogleAdSense />
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main id="main-content" className="flex-1 flex flex-col pb-20">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
