import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://seoul-tennis.vercel.app'),
  title: {
    default: "서울 테니스 | 공공 테니스장 예약",
    template: "%s | 서울 테니스",
  },
  description: "서울시 공공 테니스장 예약 현황을 실시간으로 확인하세요. 25개 자치구 공공 테니스장 예약 가능 시간을 한눈에.",
  keywords: ["서울", "테니스장", "예약", "공공시설", "테니스", "스포츠", "예약현황"],
  authors: [{ name: "서울 테니스" }],
  creator: "서울 테니스",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://seoul-tennis.vercel.app",
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
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={geist.className}>
        <GoogleAnalytics />
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
