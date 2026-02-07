import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { createAnonSupabaseClient, createServiceRoleClient } from '@/lib/supabaseServer';
import { fetchTennisAvailability, SeoulService } from '@/lib/seoulApi';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';

export const dynamic = 'force-static';

interface ReviewRow {
  court_id: string;
  court_name: string;
  district: string;
  rating: number;
}

interface FavoriteRow {
  svc_id: string;
}

interface CourtStats {
  court_id: string;
  court_name: string;
  facility_name: string;
  district: string;
  total_slots: number;
  booked_slots: number;
  is_free: boolean;
  is_available: boolean;
  total_rating: number;
  review_count: number;
  favorite_count: number;
}

interface FacilityStats {
  facility_name: string;
  representative_court_id: string;
  district: string;
  total_slots: number;
  booked_slots: number;
  is_free: boolean;
  total_rating: number;
  review_count: number;
  favorite_count: number;
}

export interface PopularCourt {
  court_id: string;
  court_name: string;
  district: string;
  district_slug: string;
  avg_rating: number;
  review_count: number;
  favorite_count: number;
  score: number;
  popularity_reasons: string[];
}

// Bayesian Average: C = minimum reviews before raw avg is trusted, M = prior mean

const BAYESIAN_C = 3;
const BAYESIAN_M = 3.5;

function bayesianAverage(totalRating: number, reviewCount: number): number {
  return (BAYESIAN_C * BAYESIAN_M + totalRating) / (BAYESIAN_C + reviewCount);
}

function normalizeFacilityName(placeName: string): string {
  return placeName
    .replace(/\s*[A-Za-z0-9]+번?\s*(코트|면)$/u, '')
    .replace(/\s*-\s*\d+번?\s*(코트|면)$/u, '')
    .trim() || placeName;
}

function buildSeoulApiStats(services: SeoulService[]) {
  const stats = new Map<string, { total: number; booked: number; isFree: boolean; isAvailable: boolean; name: string; facilityName: string; district: string }>();
  const facilityMap = new Map<string, SeoulService[]>();
  for (const svc of services) {
    const arr = facilityMap.get(svc.PLACENM);
    if (arr) {
      arr.push(svc);
    } else {
      facilityMap.set(svc.PLACENM, [svc]);
    }
  }

  for (const [facilityName, facilityCourts] of facilityMap) {
    const total = facilityCourts.length;
    const booked = facilityCourts.filter(
      c => c.SVCSTATNM === '예약마감' || c.SVCSTATNM === '접수종료'
    ).length;
    const isFree = facilityCourts.some(c => c.PAYATNM === '무료');

    let normalizedName = normalizeFacilityName(facilityName);
    if (normalizedName === '테니스장' || normalizedName.length <= 3) {
      const svcName = normalizeFacilityName(facilityCourts[0].SVCNM.replace(/\s*-\s*.+$/, ''));
      if (svcName.length > normalizedName.length) {
        normalizedName = svcName;
      }
    }
    for (const court of facilityCourts) {
      const isAvailable = court.SVCSTATNM === '접수중' || court.SVCSTATNM.includes('예약가능');
      stats.set(court.SVCID, { total, booked, isFree, isAvailable, name: court.SVCNM, facilityName: normalizedName, district: court.AREANM });
    }
  }

  return stats;
}

function normalize(values: number[]): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map(v => ((v - min) / range) * 100);
}

const W_BOOKING = 0.4;
const W_FAVORITE = 0.3;
const W_REVIEW = 0.3;

const CACHE_TTL = 30 * 60; // 30 minutes

