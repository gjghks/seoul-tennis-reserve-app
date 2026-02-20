'use client';

import { useEffect, useRef, useCallback } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdBanner({ 
  adSlot, 
  adFormat = 'auto',
  className = ''
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  const pushAd = useCallback(() => {
    if (isLoaded.current) return;
    if (!adRef.current?.querySelector('.adsbygoogle')) return;

    try {
      if (!window.adsbygoogle) window.adsbygoogle = [];
      window.adsbygoogle.push({});
      isLoaded.current = true;
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) return;
    if (isLoaded.current) return;

    const script = document.querySelector<HTMLScriptElement>(
      'script[src*="adsbygoogle"]'
    );

    if (script?.dataset.loaded === 'true') {
      pushAd();
      return;
    }

    const handleLoad = () => {
      script?.setAttribute('data-loaded', 'true');
      pushAd();
    };

    if (script) {
      script.addEventListener('load', handleLoad);
      return () => script.removeEventListener('load', handleLoad);
    }
  }, [pushAd]);

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    return null;
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
