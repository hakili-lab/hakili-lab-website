# Publier un article de blog

Ce guide explique comment ajouter, modifier ou dépublier un article du blog
Hakili Lab, sans avoir besoin de savoir programmer.

## Où se trouvent les articles

Chaque article est un fichier séparé, dans le dossier :

```
src/content/blog/
```

Un fichier = un article. Le nom du fichier (par exemple
`camp-vacances-2027.md`) devient l'adresse de la page une fois le site
publié, par exemple `hakililab.com/blog/camp-vacances-2027`. Choisissez donc
un nom court, en minuscules, sans accents ni espaces (utilisez des tirets
`-` à la place des espaces).

## Ajouter un nouvel article

1. Dans le dossier `src/content/blog/`, dupliquez un fichier `.md`
   existant et renommez la copie.
2. Ouvrez le nouveau fichier. Il commence par un bloc entre deux lignes
   `---` : c'est la fiche d'identité de l'article. En dessous, c'est le
   texte de l'article lui-même.
3. Remplissez la fiche d'identité :

   | Champ | Ce que c'est | Exemple |
   | --- | --- | --- |
   | `titre` | Le titre affiché sur la carte et en haut de la page | `"Nos résultats au BEPC 2027"` |
   | `description` | La courte phrase affichée sous le titre, sur la carte d'accueil | `"Le taux de réussite de nos élèves de 3e cette année."` |
   | `date` | La date de publication, au format année-mois-jour | `2027-06-20` |
   | `categorie` | Une des trois catégories existantes, à recopier exactement : `Pédagogie`, `Conseils` ou `Actualité` | `Actualité` |
   | `image` | Le chemin vers une photo (voir plus bas) | `"../../assets/photos/846A2755.jpg"` |
   | `brouillon` | Mettez `true` pour ne pas encore publier l'article, `false` pour le publier | `false` |

   Gardez les guillemets `"..."` autour du titre, de la description et de
   l'image, comme dans les articles existants.

4. En dessous du deuxième `---`, écrivez le texte de l'article. Un
   paragraphe = une ligne (ou un bloc de lignes séparé des autres par une
   ligne vide).
5. Enregistrez le fichier. C'est terminé : l'article apparaît sur la page
   `/blog` et, s'il fait partie des trois plus récents non-brouillons, sur
   la page d'accueil.

## Ajouter une photo

Déposez votre image dans `src/assets/photos/`, puis indiquez son chemin
dans le champ `image` du fichier, en commençant par `../../assets/photos/`
(c'est le chemin depuis le dossier de l'article jusqu'au dossier des
photos). Si vous ne renseignez pas de photo, l'article n'affichera
simplement pas d'image.

## Publier un brouillon plus tard

Pour préparer un article à l'avance sans le montrer aux visiteurs,
mettez `brouillon: true`. L'article restera invisible sur le site (ni sur
la page d'accueil, ni sur `/blog`, ni à son adresse individuelle) jusqu'à
ce que vous repassiez ce champ à `brouillon: false` et republiiez le site.

## Modifier ou retirer un article

- **Modifier** : ouvrez le fichier `.md` correspondant et changez le texte
  ou la fiche d'identité.
- **Retirer** : soit remettez `brouillon: true` pour le cacher sans le
  supprimer, soit supprimez le fichier pour l'effacer définitivement.

## Ce qui n'est pas encore disponible

Il n'existe pas encore d'interface web pour ajouter un article sans
toucher aux fichiers (comme un formulaire d'administration). Cette
interface demande une gestion des accès (mot de passe, connexion) qui
sera mise en place séparément. En attendant, la modification se fait en
éditant directement les fichiers `.md` décrits ci-dessus.
