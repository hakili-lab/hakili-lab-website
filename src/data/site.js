// URL de production, avec le https:// et sans barre oblique finale. C'est la
// seule source : canonical, Open Graph, JSON-LD, le sitemap (@astrojs/sitemap)
// et robots.txt en derivent. astro.config.mjs l'importe directement pour son
// champ `site`.
export const SITE_URL = 'https://www.hakililab.com';

export const SITE_TITLE = 'Hakili Lab - Centre d\'Excellence en Mathématiques';
export const SITE_DESCRIPTION =
  "Hakili Lab est un centre de tutorat en mathématiques et physique-chimie à Ouagadougou, du CP1 à la Terminale : test de positionnement gratuit, groupes de niveau et enseignants formés, dans cinq centres.";
