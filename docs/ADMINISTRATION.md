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

L'interface propose trois rubriques, qui correspondent aux trois collections de
contenu du site (`src/content.config.ts`) :

| Rubrique | Fichiers modifiés | Pages concernées |
| --- | --- | --- |
| **Articles de blog** | `src/content/blog/*.md` | `/blog` et `/blog/<slug>` |
| **Services** | `src/content/services/*.md` | `/services` et `/services/<slug>` |
| **Manuels** | `src/content/manuels/*.md` | `/manuels` et `/manuels/<slug>` |

Dans chaque rubrique, on peut créer une entrée, en modifier une existante, la
supprimer, et téléverser une image (les images partent dans
`src/assets/photos/`, le dossier déjà utilisé par le site).

Le guide pas à pas pour un article de blog est dans
[`PUBLIER-UN-ARTICLE.md`](PUBLIER-UN-ARTICLE.md).

## Ce qu'on ne peut PAS éditer depuis `/admin`

Ces contenus vivent dans des fichiers JavaScript, pas dans des fichiers
Markdown : ils ne sont pas exposés par l'interface et se modifient dans le
code.

| Contenu | Où le modifier |
| --- | --- |
| Les **centres** (adresses, horaires, coordonnées) | `src/data/centres.js` |
| L'**équipe** (photos, bios, rôles) | `src/data/team.js` — voir [`EQUIPE.md`](EQUIPE.md) |
| Les **tarifs et fiches « En savoir plus »** | `src/data/details.js` |
| Les **niveaux scolaires** | `src/data/levels.js` |
| Le **nom du site, l'URL, les coordonnées générales** | `src/data/site.js` |
| Les **textes des pages** (`/a-propos`, `/methode`, `/faq`…) | `src/pages/*.astro` |

Ce n'est pas un oubli : les horaires d'un centre, par exemple, forment une
grille (jour × créneau × niveau) qui s'exprime mal dans un formulaire, et une
erreur y est plus coûteuse qu'une coquille dans un article. Pour ces
modifications, passer par quelqu'un qui touche au code.

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

La cause la plus fréquente est un contenu que le site refuse de construire
(garde-fou décrit dans `src/content.config.ts`). Deux cas possibles depuis
`/admin` :

- une fiche **service** ou **manuel** dont la case « Prêt pour publication » est
  cochée alors qu'un champ obligatoire est vide **ou contient une formule
  d'attente** (« À définir », « À préciser », « À confirmer », « À compléter »,
  « À venir », « Nous consulter », « TODO », « TBD », « N/A »). Le formulaire ne
  peut pas détecter ces formules : c'est au moment du build que l'erreur
  apparaît, avec le nom exact du champ en cause ;
- un `slug` en double entre deux entrées de la même rubrique.

Le détail de l'erreur (avec le nom exact du champ en cause) est lisible dans
l'exécution en échec, sous l'onglet Actions. Dans les deux cas : corriger
l'entrée dans `/admin` et enregistrer. Ce nouvel enregistrement relance le
workflow, et la mise en ligne repart d'elle-même.

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
| `public/admin/config.yml` | Décrit les trois rubriques et leurs champs. |

Les deux fichiers sont dans `public/`, donc recopiés tels quels dans `dist/` par
`npm run build` — aucune étape de build spécifique.

### Modifier les champs d'un formulaire

Les champs de `config.yml` reproduisent **exactement** les schémas Zod de
`src/content.config.ts` (mêmes noms, mêmes types, mêmes valeurs
d'énumération). Si un champ est ajouté, renommé ou supprimé dans
`src/content.config.ts`, il faut répercuter le changement dans `config.yml`,
sinon l'interface produira des entrées que `npm run build` refusera.

`config.yml` déclare en première ligne le schéma JSON officiel de Sveltia CMS :
un éditeur avec le support YAML (VS Code + extension YAML) signale donc en
direct une clé inconnue ou mal typée. Une erreur de syntaxe dans ce fichier
rend l'interface `/admin` inutilisable sans message clair — le vérifier après
toute modification.
