import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서버 사이드 Supabase 클라이언트 (쿠키에서 인증 정보 사용)
function getSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // 요청 헤더에서 Authorization 토큰 가져오기
  const authHeader = request.headers.get('Authorization');

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
}

// GET: 내 즐겨찾기 목록 조회
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient(request);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: '즐겨찾기를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ favorites: data || [] });
}

// POST: 즐겨찾기 추가
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient(request);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { svc_id, svc_name, district, place_name } = body;

    if (!svc_id || !svc_name || !district) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: user.id,
        svc_id,
        svc_name,
        district,
        place_name,
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { error: '이미 즐겨찾기에 추가된 테니스장입니다.' },
          { status: 409 }
        );
      }
      console.error('Error adding favorite:', error);
      return NextResponse.json(
        { error: '즐겨찾기 추가에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ favorite: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    );
  }
}

// DELETE: 즐겨찾기 삭제
export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseClient(request);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const svcId = searchParams.get('svc_id');

  if (!svcId) {
    return NextResponse.json(
      { error: '테니스장 ID가 필요합니다.' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('svc_id', svcId);

  if (error) {
    console.error('Error deleting favorite:', error);
    return NextResponse.json(
      { error: '즐겨찾기 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
