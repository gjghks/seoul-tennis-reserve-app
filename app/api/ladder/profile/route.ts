import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';
import { logDbError } from '@/lib/logDbError';
import { DISTRICTS } from '@/lib/constants/districts';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('player_profiles')
    .select('singles_elo, doubles_elo, singles_matches, doubles_matches, singles_peak_elo, doubles_peak_elo, primary_district, ladder_opt_in, last_match_at')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    logDbError('fetch ladder profile', error);
    return NextResponse.json({ error: '래더 프로필을 불러오는데 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

export async function PUT(request: NextRequest) {
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

  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const body = await request.json();
  const { ladder_opt_in, primary_district } = body;

  if (typeof ladder_opt_in !== 'boolean') {
    return NextResponse.json({ error: 'ladder_opt_in은 필수입니다.' }, { status: 400 });
  }

  if (primary_district) {
    const validDistrict = DISTRICTS.some(d => d.nameKo === primary_district);
    if (!validDistrict) {
      return NextResponse.json({ error: '유효하지 않은 지역입니다.' }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from('player_profiles')
    .upsert({
      user_id: user.id,
      ladder_opt_in,
      primary_district: primary_district || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select('singles_elo, doubles_elo, singles_matches, doubles_matches, singles_peak_elo, doubles_peak_elo, primary_district, ladder_opt_in, last_match_at')
    .single();

  if (error) {
    logDbError('upsert ladder profile', error);
    return NextResponse.json({ error: '래더 프로필 업데이트에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
