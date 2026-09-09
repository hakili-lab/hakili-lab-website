# Interface d'administration (`/admin`)

Le site dispose d'une interface web qui permet de rédiger et de modifier du
contenu depuis un navigateur, sans ouvrir un seul fichier de code. Elle est
servie à l'adresse **`/admin`** du site (par exemple
`https://www.hakililab.com/admin`).

Techniquement, il s'agit de [Sveltia CMS](https://sveltiacms.app/), chargé
depuis un CDN par `public/admin/index.html` et configuré par
`public/admin/config.yml`. Aucune dépendance npm n'a été ajoutée au projet :
il n'y a rien à installer et rien à mettre à jour côté site quand le CMS
évolue.

---

## Se connecter

1. Ouvrir `https://www.hakililab.com/admin`.
2. Cliquer sur **« Sign in with GitHub »**.
3. S'authentifier avec son compte GitHub.

L'interface n'a pas de mot de passe à elle : **c'est le compte GitHub qui fait
office d'identifiant**. Seules les personnes ajoutées comme collaboratrices du
dépôt `hakili-lab/hakili-lab-website` peuvent se connecter et enregistrer.
Quelqu'un qui n'a pas cet accès verra l'écran de connexion mais ne pourra rien
modifier.

### Demander un accès

Demander à un administrateur du dépôt GitHub d'ajouter votre compte comme
collaborateur (sur GitHub : **Settings → Collaborators → Add people**), avec un
droit d'écriture (rôle *Write*). Il faut donc d'abord avoir un compte GitHub
personnel et communiquer son identifiant (le pseudo, pas l'adresse e-mail).

Retirer l'accès d'une personne se fait au même endroit : la retirer des
collaborateurs du dépôt suffit, il n'y a pas de second compte à supprimer
ailleurs.

---

## Ce qu'on peut éditer depuis `/admin`

**Quasiment tout le contenu du site.** L'interface propose huit rubriques.

### Rubriques ouvertes : on crée et on supprime librement

Ces trois rubriques contiennent des entrées que l'on ajoute et retire à
volonté. Elles correspondent aux collections de contenu déclarées dans
`src/content.config.ts`.

| Rubrique | Fichiers modifiés | Pages concernées |
| --- | --- | --- |
| **Articles de blog** | `src/content/blog/*.md` | `/blog` et `/blog/<slug>` |
| **Services** | `src/content/services/*.md` | `/services` et `/services/<slug>` |
| **Manuels** | `src/content/manuels/*.md` | `/manuels` et `/manuels/<slug>` |

### Rubriques fermées : on modifie, sans créer ni supprimer

Ces cinq rubriques portent sur des ensembles connus d'avance (les cinq centres,
les deux fondateurs, le bandeau du haut…). Chacune édite un fichier de données
unique.

| Rubrique | Fichier modifié | Ce qu'elle contient |
| --- | --- | --- |
| **Nos centres** | `src/data/centres.json` | Les cinq centres : nom, description, photo, horaires (résumé ou grille détaillée), adresse, coordonnées GPS, lien Google Maps |
| **Équipe** | `src/data/team.json` | Les fondateurs (`/a-propos`) et les enseignants : nom, rôle, biographie, photo — voir [`EQUIPE.md`](EQUIPE.md) |
| **Coordonnées et bandeau** | `src/data/parametres-site.json` | Téléphones, e-mail, numéro WhatsApp, réseaux sociaux, et le texte du bandeau d'annonce en haut de chaque page |
| **Fiches « En savoir plus »** | `src/data/details.json` | Les huit fiches ouvertes en fenêtre depuis `/services`, et les encarts des pages `/methode`, `/amira` et `/maya` |
| **Contenu du site** | `src/data/hero.json`, `src/data/valeurs.json`, `src/data/faq.json` | Le grand bandeau de l'accueil, la page `/valeurs` (valeurs et engagements) et la page `/faq` |

Dans toutes les rubriques, on peut téléverser une image : elles partent dans
`src/assets/photos/`, le dossier déjà utilisé par le site.

Le guide pas à pas pour un article de blog est dans
[`PUBLIER-UN-ARTICLE.md`](PUBLIER-UN-ARTICLE.md).

### Deux ou trois choses à savoir

**Une modification se répercute partout.** Les coordonnées et la première
question de la FAQ, par exemple, sont affichées à plusieurs endroits du site
(bandeau du haut, pied de page, page Contact, aperçu FAQ de l'accueil, données
transmises aux moteurs de recherche). Elles ne sont écrites qu'une seule fois :
les modifier depuis `/admin` les met à jour partout d'un coup.

