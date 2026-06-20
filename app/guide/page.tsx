import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '이용 가이드 | 서울 테니스',
  description: '서울 테니스의 다양한 기능을 안내합니다. 예약 방법, 경기 기록, 매칭, 래더, 양도, 대진표, 학교 테니스장 이용 가이드.',
  openGraph: {
    title: '이용 가이드 | 서울 테니스',
    description: '서울 테니스의 다양한 기능을 안내합니다.',
    url: 'https://seoul-tennis.com/guide',
    type: 'website',
  },
};

const GUIDES = [
  {
    href: '/guide/reservation',
    icon: '🎾',
    title: '예약 가이드',
    desc: '서울시 공공 테니스장 통합회원 가입부터 예약 완료까지',
  },
  {
    href: '/guide/school-courts',
    icon: '🏫',
    title: '학교 테니스장',
    desc: '학교체육시설 개방 프로그램으로 이용 가능한 19개교 안내',
  },
  {
    href: '/guide/records',
    icon: '📋',
    title: '경기 기록',
    desc: '테니스 경기 결과를 기록하고 통계를 확인하는 방법',
  },
  {
    href: '/guide/matching',
    icon: '🤝',
    title: '매칭',
    desc: '테니스 파트너를 찾고 함께 경기하는 방법',
  },
  {
    href: '/guide/ladder',
    icon: '🏆',
    title: '래더',
    desc: 'ELO 랭킹 시스템과 리더보드 참여 방법',
  },
  {
    href: '/guide/transfers',
    icon: '🔄',
    title: '양도',
    desc: '코트 예약을 양도하거나 양수받는 방법',
  },
  {
    href: '/guide/tournaments',
    icon: '🏅',
    title: '대진표',
    desc: '동호회 토너먼트 대진표 생성 및 관리 방법',
  },
];

export default function GuidePage() {
  return (
    <div className="container py-8 scrollbar-hide">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <div className="text-4xl mb-4">📖</div>
          <h1 className="text-3xl font-bold mb-3">이용 가이드</h1>
          <p className="text-gray-600 dark:text-slate-400">서울 테니스의 다양한 기능을 안내합니다</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="flex items-start gap-4 p-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600 transition-all"
            >
              <div className="text-3xl shrink-0">{guide.icon}</div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-slate-100 mb-1">{guide.title}</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{guide.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
