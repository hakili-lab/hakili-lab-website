// Construit le balisage JSON-LD BreadcrumbList a partir des memes items que
// le fil d'Ariane visuel (Breadcrumbs.astro), utilise par SiteLayout.astro.
import { SITE_URL } from '../data/site.js';

export function breadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: SITE_URL + item.href } : {}),
    })),
  };
}