**Quelques champs demandent un format précis**, et l'interface le signale au
moment de la saisie :

- le **numéro WhatsApp** s'écrit sans le `+` et sans espaces, indicatif pays
  compris (`22657919191`). Il alimente tous les boutons WhatsApp du site : un
  espace oublié les rendrait tous inopérants ;
- la **clé** d'une fiche « En savoir plus » doit rester la version sans accents
  ni majuscules du titre affiché sur sa carte. L'avertissement affiché sous le
  champ en donne le détail ;
- une **photo** doit être choisie ou téléversée dans la bibliothèque du site.
  Coller l'adresse d'une image hébergée ailleurs ne fonctionne pas : le site
  retaille lui-même les images au moment de la mise en ligne.

**Certains textes acceptent du gras.** Sur la page « Nos valeurs », les items
des deux listes s'écrivent en Markdown : entourer un passage de deux étoiles
(`**comme ceci**`) le met en gras. C'est le seul enrichissement disponible sur
ces champs.

## Ce qu'on ne peut PAS éditer depuis `/admin`

### Trois valeurs, volontairement laissées de côté

Ce sont les **seules exceptions** de contenu sur tout le site, et elles sont
délibérées. Elles vivent dans `src/data/site.js` et se modifient dans le code.

| Valeur | Ce qu'elle pilote |
| --- | --- |
| `SITE_URL` | L'adresse de production. Elle construit les adresses canoniques de chaque page, le plan du site (`sitemap-index.xml`), le fichier `robots.txt` et les données transmises aux réseaux sociaux. `astro.config.mjs` la lit directement. |
| `SITE_TITLE` | Le titre affiché dans l'onglet du navigateur et dans les résultats de recherche, pour les pages qui n'en définissent pas un. |
| `SITE_DESCRIPTION` | La description par défaut lue par les moteurs de recherche. |

**La raison est la même pour les trois : elles ne décrivent pas le centre, elles
pilotent la fabrication du site et son référencement.** Une faute de frappe
dans `SITE_URL` casserait d'un seul coup toutes les adresses canoniques, le
plan du site et `robots.txt` — sans message d'erreur, sans échec de mise en
ligne, et sans que rien ne se voie sur le site lui-même. Le dégât n'apparaîtrait
que plus tard, dans les résultats de recherche. Le rapport entre ce risque et le
besoin réel de les modifier ne le justifie pas : ces trois valeurs changent une
fois dans la vie du site.

### Les éléments de dessin et de structure

Ils ne sont pas du texte, et les exposer dans un formulaire n'aurait pas de
sens :

| Élément | Où il vit |
| --- | --- |
| Les **icônes** des cartes (valeurs, méthode, services) | dans les gabarits `src/pages/*.astro` et `src/components/*.astro` |
| Les **photos du diaporama** de l'accueil | `src/components/Hero.astro` |
| Les **niveaux scolaires** du sélecteur | `src/data/levels.js` |
| Les **textes des pages** `/a-propos` et `/methode` | `src/pages/a-propos/index.astro`, `src/pages/methode/index.astro` |

---

## Ce qui se passe quand on enregistre

Enregistrer dans `/admin` écrit directement dans le dépôt GitHub (un commit sur
la branche `main`). **Ce commit déclenche automatiquement la mise en ligne** :
le workflow GitHub Actions vérifie d'abord que le site se construit, puis
reconstruit et relance le conteneur sur le serveur.

Comptez **quelques minutes** entre l'enregistrement et l'apparition de la
modification sur `www.hakililab.com`. Aucune intervention manuelle n'est
nécessaire — il n'y a plus rien à lancer sur le serveur après une publication.

Rafraîchir la page du site au bout de quelques minutes suffit à vérifier.
Pour suivre l'opération en direct, ou comprendre pourquoi une modification
n'apparaît pas, ouvrir l'onglet **Actions** du dépôt :
<https://github.com/hakili-lab/hakili-lab-website/actions> — coche verte =
publié, croix rouge = quelque chose a échoué (voir ci-dessous).

Le détail du mécanisme est dans
[`../README-DEPLOIEMENT.md`](../README-DEPLOIEMENT.md), section « Déploiement
automatique ».

### Si la mise en ligne échoue

Une croix rouge dans l'onglet Actions signifie que la modification est bien
**enregistrée dans le dépôt** mais **pas publiée**. Rien n'est perdu, et le
site en ligne continue de tourner sur la version précédente : le workflow est
construit pour ne jamais couper le site à cause d'un contenu fautif.