const getPopularCourtsData = unstable_cache(
  async (): Promise<PopularCourt[]> => {
    const anonClient = createAnonSupabaseClient();
    const serviceClient = createServiceRoleClient();
    const [services, reviewResult, favoriteResult] = await Promise.all([
      fetchTennisAvailability().catch(() => [] as SeoulService[]),
      anonClient.from('reviews').select('court_id, court_name, district, rating'),
      serviceClient.from('favorites').select('svc_id'),
    ]);

    const reviews = (reviewResult.data || []) as ReviewRow[];
    const favorites = (favoriteResult.data || []) as FavoriteRow[];

    if (reviewResult.error) {
      console.error('Error fetching reviews for ranking:', reviewResult.error);
    }
    if (favoriteResult.error) {
      console.error('Error fetching favorites for ranking:', favoriteResult.error);
    }

    if (services.length === 0 && reviews.length === 0 && favorites.length === 0) {
      return [];
    }

    const seoulStats = buildSeoulApiStats(services);

    const reviewStats = new Map<string, { court_name: string; district: string; total_rating: number; review_count: number }>();
    for (const review of reviews) {
      const rating = Number(review.rating);
      if (!Number.isFinite(rating) || rating < 1 || rating > 5) continue;

      const existing = reviewStats.get(review.court_id);
      if (existing) {
        existing.total_rating += rating;
        existing.review_count += 1;
        if (!existing.court_name && review.court_name) existing.court_name = review.court_name;
        if (!existing.district && review.district) existing.district = review.district;
      } else {
        reviewStats.set(review.court_id, {
          court_name: review.court_name,
          district: review.district,
          total_rating: rating,
          review_count: 1,
        });
      }
    }

    const favoriteCounts = new Map<string, number>();
    for (const fav of favorites) {
      favoriteCounts.set(fav.svc_id, (favoriteCounts.get(fav.svc_id) || 0) + 1);
    }

    const allCourtIds = new Set<string>([
      ...seoulStats.keys(),
      ...reviewStats.keys(),
      ...favoriteCounts.keys(),
    ]);

    const courtStatsList: CourtStats[] = [];
    for (const courtId of allCourtIds) {
      const seoul = seoulStats.get(courtId);
      const review = reviewStats.get(courtId);
      const favCount = favoriteCounts.get(courtId) || 0;

      const courtName = seoul?.name || review?.court_name;
      const district = seoul?.district || review?.district;
      if (!courtName || !district) continue;

      courtStatsList.push({
        court_id: courtId,
        court_name: courtName,
        facility_name: seoul?.facilityName || courtName,
        district,
        total_slots: seoul?.total || 0,
        booked_slots: seoul?.booked || 0,
        is_free: seoul?.isFree || false,
        is_available: seoul?.isAvailable || false,
        total_rating: review?.total_rating || 0,
        review_count: review?.review_count || 0,
        favorite_count: favCount,
      });
    }

    if (courtStatsList.length === 0) {
      return [];
    }

    const facilityMap = new Map<string, CourtStats[]>();
    for (const court of courtStatsList) {
      const key = `${court.facility_name}::${court.district}`;
      const arr = facilityMap.get(key);
      if (arr) {
        arr.push(court);
      } else {
        facilityMap.set(key, [court]);
      }
    }

    const facilityStatsList: FacilityStats[] = Array.from(facilityMap.values()).map(courts => {
      const first = courts[0];
      const bestCourt = courts.find(c => c.is_available) || first;
      return {
        facility_name: first.facility_name,
        representative_court_id: bestCourt.court_id,
        district: first.district,
        total_slots: first.total_slots,
        booked_slots: first.booked_slots,
        is_free: courts.some(c => c.is_free),
        total_rating: courts.reduce((sum, c) => sum + c.total_rating, 0),
        review_count: courts.reduce((sum, c) => sum + c.review_count, 0),
        favorite_count: courts.reduce((sum, c) => sum + c.favorite_count, 0),
      };
    });

    const bookingRates = facilityStatsList.map(f =>
      f.total_slots > 0 ? f.booked_slots / f.total_slots : 0
    );
    const favCounts = facilityStatsList.map(f => f.favorite_count);
    const bayesianScores = facilityStatsList.map(f =>
      bayesianAverage(f.total_rating, f.review_count)
    );

    const normBooking = normalize(bookingRates);
    const normFav = normalize(favCounts);
    const normReview = normalize(bayesianScores);

    const rankedCourts: PopularCourt[] = facilityStatsList.map((facility, i) => {
      const score =
        W_BOOKING * normBooking[i] +
        W_FAVORITE * normFav[i] +
        W_REVIEW * normReview[i];

      const reasons: string[] = [];
      if (bookingRates[i] >= 0.5) reasons.push('예약 경쟁 치열');
      if (facility.is_free) reasons.push('무료');
      if (facility.review_count >= 3 && bayesianScores[i] >= 4.0) reasons.push('높은 평점');
      if (facility.favorite_count >= 3) reasons.push('즐겨찾기 많음');
      if (reasons.length === 0) {
        if (bookingRates[i] > 0) reasons.push('예약 활발');
        else reasons.push('공공 시설');
      }

      const avgRating = facility.review_count > 0
        ? Number((facility.total_rating / facility.review_count).toFixed(1))
        : 0;

      return {
        court_id: facility.representative_court_id,
        court_name: facility.facility_name,
        district: facility.district,
        district_slug: KOREAN_TO_SLUG[facility.district] || '',
        avg_rating: avgRating,
        review_count: facility.review_count,
        favorite_count: facility.favorite_count,
        score: Number(score.toFixed(1)),
        popularity_reasons: reasons,
      };
    });

    rankedCourts.sort((a, b) => b.score - a.score);
    return rankedCourts.slice(0, 10);
  },
  ['popular-courts'],
  { revalidate: CACHE_TTL, tags: ['popular-courts'] }
);

export async function GET() {
  const courts = await getPopularCourtsData();
  return NextResponse.json({ courts });
}
