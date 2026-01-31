import { NextRequest, NextResponse } from 'next/server';
import { fetchTennisAvailability, SeoulService } from '@/lib/seoulApi';
import { SLUG_TO_KOREAN } from '@/lib/constants/districts';

export const revalidate = 600; // 10분 캐싱

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district'); // slug 또는 한글

    const services = await fetchTennisAvailability();

    if (district) {
      // slug인 경우 한글로 변환
      const koreanDistrict = SLUG_TO_KOREAN[district] || district;

      const filtered = services.filter(s => s.AREANM === koreanDistrict);
      return NextResponse.json({
        district: koreanDistrict,
        count: filtered.length,
        courts: filtered,
      });
    }

    // 전체 반환 시 구별로 그룹화하여 개수도 포함
    const byDistrict = services.reduce((acc, svc) => {
      const area = svc.AREANM;
      if (!acc[area]) {
        acc[area] = { count: 0, available: 0 };
      }
      acc[area].count++;
      if (svc.SVCSTATNM === '접수중' || svc.SVCSTATNM.includes('예약가능')) {
        acc[area].available++;
      }
      return acc;
    }, {} as Record<string, { count: number; available: number }>);

    return NextResponse.json({
      total: services.length,
      byDistrict,
      courts: services,
    });
  } catch (error) {
    console.error('Error fetching tennis data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tennis data' },
      { status: 500 }
    );
  }
}
