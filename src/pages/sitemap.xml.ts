import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_URL } from '../data/site.js';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.brouillon);
  const paths = ['/', '/blog', ...posts.map((p) => `/blog/${p.id}`)];

  const urlEntries = paths.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- TODO(url): renseigner SITE_URL dans src/data/site.js pour obtenir des URLs absolues valides -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
