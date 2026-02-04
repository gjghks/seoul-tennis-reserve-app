import { fetchTennisAvailability, SeoulService } from '@/lib/seoulApi';
import { SLUG_TO_KOREAN, getDistrictBySlug } from '@/lib/constants/districts';
import DistrictContent from '@/components/district/DistrictContent';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 300;

interface DistrictPageProps {
  params: Promise<{
    district: string;
  }>;
}

export async function generateMetadata({ params }: DistrictPageProps): Promise<Metadata> {
  const { district } = await params;
  const districtInfo = getDistrictBySlug(district);
  
  if (!districtInfo) {
    return { title: '페이지를 찾을 수 없습니다' };
  }

  const { nameKo } = districtInfo;

  return {
    title: `${nameKo} 테니스장`,
    description: `${nameKo} 공공 테니스장 예약 현황을 실시간으로 확인하세요. ${nameKo} 지역 테니스 코트 위치, 운영시간, 이용료, 예약 가능 여부를 한눈에 확인하고 바로 예약하세요.`,
    keywords: [nameKo, '테니스장', '예약', '공공시설', '테니스', nameKo + ' 테니스', nameKo + ' 스포츠'],
    alternates: {
      canonical: `/${district}`,
    },
    openGraph: {
      title: `${nameKo} 공공 테니스장 예약 | 서울 테니스`,
      description: `${nameKo} 공공 테니스장 예약 현황을 실시간으로 확인하세요.`,
      url: `https://seoul-tennis.com/${district}`,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_KOREAN).map((district) => ({
    district,
  }));
}

async function getDistrictCourts(district: string): Promise<{ courts: SeoulService[]; districtName: string } | null> {
  const koreanDistrict = SLUG_TO_KOREAN[district];
  
  if (!koreanDistrict) {
    return null;
  }

  try {
    const services = await fetchTennisAvailability();
    const filtered = services.filter(s => s.AREANM === koreanDistrict);
    
    const sorted = [...filtered].sort((a, b) => {
      const isAAvailable = a.SVCSTATNM === '접수중';
      const isBAvailable = b.SVCSTATNM === '접수중';
      if (isAAvailable && !isBAvailable) return -1;
      if (!isAAvailable && isBAvailable) return 1;
      return 0;
    });

    return {
      courts: sorted,
      districtName: koreanDistrict,
    };
  } catch (error) {
    console.error('Failed to fetch district courts:', error);
    return {
      courts: [],
      districtName: koreanDistrict,
    };
  }
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const { district } = await params;
  const data = await getDistrictCourts(district);
  const districtInfo = getDistrictBySlug(district);

  if (!data || !districtInfo) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${districtInfo.nameKo} 공공 테니스장`,
    "description": `${districtInfo.nameKo} 지역 공공 테니스장 예약 현황 및 정보`,
    "url": `https://seoul-tennis.com/${district}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "서울 테니스",
      "url": "https://seoul-tennis.com"
    },
    "about": {
      "@type": "SportsActivityLocation",
      "name": `${districtInfo.nameKo} 테니스장`,
      "sport": "테니스"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "홈",
          "item": "https://seoul-tennis.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": districtInfo.nameKo,
          "item": `https://seoul-tennis.com/${district}`
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DistrictContent 
        district={district}
        initialCourts={data.courts}
        districtName={data.districtName}
      />
    </>
  );
}
