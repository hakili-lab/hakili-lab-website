# Publier un article de blog

Ce guide explique comment ajouter, modifier ou dépublier un article du blog
Hakili Lab, sans avoir besoin de savoir programmer.

Il y a **deux façons** de le faire, qui aboutissent exactement au même
résultat :

1. **Par l'interface `/admin`** (recommandée) — un formulaire dans le
   navigateur, aucun fichier à manipuler. C'est la méthode décrite en premier
   ci-dessous.
2. **En éditant directement le fichier `.md`** — la méthode d'origine, décrite
   plus bas. Elle reste valable et sert de repli si l'interface est
   indisponible.

---

## Méthode 1 — L'interface `/admin` (recommandée)

### Se connecter

Ouvrir `https://www.hakililab.com/admin`, puis cliquer sur **« Sign in with
GitHub »** et s'authentifier avec son compte GitHub.

Il n'y a pas de mot de passe propre au site : c'est le compte GitHub qui sert
d'identifiant, et seules les personnes ajoutées comme collaboratrices du dépôt
`hakili-lab/hakili-lab-website` peuvent enregistrer. Pour obtenir un accès,
voir [`ADMINISTRATION.md`](ADMINISTRATION.md).

### Écrire un nouvel article

1. Dans la colonne de gauche, choisir **« Articles de blog »**.
2. Cliquer sur le bouton de création d'une nouvelle entrée.
3. Remplir le formulaire :

   | Champ | Ce que c'est |
   | --- | --- |
   | **Adresse de la page (slug)** | Ce qui apparaîtra dans l'URL : `/blog/mon-article`. En minuscules, sans accents ni espaces (des tirets `-` à la place). |
   | **Titre** | Le titre affiché sur la carte et en haut de la page. |
   | **Description** | La phrase affichée sous le titre sur la page `/blog`, et dans les résultats de recherche Google. |
   | **Date de publication** | Choisie dans le calendrier. |
   | **Catégorie** | À choisir dans la liste : `Pédagogie`, `Conseils` ou `Actualité`. |
   | **Image** | Facultative. Bouton pour téléverser une photo ou en choisir une déjà présente sur le site. Sans image, l'article s'affiche simplement sans illustration. |
   | **Brouillon (non publié)** | **Cochée par défaut** : l'article reste invisible tant qu'on ne la décoche pas. |
   | **Texte de l'article** | Le corps de l'article. |

4. Enregistrer.

La case **« Brouillon »** est volontairement cochée d'avance : un nouvel
article ne peut donc pas se retrouver en ligne par accident avant relecture.
Une fois l'article relu, la décocher et enregistrer à nouveau.

### Modifier ou retirer un article

Dans « Articles de blog », cliquer sur l'article voulu, modifier, enregistrer.

Pour le retirer : soit **cocher « Brouillon »** (il disparaît du site mais le
texte est conservé et peut être remis en ligne plus tard), soit supprimer
l'entrée (définitif).

### Quand l'article apparaît-il en ligne ?

Enregistrer suffit : la mise en ligne est automatique et prend **quelques
minutes**. Il n'y a rien à lancer ensuite.

Un article laissé en **brouillon** est enregistré mais reste invisible sur le
site — on peut donc rédiger et enregistrer autant qu'on veut sans rien
publier par accident.

Si l'article n'apparaît toujours pas au bout de quelques minutes, vérifier
l'onglet Actions du dépôt
(<https://github.com/hakili-lab/hakili-lab-website/actions>) : une croix rouge
signale que la mise en ligne a échoué. Voir
[`ADMINISTRATION.md`](ADMINISTRATION.md), section « Si la mise en ligne
échoue ».

---

## Méthode 2 — Éditer directement le fichier (méthode de repli)

Cette méthode ne dépend d'aucun service extérieur. Elle fonctionne aussi bien
depuis l'interface web de GitHub (bouton **Add file** ou l'icône crayon sur un
fichier existant) que sur une copie du dépôt clonée en local.

### Où se trouvent les articles

Chaque article est un fichier séparé, dans le dossier :

```
src/content/blog/
```

