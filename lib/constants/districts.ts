// 서울시 25개 구 한글/영문 매핑
export interface District {
  slug: string;      // URL용 영문 slug
  nameKo: string;    // 한글 이름
  nameEn: string;    // 영문 이름
}

export const DISTRICTS: District[] = [
  { slug: 'gangnam-gu', nameKo: '강남구', nameEn: 'Gangnam-gu' },
  { slug: 'gangdong-gu', nameKo: '강동구', nameEn: 'Gangdong-gu' },
  { slug: 'gangbuk-gu', nameKo: '강북구', nameEn: 'Gangbuk-gu' },
  { slug: 'gangseo-gu', nameKo: '강서구', nameEn: 'Gangseo-gu' },
  { slug: 'gwanak-gu', nameKo: '관악구', nameEn: 'Gwanak-gu' },
  { slug: 'gwangjin-gu', nameKo: '광진구', nameEn: 'Gwangjin-gu' },
  { slug: 'guro-gu', nameKo: '구로구', nameEn: 'Guro-gu' },
  { slug: 'geumcheon-gu', nameKo: '금천구', nameEn: 'Geumcheon-gu' },
  { slug: 'nowon-gu', nameKo: '노원구', nameEn: 'Nowon-gu' },
  { slug: 'dobong-gu', nameKo: '도봉구', nameEn: 'Dobong-gu' },
  { slug: 'dongdaemun-gu', nameKo: '동대문구', nameEn: 'Dongdaemun-gu' },
  { slug: 'dongjak-gu', nameKo: '동작구', nameEn: 'Dongjak-gu' },
  { slug: 'mapo-gu', nameKo: '마포구', nameEn: 'Mapo-gu' },
  { slug: 'seodaemun-gu', nameKo: '서대문구', nameEn: 'Seodaemun-gu' },
  { slug: 'seocho-gu', nameKo: '서초구', nameEn: 'Seocho-gu' },
  { slug: 'seongdong-gu', nameKo: '성동구', nameEn: 'Seongdong-gu' },
  { slug: 'seongbuk-gu', nameKo: '성북구', nameEn: 'Seongbuk-gu' },
  { slug: 'songpa-gu', nameKo: '송파구', nameEn: 'Songpa-gu' },
  { slug: 'yangcheon-gu', nameKo: '양천구', nameEn: 'Yangcheon-gu' },
  { slug: 'yeongdeungpo-gu', nameKo: '영등포구', nameEn: 'Yeongdeungpo-gu' },
  { slug: 'yongsan-gu', nameKo: '용산구', nameEn: 'Yongsan-gu' },
  { slug: 'eunpyeong-gu', nameKo: '은평구', nameEn: 'Eunpyeong-gu' },
  { slug: 'jongno-gu', nameKo: '종로구', nameEn: 'Jongno-gu' },
  { slug: 'jung-gu', nameKo: '중구', nameEn: 'Jung-gu' },
  { slug: 'jungnang-gu', nameKo: '중랑구', nameEn: 'Jungnang-gu' },
];

// slug -> 한글 변환
export const SLUG_TO_KOREAN: Record<string, string> = Object.fromEntries(
  DISTRICTS.map(d => [d.slug, d.nameKo])
);

// 한글 -> slug 변환
export const KOREAN_TO_SLUG: Record<string, string> = Object.fromEntries(
  DISTRICTS.map(d => [d.nameKo, d.slug])
);

// slug로 District 찾기
export function getDistrictBySlug(slug: string): District | undefined {
  return DISTRICTS.find(d => d.slug === slug);
}

// 한글 이름으로 District 찾기
export function getDistrictByKorean(nameKo: string): District | undefined {
  return DISTRICTS.find(d => d.nameKo === nameKo);
}
