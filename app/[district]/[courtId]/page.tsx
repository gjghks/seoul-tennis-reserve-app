import { fetchTennisDataWithStatuses, getServedDataMeta, SeoulService } from '@/lib/seoulApi';
import { getDistrictBySlug, District } from '@/lib/constants/districts';
import { resolveCourtLookup } from '@/lib/utils/courtLookup';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CourtDetailClient from '@/components/court-detail/CourtDetailClient';
import CourtDetailFallback from '@/components/court-detail/CourtDetailFallback';

export const revalidate = 86400;

interface CourtDetailPageProps {
  params: Promise<{
    district: string;
    courtId: string;
  }>;
}

export async function generateMetadata({ params }: CourtDetailPageProps): Promise<Metadata> {
  const { district: districtSlug, courtId } = await params;
  const result = await getCourtData(districtSlug, courtId);

  // 404/폴백 페이지는 색인 제외. 루트 layout의 robots(index, follow)를 덮어써서
  // Next가 notFound 시 넣는 noindex 메타와 서로 충돌하지 않게 한다.
  if (result.type === 'not-found') {
    return { title: '테니스장을 찾을 수 없습니다', robots: { index: false } };
  }
  if (result.type === 'api-error') {
    return { title: '테니스장 정보', robots: { index: false } };
  }

  const { court, district } = result;
  const koreanDistrict = district.nameKo;

  return {
    title: `${court.SVCNM} | ${koreanDistrict}`,
    description: `${koreanDistrict} ${court.PLACENM} 테니스장 예약 정보. 운영시간, 이용료, 예약 현황을 확인하고 바로 예약하세요.`,
    keywords: [court.SVCNM, koreanDistrict, '테니스장', '예약', court.PLACENM],
    alternates: {
      canonical: `/${districtSlug}/${courtId}`,
    },
    openGraph: {
      title: `${court.SVCNM} | 서울 테니스`,
      description: `${koreanDistrict} ${court.PLACENM} 테니스장 예약 정보`,
      url: `https://seoul-tennis.com/${districtSlug}/${courtId}`,
      images: court.IMGURL ? [{ url: court.IMGURL }] : undefined,
    },
  };
}

type CourtDataResult =
  | { type: 'success'; court: SeoulService; district: District; allCourts: SeoulService[] }
  | { type: 'not-found' }
  | { type: 'api-error'; district: District };

async function getCourtData(districtSlug: string, courtId: string): Promise<CourtDataResult> {
  const district = getDistrictBySlug(districtSlug);
  
  if (!district) {
    return { type: 'not-found' };
  }

  try {
    const services = await fetchTennisDataWithStatuses();
    const decodedCourtId = decodeURIComponent(courtId);
    const lookup = resolveCourtLookup(services, decodedCourtId, getServedDataMeta());

    if (lookup.type === 'not-found') {
      return { type: 'not-found' };
    }
    if (lookup.type === 'api-error') {
      return { type: 'api-error', district };
    }
    const { court } = lookup;

    return { type: 'success', court, district, allCourts: services };
  } catch (error) {
    console.error('Failed to fetch court data:', error);
    return { type: 'api-error', district };
  }
}

function CourtJsonLd({ court, districtSlug }: { court: SeoulService; districtSlug: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": court.SVCNM,
    "description": `${court.AREANM} ${court.PLACENM} 테니스장`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": court.AREANM,
      "addressRegion": "서울특별시",
      "addressCountry": "KR"
    },
    "telephone": court.TELNO || undefined,
    "image": court.IMGURL || undefined,
    "url": `https://seoul-tennis.com/${districtSlug}/${encodeURIComponent(court.SVCID)}`,
    "openingHours": court.V_MIN && court.V_MAX ? `Mo-Su ${court.V_MIN}-${court.V_MAX}` : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function CourtDetailPage({ params }: CourtDetailPageProps) {
  const { district: districtSlug, courtId } = await params;
  const result = await getCourtData(districtSlug, courtId);

  if (result.type === 'not-found') {
    notFound();
  }

  if (result.type === 'api-error') {
    return (
      <CourtDetailFallback
        districtSlug={districtSlug}
        courtId={decodeURIComponent(courtId)}
        district={result.district}
      />
    );
  }

  const { court, district, allCourts } = result;

  return (
    <>
      <CourtJsonLd court={court} districtSlug={districtSlug} />
      <CourtDetailClient 
        court={court} 
        district={district} 
        districtSlug={districtSlug}
        allCourts={allCourts}
      />
    </>
  );
}
