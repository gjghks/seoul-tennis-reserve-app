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
  title: "Seoul Tennis Reserve | Real-time Court Alerts",
  description: "Get notified when tennis courts in Seoul become available.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Replace with actual AdSense Publisher ID */}
        <AdSense pId="ca-pub-0000000000000000" />
        {children}
      </body>
    </html>
  );
}
