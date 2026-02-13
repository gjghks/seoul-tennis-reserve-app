import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter } from '@/lib/rateLimit';
import { getSeoulDustAlertStatus, type SeoulDustAlertStatus } from '@/lib/airkoreaApi';

const EMPTY_RESPONSE: SeoulDustAlertStatus = {
  hasAlert: false,
  alerts: [],
  highestLevel: null,
  highestItemCode: null,
  highestValue: null,
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

  try {
    const data = await getSeoulDustAlertStatus();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(EMPTY_RESPONSE);
  }
}