La cause la plus fréquente est un contenu que le site refuse de construire.
Chaque fichier de données est vérifié avant la mise en ligne, et le build
s'arrête avec le nom exact du champ en cause. Les cas possibles depuis
`/admin` :

- une fiche **service**, **manuel** ou **centre** dont la case « Prêt pour
  publication » est cochée alors qu'un champ obligatoire est vide **ou contient
  une formule d'attente** (« À définir », « À préciser », « À confirmer »,
  « À compléter », « À venir », « Nous consulter », « TODO », « TBD », « N/A »).
  Le formulaire ne peut pas détecter ces formules : c'est au moment du build que
  l'erreur apparaît ;
- un `slug` en double entre deux entrées de la même rubrique, ou deux fiches
  « En savoir plus » portant la même clé ;
- un champ obligatoire vidé dans une rubrique fermée (le titre du bandeau
  d'accueil, une valeur, une question de la FAQ, le nom d'un centre…) ;
- une **photo** qui ne correspond à aucun fichier réellement présent dans la
  bibliothèque du site ;
- un **numéro WhatsApp** ou un **numéro de téléphone** mal formé. L'interface
  le signale déjà à la saisie, mais un fichier modifié en dehors de `/admin`
  passerait outre.

Le détail de l'erreur (avec le nom exact du champ en cause) est lisible dans
l'exécution en échec, sous l'onglet Actions. Dans tous les cas : corriger
l'entrée dans `/admin` et enregistrer. Ce nouvel enregistrement relance le
workflow, et la mise en ligne repart d'elle-même.

Un point important : **une erreur de contenu ne peut pas casser le site en
ligne**. Elle empêche la nouvelle version d'être publiée, et c'est tout — les
visiteurs continuent de voir la version précédente pendant ce temps.

Si l'échec porte sur l'étape de déploiement plutôt que sur la vérification, le
problème est côté serveur et non côté contenu : voir
[`../README-DEPLOIEMENT.md`](../README-DEPLOIEMENT.md).

---

## Configuration technique

### Le connecteur GitHub (Worker Cloudflare)

L'interface parle à GitHub via OAuth. Comme le site est 100 % statique, il n'a
aucun serveur pour porter le secret OAuth : ce rôle est tenu par un **Worker
Cloudflare** déployé séparément (l'authentificateur de Sveltia CMS), dont
l'URL est renseignée dans la clé `backend.base_url` de
`public/admin/config.yml`.

Le **Client ID** et le **Client Secret** de l'application GitHub OAuth sont
stockés dans ce Worker, **jamais dans ce dépôt**. Rien à ajouter dans un
`.env`, ni dans les variables d'environnement du build Astro : le site ne les
voit jamais.

> Le Worker n'est pas géré par ce projet Astro. Son déploiement et ses secrets
> se configurent côté Cloudflare, en dehors de ce dépôt.

### Fichiers concernés

| Fichier | Rôle |
| --- | --- |
| `public/admin/index.html` | Charge Sveltia CMS depuis le CDN. Porte `noindex` : la page n'est pas indexée par les moteurs de recherche. |
| `public/admin/config.yml` | Décrit les huit rubriques et leurs champs. |

Les deux fichiers sont dans `public/`, donc recopiés tels quels dans `dist/` par
`npm run build` — aucune étape de build spécifique.

### Modifier les champs d'un formulaire

Les champs de `config.yml` reproduisent **exactement** les schémas Zod du
projet (mêmes noms, mêmes types, mêmes valeurs d'énumération). Ces schémas
vivent à deux endroits :

- `src/content.config.ts` pour les trois rubriques ouvertes (blog, services,
  manuels), ainsi que pour les fiches « En savoir plus » ;
- un fichier `.js` à côté de chaque fichier de données pour les autres :
  `src/data/centres.js`, `team.js`, `site.js`, `hero.js`, `valeurs.js`,
  `faq.js`.

Si un champ est ajouté, renommé ou supprimé dans l'un de ces schémas, il faut
répercuter le changement dans `config.yml`, sinon l'interface produira des
entrées que `npm run build` refusera.

`config.yml` déclare en première ligne le schéma JSON officiel de Sveltia CMS :
un éditeur avec le support YAML (VS Code + extension YAML) signale donc en
direct une clé inconnue ou mal typée. Une erreur de syntaxe dans ce fichier
rend l'interface `/admin` inutilisable sans message clair — le vérifier après
toute modification.
