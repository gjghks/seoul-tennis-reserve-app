import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';
import { VALID_MATCH_TYPES } from '@/lib/constants/tennis';
import { VALID_MATCH_SKILL_FILTERS, VALID_POST_STATUSES } from '@/lib/constants/matching';
import type { MatchType } from '@/lib/constants/tennis';
import type { MatchPostStatus } from '@/lib/constants/matching';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 15 });

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const district = searchParams.get('district');
  const matchType = searchParams.get('match_type');
  const date = searchParams.get('date');
  const status = (searchParams.get('status') || 'open') as MatchPostStatus;
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');

  const limit = Math.min(Math.max(1, Number(limitParam) || 20), 50);
  const offset = Math.max(0, Number(offsetParam) || 0);

  let query = supabase
    .from('match_posts')
    .select('*', { count: 'exact' })
    .order('play_date', { ascending: true })
    .order('play_time_start', { ascending: true });

  if (VALID_POST_STATUSES.includes(status)) {
    query = query.eq('status', status);
  }

  if (district) {
    query = query.eq('district', district);
  }

  if (matchType && VALID_MATCH_TYPES.includes(matchType as MatchType)) {
    query = query.eq('match_type', matchType);
  }

  const today = new Date().toISOString().split('T')[0];
  query = query.gte('play_date', date || today);

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching match posts:', error);
    return NextResponse.json(
      { error: '매칭 글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  let appliedPostIds = new Set<string>();
  const { data: { user } } = await supabase.auth.getUser();

  if (user && data && data.length > 0) {
    const postIds = data.map((p: { id: string }) => p.id);
    const { data: userApps } = await supabase
      .from('match_applications')
      .select('post_id')
      .eq('applicant_id', user.id)
      .in('post_id', postIds);

    if (userApps) {
      appliedPostIds = new Set(userApps.map((a: { post_id: string }) => a.post_id));
    }
  }

  const posts = (data || []).map((post: { id: string; contact_info?: string }) => {
    const { contact_info: _, ...rest } = post;
    return { ...rest, has_applied: appliedPostIds.has(post.id) };
  });

  return NextResponse.json({ posts, total: count ?? 0 });
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
      play_date,
      play_time_start,
      play_time_end,
      location_type,
      court_id,
      court_name,
      district,
      match_type,
      ntrp_min,
      ntrp_max,
      skill_level,
      max_participants,
      cost_per_person,
      title,
      description,
      contact_type,
      contact_info,
    } = body;

    if (!play_date || !play_time_start || !court_name || !district || !match_type || !title) {
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

    if (typeof title !== 'string' || title.length < 2 || title.length > 100) {
      return NextResponse.json(
        { error: '제목은 2~100자 사이로 작성해주세요.' },
        { status: 400 }
      );
    }

    if (description && (typeof description !== 'string' || description.length > 500)) {
      return NextResponse.json(
        { error: '설명은 500자 이하로 작성해주세요.' },
        { status: 400 }
      );
    }

    if (skill_level && !VALID_MATCH_SKILL_FILTERS.includes(skill_level)) {
      return NextResponse.json(
        { error: '올바르지 않은 실력 수준입니다.' },
        { status: 400 }
      );
    }

    const participants = Number(max_participants) || 1;
    if (participants < 1 || participants > 3) {
      return NextResponse.json(
        { error: '모집 인원은 1~3명 사이여야 합니다.' },
        { status: 400 }
      );
    }

    if (ntrp_min != null && (typeof ntrp_min !== 'number' || ntrp_min < 1.0 || ntrp_min > 7.0)) {
      return NextResponse.json(
        { error: 'NTRP 최소값은 1.0~7.0 사이여야 합니다.' },
        { status: 400 }
      );
    }

    if (ntrp_max != null && (typeof ntrp_max !== 'number' || ntrp_max < 1.0 || ntrp_max > 7.0)) {
      return NextResponse.json(
        { error: 'NTRP 최대값은 1.0~7.0 사이여야 합니다.' },
        { status: 400 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('full_name, nickname')
      .eq('id', user.id)
      .single();

    const authorName = userData?.nickname || userData?.full_name || user.email?.split('@')[0] || '익명';

    const { data, error } = await supabase
      .from('match_posts')
      .insert([{
        author_id: user.id,
        author_name: authorName,
        play_date,
        play_time_start,
        play_time_end: play_time_end ?? null,
        location_type: location_type || 'seoul_court',
        court_id: court_id ?? null,
        court_name,
        district,
        match_type,
        ntrp_min: ntrp_min ?? null,
        ntrp_max: ntrp_max ?? null,
        skill_level: skill_level ?? null,
        max_participants: participants,
        cost_per_person: cost_per_person ?? null,
        title,
        description: description ?? null,
        contact_type: contact_type || null,
        contact_info: contact_info || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating match post:', error);
      return NextResponse.json(
        { error: '매칭 글 작성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    );
  }
}
