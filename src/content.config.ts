// Schemas Zod des collections de contenu (blog, services, manuels). Une
// entree qui ne respecte pas son schema fait echouer `astro build`, pas
// seulement un avertissement.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { isPlaceholder } from './lib/placeholders.js';
import fichesDetail from './data/details.json';

// Garde-fou contre les pages a moitie remplies : une entree marquee
// pretPourPublication:true doit avoir tous ses champs de contenu reel
// renseignes, sinon le build echoue avec un message precis (verifie
// empiriquement : Zod leve une InvalidContentEntryDataError qui fait
// echouer `astro build`, pas seulement un avertissement). Une entree
// pretPourPublication:false (valeur par defaut) peut avoir des champs
// vides sans consequence : elle est simplement exclue des routes,
// du sitemap et de la navigation (voir getStaticPaths de chaque page).
//
// Une chaine non vide n'est pas forcement une vraie valeur : "A definir"
// est rempli au sens de Zod mais dit la meme chose qu'un champ vide. Les
// champs texte sont donc verifies avec isPlaceholder (chaine vide OU
// formule d'attente connue), pas seulement leur presence.
function requireWhenReady(fields: string[]) {
  return (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
    if (!data.pretPourPublication) return;
    for (const field of fields) {
      const val = data[field];
      const isEmpty = Array.isArray(val) ? val.length === 0 : isPlaceholder(val as string | undefined);
      if (isEmpty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Le champ "${field}" est vide ou contient une formule d'attente ("${val}") alors que pretPourPublication vaut true : cette entree ne peut pas etre publiee en l'etat.`,
          path: [field],
        });
      }
    }
  };
}

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      // Slug declare explicitement : un renommage de fichier ne doit jamais
      // casser une URL deja indexee.
      slug: z.string(),
      titre: z.string(),
      description: z.string(),
      date: z.date(),
      categorie: z.enum(['Pédagogie', 'Conseils', 'Actualité']),
      image: image().optional(),
      // Garde-fou de cette collection : conserve tel quel (deja en place
      // avant cette passe), plutot que d'ajouter un second booleen
      // pretPourPublication qui ferait doublon et pourrait entrer en
      // contradiction avec lui. Polarite inversee : brouillon:true = exclu.
      brouillon: z.boolean().default(false),
    }),
});

// La collection "centres" a ete remplacee par src/data/centres.js (2026-08-22) :
// horaires doit pouvoir accueillir une grille complete (jour/creneau/niveau),
// plus simple a exprimer en JS qu'en frontmatter Markdown/Zod.

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z
    .object({
      slug: z.string(),
      nom: z.string().default(''),
      resumeCourt: z.string().default(''),
      publicVise: z.array(z.string()).default([]),
      deroule: z.array(z.string()).default([]),
      facts: z.array(z.object({ label: z.string(), valeur: z.string() })).default([]),
      cta: z.string().default(''),
      pretPourPublication: z.boolean().default(false),
    })
    .superRefine((data, ctx) =>
      requireWhenReady(['slug', 'nom', 'resumeCourt', 'publicVise', 'deroule', 'cta'])(data, ctx)
    ),
});

const manuels = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/manuels' }),
  schema: z
    .object({
      slug: z.string(),
      niveau: z.string().default(''),
      matiere: z.string().default(''),
      resumeCourt: z.string().default(''),
      publicVise: z.array(z.string()).default([]),
      caracteristiques: z.array(z.string()).default([]),
      facts: z.array(z.object({ label: z.string(), valeur: z.string() })).default([]),
      cta: z.string().default(''),
      pretPourPublication: z.boolean().default(false),
    })
    .superRefine((data, ctx) =>
      requireWhenReady(['slug', 'niveau', 'matiere', 'resumeCourt', 'cta'])(data, ctx)
    ),
});

// --- Fiches "En savoir plus" (src/data/details.json) ------------------------
// Ces fiches ne forment pas une collection de contenu : elles vivent dans un
// seul fichier JSON, remis en forme par src/data/details.js. Leur schema est
// verifie ici, et non dans details.js, pour une raison mesuree : details.js
// part dans le bundle navigateur (detail-modal.js l importe cote client), et y
// embarquer Zod faisait passer le JS livre sur chaque page de 17 Ko a 76 Ko.
// Ce fichier-ci, lui, est charge par Astro au demarrage du build, cote
// serveur : une erreur levee ici arrete le build, ce qui est exactement le
// garde-fou recherche.
const ficheDetailSchema = z.object({
  cle: z.string().min(1),
  k: z.string().min(1),
  p: z.string().min(1),
  who: z.array(z.string().min(1)).min(1),
  how: z.array(z.string().min(1)).min(1),
  facts: z.array(z.object({ label: z.string().min(1), valeur: z.string().min(1) })).default([]),
  cta: z.string().min(1),
});

z.array(ficheDetailSchema)
  .superRefine((fiches, ctx) => {
    // Deux fiches de meme cle : la seconde ecraserait la premiere a la
    // construction de l objet indexe, sans que rien ne le signale.
    const vues = new Set<string>();
    for (const fiche of fiches) {
      if (vues.has(fiche.cle)) {
        ctx.addIssue({
          code: 'custom',
          message: `Fiche "${fiche.cle}" : cette cle apparait deux fois dans src/data/details.json ; la seconde ecraserait silencieusement la premiere.`,
        });
      }
      vues.add(fiche.cle);
    }
  })
  .parse(fichesDetail.fiches);

export const collections = { blog, services, manuels };
