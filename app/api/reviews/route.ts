import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const authHeader = request.headers.get('Authorization');

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
}

export interface Review {
  id: string;
  user_id: string;
  court_id: string;
  court_name: string;
  district: string;
  rating: number;
  content: string;
  images: string[];
  created_at: string;
  updated_at: string;
  user_email?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courtId = searchParams.get('court_id');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  let query = supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (courtId) {
    query = query.eq('court_id', courtId);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: '후기를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ reviews: data || [] });
}

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
    const { court_id, court_name, district, rating, content, images } = body;

    if (!court_id || !court_name || !district || !rating || !content) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '평점은 1~5 사이여야 합니다.' },
        { status: 400 }
      );
    }

    if (content.length < 10 || content.length > 500) {
      return NextResponse.json(
        { error: '후기는 10자 이상 500자 이하로 작성해주세요.' },
        { status: 400 }
      );
    }

    const imageUrls = Array.isArray(images) ? images.slice(0, 3) : [];

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        user_id: user.id,
        court_id,
        court_name,
        district,
        rating,
        content,
        images: imageUrls,
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: '이미 이 테니스장에 후기를 작성하셨습니다.' },
          { status: 409 }
        );
      }
      console.error('Error adding review:', error);
      return NextResponse.json(
        { error: '후기 작성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ review: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    );
  }
}

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
  const reviewId = searchParams.get('id');

  if (!reviewId) {
    return NextResponse.json(
      { error: '후기 ID가 필요합니다.' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: '후기 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
