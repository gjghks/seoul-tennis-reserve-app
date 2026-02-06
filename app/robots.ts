import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/my/'],
    },
    sitemap: 'https://seoul-tennis.com/sitemap.xml',
  };
}
