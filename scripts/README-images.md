# Traitement des photos

Le site utilise le composant `<Picture>` d'Astro (`astro:assets`) partout où une
photo est affichée (hero, "Nos centres", galerie, "Qui sommes-nous", articles de
blog). **Ce pipeline génère déjà, automatiquement à la compilation (`npm run
build`), les variantes AVIF/WebP/JPEG et les tailles (`srcset`) attendues par
chaque emplacement.** Il n'y a rien à générer à la main pour ça.

`scripts/optimiser-images.mjs` sert à une étape *avant* : réduire des photos
brutes (export d'appareil photo ou de téléphone, souvent 3000 à 6000 px de large
et plusieurs Mo chacune) à une résolution "maîtresse" raisonnable, avant de les
déposer dans `src/assets/photos/`. Sans cette étape, le dépôt Git accumule des
fichiers inutilement lourds que le pipeline devrait de toute façon réduire à
chaque compilation.

## Utilisation

```
node scripts/optimiser-images.mjs <dossier_source> <dossier_sortie> [--largeur=1600] [--qualite=82]
```

Le script ne fait jamais grossir une image plus petite que la largeur cible
(`withoutEnlargement`) ; il ré-encode toujours en JPEG qualité 82 par défaut.

## Largeur cible par emplacement

| Emplacement | Affiché au maximum | Largeur maîtresse recommandée | Ratio |
|---|---|---|---|
| Hero (fond plein écran) | 100 % de la largeur d'écran | **2600 px** | libre, cadrage large (16:9 à 3:2) |
| Nos centres (carte) | 380 px | **1200–1600 px** | 16:10 |
| Galerie | 500 px | **1200 px** | libre |
| Qui sommes-nous (vignette vidéo) | 560 px | **1200 px** | 4:3 |
| Logo | 51×48 px (en-tête) | déjà correct (420×394 px) | — |

Exemples :

```
node scripts/optimiser-images.mjs ./photos-brutes/hero      src/assets/photos/hero    --largeur=2600
node scripts/optimiser-images.mjs ./photos-brutes/centres   src/assets/photos         --largeur=1600
node scripts/optimiser-images.mjs ./photos-brutes/galerie   src/assets/photos         --largeur=1200
```

Une fois les fichiers déposés dans `src/assets/photos/` (en conservant les noms
actuels, ou en mettant à jour les `import` correspondants dans les composants
`.astro`), `npm run build` régénère automatiquement toutes les variantes
responsives.

## État actuel (28/08/2026)

Les vraies photos de Hakili Lab sont en place depuis longtemps (`1.jpg` à
`42.jpeg`, les portraits de l'équipe, les photos de chaque centre). Les 3
fichiers de banque d'images du tout premier gabarit (`846A26820.jpg`,
`846A2755.jpg`, `banner1.jpg`) ne sont plus utilisés nulle part dans le
code — voir `docs/RAPPORT-PROJET.md`, section 2 ("Orphelins"), qui liste
précisément ce qui reste sur le disque sans être référencé, et section 3
pour la liste des fichiers candidats à la suppression.
