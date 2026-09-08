// URL de production, avec le https:// et sans barre oblique finale. C'est la
// seule source : canonical, Open Graph, JSON-LD, le sitemap (@astrojs/sitemap)
// et robots.txt en derivent. astro.config.mjs l'importe directement pour son
// champ `site`.
//
// Volontairement NON editable depuis /admin : cette valeur pilote le build et
// le referencement, pas une information de contact. Une faute de frappe
// enregistree depuis l'interface casserait d'un coup toutes les URL
// canoniques, le sitemap et robots.txt, sans que rien ne le signale. Meme
// raison pour SITE_TITLE et SITE_DESCRIPTION juste en dessous.
export const SITE_URL = 'https://www.hakililab.com';

export const SITE_TITLE = 'Hakili Lab - Centre d\'Excellence en Mathématiques';
export const SITE_DESCRIPTION =
  "Hakili Lab est un centre de tutorat en mathématiques et physique-chimie à Ouagadougou, du CP1 à la Terminale : test de positionnement gratuit, groupes de niveau et enseignants formés, dans cinq centres.";

// --- Valeurs editables depuis /admin ---------------------------------------
// Coordonnees, reseaux sociaux et texte du bandeau : lus depuis
// parametres-site.json, que l'interface d'administration sait editer (Sveltia
// CMS, voir public/admin/config.yml > collection "parametres"). Un
// enregistrement depuis /admin reecrit ce JSON, jamais ce fichier-ci.
//
// Source unique pour tout le site : le bandeau du haut (TopBar), le pied de
// page, la page /contact et les balisages JSON-LD en tirent tous leurs
// valeurs. Rien n'est recopie en dur ailleurs.
//
// Valide par Zod au chargement du module : une valeur mal formee arrete le
// build avec un message precis, au lieu de produire des liens casses en
// production.
//
// Zod est importe depuis 'zod' et non depuis 'astro:content' : ce fichier est
// aussi charge par astro.config.mjs, hors du runtime Astro, ou le module
// virtuel 'astro:content' n'existe pas. C'est la difference avec centres.js
// et team.js, qui ne sont lus que pendant le rendu des pages.
import { z } from 'zod';
import parametres from './parametres-site.json';

const telephoneSchema = z.object({
  // Format E.164 : un plus, puis uniquement des chiffres (indicatif compris).
  tel: z
    .string()
    .regex(/^\+[0-9]{8,15}$/, 'numero au format international attendu, par exemple "+22657919191" (un plus, puis uniquement des chiffres)'),
  // Forme lisible affichee a l'ecran, par exemple "57 91 91 91".
  display: z.string().min(1),
});

const parametresSchema = z.object({
  telephones: z.array(telephoneSchema).min(1),
  email: z.string().email('adresse e-mail invalide'),
  // Ce numero alimente TOUS les boutons WhatsApp du site, sous la forme
  // https://wa.me/<numero>. wa.me n'accepte que des chiffres : ni plus, ni
  // espaces, ni tirets, et l'indicatif pays est obligatoire. Un simple
  // z.string().min(1) laisserait passer "+226 57 91 91 91", qui produirait un
  // lien mort sur chaque bouton sans qu'aucune verification ne le voie.
  whatsapp: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'numero WhatsApp invalide : uniquement des chiffres, indicatif pays compris et sans le plus, par exemple "22657919191" (ni espaces, ni tirets, ni +)'),
  reseauxSociaux: z
    .array(
      z.object({
        plateforme: z.string().min(1),
        url: z.string().url('adresse de profil invalide : une URL complete est attendue, https:// compris'),
      })
    )
    .default([]),
  bandeau: z
    .object({
      badge: z.string().default(''),
      texte: z.string().default(''),
    })
    .default({ badge: '', texte: '' }),
});

const valeurs = parametresSchema.parse(parametres);

// Coordonnees generales du centre. `tel` est au format E.164 (prefixe +226),
// `display` est la forme lisible.
export const SITE_PHONES = valeurs.telephones;
export const SITE_EMAIL = valeurs.email;
// Numero WhatsApp (format wa.me, sans + ni espaces). Meme motif de lien direct
// que partout ailleurs sur le site : https://wa.me/<WHATSAPP_NUMBER>.
export const WHATSAPP_NUMBER = valeurs.whatsapp;
// Profils publics : liens du pied de page et propriete sameAs du JSON-LD.
export const SITE_SOCIALS = valeurs.reseauxSociaux;
// Bandeau fin en tete de chaque page (TopBar.astro) : pastille + phrase.
export const SITE_BANDEAU = valeurs.bandeau;

// Forme internationale lisible d'un numero ("+226 57 91 91 91"), telle
// qu'affichee dans le bandeau du haut. L'indicatif est ce que `tel` porte en
// plus du numero local, donc changer de pays ne demande rien de plus ici.
export function telephoneInternational(phone) {
  const local = phone.display.replace(/\s+/g, '');
  const indicatif = phone.tel.slice(0, phone.tel.length - local.length);
  return `${indicatif} ${phone.display}`;
}
