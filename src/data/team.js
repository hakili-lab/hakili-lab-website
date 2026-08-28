// Fondateurs et enseignants mis en avant (portraits nommés). Espaces
// reserves explicites en attendant les vraies photos/biographies : voir
// docs/EQUIPE.md pour la marche a suivre quand elles arrivent.
//
// Meme principe de validation que src/data/centres.js : z.custom() pour
// "photo" (une image importee statiquement, ou null) ne reconstruit pas
// l'objet et ne tronque donc pas ses proprietes (contrairement a
// z.object({...}).parse(), qui supprime toute propriete non declaree -
// piege deja rencontre sur centres.js). Un champ manquant (name/role/bio)
// fait echouer .parse() et donc le build, avec un message precis.
import { z } from 'astro:content';
import salfoPhoto from '../assets/photos/portrait-salfo-bikienga.jpg';
import mahamadouPhoto from '../assets/photos/portrait-mahamadou-bikienga.jpg';

const imageMetadataSchema = z.custom(
  (val) =>
    !!val &&
    typeof val === 'object' &&
    typeof val.src === 'string' &&
    typeof val.width === 'number' &&
    typeof val.height === 'number',
  { message: 'doit etre une image importee statiquement (import photo from "../assets/photos/x.jpeg"), pas une chaine de caracteres' }
);

const personSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  photo: z.union([imageMetadataSchema, z.null()]),
});

const rawFondateurs = [
  { name: 'Salfo Bikienga', role: 'Co-fondateur', bio: 'Titulaire d’un doctorat obtenu à l’Université du Nebraska en 2018, Salfo Bikienga a construit son parcours autour des mathématiques et de l’analyse de données, avec une licence en administration des affaires et un master en économie obtenus à l’Université de Ouagadougou. Ses travaux de recherche portent sur les méthodes d’analyse de texte appliquées à l’économie du développement. C’est cette exigence académique, acquise entre le Burkina Faso et les États-Unis, qu’il met aujourd’hui au service des élèves de Hakili Lab.', photo: salfoPhoto },
  { name: 'Mahamadou Bikienga', role: 'Co-fondateur', bio: 'Diplômé d’un master en systèmes d’information et intelligence d’affaires de l’université Carnegie Mellon, après une licence en économie et mathématiques à l’université de Pittsburgh, Mahamadou Bikienga dirige aujourd’hui les équipes de prévision et d’analyse chez Seminole Electric Cooperative, aux États-Unis. Avant cette carrière dans la donnée, il a été tuteur en mathématiques auprès de collégiens et lycéens, une expérience qu’il retrouve aujourd’hui à la tête de Hakili Lab.', photo: mahamadouPhoto },
];

const rawEnseignants = [
  { name: 'Aziz Sawadogo', role: 'Enseignant de mathématiques', bio: 'Biographie à venir.', photo: null },
  { name: 'Manly', role: 'Enseignant de mathématiques', bio: 'Biographie à venir.', photo: null },
  { name: 'Gottoh', role: 'Enseignant de mathématiques', bio: 'Biographie à venir.', photo: null },
  { name: 'Salamata', role: 'Enseignant de mathématiques', bio: 'Biographie à venir.', photo: null },
];

export const fondateurs = z.array(personSchema).parse(rawFondateurs);
export const enseignants = z.array(personSchema).parse(rawEnseignants);
