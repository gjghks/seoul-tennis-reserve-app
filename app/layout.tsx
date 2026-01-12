import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import AdSense from "@/components/AdSense";

export const metadata: Metadata = {
  title: "서울 테니스 예약 알림 | 실시간 코트 알림",
  description: "서울시 공공 테니스장 예약 가능 시 실시간으로 알림을 받으세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Replace with actual AdSense Publisher ID */}
        <AdSense pId="ca-pub-0000000000000000" />
        {children}
      </body>
    </html>
  );
}
