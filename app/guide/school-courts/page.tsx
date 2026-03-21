import type { Metadata } from 'next';
import SchoolCourtsGuideContent from '@/components/guide/SchoolCourtsGuideContent';

export const metadata: Metadata = {
  title: '학교 테니스장 이용 가이드 | 서울 테니스',
  description: '서울시 학교체육시설 개방 프로그램을 통해 이용할 수 있는 학교 테니스장 안내. 19개교 리스트와 예약 방법.',
  openGraph: {
    title: '학교 테니스장 이용 가이드 | 서울 테니스',
    description: '서울시 학교체육시설 개방 프로그램을 통해 이용할 수 있는 학교 테니스장 안내. 19개교 리스트와 예약 방법.',
    url: 'https://seoul-tennis.com/guide/school-courts',
    type: 'article',
  },
};

export default function SchoolCourtsGuidePage() {
  return <SchoolCourtsGuideContent />;
}
