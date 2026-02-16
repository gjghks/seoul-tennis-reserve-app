import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '@/lib/rateLimit';
import { getLivingWeatherData, type LivingWeatherData } from '@/lib/livingWeatherApi';

const EMPTY_RESPONSE: LivingWeatherData = {
  uv: null,
  airDiffusion: null,
  updatedAt: new Date().toISOString(),
};

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

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

  const district = request.nextUrl.searchParams.get('district');
  if (!district) {
    return NextResponse.json(EMPTY_RESPONSE);
  }

  try {
    const data = await getLivingWeatherData(district);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    });
  } catch {
    return NextResponse.json(EMPTY_RESPONSE);
  }
}
