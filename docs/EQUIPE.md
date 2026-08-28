# Fondateurs et enseignants (portraits)

Ce guide explique comment remplacer les espaces réservés actuels par les
vraies photos et biographies, sur les sections « Nos fondateurs »
(`/a-propos`) et « L'équipe » (page des enseignants).

## Où se trouvent les données

Toutes les fiches sont dans un seul fichier :

```
src/data/team.js
```

Deux listes : `rawFondateurs` (affichée sur `/a-propos`) et
`rawEnseignants` (affichée sur la page des enseignants). Chaque fiche a
quatre champs :

| Champ | Ce que c'est | Exemple |
| --- | --- | --- |
| `name` | Le nom affiché en gras, en couleur | `'Aïcha Compaoré'` |
| `role` | Le rôle affiché sous le nom, en plus petit | `'Cofondatrice'` |
| `bio` | La biographie, un paragraphe | `'Enseignante de mathématiques depuis 2015...'` |
| `photo` | La photo (voir plus bas), ou `null` si pas encore disponible | `photoAicha` |

## Ajouter une photo

1. Déposez le fichier image dans `src/assets/photos/`.
2. En haut de `src/data/team.js`, ajoutez une ligne d'import à côté des
   imports déjà présents (`import { z } from 'astro:content';` etc.) :

   ```js
   import photoAicha from '../assets/photos/aicha.jpg';
   ```

3. Dans la fiche correspondante, remplacez `photo: null` par
   `photo: photoAicha` (le nom que vous avez choisi à l'import).

Tant que `photo` reste à `null`, la carte affiche automatiquement les
initiales de la personne sur un fond bleu très clair — jamais de cadre
vide ni d'icône générique. Rien à faire de spécial pour ça, c'est le
comportement par défaut du composant.

### Format de photo attendu

- **Une seule photo de la personne, rien d'autre dans le cadre** : pas de
  montage avec un diplôme scanné, un texte de légende ou plusieurs photos
  collées côte à côte dans le même fichier. Le recadrage automatique en
  4:5 (voir ci-dessous) est centré sur l'ensemble de l'image : un montage
  à plusieurs éléments donne un recadrage qui ne montre ni le visage en
  entier ni les autres éléments correctement.
- **Cadrage** : portrait, buste ou visage centré — la photo est recadrée
  automatiquement en rectangle vertical (ratio 4:5), donc évitez qu'un
  élément important (visage, texte) soit tout en haut ou tout en bas du
  cadre.
- **Dimensions minimales conseillées** : environ 640 × 800 px (le site
  génère lui-même les tailles plus petites nécessaires à l'affichage).
- **Format de fichier** : `.jpg` ou `.png`, comme les autres photos du
  site.
- **Poids** : peu importe, le site compresse et optimise l'image
  automatiquement à la compilation.

## Modifier un nom, un rôle ou une biographie

Ouvrez `src/data/team.js` et modifiez directement le texte entre
guillemets du champ concerné, puis enregistrez.

## Ajouter ou retirer une personne

- **Ajouter** : dupliquez une fiche existante dans `rawFondateurs` ou
  `rawEnseignants` (n'oubliez pas la virgule entre deux fiches), puis
  changez ses champs. La grille s'adapte automatiquement au nombre de
  fiches, aucune autre modification n'est nécessaire.
- **Retirer** : supprimez la fiche correspondante (et sa virgule).

## Si un champ est mal rempli ou manquant

`npm run build` s'arrête avec un message d'erreur précis (quel champ, sur
quelle fiche) plutôt que de publier une fiche incomplète. Les champs
`name`, `role` et `bio` ne peuvent pas être vides ; `photo` doit être soit
un import de photo comme décrit ci-dessus, soit `null`.
