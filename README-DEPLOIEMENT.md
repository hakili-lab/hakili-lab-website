# Guide de déploiement — Hakili Lab

Pour quelqu'un qui reprend ce projet sans avoir suivi son développement. Commandes exactes, à copier-coller telles quelles.

> **État au 01/09/2026** (voir `docs/RAPPORT-PROJET.md` section 4 pour le détail) : le code est prêt. `SITE_URL` pointe déjà sur `https://www.hakililab.com`, le favicon et le manifest sont câblés, le dépôt est sur GitHub (`github.com/hakili-lab/hakili-lab-website`, branche `main`) et à jour. `/inscription` et Web3Forms restent retirés (plus aucune variable d'environnement requise) ; `/contact` a été restaurée en page d'affichage simple (coordonnées seulement, aucun formulaire). L'interface d'administration `/admin` est en place côté site ; il reste à y renseigner l'URL du Worker Cloudflare (voir la section « Interface d'administration »). Le déploiement est désormais automatisé : tout push sur `main` déclenche `.github/workflows/deploy.yml`, qui vérifie le build puis reconstruit le conteneur sur le VPS. Restent aussi : faire pointer le DNS du domaine sur le serveur (ce guide), et une image de partage Open Graph (en attente d'un visuel).

---

## Prérequis

- **Node.js ≥ 22.12.0** et npm (fourni avec Node). Vérifier :
  ```sh
  node --version
  npm --version
  ```
- Un accès au dépôt GitHub du projet (`github.com/hakili-lab/hakili-lab-website`).

### Cloner et installer

```sh
git clone https://github.com/hakili-lab/hakili-lab-website.git hakili-lab
cd hakili-lab
npm install
```

`npm install` lit `package-lock.json` (versionné) pour installer des versions exactement reproductibles.

---

## Variables d'environnement

Aucune. Le site n'a plus de formulaire ni de service tiers à configurer
(la page `/contact` affiche seulement des coordonnées — liens `tel:`/`mailto:`
et bouton WhatsApp direct — et la plaquette de la rentrée est un
téléchargement direct de `public/plaquette-rentree.pdf`) : `npm run build`
fonctionne sans aucun fichier `.env` ni variable système.

L'interface d'administration `/admin` (voir la section suivante) ne change rien
à cela : ses identifiants OAuth vivent dans un Worker Cloudflare externe, pas
dans le build Astro.

---

## Interface d'administration (`/admin`)

Le site expose une interface web d'édition de contenu à l'adresse `/admin`
(Sveltia CMS). Elle permet de créer et modifier les **articles de blog**, les
**services** et les **manuels** depuis un navigateur, avec un compte GitHub
ayant accès au dépôt. Guide complet : `docs/ADMINISTRATION.md`.

Côté déploiement, il n'y a **rien à faire** : les deux fichiers concernés
(`public/admin/index.html` et `public/admin/config.yml`) sont dans `public/`,
donc recopiés tels quels dans `dist/` par `npm run build`. Sveltia CMS est
chargé depuis un CDN — aucune dépendance npm, aucune étape de build en plus.

**Prérequis, à configurer une seule fois et en dehors de ce projet Astro :**

- une **GitHub OAuth App** pour le dépôt `hakili-lab/hakili-lab-website` ;
- un **Worker Cloudflare** (l'authentificateur de Sveltia CMS) qui porte le
  Client ID et le Client Secret de cette application. Le site étant 100 %
  statique, il n'a aucun serveur pour tenir ce rôle. **Ces secrets ne sont
  jamais dans ce dépôt** et n'ont pas à l'être ;
- l'URL de ce Worker renseignée dans la clé `backend.base_url` de
  `public/admin/config.yml`.

> Tant que `base_url` n'est pas renseignée, la page `/admin` s'affiche mais la
> connexion GitHub échoue. Le reste du site n'est pas affecté.

**Enregistrer dans `/admin` publie le contenu.** Le CMS écrit dans le dépôt
GitHub (un commit sur `main`), et ce commit déclenche le workflow de
déploiement décrit dans la section suivante : la modification est en ligne
quelques minutes plus tard, sans intervention sur le serveur. Une publication
qui casserait le build est arrêtée à l'étape de vérification, avant d'atteindre
le serveur.

---

## Build et prévisualisation en local

```sh
npm run dev
```
Lance un serveur de développement avec rechargement à chaud. Ouvrir `http://localhost:3000` (port fixé dans `astro.config.mjs`).

```sh
npm run build
```
Génère le site statique dans `dist/`. **Vérifier que la commande se termine par `[build] Complete!` sans erreur rouge** — un échec ici (souvent une entrée de contenu invalide, voir `src/content.config.ts`) doit être corrigé avant tout déploiement.

```sh
npm run preview
```
Sert le contenu de `dist/` (le build réel, pas un serveur de dev) sur `http://localhost:4321` (port fixé dans le script `preview` de `package.json`). C'est cette commande qu'il faut avoir lancée avant d'exécuter les scripts de vérification ci-dessous, puisqu'ils testent le build réel.

### Vérifier que le build est correct avant de déployer

Avec `npm run preview` démarré dans un terminal, dans un second terminal :

```sh
npm run verify
```
Raccourci de `node scripts/verifier-pages.mjs` (qui vise `http://localhost:4321` par défaut). Doit se terminer sur une ligne tout à zéro : `35 route(s) verifiee(s), 0 violation(s) axe-core, 0 lien(s) mort(s), 0 ancre(s) orpheline(s), 0 image(s) deformee(s), 0 repetition(s) de contenu, 0 quasi-doublon(s), 0 chiffre(s)-cle repete(s)`. Toute ligne différente de zéro liste précisément la route et le problème.

```sh
npm run verify:contrast
```
Raccourci de `node scripts/verifier-contrastes.mjs`. Doit se terminer sur `Toutes les combinaisons passent.`

Arrêter ensuite le serveur de prévisualisation (`Ctrl+C` dans son terminal, ou `npx astro preview stop` s'il tourne en arrière-plan).

---

## Déploiement automatique (méthode principale)

**Tout push sur la branche `main` déclenche le déploiement**, via le workflow
GitHub Actions `.github/workflows/deploy.yml`. Il n'y a plus rien à faire à la
main dans le cas courant : on pousse, et le site se met à jour tout seul en
quelques minutes.

Le workflow se déroule en trois temps, et **chaque étape ne démarre que si la
précédente a réussi** :

1. **Vérifier** — sur le runner GitHub (pas sur le serveur) : `npm ci` puis
   `npm run build`. Si le site ne se construit pas (le plus souvent : une
   entrée de contenu invalide, voir `src/content.config.ts`), **le workflow
   s'arrête ici et le serveur n'est jamais touché**. C'est la protection qui
   manquait depuis qu'on n'est plus chez un hébergeur statique qui refusait
   de publier un build en échec.
2. **Construire et publier l'image** — toujours sur le runner GitHub :
   `docker build` à partir du `Dockerfile` du dépôt, puis publication de
   l'image sur **GitHub Container Registry** (`ghcr.io`), sous deux
   étiquettes (voir ci-dessous).
3. **Déployer** — connexion SSH au VPS, puis `docker pull` de l'image déjà
   construite, et seulement ensuite le remplacement du conteneur. **Si le
   téléchargement échoue, le script s'arrête avant `docker stop`** : le site
   reste en ligne sur l'ancienne version plutôt que d'être coupé. Une fois le
   nouveau conteneur confirmé en service, un `docker image prune -f` supprime
   les images orphelines, pour que le disque du VPS ne se remplisse pas au fil
   des déploiements.

### Pourquoi l'image est construite sur GitHub et non sur le VPS

**Le VPS ne construit plus rien.** Il télécharge une image déjà prête et la
lance. C'est le seul changement de fond depuis la première version du
workflow ; le `Dockerfile`, lui, n'a pas bougé d'une ligne et sert toujours de
base à la construction.

La raison est concrète : le VPS est une petite machine **partagée avec d'autres
projets**. `docker build` y refaisait `npm ci` puis `npm run build` à chaque
déploiement, dans le conteneur de construction. Un déploiement a fini par être
**tué par le noyau faute de mémoire** — le symptôme est un job qui s'arrête net
avec le **code de sortie 137** (128 + 9, c'est-à-dire le signal `SIGKILL` envoyé
par l'*OOM killer* du système). Rien n'était cassé dans le site : la machine
n'avait simplement plus assez de mémoire au mauvais moment, ce qui dépend aussi
de ce que faisaient les autres projets hébergés là.

Déplacer la construction sur un runner GitHub règle le problème à la racine :

- le runner est dimensionné pour ça, et il est neuf à chaque exécution ;
- l'image est construite **une seule fois**, pas une fois par serveur ;
- le VPS ne fait plus qu'un téléchargement et un redémarrage de conteneur —
  quelques secondes, et une charge mémoire négligeable ;
- si la construction échoue, elle échoue **sur GitHub**, avant que le serveur
  ne soit touché.

### Les deux étiquettes de l'image

L'image est publiée sous deux noms qui désignent le même contenu :

| Étiquette | À quoi elle sert |
|---|---|
| `ghcr.io/hakili-lab/hakili-lab-website:latest` | Celle que le VPS télécharge à chaque déploiement. Elle pointe toujours sur la dernière version publiée. |
| `ghcr.io/hakili-lab/hakili-lab-website:<sha>` | L'empreinte du commit. Elle ne bouge jamais : elle permet de relancer une version précise à la main si besoin (voir la méthode de secours plus bas). |

### Le registre d'images : à faire une seule fois

La publication sur `ghcr.io` utilise `GITHUB_TOKEN`, un jeton que GitHub
fournit automatiquement à chaque exécution. **Aucun compte, aucun secret et
aucun abonnement à créer** — le registre est gratuit pour un dépôt public.

En revanche, **un paquet publié sur `ghcr.io` est privé par défaut**, même
lorsque le dépôt est public. Tant qu'il l'est, le VPS ne peut pas le
télécharger et le déploiement échoue sur un `denied` ou `unauthorized`. Il faut
donc, **une seule fois, après la première publication réussie** :

1. ouvrir <https://github.com/orgs/hakili-lab/packages> ;
2. cliquer sur le paquet **`hakili-lab-website`** ;
3. **Package settings** → **Danger Zone** → **Change visibility** → **Public**.

Une fois public, le VPS le télécharge sans authentification et il n'y a plus
jamais rien à faire. Le message d'erreur du workflow rappelle cette procédure
si le cas se présente.

> L'alternative serait d'authentifier le VPS auprès de `ghcr.io` avec un jeton
> personnel à portée `read:packages`. Elle a été écartée : elle demande de créer
> un secret de plus et de le renouveler à son expiration, pour un site dont le
> code est de toute façon public.

### Suivre une exécution

Onglet **Actions** du dépôt :
<https://github.com/hakili-lab/hakili-lab-website/actions>

Chaque push y apparaît comme une exécution du workflow « Deploiement », avec
une coche verte (réussi) ou une croix rouge (échoué). Cliquer dessus affiche le
détail étape par étape : on voit immédiatement si l'échec vient de la
vérification (le site ne se construit pas — à corriger dans le code ou le
contenu), de la publication de l'image (problème de construction Docker ou de
droits sur le registre) ou du déploiement (problème sur le serveur : SSH,
téléchargement de l'image, Docker).

Un échec de la vérification ne casse rien en ligne : le site continue de
tourner sur la dernière version déployée avec succès.

### Ce que GitHub doit connaître

Trois secrets de dépôt (**Settings → Secrets and variables → Actions**), déjà
configurés. Le workflow ne fait qu'y faire référence, aucune valeur n'est
écrite dans le dépôt :

| Secret | Contenu |
|---|---|
| `VPS_HOST` | L'adresse du serveur. |
| `VPS_USER` | L'utilisateur SSH utilisé pour se connecter. |
| `VPS_SSH_KEY` | La **clé privée** SSH correspondante. Sa clé publique doit être dans le `~/.ssh/authorized_keys` de cet utilisateur sur le serveur. |

### Épinglage de la clé d'hôte : tenté, abandonné

L'option `fingerprint` d'`appleboy/ssh-action` devait vérifier l'identité du
serveur avant de s'y connecter. Elle a été mise en place puis retirée : la
fonctionnalité est cassée dans l'action et refuse la connexion même avec une
empreinte correcte. Le problème est connu, ouvert depuis des années et non
corrigé — <https://github.com/appleboy/ssh-action/issues/275>.

À reconsidérer si l'issue est un jour résolue, ou si l'on remplace cette action
par autre chose. En l'état, la connexion fait confiance à l'hôte qui répond à
l'adresse ; le secret `VPS_HOST_FINGERPRINT`, s'il subsiste dans les réglages
du dépôt, n'est plus utilisé et peut être supprimé.

### Ce qui fait échouer le job, et ce qui ne le fait pas

Une croix rouge doit vouloir dire « le site n'est pas à jour ». Toutes les
étapes ne sont donc pas traitées de la même façon :

| Étape | Bloquante ? | Pourquoi |
|---|---|---|
| `npm ci` / `npm run build` (runner) | **Oui** | Rien ne doit atteindre le serveur si le site ne se construit pas. |
| `docker build` (runner) | **Oui** | Une image qui ne se construit pas n'est jamais publiée, donc jamais déployée. |
| Publication sur `ghcr.io` | **Oui** | Sans image publiée, il n'y a rien à déployer. |
| Connexion SSH (clé privée) | **Oui** | Sans connexion au serveur, il n'y a pas de déploiement possible. |
| `docker pull` (VPS) | **Oui** | Le script s'arrête avant `docker stop` : l'ancien conteneur continue de servir le site. |
| `docker stop` / `docker rm` | Non (`\|\| true`) | Au premier déploiement il n'y a pas de conteneur à arrêter, et ce n'est pas une erreur. |
| Contrôle `docker ps` après `docker run` | **Oui** | Un conteneur qui sort aussitôt laisserait le site hors ligne ; le job doit le signaler. |
| `docker image prune -f` | Non (`\|\| true`) | Volontairement non bloquant : voir ci-dessous. |

Le nettoyage des images est la **dernière** commande, exécutée alors que le
déploiement a déjà réussi et que le conteneur vient d'être confirmé en service
par le contrôle `docker ps`. Un `prune` qui échoue (démon Docker occupé, build
manuel lancé en parallèle sur le serveur…) ne change rien au fait que le site
est bien en ligne dans sa nouvelle version. Le laisser faire échouer le job
afficherait une croix rouge pour un site parfaitement déployé — et pousserait
à redéployer sans raison. D'où le `|| true`.

En contrepartie, un échec de nettoyage répété passe inaperçu dans le statut du
workflow. S'il devient nécessaire de le surveiller (disque du VPS qui se
remplit malgré tout), la trace reste lisible dans le log de l'étape, sous
« Nettoyage des images Docker orphelines ».

Le workflow suppose que l'utilisateur SSH peut lancer `docker` sans mot de
passe (appartenance au groupe `docker`).

**Le clone du dépôt sur le serveur ne fait plus partie du chemin de
déploiement.** Depuis que l'image est construite sur GitHub, le VPS n'a plus
besoin de connaître le code source : il ne fait plus ni `git pull` ni
`docker build`. Le clone présent dans `~/hakili-lab-website` est conservé,
mais uniquement comme référence et pour du débogage manuel — il peut être en
retard sur `main` sans que cela gêne le moindre déploiement.

Le déploiement n'est configuré **que pour `main`** : pousser sur une autre
branche ne touche pas au serveur.

---

## Choix de l'hébergeur (historique)

Le dépôt est sur GitHub (`origin` → `github.com/hakili-lab/hakili-lab-website`, branche `main`). Le site tourne aujourd'hui en auto-hébergement Docker, déployé par le workflow décrit ci-dessus ; aucun hébergeur statique tiers n'y est branché (pas de `netlify.toml`/`vercel.json`/`wrangler.toml`).

Le site est un export 100 % statique (`dist/`, sans serveur Node ni fonction serverless requise), compatible avec n'importe quel hébergeur de sites statiques. Options courantes, sans trancher à votre place :

| Hébergeur | Différenciateur |
|---|---|
| **Cloudflare Pages** | Gratuit à large échelle, réseau de diffusion mondial rapide, intégration Git native (build automatique à chaque push). |
| **Netlify** | Interface la plus simple pour démarrer, déploiements de prévisualisation par pull request. |
| **Vercel** | Très bonne intégration avec Astro, déploiements de prévisualisation par pull request également, analytics basiques inclus en gratuit. |
| **GitHub Pages** | Gratuit, mais pas de redirections serveur natives. |
| **Auto-hébergement Docker** | Serveur maîtrisé de bout en bout ; c'est la méthode en place aujourd'hui (voir la section « Auto-hébergement par conteneur Docker » plus bas). |

Si l'on devait un jour basculer vers un hébergeur statique, la marche générale (identique pour Cloudflare Pages/Netlify/Vercel) serait :

1. Vérifier que le dépôt GitHub est à jour :
   ```sh
   git status        # doit être propre
   git push          # rien à pousser si tout est déjà en ligne
   ```
2. Connecter le dépôt `hakili-lab/hakili-lab-website` (branche `main`) depuis l'interface de l'hébergeur choisi.
3. Renseigner la commande de build : `npm run build`, et le dossier de sortie : `dist`.
4. Déclencher le premier déploiement (aucune variable d'environnement à renseigner, voir plus haut).

---

## Auto-hébergement par conteneur Docker

C'est la méthode utilisée sur le serveur de déploiement actuel (image Docker
servie par nginx derrière un port non standard, ex. `:8014`).

**Le serveur n'a plus besoin du code source.** L'image est construite et
publiée par GitHub (voir « Déploiement automatique » plus haut) ; mettre le site
en service sur une machine revient à télécharger cette image et à la lancer.
Ni clone, ni Node, ni `docker build` :

```sh
docker pull ghcr.io/hakili-lab/hakili-lab-website:latest

docker stop hakili-lab-website 2>/dev/null || true
docker rm   hakili-lab-website 2>/dev/null || true

docker run -d --name hakili-lab-website \
  -p 8014:80 --restart unless-stopped \
  ghcr.io/hakili-lab/hakili-lab-website:latest
```

C'est exactement ce que fait le workflow à chaque déploiement. Rien à installer
sur l'hôte hormis Docker.

**Ce que contient l'image**, construite à partir du `Dockerfile` versionné dans
le dépôt : le build se fait **dans l'image** (`node:22-slim` → `npm ci` →
`npm run build`), puis seul le dossier `dist/` est copié dans une image
`nginx:alpine` finale, avec `docker/nginx.conf`. C'est cette seconde image,
légère, qui est publiée et téléchargée — les outils de construction ne partent
pas sur le serveur.

### Pourquoi `absolute_redirect off` dans `docker/nginx.conf`

Le site est servi derrière un port non standard (`:8014`). Quand nginx reçoit
une URL sans barre oblique finale (`/a-propos`), il renvoie par défaut une
redirection **absolue** vers `/a-propos/` — et il reconstruit cette adresse
**sans le port** : `Location: http://167.233.234.219/a-propos/` au lieu de
`http://167.233.234.219:8014/a-propos/`. Le navigateur part alors sur le
nginx partagé du serveur (port 80), qui ne connaît pas ce site : cliquer sur
un lien du menu semble « sortir » du site.

`absolute_redirect off;` force nginx à répondre avec une redirection en
**chemin relatif** (`Location: /a-propos/`), que le navigateur résout en
conservant l'hôte **et le port** courants. C'est un réglage d'infrastructure :
le code du site, lui, n'a jamais construit d'URL absolue pour ses liens de
navigation.

### Mettre à jour le site déployé — à la main (méthode de secours)

> **Ce n'est plus la méthode courante.** Depuis la mise en place du workflow
> GitHub Actions (section « Déploiement automatique » plus haut), un push sur
> `main` suffit. La procédure ci-dessous reste utile dans trois cas :
>
> - le workflow échoue à l'étape de déploiement et il faut comprendre pourquoi,
>   en rejouant les commandes une par une sur le serveur ;
> - GitHub Actions est indisponible, ou les secrets SSH sont à renouveler ;
> - on veut redéployer **sans passer par un commit** — par exemple pour
>   reconstruire l'image après un changement côté serveur. C'est rare.

Sur le serveur, connecté en SSH. **Il n'y a plus ni `git pull` ni
`docker build` à faire** : on récupère la même image que celle publiée par le
workflow.

```sh
docker pull ghcr.io/hakili-lab/hakili-lab-website:latest
docker stop hakili-lab-website && docker rm hakili-lab-website
docker run -d --name hakili-lab-website -p 8014:80 --restart unless-stopped \
  ghcr.io/hakili-lab/hakili-lab-website:latest
```

À taper à la main, `docker stop && docker rm` échoue si le conteneur n'existe
pas — sans conséquence, passer directement au `docker run`.

#### Revenir à une version précédente

Chaque déploiement publie aussi l'image sous l'empreinte de son commit. Pour
remettre en ligne une version antérieure, récupérer son empreinte dans
l'historique (`git log --oneline`) et l'utiliser à la place de `latest` :

```sh
docker pull ghcr.io/hakili-lab/hakili-lab-website:<empreinte-du-commit>
docker stop hakili-lab-website && docker rm hakili-lab-website
docker run -d --name hakili-lab-website -p 8014:80 --restart unless-stopped \
  ghcr.io/hakili-lab/hakili-lab-website:<empreinte-du-commit>
```

L'empreinte doit être la version **complète** (40 caractères), telle que le
workflow l'a publiée. Ce retour en arrière est manuel et temporaire : le
déploiement suivant remettra `latest` en service. Pour le rendre durable, il
faut annuler le commit fautif sur `main`.

#### Reconstruire l'image à la main

Utile seulement si GitHub est indisponible et qu'il faut absolument déployer.
La construction se fait alors sur le serveur, avec la charge mémoire que cela
implique (voir « Pourquoi l'image est construite sur GitHub ») :

```sh
cd hakili-lab-website
git pull
docker build --no-cache -t hakili-lab-website .
docker stop hakili-lab-website && docker rm hakili-lab-website
docker run -d --name hakili-lab-website -p 8014:80 --restart unless-stopped hakili-lab-website
```

Attention : le conteneur tourne alors sur une image locale nommée
`hakili-lab-website`, et non sur celle du registre. Le déploiement automatique
suivant la remplacera par l'image `ghcr.io`, ce qui est le comportement voulu.

---

## Domaine personnalisé

Le domaine `www.hakililab.com` est déjà inscrit dans `src/data/site.js` (`SITE_URL`), d'où dérivent l'URL canonique, l'Open Graph, le JSON-LD, le sitemap et `robots.txt`. Il reste à le raccorder à l'hébergeur :

1. Chez le registrar du domaine, faire pointer `www.hakililab.com` vers l'hébergeur (procédure DNS propre à chacun — CNAME ou enregistrement A selon le cas), et ajouter le domaine dans l'interface de l'hébergeur.
2. Si le domaine final devait différer de `https://www.hakililab.com`, le corriger dans `src/data/site.js` (avec le `https://`, **sans barre oblique finale**) — c'est la seule valeur à changer — puis recompiler et redéployer.
3. Vérifier après coup : `https://www.hakililab.com/robots.txt` et `/sitemap-index.xml` doivent répondre et référencer le bon domaine.

---

## Après déploiement

Une fois le site en ligne sur sa vraie URL, vérifier concrètement :

- [ ] **Page contact** (`/contact`) : page d'affichage sans formulaire — vérifier les liens `tel:` (les deux numéros), le lien `mailto:` et le bouton « Nous écrire sur WhatsApp » (doit ouvrir WhatsApp avec le message pré-rempli vers le bon numéro), ainsi que le bouton « Inscrire mon enfant » (Google Forms).
- [ ] **Plaquette de la rentrée** (bloc « Recevez la plaquette de la rentrée » sur l'accueil) : cliquer sur « Télécharger », confirmer que `plaquette-rentree.pdf` se télécharge bien.
- [ ] **`https://www.hakililab.com/sitemap-index.xml`** : doit répondre et lister les URLs réelles du site.
- [ ] **`https://www.hakililab.com/robots.txt`** : doit répondre et référencer le bon sitemap.
- [ ] Relancer `npm run verify -- --base=https://www.hakililab.com` pour vérifier liens et ancres sur le site réellement en ligne (et pas seulement en local).
- [ ] Parcourir la navigation complète (`/maya`, `/amira`, `/galerie`, fiches centres, articles de blog…) pour confirmer que toutes les pages répondent en production.

---

## Maintenance courante

- **Éditer du contenu sans toucher au code** : interface `/admin`, pour les articles de blog, les services et les manuels — voir `docs/ADMINISTRATION.md`.
- **Publier un nouvel article de blog** : voir `docs/PUBLIER-UN-ARTICLE.md`, guide dédié, pas à dupliquer ici (via `/admin` ou en éditant le fichier `.md`).
- **Mettre à jour l'équipe (photos, bios, rôles)** : voir `docs/EQUIPE.md`, guide dédié. **Pas éditable depuis `/admin`** (données dans `src/data/team.js`).
- **Mettre à jour un tarif ou une caractéristique de service/manuel** : depuis `/admin` (rubriques « Services » et « Manuels »), ou directement dans les fichiers `src/content/services/*.md` ou `src/content/manuels/*.md` (frontmatter). Les fiches "En savoir plus" (services, manuels, applications) restent dans `src/data/details.js`, **hors `/admin`**.
- **Mettre à jour une donnée de centre** (horaires, adresse, coordonnées) : `src/data/centres.js`, **hors `/admin`**, validé par un schéma Zod au build — une valeur manquante sur un centre marqué `pretPourPublication:true` fait échouer `npm run build` avec un message précis plutôt que de publier une fiche à moitié vide.

Après toute modification de contenu faite en local, relancer la boucle `npm run build` → `npm run preview` → `npm run verify` → `npm run verify:contrast` décrite plus haut **avant de pousser sur `main`** : le workflow de déploiement vérifie que le site se construit, mais **il n'exécute pas** `verify` ni `verify:contrast` (ces deux scripts ont besoin d'un serveur de prévisualisation lancé en parallèle). Un lien mort ou un défaut de contraste passerait donc le déploiement sans être signalé.
