import { NextRequest, NextResponse } from 'next/server';
import { createAnonSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';
import { getKSTDateString } from '@/lib/date';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

interface VisitCounts {
  today: number;
  total: number;
}

export async function GET() {
  try {
    const supabase = createAnonSupabaseClient();
    const todayStr = getKSTDateString();

    const [todayResult, totalResult] = await Promise.all([
      supabase
        .from('site_visits')
        .select('visit_count')
        .eq('visit_date', todayStr)
        .single(),
      supabase
        .from('site_visits')
        .select('visit_count'),
    ]);

    const today = todayResult.data?.visit_count ?? 0;
    const total = totalResult.data?.reduce((sum, row) => sum + row.visit_count, 0) ?? 0;

    return NextResponse.json({ today, total } satisfies VisitCounts, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch {
    return NextResponse.json(
      { error: '방문자 수를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResult = await limiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)) } }
    );
  }

  try {
    const supabase = createAnonSupabaseClient();
    const { data, error } = await supabase.rpc('increment_site_visit');

    if (error) {
      console.error('Visit increment error:', error);
      return NextResponse.json({ error: '방문 기록에 실패했습니다.' }, { status: 500 });
    }

    const result = data as VisitCounts;
    return NextResponse.json({ today: result.today, total: result.total } satisfies VisitCounts);
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    );
  }
}
