'use client';

import { useKakaoLoader } from 'react-kakao-maps-sdk';

/**
 * Custom hook that wraps useKakaoLoader and ensures HTTPS URL is always used.
 * This fixes the CSP issue where the library's default protocol-relative URL
 * would resolve to HTTP on localhost, violating the CSP policy.
 */
export function useKakaoLoaderWithHttps() {
  return useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_KEY!,
    url: 'https://dapi.kakao.com/v2/maps/sdk.js',
  });
}
