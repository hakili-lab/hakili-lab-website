// Donnees des centres, sorties de la collection de contenu (src/content/centres/)
// vers ce fichier pour etre plus simples a relire et modifier d'un bloc,
// notamment "horaires" qui doit pouvoir accueillir une grille complete
// (jour, creneau, niveau) une fois fournie.
//
// Valeurs actuelles conservees telles quelles (photos, resumes) : a remplacer
// par les vraies quand elles arrivent. adresse/classesOuvertes/coordonnees
// GPS/lien Maps restent vides tant qu'ils ne sont pas fournis - jamais un
// libelle affiche a cote d'une valeur vide (voir les gabarits centres/*.astro
// et src/lib/placeholders.js, qui detecte aussi les chaines vides).
//
// Valide par Zod au chargement du module (voir centreSchema plus bas), sur
// le meme principe que l'ancienne collection de contenu : un champ mal
// forme ou une entree pretPourPublication:true avec un champ obligatoire
// vide/en attente fait planter le build avec un message precis, au lieu de
// passer inapercu jusqu'en production.
import { z } from 'astro:content';
import { isPlaceholder } from '../lib/placeholders.js';
import pissyPhoto from '../assets/photos/pissyPhoto.jpeg';
import tampouyPhoto from '../assets/photos/tampouyPhoto.jpeg';
import saabaPhoto from '../assets/photos/saabaPhoto.jpg';
import siaoPhoto from '../assets/photos/siaoPhoto.jpg';
import nagrinPhoto from '../assets/photos/nagrinPhoto.jpeg';

// "resume" reste affiche tel quel tant que "grille" est vide (un seul texte
// horaires a la fois, jamais les deux). Une fois la grille fournie, chaque
// entree suit la forme { jour: "Lundi", creneaux: [{ debut: "16h", fin: "18h", niveau: "Primaire" }] }.
function horaires(resume) {
  return { resume, grille: [] };
}

const horaireCreneauSchema = z.object({
  debut: z.string().min(1),
  fin: z.string().min(1),
  niveau: z.string().min(1),
});

const horairesSchema = z.object({
  resume: z.string(),
  grille: z.array(z.object({ jour: z.string().min(1), creneaux: z.array(horaireCreneauSchema) })),
});

// Une image importee statiquement (import photo from '...') est un objet
// ImageMetadata (src/width/height/format/...) une fois resolu par Vite - une
// chaine de caracteres a la place (chemin colle tel quel, import oublie)
// doit echouer. z.custom() renvoie la valeur telle quelle si elle passe :
// contrairement a z.object({...}).parse() (qui reconstruit un objet et
// supprime toute propriete non declaree), ca ne tronque pas les proprietes
// de l'image dont le pipeline d'images d'Astro a besoin (ex. "format") -
// verifie empiriquement, un premier essai avec z.object() les faisait
// disparaitre et cassait la generation des images de chaque centre.
const imageMetadataSchema = z.custom(
  (val) =>
    !!val &&
    typeof val === 'object' &&
    typeof val.src === 'string' &&
    typeof val.width === 'number' &&
    typeof val.height === 'number',
  { message: 'doit etre une image importee statiquement (import photo from "../assets/photos/x.jpeg") avec src/width/height, pas une chaine de caracteres' }
);

const REQUIRED_WHEN_READY = ['nom', 'description'];

const centreSchema = z
  .object({
    slug: z.string().min(1),
    nom: z.string(),
    description: z.string(),
    image: imageMetadataSchema,
    horaires: horairesSchema,
    classesOuvertes: z.string(),
    adresse: z.string(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    googleMapsUrl: z.string(),
    pretPourPublication: z.boolean(),
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

const rawCentres = [
  {
    slug: 'pissy',
    nom: 'Pissy',
    description:
      'Au cœur d\'un quartier dense, un cadre studieux pensé pour les collégiens et lycéens qui veulent progresser sérieusement en mathématiques.',
    image: pissyPhoto,
    horaires: horaires('Du lundi au samedi, 8h à 18h'),
    classesOuvertes: '',
    adresse: '',
    latitude: null,
    longitude: null,
    googleMapsUrl: '',
    pretPourPublication: true,
  },
  {
    slug: 'tampouy',
    nom: 'Tampouy',
    description:
      'Un centre facilement accessible depuis le nord de la ville, avec des séances en fin d’après-midi et le samedi.',
    image: tampouyPhoto,
    horaires: horaires('Du lundi au samedi, 8h à 18h'),
    classesOuvertes: '',
    adresse: '',
    latitude: null,
    longitude: null,
    googleMapsUrl: '',
    pretPourPublication: true,
  },
  {
    slug: 'saaba',
    nom: 'Saaba',
    description:
      'À l\'est de Ouagadougou, un cadre calme et propice à la concentration pour les collégiens et lycéens.',
    image: saabaPhoto,
    horaires: horaires('Du lundi au samedi, 8h à 18h'),
    classesOuvertes: '',
    adresse: '',
    latitude: null,
    longitude: null,
    googleMapsUrl: '',
    pretPourPublication: true,
  },
  {
    slug: 'siao',
    nom: 'SIAO',
    description:
      'Notre centre historique, en plein centre-ville,le seul à accueillir aussi les plus jeunes, du primaire au secondaire, pratique pour les familles qui viennent chercher leurs enfants en sortant du travail.',
    image: siaoPhoto,
    horaires: horaires('Du lundi au samedi, 8h à 18h'),
    classesOuvertes: '',
    adresse: '',
    latitude: null,
    longitude: null,
    googleMapsUrl: '',
    pretPourPublication: true,
  },
  {
    slug: 'nagrin',
    nom: 'Nagrin',
    description: 'Notre implantation la plus récente, au sud de la ville, avec des groupes à taille réduite.',
    image: nagrinPhoto,
    horaires: horaires('Du lundi au samedi, 8h à 18h'),
    classesOuvertes: '',
    adresse: '',
    latitude: null,
    longitude: null,
    googleMapsUrl: '',
    pretPourPublication: true,
  },
];

// z.array(...).parse() leve au premier appel du module (donc au moment de
// la compilation, puisque les pages important ce fichier l'evaluent) si une
// entree ne respecte pas le schema : le build s'arrete avec un message
// precis (champ et centre concernes), au lieu d'une donnee fausse publiee.
export const centres = z.array(centreSchema).parse(rawCentres);
