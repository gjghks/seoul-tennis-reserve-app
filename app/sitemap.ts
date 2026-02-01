import { MetadataRoute } from 'next';

const DISTRICTS = [
  'gangnam', 'gangdong', 'gangbuk', 'gangseo', 'gwanak',
  'gwangjin', 'guro', 'geumcheon', 'nowon', 'dobong',
  'dongdaemun', 'dongjak', 'mapo', 'seodaemun', 'seocho',
  'seongdong', 'seongbuk', 'songpa', 'yangcheon', 'yeongdeungpo',
  'yongsan', 'eunpyeong', 'jongno', 'jung', 'jungnang'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://seoul-tennis.com';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const districtPages: MetadataRoute.Sitemap = DISTRICTS.map((district) => ({
    url: `${baseUrl}/${district}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...districtPages];
}
