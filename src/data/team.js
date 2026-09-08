// Schema et validation des portraits nommes : fondateurs (/a-propos) et
// enseignants (/enseignants). Les valeurs elles-memes vivent desormais dans
// team.json, a cote : ce fichier ne porte plus que le schema, la resolution
// des photos et la validation.
//
// Le JSON est le format que l interface d administration sait editer
// (Sveltia CMS, voir public/admin/config.yml > collection "equipe") :
// un enregistrement depuis /admin reecrit team.json, jamais ce fichier.
// Les exports "fondateurs" et "enseignants" n ont pas change de forme, les
// deux pages qui les importent n ont rien eu a changer.
//
// Espaces reserves explicites en attendant les vraies photos et biographies :
// voir docs/EQUIPE.md pour la marche a suivre quand elles arrivent. La
// section "L equipe" de /enseignants est par ailleurs commentee pour le
// moment, ce qui ne change rien a la validation faite ici.
//
// Meme principe de validation que src/data/centres.js : z.custom() pour
// "photo" (une image resolue, ou null) ne reconstruit pas l objet et ne
// tronque donc pas ses proprietes (contrairement a z.object({...}).parse(),
// qui supprime toute propriete non declaree - piege deja rencontre sur
// centres.js). Un champ manquant (name/role/bio) fait echouer .parse() et
// donc le build, avec un message precis.
import { z } from 'astro:content';
import teamData from './team.json';

// Un fichier JSON ne peut contenir qu une chaine de caracteres : les photos
// ne peuvent plus etre des imports statiques et sont resolues ici.
// import.meta.glob en mode eager rend exactement le meme objet ImageMetadata
// que les imports d avant (meme mecanique que src/data/centres.js et
// src/pages/galerie/index.astro), et le pipeline d images d Astro fonctionne
// donc a l identique.
const photosImportees = import.meta.glob('../assets/photos/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
});

// Indexe par nom de fichier seul : la valeur ecrite dans le JSON reste
// valable quelle que soit la forme exacte du chemin. Sveltia ecrit
// "/src/assets/photos/x.jpg" (public_folder de public/admin/config.yml),
// une saisie manuelle pourrait ecrire un chemin relatif.
const photosParNom = {};
for (const chemin of Object.keys(photosImportees)) {
  photosParNom[chemin.split('/').pop()] = photosImportees[chemin];
}

function resoudrePhoto(valeur) {
  // Pas de photo : la carte affiche les initiales (voir PersonCard.astro).
  // La cle absente est traitee comme null, parce que l interface omet
  // purement et simplement un champ facultatif laisse vide (option
  // "output.omit_empty_optional_fields" de public/admin/config.yml).
  if (valeur === undefined || valeur === null || valeur === '') return null;
  // Une valeur qui n est pas une chaine est laissee telle quelle : c est au
  // schema ci-dessous de la refuser avec son propre message.
  if (typeof valeur !== 'string') return valeur;
  // Un nom de fichier absent du dossier rend undefined, que le schema
  // refuse : jamais un portrait silencieusement manquant.
  return photosParNom[valeur.split('/').pop()];
}

const imageMetadataSchema = z.custom(
  (val) =>
    !!val &&
    typeof val === 'object' &&
    typeof val.src === 'string' &&
    typeof val.width === 'number' &&
    typeof val.height === 'number',
  {
    message:
      'photo introuvable : "photo" doit designer un fichier reellement present dans src/assets/photos/ (ex. "/src/assets/photos/portrait-salfo-bikienga.jpg"), ou etre vide',
  }
);

const personSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  photo: z.preprocess(resoudrePhoto, z.union([imageMetadataSchema, z.null()])),
});

// z.array(...).parse() leve au premier appel du module (donc au moment de la
// compilation, puisque les pages important ce fichier l evaluent) si une
// entree ne respecte pas le schema : le build s arrete avec un message
// precis, au lieu d une donnee fausse publiee.
export const fondateurs = z.array(personSchema).parse(teamData.fondateurs);
export const enseignants = z.array(personSchema).parse(teamData.enseignants);
