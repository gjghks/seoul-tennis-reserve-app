import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchTennisAvailability } from '@/lib/seoulApi';
import { SLUG_TO_KOREAN, getDistrictBySlug, DISTRICTS } from '@/lib/constants/districts';
import { computeAllDistrictStats, getDistrictRank } from '@/lib/utils/districtStats';
import { notFound } from 'next/navigation';
import GuideContent from '@/components/guide/GuideContent';

export const revalidate = 300;

interface GuidePageProps {
  params: Promise<{ district: string }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { district } = await params;
  const districtInfo = getDistrictBySlug(district);

  if (!districtInfo) {
    return { title: '페이지를 찾을 수 없습니다' };
  }

  const { nameKo } = districtInfo;

  return {
    title: `${nameKo} 테니스장 가이드 | 서울 테니스`,
    description: `${nameKo} 공공 테니스장 완전 가이드. 시설 수, 무료 코트, 예약 경쟁률, 운영시간, 예약 팁까지 ${nameKo} 테니스장의 모든 것을 알려드립니다.`,
    keywords: [
      `${nameKo} 테니스장`,
      `${nameKo} 테니스장 가이드`,
      `${nameKo} 공공 테니스장`,
      `${nameKo} 테니스 예약`,
      '서울 테니스장',
    ],
    alternates: {
      canonical: `/guide/${district}`,
    },
    openGraph: {
      title: `${nameKo} 테니스장 완전 가이드 | 서울 테니스`,
      description: `${nameKo} 공공 테니스장의 모든 정보를 한눈에 확인하세요.`,
      url: `https://seoul-tennis.com/guide/${district}`,
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return DISTRICTS.map((d) => ({ district: d.slug }));
}

function GuideUnavailable({ nameKo, district }: { nameKo: string; district: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="court-pattern text-white py-6">
        <div className="container relative z-10">
          <nav className="mb-3">
            <ol className="flex items-center gap-1.5 text-sm text-white/70 flex-wrap">
              <li>
                <Link href="/" className="hover:text-white transition-colors">홈</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">구별 비교</Link>
              </li>
              <li>/</li>
              <li className="text-white font-bold">{nameKo} 가이드</li>
            </ol>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {nameKo} 테니스장 가이드
          </h1>
        </div>
      </section>
      <section className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="text-5xl mb-4">🔄</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            데이터를 불러오는 중입니다
          </h2>
          <p className="text-gray-600 mb-6">
            서울시 공공데이터 API에서 {nameKo} 테니스장 정보를 가져오지 못했습니다.
            잠시 후 다시 방문해 주세요.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href={`/guide/${district}`}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              새로고침
            </Link>
            <Link
              href="/compare"
              className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              구별 비교 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { district } = await params;
  const koreanName = SLUG_TO_KOREAN[district];

  if (!koreanName) {
    notFound();
  }

  const services = await fetchTennisAvailability();
  const allStats = computeAllDistrictStats(services);
  const districtStat = allStats.districts.find((d) => d.nameKo === koreanName);

  if (!districtStat) {
    return <GuideUnavailable nameKo={koreanName} district={district} />;
  }

  const facilityRank = getDistrictRank(allStats, koreanName, 'totalCourts');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${koreanName} 테니스장 완전 가이드`,
    description: `${koreanName} 공공 테니스장 정보 - 시설 ${districtStat.totalCourts}개, 예약 가능 ${districtStat.availableCourts}개`,
    url: `https://seoul-tennis.com/guide/${district}`,
    publisher: {
      '@type': 'Organization',
      name: '서울 테니스',
      url: 'https://seoul-tennis.com',
    },
    dateModified: allStats.lastUpdated,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: 'https://seoul-tennis.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '구별 비교',
          item: 'https://seoul-tennis.com/compare',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `${koreanName} 가이드`,
          item: `https://seoul-tennis.com/guide/${district}`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuideContent
        district={district}
        stat={districtStat}
        allStats={allStats}
        facilityRank={facilityRank}
      />
    </>
  );
}
