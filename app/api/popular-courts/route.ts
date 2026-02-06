import { NextResponse } from 'next/server';
import { createAnonSupabaseClient } from '@/lib/supabaseServer';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';

export const revalidate = 3600;

interface ReviewRow {
  court_id: string;
  court_name: string;
  district: string;
  rating: number;
}

interface FavoriteRow {
  svc_id: string;
}

interface PopularCourt {
  court_id: string;
  court_name: string;
  district: string;
  district_slug: string;
  avg_rating: number;
  review_count: number;
  favorite_count: number;
}

export async function GET() {
  const supabase = createAnonSupabaseClient();

  const { data: reviews, error: reviewError } = await supabase
    .from('reviews')
    .select('court_id, court_name, district, rating');

  if (reviewError) {
    console.error('Error fetching review stats:', reviewError);
    return NextResponse.json(
      { error: '인기 테니스장 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  if (!reviews || reviews.length === 0) {
    return NextResponse.json({ courts: [] });
  }

  const reviewStats = new Map<
    string,
    { court_name: string; district: string; total_rating: number; review_count: number }
  >();

  for (const review of reviews as ReviewRow[]) {
    const existing = reviewStats.get(review.court_id);
    if (existing) {
      existing.total_rating += review.rating;
      existing.review_count += 1;
      if (!existing.court_name && review.court_name) {
        existing.court_name = review.court_name;
      }
      if (!existing.district && review.district) {
        existing.district = review.district;
      }
      continue;
    }

    reviewStats.set(review.court_id, {
      court_name: review.court_name,
      district: review.district,
      total_rating: review.rating,
      review_count: 1,
    });
  }

  const { data: favorites, error: favoriteError } = await supabase
    .from('favorites')
    .select('svc_id');

  if (favoriteError) {
    console.error('Error fetching favorite stats:', favoriteError);
    return NextResponse.json(
      { error: '인기 테니스장 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  const favoriteCounts = new Map<string, number>();
  for (const favorite of (favorites || []) as FavoriteRow[]) {
    favoriteCounts.set(favorite.svc_id, (favoriteCounts.get(favorite.svc_id) || 0) + 1);
  }

  const rankedCourts: PopularCourt[] = Array.from(reviewStats.entries()).map(([courtId, stat]) => ({
    court_id: courtId,
    court_name: stat.court_name,
    district: stat.district,
    district_slug: KOREAN_TO_SLUG[stat.district] || '',
    avg_rating: Number((stat.total_rating / stat.review_count).toFixed(2)),
    review_count: stat.review_count,
    favorite_count: favoriteCounts.get(courtId) || 0,
  }));

  rankedCourts.sort((a, b) => {
    if (b.avg_rating !== a.avg_rating) {
      return b.avg_rating - a.avg_rating;
    }
    if (b.review_count !== a.review_count) {
      return b.review_count - a.review_count;
    }
    return b.favorite_count - a.favorite_count;
  });

  return NextResponse.json({ courts: rankedCourts.slice(0, 10) });
}
