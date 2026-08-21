import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/site.js';

export const GET: APIRoute = () => {
  // sitemap-index.xml est genere par l'integration @astrojs/sitemap (astro.config.mjs)
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_URL}/sitemap-index.xml`, ''].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
