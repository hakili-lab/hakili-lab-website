// Schema et validation de la page /faq : les questions/reponses et le texte
// autour. Les valeurs elles-memes vivent dans faq.json, a cote : ce fichier
// ne porte que le schema et la validation.
//
// Le JSON est le format que l'interface d'administration sait editer
// (Sveltia CMS, voir public/admin/config.yml > collection "contenu" > entree
// "FAQ"). Un enregistrement depuis /admin reecrit faq.json, jamais ce
// fichier-ci.
//
// Structure reelle du gabarit avant ce chantier : une liste plate de
// questions/reponses (pas de categories). Aucun gras ni mise en forme dans
// les questions ou les reponses : des champs texte simples suffisent, pas de
// widget markdown.
//
// Ce module ne part PAS dans le bundle navigateur : la page /faq n'est
// rendue que cote serveur/build (et le teaser FAQ de l'accueil, meme
// mecanique). Zod peut donc venir de 'astro:content'.
import { z } from 'astro:content';
import donnees from './faq.json';

const questionSchema = z.object({
  question: z.string().min(1),
  reponse: z.string().min(1),
});

const faqSchema = z.object({
  eyebrow: z.string().min(1),
  titre: z.string().min(1),
  intro: z.string().min(1),
  // Au moins une question : une page ou un teaser FAQ sans aucune question
  // n'a pas de sens.
  questions: z.array(questionSchema).min(1),
  cta: z.string().min(1),
});

export const faq = faqSchema.parse(donnees);
