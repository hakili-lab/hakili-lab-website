// Schema et validation des centres. Les valeurs elles-memes vivent
// desormais dans centres.json, a cote : ce fichier ne porte plus que le
// schema, la resolution des images et la validation.
//
// Le JSON est le format que l'interface d'administration sait editer
// (Sveltia CMS, voir public/admin/config.yml > collection "centres") :
// un enregistrement depuis /admin reecrit centres.json, jamais ce fichier.
// L'export "centres" ci-dessous n'a pas change de forme, les pages qui
// l'importent (centres/index.astro, centres/[slug].astro, index.astro)
// n'ont rien eu a changer.
//
// "horaires" peut accueillir une grille complete (jour, creneau, niveau)
// une fois fournie. Tant que "grille" est vide, "resume" est affiche tel
// quel : un seul texte horaires a la fois, jamais les deux. Chaque entree
// de grille suit la forme
// { "jour": "Lundi", "creneaux": [{ "debut": "16h", "fin": "18h", "niveau": "Primaire" }] }.
//
// adresse / classesOuvertes / coordonnees GPS / lien Maps restent vides
// tant qu ils ne sont pas fournis - jamais un libelle affiche a cote d une
// valeur vide (voir les gabarits centres/*.astro et src/lib/placeholders.js,
// qui detecte aussi les chaines vides).
//
// Valide par Zod au chargement du module (voir centreSchema plus bas), sur
// le meme principe qu avant : un champ mal forme, ou une entree
// pretPourPublication:true dont un champ obligatoire est vide ou contient
// une formule d attente, fait planter le build avec un message precis au
// lieu de passer inapercu jusqu en production.
import { z } from 'astro:content';
import { isPlaceholder } from '../lib/placeholders.js';
import centresData from './centres.json';

// Un fichier JSON ne peut contenir qu une chaine de caracteres : les images
// ne peuvent plus etre des imports statiques et sont resolues ici.
// import.meta.glob en mode eager rend exactement le meme objet ImageMetadata
// que les imports d avant (meme mecanique que src/pages/galerie/index.astro),
// et le pipeline d images d Astro fonctionne donc a l identique.
const photosImportees = import.meta.glob('../assets/photos/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
});

// Indexe par nom de fichier seul : la valeur ecrite dans le JSON reste
// valable quelle que soit la forme exacte du chemin. Sveltia ecrit
// "/src/assets/photos/x.jpeg" (public_folder de public/admin/config.yml),
// une saisie manuelle pourrait ecrire un chemin relatif.
const photosParNom = {};
for (const chemin of Object.keys(photosImportees)) {
  photosParNom[chemin.split('/').pop()] = photosImportees[chemin];
}

function resoudrePhoto(valeur) {
  // Une valeur qui n est pas une chaine est laissee telle quelle : c est au
  // schema ci-dessous de la refuser avec son propre message.
  if (typeof valeur !== 'string') return valeur;
  return photosParNom[valeur.split('/').pop()];
}

// "resume" reste affiche tel quel tant que "grille" est vide.
const horaireCreneauSchema = z.object({
  debut: z.string().min(1),
  fin: z.string().min(1),
  niveau: z.string().min(1),
});

const horairesSchema = z.object({
  resume: z.string().default(''),
  grille: z
    .array(z.object({ jour: z.string().min(1), creneaux: z.array(horaireCreneauSchema) }))
    .default([]),
});

// Apres resolution, une image est un objet ImageMetadata
// (src/width/height/format...) - une chaine de caracteres a la place (photo
// absente de src/assets/photos/, chemin mal ecrit) doit echouer. z.custom()
// renvoie la valeur telle quelle si elle passe : contrairement a
// z.object({...}).parse() (qui reconstruit un objet et supprime toute
// propriete non declaree), ca ne tronque pas les proprietes de l image dont
// le pipeline d images d Astro a besoin (ex. "format") - verifie
// empiriquement, un premier essai avec z.object() les faisait disparaitre et
// cassait la generation des images de chaque centre.
const imageMetadataSchema = z.custom(
  (val) =>
    !!val &&
    typeof val === 'object' &&
    typeof val.src === 'string' &&
    typeof val.width === 'number' &&
    typeof val.height === 'number',
  {
    message:
      'photo introuvable : "image" doit designer un fichier reellement present dans src/assets/photos/ (ex. "/src/assets/photos/pissyPhoto.jpeg")',
  }
);

const REQUIRED_WHEN_READY = ['nom', 'description'];

// Les valeurs par defaut ne relachent pas la validation : elles couvrent le
// cas ou l interface d administration omet purement et simplement une cle
// laissee vide (option "output.omit_empty_optional_fields" de
// public/admin/config.yml). Une cle absente redevient donc la chaine vide
// deja utilisee ici, et isPlaceholder la refuse toujours sur un centre
// marque pretPourPublication.
const centreSchema = z
  .object({
    slug: z.string().min(1),
    nom: z.string().default(''),
    description: z.string().default(''),
    image: z.preprocess(resoudrePhoto, imageMetadataSchema),
    horaires: horairesSchema.default({ resume: '', grille: [] }),
    classesOuvertes: z.string().default(''),
    adresse: z.string().default(''),
    latitude: z.number().nullable().default(null),
    longitude: z.number().nullable().default(null),
    googleMapsUrl: z.string().default(''),
    pretPourPublication: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.pretPourPublication) return;
    for (const field of REQUIRED_WHEN_READY) {
      if (isPlaceholder(data[field])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Centre "${data.slug}" : le champ "${field}" est vide ou contient une formule d'attente ("${data[field]}") alors que pretPourPublication vaut true.`,
          path: [field],
        });
      }
    }
    if (isPlaceholder(data.horaires.resume)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Centre "${data.slug}" : "horaires.resume" est vide ou contient une formule d'attente ("${data.horaires.resume}") alors que pretPourPublication vaut true.`,
        path: ['horaires', 'resume'],
      });
    }
  });

// z.array(...).parse() leve au premier appel du module (donc au moment de
// la compilation, puisque les pages important ce fichier l evaluent) si une
// entree ne respecte pas le schema : le build s arrete avec un message
// precis (champ et centre concernes), au lieu d une donnee fausse publiee.
export const centres = z.array(centreSchema).parse(centresData.centres);
