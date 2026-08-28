# Extraits des manuels

Ce dossier contient les PDF d'extraits feuilletables de la Collection Hakili Lab. Les fichiers déposés ici sont servis tels quels, à l'adresse `/extraits/<nom-du-fichier>`.

## Déposer un extrait pour un manuel précis

1. Nommez le fichier exactement `<slug-du-manuel>.pdf`, où `<slug-du-manuel>` est le `slug` de la fiche dans `src/content/manuels/` (par exemple `mathematiques-6e.pdf` pour le manuel dont le fichier est `src/content/manuels/mathematiques-6e.md`).
2. Déposez le PDF dans ce dossier.
3. Rien d'autre à faire : la page `/manuels/<slug-du-manuel>` détecte automatiquement le fichier au moment de la compilation du site et affiche le bouton « Feuilleter un extrait » à côté du bouton « Commander ». Si le fichier est absent, le bouton ne s'affiche simplement pas — jamais de lien mort.

Slugs actuels : `mathematiques-6e`, `mathematiques-5e`, `mathematiques-4e`, `mathematiques-3e`, `mathematiques-2nde`, `mathematiques-1re`, `mathematiques-terminale`.

## Déposer un extrait général pour toute la collection

Nommez le fichier `collection-hakili-lab.pdf` et déposez-le ici : le bouton « Feuilleter un extrait » de la page `/manuels` (liste de tous les manuels) le détecte de la même façon.

## Après un dépôt

Recompilez le site (`npm run build`) pour que les nouveaux boutons apparaissent — la détection se fait à la compilation, pas en direct sur le site déjà publié.
