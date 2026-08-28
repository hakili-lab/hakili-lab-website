# Site Hakili Lab (Astro)

Site vitrine du centre de tutorat Hakili Lab (Ouagadougou), en mathématiques
et physique-chimie du primaire au secondaire. Astro, rendu 100 % statique.

Le site est multipage : accueil, à propos, méthode, enseignants, services,
centres, manuels, Amira, Dr Maya, galerie, blog, FAQ, contact, inscription.
Le contenu éditorial (articles, fiches service, fiches manuels) vit dans des
collections de contenu Markdown ; les centres et l'équipe dans des modules de
données JS validés par Zod au build.

## Installation et lancement

```sh
npm install
npm run dev       # http://localhost:3000
```

```sh
npm run build     # build statique dans ./dist
npm run preview   # sert ./dist localement (http://localhost:4321)
```

Node.js ≥ 22.12.0 est requis (`package.json` → `engines`).

## Où modifier quoi

| Je veux changer…                                              | Fichier(s)                                                        |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| Le texte, les titres, les listes d'une section                | `src/components/<NomDeLaSection>.astro` ou la page concernée dans `src/pages/` |
| Les couleurs, tailles, espacements globaux                    | `src/styles/tokens.css` (variables `--blue`, `--green`, `--r`…)  |
| Le style d'un composant précis (header, hero, cartes, modale…)| `src/styles/components/<nom>.css`                                |
| Les points de rupture responsive (1080 / 980 / 680 px)        | `src/styles/responsive.css`                                      |
| Les 13 fiches « classe » du sélecteur de niveau (accueil)     | `src/data/levels.js`                                             |
| Les 7 fiches « En savoir plus » (matières, formules, applications), affichées en modale | `src/data/details.js` (la clé doit correspondre au titre normalisé, voir plus bas) |
| Les articles de blog, les fiches service, les fiches manuels  | `src/content/blog/`, `src/content/services/`, `src/content/manuels/` (un fichier `.md` par entrée, voir `docs/PUBLIER-UN-ARTICLE.md` pour le blog) |
| Les centres (horaires, adresse, coordonnées GPS, lien Maps)   | `src/data/centres.js` (validé par Zod au build : une valeur manquante sur un centre `pretPourPublication:true` fait échouer `npm run build`) |
| Les fondateurs et enseignants (noms, rôles, biographies, photos) | `src/data/team.js` (voir `docs/EQUIPE.md`)                    |
| L'URL de production, le titre et la description SEO           | `src/data/site.js`                                               |
| Le menu et les sous-menus du header                           | `src/components/Header.astro`                                    |
| Le logo                                                       | `src/assets/logo-hakili-lab.png`, importé dans `Header.astro` et `Footer.astro` |
| Les photos (centres, galerie, blog, portraits)                | `src/assets/photos/`, importées dans le composant ou la page correspondante |
| Le comportement JS (menu mobile, sélecteur, modale, diaporama, lightbox…) | `src/scripts/*.js` (un fichier par comportement, importé dans la page ou le layout qui en a besoin) |
| Le `<head>` (title, polices, meta, Open Graph, JSON-LD)       | `src/layouts/BaseLayout.astro`                                   |
| La coquille commune à presque toutes les pages               | `src/layouts/SiteLayout.astro`                                   |
| L'ordre des sections sur la page d'accueil                    | `src/pages/index.astro`                                          |

## Point d'attention : les fiches détail

`src/scripts/detail-modal.js` associe automatiquement chaque carte cliquable
(services, manuels, applications) à sa fiche dans `src/data/details.js`, en
normalisant le texte de son titre (`<h2>`/`<h3>`) : minuscules, accents
supprimés, caractères non alphanumériques supprimés. Si vous changez un titre
de section dans un composant, la clé correspondante dans `details.js` doit
être mise à jour à l'identique, sinon la fiche ne s'ouvre plus (silencieusement,
sans erreur visible). Une carte devenue un vrai lien `<a>`, ou qui contient
déjà un lien « En savoir plus », n'ouvre jamais de modale même si sa clé
existe. Trois fiches (`test de positionnement`, `amira`, `dr maya`) sont aussi
lues directement par leur page, hors du système de modale : le commentaire en
tête de `details.js` détaille les deux vérifications à faire avant d'en retirer
une.

## Structure

```
src/
├── assets/            logo + photos, importés (donc optimisés et hashés au build)
│   └── photos/
├── components/        un fichier .astro par bloc réutilisable (Header, Footer,
│                      Hero, LevelFinder, Method, Brochure, DetailModal,
│                      Breadcrumbs, PersonCard, TopBar)
├── content/           collections de contenu Markdown, schémas dans
│                      src/content.config.ts (garde-fou : une entrée marquée
│                      prête à publier avec un champ vide fait échouer le build)
│   ├── blog/          articles du blog
│   ├── services/      fiches service
│   └── manuels/       fiches manuels (6e à Terminale)
├── data/              données en JS (hors Markdown)
│   ├── site.js        URL, titre, description du site
│   ├── levels.js      les 13 fiches du sélecteur de niveau
│   ├── details.js     les 7 fiches « En savoir plus »
│   ├── centres.js     les 5 centres (remplace l'ancienne collection, validé par Zod)
│   └── team.js        fondateurs et enseignants
├── layouts/
│   ├── BaseLayout.astro   le <head> unique du site
│   └── SiteLayout.astro   TopBar + Header + main + fil d'Ariane + Footer + scripts globaux
├── lib/               helpers partagés (breadcrumbs.js, placeholders.js)
├── scripts/           scripts client, chargés page par page
├── styles/            main.css importe tout le reste (tokens, composants, responsive)
└── pages/             une route par dossier ; index.astro assemble l'accueil
```

## Ce qui reste à faire

Contenu encore provisoire (valeurs « À définir », données factices, structures
vides) : `docs/A-FAIRE-CONTENU.md`. État technique, fichiers à nettoyer et ce
qui manque avant mise en ligne : `docs/RAPPORT-PROJET.md`, sections 3 et 4.

## Documentation

Le détail vit dans des documents dédiés, ce README n'en recopie pas le contenu :

| Document                   | Pour                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `README-DEPLOIEMENT.md`    | Installer, construire, vérifier et mettre en ligne le site (commandes exactes à copier-coller). |
| `docs/RAPPORT-PROJET.md`   | État technique détaillé : stack, inventaire des fichiers, orphelins et doublons, ce qui manque, décisions de structure et d'accessibilité. |
| `docs/EQUIPE.md`           | Remplacer les espaces réservés par les vraies photos et biographies des fondateurs et enseignants. |
| `docs/PUBLIER-UN-ARTICLE.md` | Ajouter, modifier ou dépublier un article de blog sans savoir programmer.                   |
| `docs/A-FAIRE-CONTENU.md`  | Inventaire complet du contenu provisoire : quoi fournir, où, sous quel format.                |

Deux scripts de vérification (`scripts/verifier-pages.mjs`,
`scripts/verifier-contrastes.mjs`) contrôlent liens morts, accessibilité,
répétitions de contenu et contrastes sur un build servi localement. Leur
usage exact est décrit dans `README-DEPLOIEMENT.md`.
