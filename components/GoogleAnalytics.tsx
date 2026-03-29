'use client';

import { useEffect } from 'react';
import Script from 'next/script';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_TRACKING_ID) return;

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.gtag?.('event', 'page_view');
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}');
        `}
      </Script>
    </>
  );
}
