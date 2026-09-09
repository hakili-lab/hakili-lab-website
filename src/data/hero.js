// Schema et validation du bandeau plein cadre de l'accueil (Hero.astro). Les
// valeurs elles-memes vivent dans hero.json, a cote : ce fichier ne porte que
// le schema et la validation.
//
// Le JSON est le format que l'interface d'administration sait editer
// (Sveltia CMS, voir public/admin/config.yml > collection "contenu" > entree
// "Accueil"). Un enregistrement depuis /admin reecrit hero.json, jamais ce
// fichier-ci.
//
// Le titre est decoupe en trois champs (avant / accent / apres) plutot qu'un
// widget markdown : sa structure est fixe (un seul mot mis en couleur, toujours
// au meme endroit visuellement, jamais de gras ni d'autre mise en forme), donc
// plus simple et plus sur a editer sous cette forme qu'en tapant du HTML ou du
// markdown. Le gabarit reconstruit <em>{accent}</em> avec la couleur deja en
// place (voir src/styles/components/hero.css > .hero h1 em).
//
// Ce module ne part PAS dans le bundle navigateur : Hero.astro n'est rendu
// que cote serveur/build, aucun script client ne l'importe. Zod peut donc
// venir de 'astro:content', comme centres.js et team.js.
import { z } from 'astro:content';
import donnees from './hero.json';

const boutonSchema = z.object({
  texte: z.string().min(1),
  lien: z.string().min(1),
});

const heroSchema = z.object({
  titre: z.object({
    // "avant" et "apres" encadrent le mot mis en couleur ; l'un des deux peut
    // legitimement etre vide (le mot en couleur en tete ou en fin de phrase),
    // "accent" ne le peut pas : c'est la raison d'etre de ce champ.
    avant: z.string().default(''),
    accent: z.string().min(1),
    apres: z.string().default(''),
  }),
  sousTitre: z.string().min(1),
  // La ligne "Ouagadougou • Cinq centres • Depuis 2020" : un element par
  // segment, assembles par le gabarit avec le meme separateur qu'aujourd'hui.
  meta: z.array(z.string().min(1)).min(1),
  // Toujours deux boutons, dans cet ordre : le premier reprend le style plein
  // (vert) et le second le style contour, comme aujourd'hui. Un nombre
  // different de boutons romprait la mise en page (voir hero-actions dans
  // hero.css), donc la longueur exacte est verifiee ici plutot que laissee
  // libre.
  boutons: z.tuple([boutonSchema, boutonSchema]),
});

export const hero = heroSchema.parse(donnees);
