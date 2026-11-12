import { fetchTennisDataWithStatuses, getServedDataMeta, SeoulService } from '@/lib/seoulApi';
import { getDistrictBySlug, District } from '@/lib/constants/districts';
import { resolveCourtLookup } from '@/lib/utils/courtLookup';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import CourtDetailClient from '@/components/court-detail/CourtDetailClient';
import CourtDetailFallback from '@/components/court-detail/CourtDetailFallback';
import { toCourtList } from '@/lib/utils/courtListView';

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

  if (result.type === 'not-found') exitForMissingCourt(districtSlug);
  // 데이터 소스 장애 시 폴백 페이지: 색인 제외하되 대표 주소는 자기 자신(홈 상속 방지)
  if (result.type === 'api-error') {
    return {
      title: '테니스장 정보',
      robots: { index: false },
      alternates: { canonical: `/${districtSlug}/${courtId}` },
    };
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

// 서울시 SVCID는 예약 회차마다 새로 발급되어 지난 회차 주소가 계속 쌓인다 → 해당 구 목록으로 보낸다.
// loading.tsx 스트리밍으로 상태 코드가 먼저 나가므로 실제 응답은 308이 아니라
// 200 + <meta http-equiv="refresh" content="0;url=/구"> + noindex 이다
// (구글은 0초 meta refresh를 영구 리디렉션으로 처리). 잘못된 구는 404.
// generateMetadata와 페이지가 동시에 렌더되므로 둘 다 이 함수를 써서 결과를 맞춘다.
function exitForMissingCourt(districtSlug: string): never {
  if (getDistrictBySlug(districtSlug)) permanentRedirect(`/${districtSlug}`);
  notFound();
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

    return { type: 'success', court, district, allCourts: toCourtList(services) };
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

  if (result.type === 'not-found') exitForMissingCourt(districtSlug);

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
