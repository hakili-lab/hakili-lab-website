// TODO(url): remplacer par le vrai domaine de production des qu'il est connu
// (exemple : "https://www.hakililab.com", sans barre oblique finale), et
// mettre a jour `site` dans astro.config.mjs avec la meme valeur.
//
// "https://example.com" est un domaine reserve a la documentation par la
// norme (RFC 2606) : il ne pointe vers aucun site reel et ne peut pas etre
// confondu avec le futur domaine de Hakili Lab. Il sert de valeur temporaire
// pour que canonical/Open Graph/sitemap.xml produisent des URLs absolues
// valides des maintenant (une URL relative comme canonical="/" est invalide),
// sans jamais inventer un nom de domaine plausible.
export const SITE_URL = 'https://example.com';

export const SITE_TITLE = 'Hakili Lab — Tutorat en mathématiques et physique-chimie à Ouagadougou';
export const SITE_DESCRIPTION =
  "Hakili Lab est un centre de tutorat en mathématiques et physique-chimie à Ouagadougou, du CP1 à la Terminale : test de positionnement gratuit, groupes de niveau et enseignants formés, dans cinq centres.";
