export type MapProvider = 'tmap' | 'naver' | 'kakao';

export interface MapDestination {
  lat: number;
  lng: number;
  name: string;
}

export interface MapProviderInfo {
  id: MapProvider;
  label: string;
  color: string;
  colorNeo: string;
}

export const MAP_PROVIDERS: MapProviderInfo[] = [
  { id: 'tmap', label: 'T맵', color: 'bg-red-50 text-red-700 border-red-200', colorNeo: 'bg-[#ff4444] text-black border-black' },
  { id: 'naver', label: '네이버 지도', color: 'bg-green-50 text-green-700 border-green-200', colorNeo: 'bg-[#03c75a] text-black border-black' },
  { id: 'kakao', label: '카카오맵', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', colorNeo: 'bg-[#fee500] text-black border-black' },
];

interface GeoPosition {
  lat: number;
  lng: number;
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/** Try to get current position with a short timeout. Returns null on failure/denial. */
function getCurrentPosition(timeoutMs: number = 3000): Promise<GeoPosition | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(null);
  if (typeof window !== 'undefined' && !window.isSecureContext) return Promise.resolve(null);

  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 60000 },
    );
  });
}

/**
 * Clean a court/facility name for map service search.
 * Strips court-specific suffixes (1면, A코트, etc.) that don't match map POIs,
 * while preserving the core facility name for searchability.
 */
export function cleanCourtNameForMap(name: string): string {
  let cleaned = name;

  // Handle '>' hierarchy paths (e.g., "서울물재생시설공단>탄천물재생센터")
  if (cleaned.includes('>')) {
    const parts = cleaned.split('>');
    const after = parts[parts.length - 1].trim();
    cleaned = after.length > 2 ? after : parts[0].trim();
  }

  cleaned = cleaned
    .replace(/\s*\d+면\s*$/g, '')              // trailing court face: "1면", "2면"
    .replace(/\s*[A-Za-z]코트\s*/g, '')         // letter courts: "A코트", "B코트"
    .replace(/\s*\d+번?\s*코트\s*/g, '')        // numbered courts: "1코트", "1번 코트"
    .replace(/\s*\([^)]*\)\s*/g, '')            // parenthetical: "(주말 대관)", "(야간)"
    .replace(/\s*\[[^\]]*\]\s*/g, '')           // brackets: "[야간]"
    .replace(/\d{1,2}월\d{1,2}일(~\d{1,2}(월\d{1,2})?일)?/g, '')  // date ranges
    .replace(/\d{1,2}월_?/g, '')                // months: "1월", "2월_"
    .replace(/\d{2,4}년_?/g, '')                // years: "2024년"
    .replace(/\d{1,2}[:시]\d{0,2}(~\d{1,2}[:시]\d{0,2})?/g, '')  // time ranges
    .replace(/평일|주말|주간|야간|공휴일|할증|낮|접수|대관|이용|예약/g, '')  // temporal keywords
    .replace(/\s+/g, ' ')                       // normalize whitespace
    .trim();

  return cleaned || name;  // fallback to original if cleaning empties the string
}

function buildDeepLink(provider: MapProvider, dest: MapDestination, origin: GeoPosition | null): string {
  const { lat, lng, name } = dest;
  const encoded = encodeURIComponent(name);
  const originLabel = encodeURIComponent('현재위치');

  switch (provider) {
    case 'tmap':
      if (isIOS()) {
        const base = `tmap://route?rGoName=${encoded}&rGoX=${lng}&rGoY=${lat}`;
        return origin ? `${base}&rSName=${originLabel}&rSX=${origin.lng}&rSY=${origin.lat}` : base;
      } {
        const base = `tmap://route?goalname=${encoded}&goalx=${lng}&goaly=${lat}`;
        return origin ? `${base}&startname=${originLabel}&startx=${origin.lng}&starty=${origin.lat}` : base;
      }

    case 'naver': {
      const base = `nmap://navigation?dlat=${lat}&dlng=${lng}&dname=${encoded}&appname=https://seoul-tennis.com`;
      return origin ? `${base}&slat=${origin.lat}&slng=${origin.lng}&sname=${originLabel}` : base;
    }

    case 'kakao':
      return origin
        ? `kakaomap://route?sp=${origin.lat},${origin.lng}&ep=${lat},${lng}&by=car`
        : `kakaomap://route?ep=${lat},${lng}&by=car`;
  }
}

function getWebFallback(provider: MapProvider, dest: MapDestination, origin: GeoPosition | null): string {
  const { lat, lng, name } = dest;
  const encoded = encodeURIComponent(name);
  const originLabel = encodeURIComponent('현재위치');

  switch (provider) {
    case 'kakao':
      // Kakao web link/to format doesn't support origin — Kakao handles "내 위치" in-app
      return `https://map.kakao.com/link/to/${encoded},${lat},${lng}`;

    case 'naver': {
      const destSegment = `${lng},${lat},${encoded},0,PLACE_POI`;
      const originSegment = origin
        ? `${origin.lng},${origin.lat},${originLabel},0,PLACE_POI`
        : '-';
      return `https://map.naver.com/p/directions/${originSegment}/${destSegment}/-/car?c=${lng},${lat},15,0,0,0,dh`;
    }

    case 'tmap':
      // T-Map has no web navigation — fall back to app store
      return getStoreFallback('tmap');
  }
}

function getStoreFallback(provider: MapProvider): string {
  const ios = isIOS();

  const stores: Record<MapProvider, { ios: string; android: string }> = {
    tmap: {
      ios: 'https://apps.apple.com/app/id431589174',
      android: 'https://play.google.com/store/apps/details?id=com.skt.tmap.ku',
    },
    naver: {
      ios: 'https://apps.apple.com/kr/app/id311867728',
      android: 'https://play.google.com/store/apps/details?id=com.nhn.android.nmap',
    },
    kakao: {
      ios: 'https://apps.apple.com/app/id304608425',
      android: 'https://play.google.com/store/apps/details?id=net.daum.android.map',
    },
  };

  return ios ? stores[provider].ios : stores[provider].android;
}

/**
 * Opens the selected map app with destination and origin (if geolocation available).
 * Tries to get current position with a 3-second timeout before opening.
 */
export async function openMapApp(provider: MapProvider, dest: MapDestination): Promise<void> {
  const origin = await getCurrentPosition(3000);

  if (!isMobile()) {
    window.open(getWebFallback(provider, dest, origin), '_blank');
    return;
  }

  const deepLink = buildDeepLink(provider, dest, origin);
  const storeFallback = getStoreFallback(provider);

  if (provider === 'kakao') {
    const webFallback = origin
      ? `http://m.map.kakao.com/scheme/route?sp=${origin.lat},${origin.lng}&ep=${dest.lat},${dest.lng}&by=car`
      : `http://m.map.kakao.com/scheme/route?ep=${dest.lat},${dest.lng}&by=car`;
    const start = Date.now();
    window.location.href = deepLink;
    setTimeout(() => {
      if (document.hidden) return;
      if (Date.now() - start < 2000) {
        window.location.href = webFallback;
      }
    }, 1500);
    return;
  }

  const start = Date.now();
  window.location.href = deepLink;
  setTimeout(() => {
    if (document.hidden) return;
    if (Date.now() - start < 2000) {
      window.location.href = storeFallback;
    }
  }, 1500);
}
