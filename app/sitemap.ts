import { MetadataRoute } from 'next';
import { DISTRICTS, KOREAN_TO_SLUG } from '@/lib/constants/districts';
import { fetchTennisAvailability } from '@/lib/seoulApi';

const LAST_MODIFIED = new Date('2026-03-01T00:00:00Z');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://seoul-tennis.com';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/today`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/trends`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/records`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sitemap-page`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const districtPages: MetadataRoute.Sitemap = DISTRICTS.map((district) => ({
    url: `${baseUrl}/${district.slug}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }));

  const guidePages: MetadataRoute.Sitemap = DISTRICTS.map((district) => ({
    url: `${baseUrl}/guide/${district.slug}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const standaloneGuidePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/guide/reservation`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/guide/records`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  let courtPages: MetadataRoute.Sitemap = [];
  try {
    const courts = await fetchTennisAvailability();
    courtPages = courts
      .map((court) => {
        const slug = KOREAN_TO_SLUG[court.AREANM];
        if (!slug) return null;
        return {
          url: `${baseUrl}/${slug}/${court.SVCID}`,
          lastModified: LAST_MODIFIED,
          changeFrequency: 'daily' as const,
          priority: 0.6,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  } catch {
    // Seoul API unavailable — proceed without court pages
  }

  return [...staticPages, ...districtPages, ...guidePages, ...standaloneGuidePages, ...courtPages];
}
