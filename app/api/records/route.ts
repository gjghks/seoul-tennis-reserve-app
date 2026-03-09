import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';
import { VALID_MATCH_TYPES, VALID_MATCH_FORMATS, VALID_RESULTS, VALID_LOCATION_TYPES, VALID_COURT_SURFACES } from '@/lib/constants/tennis';
import type { MatchType, MatchResult } from '@/lib/constants/tennis';
import { validateScore } from '@/lib/utils/tennis';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const matchType = searchParams.get('match_type');
  const result = searchParams.get('result');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');

  const limit = Math.min(Math.max(1, Number(limitParam) || 20), 100);
  const offset = Math.max(0, Number(offsetParam) || 0);

  let query = supabase
    .from('game_records')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('played_at', { ascending: false });

  if (matchType && VALID_MATCH_TYPES.includes(matchType as MatchType)) {
    query = query.eq('match_type', matchType);
  }

  if (result && VALID_RESULTS.includes(result as MatchResult)) {
    query = query.eq('result', result);
  }

  if (from) {
    query = query.gte('played_at', from);
  }

  if (to) {
    query = query.lte('played_at', to);
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { error: '기록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ records: data || [], total: count ?? 0 });
}

export async function POST(request: NextRequest) {
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
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      played_at,
      duration_minutes,
      location_type,
      court_id,
      court_name,
      district,
      match_type,
      match_format,
      score,
      result,
      court_surface,
      opponent_name,
      opponent_level,
      cost,
      notes,
      images,
    } = body;

    if (!played_at || !court_name || !match_type || !match_format || !score || !result) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (!VALID_MATCH_TYPES.includes(match_type)) {
      return NextResponse.json(
        { error: '올바르지 않은 경기 유형입니다.' },
        { status: 400 }
      );
    }

    if (!VALID_MATCH_FORMATS.includes(match_format)) {
      return NextResponse.json(
        { error: '올바르지 않은 경기 형식입니다.' },
        { status: 400 }
      );
    }

    if (!VALID_RESULTS.includes(result)) {
      return NextResponse.json(
        { error: '올바르지 않은 경기 결과입니다.' },
        { status: 400 }
      );
    }

    if (location_type && !VALID_LOCATION_TYPES.includes(location_type)) {
      return NextResponse.json(
        { error: '올바르지 않은 장소 유형입니다.' },
        { status: 400 }
      );
    }

    if (court_surface && !VALID_COURT_SURFACES.includes(court_surface)) {
      return NextResponse.json(
        { error: '올바르지 않은 코트 표면 유형입니다.' },
        { status: 400 }
      );
    }

    const scoreValidation = validateScore(score);
    if (!scoreValidation.valid) {
      return NextResponse.json(
        { error: scoreValidation.error },
        { status: 400 }
      );
    }

    if (duration_minutes !== null && duration_minutes !== undefined) {
      if (!Number.isInteger(duration_minutes) || duration_minutes < 0 || duration_minutes > 600) {
        return NextResponse.json(
          { error: '경기 시간은 0~600분 사이여야 합니다.' },
          { status: 400 }
        );
      }
    }

    if (cost !== null && cost !== undefined) {
      if (typeof cost !== 'number' || cost < 0) {
        return NextResponse.json(
          { error: '비용은 0 이상이어야 합니다.' },
          { status: 400 }
        );
      }
    }

    if (notes && typeof notes === 'string' && notes.length > 1000) {
      return NextResponse.json(
        { error: '메모는 1000자 이하로 작성해주세요.' },
        { status: 400 }
      );
    }

    const imageUrls = Array.isArray(images) ? images.slice(0, 5) : [];

    const { data, error } = await supabase
      .from('game_records')
      .insert([{
        user_id: user.id,
        played_at,
        duration_minutes: duration_minutes ?? null,
        location_type: location_type || 'custom',
        court_id: court_id ?? null,
        court_name,
        district: district ?? null,
        match_type,
        match_format,
        score,
        result,
        court_surface: court_surface ?? null,
        opponent_name: opponent_name ?? null,
        opponent_level: opponent_level ?? null,
        cost: cost ?? null,
        notes: notes ?? null,
        images: imageUrls,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating record:', error);
      return NextResponse.json(
        { error: '기록 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    let eloResult = null;
    if (result !== 'retired') {
      const { data: profile } = await supabase
        .from('player_profiles')
        .select('ladder_opt_in, singles_elo, doubles_elo')
        .eq('user_id', user.id)
        .single();

      if (profile?.ladder_opt_in) {
        const eloMatchType = match_type === 'singles' ? 'singles' : 'doubles';
        const opponentElo = eloMatchType === 'singles'
          ? (profile.singles_elo ?? 1200)
          : (profile.doubles_elo ?? 1200);

        const { data: eloData, error: eloError } = await supabase.rpc('calculate_elo', {
          p_user_id: user.id,
          p_opponent_elo: opponentElo,
          p_result: result === 'draw' ? 'draw' : result,
          p_match_type: eloMatchType,
          p_game_record_id: data.id,
        });

        if (eloError) {
          console.error('ELO calculation failed (non-blocking):', eloError);
        } else {
          eloResult = eloData;
        }
      }
    }

    return NextResponse.json({ record: data, elo: eloResult }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    );
  }
}
