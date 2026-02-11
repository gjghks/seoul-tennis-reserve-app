import { fetchTennisAvailability, SeoulService } from '@/lib/seoulApi';
import { getDistrictBySlug, SLUG_TO_KOREAN } from '@/lib/constants/districts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CourtDetailClient from '@/components/court-detail/CourtDetailClient';
import SimilarCourts from '@/components/court-detail/SimilarCourts';

export const revalidate = 300;

interface CourtDetailPageProps {
  params: Promise<{
    district: string;
    courtId: string;
  }>;
}

export async function generateMetadata({ params }: CourtDetailPageProps): Promise<Metadata> {
  const { district: districtSlug, courtId } = await params;
  const decodedCourtId = decodeURIComponent(courtId);
  const koreanDistrict = SLUG_TO_KOREAN[districtSlug];
  
  if (!koreanDistrict) {
    return { title: '페이지를 찾을 수 없습니다' };
  }

  try {
    const services = await fetchTennisAvailability();
    const court = services.find(s => s.SVCID === decodedCourtId);
    
    if (!court) {
      return { title: '테니스장을 찾을 수 없습니다' };
    }

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
  } catch {
    return { title: '테니스장 정보' };
  }
}

async function getCourtData(districtSlug: string, courtId: string) {
  const district = getDistrictBySlug(districtSlug);
  
  if (!district) {
    return null;
  }

  try {
    const services = await fetchTennisAvailability();
    const decodedCourtId = decodeURIComponent(courtId);
    const court = services.find(s => s.SVCID === decodedCourtId);
    
    if (!court) {
      return null;
    }

    return { court, district, allCourts: services };
  } catch (error) {
    console.error('Failed to fetch court data:', error);
    return null;
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
  const data = await getCourtData(districtSlug, courtId);

  if (!data) {
    notFound();
  }

  const { court, district, allCourts } = data;

  return (
    <>
      <CourtJsonLd court={court} districtSlug={districtSlug} />
      <CourtDetailClient 
        court={court} 
        district={district} 
        districtSlug={districtSlug} 
      />
      <div className="container py-6">
        <SimilarCourts
          currentCourtId={court.SVCID}
          district={court.AREANM}
          allCourts={allCourts}
          isNeoBrutalism={false}
        />
      </div>
    </>
  );
}
