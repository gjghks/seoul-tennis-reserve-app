import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/my/', '/dashboard/'],
    },
    sitemap: 'https://seoul-tennis.vercel.app/sitemap.xml',
  };
}
