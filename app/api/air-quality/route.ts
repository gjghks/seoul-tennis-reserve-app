import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '@/lib/rateLimit';
import { getAirQualityByDistrict, getSeoulAverageAirQuality, type AirQualityData } from '@/lib/airQualityApi';

const EMPTY_RESPONSE: AirQualityData = {
  district: '',
  grade: '정보없음',
  cai: null,
  pm10: null,
  pm25: null,
  mainPollutant: '',
  measuredAt: '',
};

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });

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

  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');

    let data: AirQualityData | null;

    if (district) {
      data = await getAirQualityByDistrict(district);
    } else {
      data = await getSeoulAverageAirQuality();
    }

    return NextResponse.json(data ?? EMPTY_RESPONSE);
  } catch {
    return NextResponse.json(EMPTY_RESPONSE);
  }
}
