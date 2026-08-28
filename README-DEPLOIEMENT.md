# Guide de déploiement — Hakili Lab

Pour quelqu'un qui reprend ce projet sans avoir suivi son développement. Commandes exactes, à copier-coller telles quelles.

> **Avant de déployer**, lisez la section "Constat transversal" et la section 4 de `docs/RAPPORT-PROJET.md` — il y a un bug fonctionnel actif (formulaire de plaquette) et 111 fichiers jamais commités à traiter d'abord, sans quoi ce que vous mettrez en ligne ne correspondra pas à l'état réel du travail effectué.

---

## Prérequis

- **Node.js ≥ 22.12.0** et npm (fourni avec Node). Vérifier :
  ```sh
  node --version
  npm --version
  ```
- Un accès au dépôt Git du projet (actuellement local uniquement, aucun remote configuré — voir "Déploiement" plus bas).

### Cloner et installer

```sh
git clone <url-du-depot> hakili-lab
cd hakili-lab
npm install
```

`npm install` lit `package-lock.json` (versionné) pour installer des versions exactement reproductibles.

---

## Variables d'environnement

Une seule variable est nécessaire pour que le site fonctionne complètement :

| Variable | Sert à | Où l'obtenir |
|---|---|---|
| `PUBLIC_WEB3FORMS_KEY` | Envoi du formulaire de contact et du champ e-mail de la plaquette (service Web3Forms). | Créer un compte gratuit sur [web3forms.com](https://web3forms.com), récupérer la clé associée au domaine du site. |

### En local

```sh
cp .env.example .env
```

Puis ouvrir `.env` et coller la clé après `PUBLIC_WEB3FORMS_KEY=`. Ce fichier est ignoré par Git (`.gitignore`) — ne jamais le committer avec une vraie clé dedans.

### En production

Déclarer la même variable (`PUBLIC_WEB3FORMS_KEY`, avec la vraie valeur) dans l'interface de l'hébergeur choisi — chaque hébergeur a son propre emplacement pour les variables d'environnement (Netlify : *Site settings → Environment variables* ; Vercel : *Project settings → Environment Variables* ; Cloudflare Pages : *Settings → Environment variables*). Le préfixe `PUBLIC_` est une convention Astro : la variable est injectée dans le code envoyé au navigateur, donc pas besoin de la marquer "secrète" côté hébergeur — mais elle doit être présente **au moment du build**, pas seulement à l'exécution.

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
Sert le contenu de `dist/` (le build réel, pas un serveur de dev) sur `http://localhost:4321` par défaut. C'est cette commande qu'il faut avoir lancée avant d'exécuter les scripts de vérification ci-dessous, puisqu'ils testent le build réel.

### Vérifier que le build est correct avant de déployer

Avec `npm run preview` démarré dans un terminal, dans un second terminal :

```sh
node scripts/verifier-pages.mjs
```
Doit se terminer sur `0 violation(s) axe-core, 0 lien(s) mort(s), 0 ancre(s) orpheline(s), 0 image(s) deformee(s), 0 repetition(s) de contenu`. Toute ligne différente de zéro liste précisément la route et le problème.

```sh
node scripts/verifier-contrastes.mjs
```
Doit se terminer sur `Toutes les combinaisons passent.`

Arrêter ensuite le serveur de prévisualisation (`Ctrl+C` dans son terminal, ou `npx astro preview stop` s'il tourne en arrière-plan).

---

## Déploiement

**Aucun hébergeur n'est actuellement configuré** pour ce projet (vérifié : aucun fichier `netlify.toml`/`vercel.json`/`wrangler.toml`, aucun `.github/workflows/`, et `git remote -v` ne retourne rien — le dépôt local n'est connecté à aucun service distant).

Le site est un export 100 % statique (`dist/`, sans serveur Node ni fonction serverless requise), compatible avec n'importe quel hébergeur de sites statiques. Options courantes, sans trancher à votre place :

| Hébergeur | Différenciateur |
|---|---|
| **Cloudflare Pages** | Gratuit à large échelle, réseau de diffusion mondial rapide, intégration Git native (build automatique à chaque push). |
| **Netlify** | Interface la plus simple pour démarrer, formulaires natifs intégrés (alternative possible à Web3Forms), déploiements de prévisualisation par pull request. |
| **Vercel** | Très bonne intégration avec Astro, déploiements de prévisualisation par pull request également, analytics basiques inclus en gratuit. |
| **GitHub Pages** | Gratuit, mais nécessite un contournement pour les variables d'environnement au build (secrets GitHub Actions) et pas de redirections serveur natives. |

Marche générale une fois l'hébergeur choisi (identique pour Cloudflare Pages/Netlify/Vercel) :

1. Créer un dépôt Git distant (GitHub/GitLab) et y pousser ce projet :
   ```sh
   git remote add origin <url-du-nouveau-depot>
   git push -u origin master
   ```
   (voir la section "Constat transversal" de `docs/RAPPORT-PROJET.md` avant cette étape — il faut d'abord committer les 111 fichiers non suivis, sans quoi ce push ne contiendra pas l'état réel du site.)
2. Connecter ce dépôt distant depuis l'interface de l'hébergeur choisi.
3. Renseigner la commande de build : `npm run build`, et le dossier de sortie : `dist`.
4. Renseigner `PUBLIC_WEB3FORMS_KEY` dans les variables d'environnement de l'hébergeur (voir plus haut).
5. Déclencher le premier déploiement.

---

## Domaine personnalisé

Une fois un nom de domaine choisi et pointé vers l'hébergeur (procédure DNS propre à chaque hébergeur — CNAME ou enregistrement A selon le cas) :

1. Ouvrir `src/data/site.js` et remplacer :
   ```js
   export const SITE_URL = 'https://example.com';
   ```
   par la vraie valeur, par exemple :
   ```js
   export const SITE_URL = 'https://www.hakililab.com';
   ```
   Sans barre oblique finale.
2. Vérifier que `astro.config.mjs` importe déjà `SITE_URL` depuis ce même fichier pour son champ `site` — c'est déjà le cas, aucune modification à faire là.
3. Recompiler (`npm run build`) et redéployer : l'URL canonique, les balises Open Graph, le JSON-LD et le sitemap se mettent à jour automatiquement à partir de cette seule valeur.

---

## Après déploiement

Une fois le site en ligne sur sa vraie URL, vérifier concrètement :

- [ ] **Formulaire de contact** (`/contact`) : soumettre un test, confirmer la réception de l'e-mail.
- [ ] **Formulaire de plaquette** (bloc "Recevez la plaquette de la rentrée" sur l'accueil) : **ne fonctionnera pas tant que le bug documenté dans `docs/RAPPORT-PROJET.md` section 2 n'est pas corrigé** (script `brochure-form.js` non importé) — à corriger avant ce test, pas après.
- [ ] **Liens WhatsApp** (`/inscription`) : cliquer, confirmer l'ouverture de WhatsApp avec le bon numéro pré-rempli.
- [ ] **`https://<domaine>/sitemap-index.xml`** : doit répondre et lister les URLs réelles du site (pas `example.com`).
- [ ] **`https://<domaine>/robots.txt`** : doit répondre et référencer le bon sitemap.
- [ ] Relancer `node scripts/verifier-pages.mjs --base=https://<domaine>` pour vérifier liens et ancres sur le site réellement en ligne (et pas seulement en local).
- [ ] Vérifier que `/dr-maya`, `/amira`, `/galerie` et les autres pages ajoutées récemment sont bien accessibles en production (elles ne le seront que si le commit/push a bien inclus les 111 fichiers actuellement non suivis — voir plus haut).

---

## Maintenance courante

- **Publier un nouvel article de blog** : voir `docs/PUBLIER-UN-ARTICLE.md`, guide dédié, pas à dupliquer ici.
- **Mettre à jour l'équipe (photos, bios, rôles)** : voir `docs/EQUIPE.md`, guide dédié.
- **Mettre à jour un tarif ou une caractéristique de service/manuel** : directement dans les fichiers `src/content/services/*.md` ou `src/content/manuels/*.md` (frontmatter), ou dans `src/data/details.js` pour les fiches "En savoir plus" (services, manuels, applications).
- **Mettre à jour une donnée de centre** (horaires, adresse, coordonnées) : `src/data/centres.js`, validé par un schéma Zod au build — une valeur manquante sur un centre marqué `pretPourPublication:true` fait échouer `npm run build` avec un message précis plutôt que de publier une fiche à moitié vide.

Après toute modification de contenu, relancer la boucle `npm run build` → `npm run preview` → `node scripts/verifier-pages.mjs` → `node scripts/verifier-contrastes.mjs` décrite plus haut avant de redéployer.