Un fichier = un article. Le nom du fichier reprend le champ `slug` (par exemple
`camp-vacances-2027.md` pour `slug: "camp-vacances-2027"`), et c'est ce `slug`
qui donne l'adresse de la page une fois le site publié :
`hakililab.com/blog/camp-vacances-2027`. Choisissez donc un nom court, en
minuscules, sans accents ni espaces (utilisez des tirets `-` à la place des
espaces).

### Ajouter un nouvel article

1. Dans le dossier `src/content/blog/`, dupliquez un fichier `.md`
   existant et renommez la copie.
2. Ouvrez le nouveau fichier. Il commence par un bloc entre deux lignes
   `---` : c'est la fiche d'identité de l'article. En dessous, c'est le
   texte de l'article lui-même.
3. Remplissez la fiche d'identité :

   | Champ | Ce que c'est | Exemple |
   | --- | --- | --- |
   | `slug` | L'adresse de la page (à garder identique au nom du fichier) | `"nos-resultats-bepc-2027"` |
   | `titre` | Le titre affiché sur la carte et en haut de la page | `"Nos résultats au BEPC 2027"` |
   | `description` | La courte phrase affichée sous le titre, sur la carte de l'article (page `/blog`) | `"Le taux de réussite de nos élèves de 3e cette année."` |
   | `date` | La date de publication, au format année-mois-jour, **sans guillemets** | `2027-06-20` |
   | `categorie` | Une des trois catégories existantes, à recopier exactement : `Pédagogie`, `Conseils` ou `Actualité` | `Actualité` |
   | `image` | Le chemin vers une photo (voir plus bas). Facultatif : si l'article n'a pas de photo, **retirez la ligne entière** plutôt que de la laisser vide | `"../../assets/photos/846A2755.jpg"` |
   | `brouillon` | Mettez `true` pour ne pas encore publier l'article, `false` pour le publier | `false` |

   Gardez les guillemets `"..."` autour du slug, du titre, de la description et
   de l'image, comme dans les articles existants. En revanche **ne mettez pas
   de guillemets autour de la date** : `date: 2027-06-20` et non
   `date: "2027-06-20"`, sinon le site refusera de se construire.

4. En dessous du deuxième `---`, écrivez le texte de l'article. Un
   paragraphe = une ligne (ou un bloc de lignes séparé des autres par une
   ligne vide).
5. Enregistrez le fichier, et **validez la modification sur la branche
   `main`** (bouton « Commit changes » depuis GitHub, ou `git commit` puis
   `git push` en local). C'est ce qui déclenche la mise en ligne : l'article
   apparaît sur `/blog` quelques minutes plus tard.

### Ajouter une photo

Déposez votre image dans `src/assets/photos/`, puis indiquez son chemin
dans le champ `image` du fichier, en commençant par `../../assets/photos/`
(c'est le chemin depuis le dossier de l'article jusqu'au dossier des
photos). Si vous ne renseignez pas de photo, supprimez la ligne `image:`
entière : l'article s'affichera simplement sans illustration.

### Publier un brouillon plus tard

Pour préparer un article à l'avance sans le montrer aux visiteurs,
mettez `brouillon: true`. L'article restera invisible sur le site (ni sur
`/blog`, ni à son adresse individuelle) jusqu'à ce que vous repassiez ce
champ à `brouillon: false` et validiez la modification sur `main`.

### Modifier ou retirer un article

- **Modifier** : ouvrez le fichier `.md` correspondant et changez le texte
  ou la fiche d'identité.
- **Retirer** : soit remettez `brouillon: true` pour le cacher sans le
  supprimer, soit supprimez le fichier pour l'effacer définitivement.

---

## Voir aussi

- [`ADMINISTRATION.md`](ADMINISTRATION.md) — l'interface `/admin` dans son
  ensemble : connexion, gestion des accès, ce qui **n'est pas** éditable par ce
  biais (centres, équipe, tarifs).
- [`../README-DEPLOIEMENT.md`](../README-DEPLOIEMENT.md) — le déploiement
  automatique déclenché par chaque modification, et la procédure manuelle de
  secours si celui-ci échoue.
