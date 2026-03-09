import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';
import { validateNickname, BIO_MAX } from '@/lib/constants/profile';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

const VALID_GENDERS = ['male', 'female'] as const;

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('users')
    .select('nickname, bio, gender, full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
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
    const { nickname, bio, gender } = body;

    if (nickname !== undefined && nickname !== null) {
      if (typeof nickname !== 'string') {
        return NextResponse.json({ error: '닉네임 형식이 올바르지 않습니다.' }, { status: 400 });
      }

      const nicknameError = validateNickname(nickname);
      if (nicknameError) {
        return NextResponse.json({ error: nicknameError }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .ilike('nickname', nickname)
        .neq('id', user.id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: '이미 사용 중인 닉네임입니다.' }, { status: 409 });
      }
    }

    if (bio !== undefined && bio !== null) {
      if (typeof bio !== 'string' || bio.length > BIO_MAX) {
        return NextResponse.json({ error: `한줄 소개는 ${BIO_MAX}자 이하로 작성해주세요.` }, { status: 400 });
      }
    }

    if (gender !== undefined && gender !== null) {
      if (!VALID_GENDERS.includes(gender)) {
        return NextResponse.json({ error: '올바르지 않은 성별 정보입니다.' }, { status: 400 });
      }
    }

    const updateData: Record<string, string | null> = {};
    if (nickname !== undefined) updateData.nickname = nickname || null;
    if (bio !== undefined) updateData.bio = bio || null;
    if (gender !== undefined) updateData.gender = gender || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '변경할 정보가 없습니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('nickname, bio, gender, full_name, avatar_url')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: '이미 사용 중인 닉네임입니다.' }, { status: 409 });
      }
      console.error('Error updating user profile:', error);
      return NextResponse.json({ error: '프로필 저장에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
}
