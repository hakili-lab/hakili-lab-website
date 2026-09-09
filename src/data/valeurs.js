// Schema et validation des deux sections de /valeurs : "Nos valeurs" (la
// liste a coches) et "Engagements de nos eleves" (les 4 cartes). Les valeurs
// elles-memes vivent dans valeurs.json, a cote : ce fichier ne porte que le
// schema et la validation.
//
// Le JSON est le format que l'interface d'administration sait editer
// (Sveltia CMS, voir public/admin/config.yml > collection "contenu" > entree
// "Valeurs"). Un enregistrement depuis /admin reecrit valeurs.json, jamais ce
// fichier-ci.
//
// Chaque item de liste est un champ texte au format markdown (widget
// "markdown" cote Sveltia, texte simple ici) : la forme est libre - une
// phrase avec un seul segment mis en gras, jamais au meme endroit d'un item a
// l'autre - contrairement au titre de Hero.astro, ou la structure est fixe.
// "**texte**" en markdown correspond exactement a ce qui est aujourd'hui
// ecrit <b>texte</b> dans le gabarit. Le rendu passe par marked.parseInline()
// (voir src/pages/valeurs/index.astro), qui produit <strong> plutot que <b> -
// verifie qu'aucune regle CSS ne distingue les deux, le rendu visuel est
// identique.
//
// Ce module ne part PAS dans le bundle navigateur : la page /valeurs n'est
// rendue que cote serveur/build. Zod peut donc venir de 'astro:content'.
import { z } from 'astro:content';
import donnees from './valeurs.json';

const itemSchema = z.string().min(1);

const carteSchema = z.object({
  titre: z.string().min(1),
  items: z.array(itemSchema).min(1),
});

const valeursSchema = z.object({
  valeurs: z.object({
    eyebrow: z.string().min(1),
    titre: z.string().min(1),
    items: z.array(itemSchema).min(1),
  }),
  engagements: z.object({
    eyebrow: z.string().min(1),
    titre: z.string().min(1),
    intro: z.string().min(1),
    cartes: z.array(carteSchema).min(1),
  }),
});

export const valeurs = valeursSchema.parse(donnees);
