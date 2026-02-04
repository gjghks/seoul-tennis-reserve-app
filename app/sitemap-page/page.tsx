import Link from 'next/link';
import { DISTRICTS } from '@/lib/constants/districts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '사이트맵',
  description: '서울 테니스 사이트의 모든 페이지를 한눈에 확인하세요. 서울시 25개 자치구 테니스장 페이지와 서비스 안내 페이지를 제공합니다.',
  alternates: {
    canonical: '/sitemap-page',
  },
};

export default function SitemapPage() {
  const mainPages = [
    { href: '/', label: '홈', description: '서울시 전체 테니스장 예약 현황' },
    { href: '/about', label: '서비스 소개', description: '서울 테니스 서비스 안내' },
    { href: '/contact', label: '문의하기', description: '서비스 문의 및 건의' },
    { href: '/privacy', label: '개인정보처리방침', description: '개인정보 보호 정책' },
    { href: '/terms', label: '이용약관', description: '서비스 이용약관' },
  ];

  const userPages = [
    { href: '/login', label: '로그인', description: '회원 로그인' },
    { href: '/my', label: '마이페이지', description: '즐겨찾기 및 알림 관리' },
  ];

  return (
    <div className="container py-8 scrollbar-hide">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">사이트맵</h1>
          <p className="text-gray-600">서울 테니스의 모든 페이지를 확인하세요.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                📄
              </span>
              주요 페이지
            </h2>
            <ul className="space-y-3">
              {mainPages.map((page) => (
                <li key={page.href}>
                  <Link 
                    href={page.href}
                    className="group block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                      {page.label}
                    </span>
                    <p className="text-sm text-gray-500 mt-0.5">{page.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                👤
              </span>
              회원 페이지
            </h2>
            <ul className="space-y-3">
              {userPages.map((page) => (
                <li key={page.href}>
                  <Link 
                    href={page.href}
                    className="group block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                      {page.label}
                    </span>
                    <p className="text-sm text-gray-500 mt-0.5">{page.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="md:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                🎾
              </span>
              지역별 테니스장
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              서울시 25개 자치구별 공공 테니스장 예약 현황을 확인할 수 있습니다.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {DISTRICTS.map((district) => (
                <Link
                  key={district.slug}
                  href={`/${district.slug}`}
                  className="px-3 py-2 text-sm text-center rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  {district.nameKo}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            찾으시는 페이지가 없으신가요?{' '}
            <Link href="/contact" className="text-green-600 hover:underline font-medium">
              문의하기
            </Link>
            를 통해 알려주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
