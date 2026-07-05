import { NextRequest, NextResponse } from 'next/server';
import { fetchTennisDataWithStatuses, applyScrapedStatuses, getCachedTennisData, getServedDataMeta, type ServedDataMeta } from '@/lib/seoulApi';
import { SLUG_TO_KOREAN } from '@/lib/constants/districts';
import type { SeoulService } from '@/lib/seoulApi';
import { buildByDistrict } from '@/lib/utils/tennisDistrictStats';
import { createRateLimiter } from '@/lib/rateLimit';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });

function buildTennisResponse(services: SeoulService[], district: string | null, meta: ServedDataMeta) {
  const cacheHeaders = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' };

  if (district) {
    const koreanDistrict = SLUG_TO_KOREAN[district] || district;
    const filtered = services.filter(s => s.AREANM === koreanDistrict);

    return NextResponse.json({
      district: koreanDistrict,
      count: filtered.length,
      courts: filtered,
      lastUpdated: meta.lastUpdatedAt,
      ...(meta.isStale ? { stale: true } : {}),
    }, { headers: cacheHeaders });
  }

  const byDistrict = buildByDistrict(services);

  return NextResponse.json({
    total: services.length,
    byDistrict,
    courts: services,
    lastUpdated: meta.lastUpdatedAt,
    ...(meta.isStale ? { stale: true } : {}),
  }, { headers: cacheHeaders });
}

export async function GET(request: NextRequest) {
  const rateLimitResult = await limiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district'); // slug 또는 한글

  try {
    const services = await fetchTennisDataWithStatuses();
    return buildTennisResponse(services, district, getServedDataMeta());
  } catch (error) {
    console.error('Error fetching tennis data:', error);

    const cached = getCachedTennisData();
    if (cached) {
      const enhancedCachedServices = await applyScrapedStatuses(cached.data);
      return buildTennisResponse(enhancedCachedServices, district, {
        lastUpdatedAt: new Date(cached.timestamp ?? Date.now()).toISOString(),
        isStale: true,
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch tennis data' },
      { status: 500 }
    );
  }
}
