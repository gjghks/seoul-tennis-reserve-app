import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

const VALID_SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'pro'];
const VALID_HANDS = ['right', 'left', 'both'];
const VALID_AGE_GROUPS = ['10s', '20s', '30s', '40s', '50s', '60s_plus'];

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('player_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: '프로필을 불러오는데 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ profile: data || null });
}

export async function PUT(request: NextRequest) {
  const rateLimitResult = await limiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)) } }
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { career_years, ntrp_rating, skill_level, preferred_hand, age_group } = body;

    if (career_years !== undefined && career_years !== null) {
      if (!Number.isInteger(career_years) || career_years < 0 || career_years > 50) {
        return NextResponse.json({ error: '구력은 0~50 사이의 정수여야 합니다.' }, { status: 400 });
      }
    }

    if (ntrp_rating !== undefined && ntrp_rating !== null) {
      if (typeof ntrp_rating !== 'number' || ntrp_rating < 1.0 || ntrp_rating > 7.0) {
        return NextResponse.json({ error: 'NTRP 레이팅은 1.0~7.0 사이여야 합니다.' }, { status: 400 });
      }
    }

    if (skill_level && !VALID_SKILL_LEVELS.includes(skill_level)) {
      return NextResponse.json({ error: '올바르지 않은 실력 수준입니다.' }, { status: 400 });
    }

    if (preferred_hand && !VALID_HANDS.includes(preferred_hand)) {
      return NextResponse.json({ error: '올바르지 않은 주사용 손 정보입니다.' }, { status: 400 });
    }

    if (age_group && !VALID_AGE_GROUPS.includes(age_group)) {
      return NextResponse.json({ error: '올바르지 않은 연령대입니다.' }, { status: 400 });
    }

    const profileData = {
      user_id: user.id,
      career_years: career_years ?? null,
      ntrp_rating: ntrp_rating ?? null,
      skill_level: skill_level || null,
      preferred_hand: preferred_hand || null,
      age_group: age_group || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('player_profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting profile:', error);
      return NextResponse.json({ error: '프로필 저장에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
}
