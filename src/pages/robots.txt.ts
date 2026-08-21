import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/site.js';

export const GET: APIRoute = () => {
  const sitemapLine = SITE_URL
    ? `Sitemap: ${SITE_URL}/sitemap.xml`
    : '# TODO(url): ligne Sitemap absolue une fois le domaine renseigne dans src/data/site.js';

  const body = ['User-agent: *', 'Allow: /', '', sitemapLine, ''].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
