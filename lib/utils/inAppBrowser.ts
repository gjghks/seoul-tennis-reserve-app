export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor || '';

  return /KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\/|SamsungBrowser\/.*CrossApp|wv\)|DaumApps|trill|BytedanceWebview/i.test(ua);
}

export function getInAppBrowserName(): string | null {
  if (typeof navigator === 'undefined') return null;

  const ua = navigator.userAgent || navigator.vendor || '';

  if (/KAKAOTALK/i.test(ua)) return '카카오톡';
  if (/NAVER/i.test(ua)) return '네이버';
  if (/Instagram/i.test(ua)) return '인스타그램';
  if (/FBAN|FBAV/i.test(ua)) return '페이스북';
  if (/Line\//i.test(ua)) return '라인';
  if (/trill|BytedanceWebview/i.test(ua)) return '틱톡';
  if (/DaumApps/i.test(ua)) return '다음';

  if (/wv\)/i.test(ua)) return null;

  return null;
}

export function openInExternalBrowser(url?: string): void {
  const targetUrl = url ?? window.location.href;

  window.location.href = `intent://${targetUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
}
