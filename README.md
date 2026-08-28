# Hakili Lab — site (Astro)

Site vitrine du centre de tutorat Hakili Lab (Ouagadougou), en Astro statique.

> **Note (28/08/2026)** : ce README date de la toute première session du
> projet (conversion d'une maquette HTML unique) et ne reflète plus
> l'architecture actuelle (collections de contenu, blog, plusieurs pages,
> `src/data/centres.js`, etc.). Pour une vue à jour du projet — stack,
> inventaire des fichiers, ce qui manque avant mise en ligne — voir
> `docs/RAPPORT-PROJET.md`. Pour déployer, voir `README-DEPLOIEMENT.md`.
> La maquette d'origine `hakililab.html` et `AMELIORATIONS.md` (notes sur
> cette première conversion) ont été retirés du dépôt ; ce qui restait
> pertinent dans `AMELIORATIONS.md` a été repris dans
> `docs/RAPPORT-PROJET.md` section 7.

## Installation et lancement

```sh
npm install
npm run dev       # http://localhost:3000
```

```sh
npm run build     # build statique dans ./dist
npm run preview   # sert ./dist localement
```

## Où modifier quoi

| Je veux changer…                                             | Fichier(s)                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------- |
| Le texte, les titres, les listes d'une section                 | `src/components/<NomDeLaSection>.astro` (une section = un fichier)  |
| Les couleurs, tailles, espacements globaux                     | `src/styles/tokens.css` (variables `--blue`, `--green`, `--r`…)     |
| Le style d'un composant précis (header, hero, cartes, modale…) | `src/styles/components/<nom>.css`                                   |
| Les points de rupture responsive (1080 / 980 / 680 px)         | `src/styles/responsive.css`                                         |
| Les 13 fiches "classe" du sélecteur de niveau (primaire/secondaire) | `src/data/levels.js`                                            |
| Les 16 fiches "En savoir plus" (services, manuels, apps)        | `src/data/details.js` — **la clé doit correspondre au titre normalisé** (voir plus bas) |
| Le menu et les sous-menus du header                            | `src/components/Header.astro`                                       |
| Le logo                                                         | `src/assets/logo-hakili-lab.png`, importé dans `Header.astro` et `Footer.astro` |
| Les photos (centres, galerie, blog, à propos)                  | `src/assets/photos/`, importées dans le composant correspondant     |
| Le comportement JS (menu mobile, sélecteur, modale)             | `src/scripts/nav.js`, `level-finder.js`, `detail-modal.js`          |
| Le `<head>` (title, polices, meta)                              | `src/layouts/BaseLayout.astro`                                      |
| L'ordre des sections sur la page                                | `src/pages/index.astro`                                             |

## Point d'attention : les fiches détail

`src/scripts/detail-modal.js` associe automatiquement chaque carte cliquable
(services, manuels, applications) à sa fiche dans `src/data/details.js`, en
normalisant le texte de son titre (`<h3>`/`<h4>`) : minuscules, accents
supprimés, caractères non alphanumériques supprimés. Si vous changez un titre
de section dans un composant, la clé correspondante dans `details.js` doit
être mise à jour à l'identique, sinon la fiche ne s'ouvre plus (silencieusement,
sans erreur visible).

## Structure

```
src/
├── assets/            logo + photos, importés (donc optimisés/hashés au build)
├── components/         un fichier .astro par section de la page
├── data/                levels.js (sélecteur de niveau) et details.js (fiches)
├── layouts/             BaseLayout.astro (head, polices, <slot />)
├── scripts/              les 3 scripts client, repris tels quels (var, forEach.call…)
├── styles/               main.css importe tout le reste, dans l'ordre du CSS d'origine
└── pages/
    └── index.astro       assemble tous les composants dans l'ordre de la page
```

## Ce qui n'a pas été fait

Voir `docs/RAPPORT-PROJET.md`, section 7 (notes historiques reprises de
l'ancien `AMELIORATIONS.md`) et section 4 (« Ce qui manque ») pour l'état à
jour de ce point.
