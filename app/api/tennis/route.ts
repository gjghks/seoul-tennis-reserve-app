import { NextRequest, NextResponse } from 'next/server';
import { fetchTennisAvailability, getCachedTennisData } from '@/lib/seoulApi';
import { SLUG_TO_KOREAN } from '@/lib/constants/districts';
import { isCourtAvailable } from '@/lib/utils/courtStatus';
import type { SeoulService } from '@/lib/seoulApi';
import { createRateLimiter } from '@/lib/rateLimit';
import { createAnonSupabaseClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });

type CachedIndependentStatusRow = {
  svc_id: string;
  status: string;
  updated_at: string;
};

async function applyScrapedStatuses(services: SeoulService[]): Promise<SeoulService[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return services;
    }

    const twoHoursAgoIso = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const supabase = createAnonSupabaseClient();

    const { data, error } = await supabase
      .from('court_status_cache')
      .select('svc_id, status, updated_at')
      .like('svc_id', 'INDEP_%')
      .gte('updated_at', twoHoursAgoIso);

    if (error) {
      console.error('Failed to read scraped external statuses:', error);
      return services;
    }

    const rows = (data ?? []) as CachedIndependentStatusRow[];
    if (rows.length === 0) {
      return services;
    }

    const statusMap = new Map(rows.map((row) => [row.svc_id, row.status]));

    return services.map((service) => {
      const cachedStatus = statusMap.get(service.SVCID);
      if (!cachedStatus) {
        return service;
      }

      return {
        ...service,
        SVCSTATNM: cachedStatus,
      };
    });
  } catch (error) {
    console.error('Unexpected scraped status apply error:', error);
    return services;
  }
}

function buildTennisResponse(services: SeoulService[], district: string | null, stale = false) {
  if (district) {
    const koreanDistrict = SLUG_TO_KOREAN[district] || district;
    const filtered = services.filter(s => s.AREANM === koreanDistrict);

    return NextResponse.json({
      district: koreanDistrict,
      count: filtered.length,
      courts: filtered,
      ...(stale ? { stale: true } : {}),
    });
  }

  const byDistrict = services.reduce((acc, svc) => {
    const area = svc.AREANM;
    if (!acc[area]) {
      acc[area] = { count: 0, available: 0 };
    }
    acc[area].count++;
    if (isCourtAvailable(svc.SVCSTATNM)) {
      acc[area].available++;
    }
    return acc;
  }, {} as Record<string, { count: number; available: number }>);

  return NextResponse.json({
    total: services.length,
    byDistrict,
    courts: services,
    lastUpdated: new Date().toISOString(),
    ...(stale ? { stale: true } : {}),
  });
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
    const services = await fetchTennisAvailability();
    const enhancedServices = await applyScrapedStatuses(services);
    return buildTennisResponse(enhancedServices, district);
  } catch (error) {
    console.error('Error fetching tennis data:', error);

    const cached = getCachedTennisData();
    if (cached) {
      const enhancedCachedServices = await applyScrapedStatuses(cached.data);
      return buildTennisResponse(enhancedCachedServices, district, true);
    }

    return NextResponse.json(
      { error: 'Failed to fetch tennis data' },
      { status: 500 }
    );
  }
}
