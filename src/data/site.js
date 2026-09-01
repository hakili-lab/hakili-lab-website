// URL de production, avec le https:// et sans barre oblique finale. C'est la
// seule source : canonical, Open Graph, JSON-LD, le sitemap (@astrojs/sitemap)
// et robots.txt en derivent. astro.config.mjs l'importe directement pour son
// champ `site`.
export const SITE_URL = 'https://www.hakililab.com';

export const SITE_TITLE = 'Hakili Lab - Centre d\'Excellence en Mathématiques';
export const SITE_DESCRIPTION =
  "Hakili Lab est un centre de tutorat en mathématiques et physique-chimie à Ouagadougou, du CP1 à la Terminale : test de positionnement gratuit, groupes de niveau et enseignants formés, dans cinq centres.";

// Coordonnees generales du centre. Source unique : la page /contact en tire
// ses liens tel:/mailto: et le bouton WhatsApp, rien n'y est recopie en dur.
// `tel` est au format E.164 (prefixe +226), `display` est la forme lisible.
export const SITE_PHONES = [
  { tel: '+22657919191', display: '57 91 91 91' },
  { tel: '+22658795050', display: '58 79 50 50' },
];
export const SITE_EMAIL = 'info@hakililab.com';
// Numero WhatsApp (format wa.me, sans + ni espaces). Meme motif de lien direct
// que partout ailleurs sur le site : https://wa.me/<WHATSAPP_NUMBER>.
export const WHATSAPP_NUMBER = '22657919191';
