import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Metadata } from 'next';

// Page modules pull in client components that create a Supabase browser client at import time.
vi.mock('@supabase/ssr', () => ({ createBrowserClient: vi.fn(() => ({})), createServerClient: vi.fn(() => ({})) }));

// Pages that used to inherit the root layout's canonical (the home page),
// which told Google they were duplicates of `/`.
const SELF_CANONICAL_PAGES: [string, () => Promise<{ metadata: Metadata }>][] = [
  ['/ladder', () => import('./ladder/page')],
  ['/transfers', () => import('./transfers/page')],
  ['/guide/reservation', () => import('./guide/reservation/page')],
  ['/guide/records', () => import('./guide/records/page')],
  ['/guide/matching', () => import('./guide/matching/page')],
  ['/guide/ladder', () => import('./guide/ladder/page')],
  ['/guide/transfers', () => import('./guide/transfers/page')],
  ['/guide/tournaments', () => import('./guide/tournaments/page')],
  ['/guide', () => import('./guide/page')],
  ['/guide/school-courts', () => import('./guide/school-courts/page')],
];

describe('root layout', () => {
  it('does not set a site-wide canonical/hreflang (every page would inherit "canonical = home")', async () => {
    const { metadata } = await import('./layout');
    expect(metadata.alternates?.canonical).toBeUndefined();
    expect(metadata.alternates?.languages).toBeUndefined();
  });
});

describe('static pages declare their own canonical', () => {
  it.each(SELF_CANONICAL_PAGES)('%s', async (path, load) => {
    const { metadata } = await load();
    expect(metadata.alternates?.canonical).toBe(path);
  });
});

describe('metadata is rendered in <head> for crawlers', () => {
  it('renders blocking metadata for search crawlers incl. plain Googlebot (canonical in <body> is ignored by Google)', async () => {
    const { default: config } = await import('../next.config');
    const bots = config.htmlLimitedBots as RegExp;
    expect(bots).toBeInstanceOf(RegExp);
    expect(bots.test('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true);
    expect(bots.test('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)')).toBe(true);
    expect(bots.test('Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)')).toBe(true);
    expect(bots.test('Mozilla/5.0 (compatible; Daum/4.1; +http://cs.daum.net/faq/15/4118.html)')).toBe(true);
    expect(bots.test('Mediapartners-Google')).toBe(true);
    // real users keep streaming metadata (loading.tsx shows immediately)
    expect(bots.test('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1')).toBe(false);
    expect(bots.test('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36')).toBe(false);
  });
});

// --- court detail: stale / unknown ids ---------------------------------------
const nav = vi.hoisted(() => ({
  permanentRedirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND');
  }),
}));
vi.mock('next/navigation', () => nav);

const lookup = vi.hoisted(() => ({ result: { type: 'not-found' } as { type: string; court?: unknown } }));
vi.mock('@/lib/seoulApi', () => ({
  fetchTennisDataWithStatuses: vi.fn(async () => []),
  getServedDataMeta: vi.fn(() => ({})),
}));
vi.mock('@/lib/utils/courtLookup', () => ({ resolveCourtLookup: vi.fn(() => lookup.result) }));
vi.mock('@/components/court-detail/CourtDetailClient', () => ({ default: () => null }));
vi.mock('@/components/court-detail/CourtDetailFallback', () => ({ default: () => null }));

describe('court detail metadata for ids that no longer exist', () => {
  beforeEach(() => {
    nav.permanentRedirect.mockClear();
    nav.notFound.mockClear();
    lookup.result = { type: 'not-found' };
  });

  const params = (district: string, courtId: string) => ({ params: Promise.resolve({ district, courtId }) });

  it('permanently redirects an expired court id to its district page', async () => {
    const { generateMetadata } = await import('./[district]/[courtId]/page');
    await expect(generateMetadata(params('gangnam-gu', 'S200101000000000000'))).rejects.toThrow(
      'REDIRECT:/gangnam-gu'
    );
  });

  it('returns a real 404 for an unknown district', async () => {
    const { generateMetadata } = await import('./[district]/[courtId]/page');
    await expect(generateMetadata(params('not-a-district', 'S1'))).rejects.toThrow('NOT_FOUND');
    expect(nav.permanentRedirect).not.toHaveBeenCalled();
  });

  it('keeps the noindex fallback (no redirect) when the data source is down', async () => {
    lookup.result = { type: 'api-error' };
    const { generateMetadata } = await import('./[district]/[courtId]/page');
    const meta = await generateMetadata(params('gangnam-gu', 'S1'));
    expect(meta.robots).toEqual({ index: false });
    expect(meta.alternates?.canonical).toBe('/gangnam-gu/S1');
    expect(nav.permanentRedirect).not.toHaveBeenCalled();
  });

  it('the page component redirects an expired id too (same as metadata, no 404 flash)', async () => {
    const { default: CourtDetailPage } = await import('./[district]/[courtId]/page');
    await expect(CourtDetailPage(params('gangnam-gu', 'S200101000000000000'))).rejects.toThrow('REDIRECT:/gangnam-gu');
  });

  it('emits a self canonical for an existing court', async () => {
    lookup.result = { type: 'found', court: { SVCID: 'S9', SVCNM: '코트', PLACENM: '공원' } };
    const { generateMetadata } = await import('./[district]/[courtId]/page');
    const meta = await generateMetadata(params('gangnam-gu', 'S9'));
    expect(meta.alternates?.canonical).toBe('/gangnam-gu/S9');
    expect(meta.robots).toBeUndefined();
  });
});
