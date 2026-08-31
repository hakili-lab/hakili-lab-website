# Guide de déploiement — Hakili Lab

Pour quelqu'un qui reprend ce projet sans avoir suivi son développement. Commandes exactes, à copier-coller telles quelles.

> **État au 31/08/2026** (voir `docs/RAPPORT-PROJET.md` section 4 pour le détail) : le code est prêt. `SITE_URL` pointe déjà sur `https://www.hakililab.com`, le favicon et le manifest sont câblés, le dépôt est sur GitHub (`github.com/hakili-lab/hakili-lab-website`, branche `main`) et à jour. Les pages `/contact` et `/inscription` ainsi que Web3Forms ont été retirées (plus aucune page fantôme, plus aucune variable d'environnement requise). Restent : choisir un hébergeur et y faire pointer le DNS du domaine (ce guide), et une image de partage Open Graph (en attente d'un visuel).

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
(le contact se fait par lien `tel:`/`mailto:`/WhatsApp direct, la plaquette
de la rentrée est un téléchargement direct de `public/plaquette-rentree.pdf`) :
`npm run build` fonctionne sans aucun fichier `.env` ni variable système.

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
Raccourci de `node scripts/verifier-pages.mjs` (qui vise `http://localhost:4321` par défaut). Doit se terminer sur une ligne tout à zéro : `34 route(s) verifiee(s), 0 violation(s) axe-core, 0 lien(s) mort(s), 0 ancre(s) orpheline(s), 0 image(s) deformee(s), 0 repetition(s) de contenu, 0 quasi-doublon(s), 0 chiffre(s)-cle repete(s)`. Toute ligne différente de zéro liste précisément la route et le problème.

```sh
npm run verify:contrast
```
Raccourci de `node scripts/verifier-contrastes.mjs`. Doit se terminer sur `Toutes les combinaisons passent.`

Arrêter ensuite le serveur de prévisualisation (`Ctrl+C` dans son terminal, ou `npx astro preview stop` s'il tourne en arrière-plan).

---

## Déploiement

Le dépôt est sur GitHub (`origin` → `github.com/hakili-lab/hakili-lab-website`, branche `main`), mais **aucun hébergeur n'y est encore branché** (vérifié : aucun fichier `netlify.toml`/`vercel.json`/`wrangler.toml`, aucun `.github/workflows/`).

Le site est un export 100 % statique (`dist/`, sans serveur Node ni fonction serverless requise), compatible avec n'importe quel hébergeur de sites statiques. Options courantes, sans trancher à votre place :

| Hébergeur | Différenciateur |
|---|---|
| **Cloudflare Pages** | Gratuit à large échelle, réseau de diffusion mondial rapide, intégration Git native (build automatique à chaque push). |
| **Netlify** | Interface la plus simple pour démarrer, déploiements de prévisualisation par pull request. |
| **Vercel** | Très bonne intégration avec Astro, déploiements de prévisualisation par pull request également, analytics basiques inclus en gratuit. |
| **GitHub Pages** | Gratuit, mais pas de redirections serveur natives. |

Marche générale une fois l'hébergeur choisi (identique pour Cloudflare Pages/Netlify/Vercel) :

1. Vérifier que le dépôt GitHub est à jour :
   ```sh
   git status        # doit être propre
   git push          # rien à pousser si tout est déjà en ligne
   ```
2. Connecter le dépôt `hakili-lab/hakili-lab-website` (branche `main`) depuis l'interface de l'hébergeur choisi.
3. Renseigner la commande de build : `npm run build`, et le dossier de sortie : `dist`.
4. Déclencher le premier déploiement (aucune variable d'environnement à renseigner, voir plus haut).

---

## Domaine personnalisé

Le domaine `www.hakililab.com` est déjà inscrit dans `src/data/site.js` (`SITE_URL`), d'où dérivent l'URL canonique, l'Open Graph, le JSON-LD, le sitemap et `robots.txt`. Il reste à le raccorder à l'hébergeur :

1. Chez le registrar du domaine, faire pointer `www.hakililab.com` vers l'hébergeur (procédure DNS propre à chacun — CNAME ou enregistrement A selon le cas), et ajouter le domaine dans l'interface de l'hébergeur.
2. Si le domaine final devait différer de `https://www.hakililab.com`, le corriger dans `src/data/site.js` (avec le `https://`, **sans barre oblique finale**) — c'est la seule valeur à changer — puis recompiler et redéployer.
3. Vérifier après coup : `https://www.hakililab.com/robots.txt` et `/sitemap-index.xml` doivent répondre et référencer le bon domaine.

---

## Après déploiement

Une fois le site en ligne sur sa vraie URL, vérifier concrètement :

- [ ] **Contact** : le site n'a plus de page dédiée ni de formulaire — vérifier que les liens `tel:`, `mailto:` et les boutons « Contact »/« Nos coordonnées » (WhatsApp) fonctionnent, ainsi que le bouton « Inscrire mon enfant » (Google Forms).
- [ ] **Plaquette de la rentrée** (bloc « Recevez la plaquette de la rentrée » sur l'accueil) : cliquer sur « Télécharger », confirmer que `plaquette-rentree.pdf` se télécharge bien.
- [ ] **`https://www.hakililab.com/sitemap-index.xml`** : doit répondre et lister les URLs réelles du site.
- [ ] **`https://www.hakililab.com/robots.txt`** : doit répondre et référencer le bon sitemap.
- [ ] Relancer `npm run verify -- --base=https://www.hakililab.com` pour vérifier liens et ancres sur le site réellement en ligne (et pas seulement en local).
- [ ] Parcourir la navigation complète (`/dr-maya`, `/amira`, `/galerie`, fiches centres, articles de blog…) pour confirmer que toutes les pages répondent en production.

---

## Maintenance courante

- **Publier un nouvel article de blog** : voir `docs/PUBLIER-UN-ARTICLE.md`, guide dédié, pas à dupliquer ici.
- **Mettre à jour l'équipe (photos, bios, rôles)** : voir `docs/EQUIPE.md`, guide dédié.
- **Mettre à jour un tarif ou une caractéristique de service/manuel** : directement dans les fichiers `src/content/services/*.md` ou `src/content/manuels/*.md` (frontmatter), ou dans `src/data/details.js` pour les fiches "En savoir plus" (services, manuels, applications).
- **Mettre à jour une donnée de centre** (horaires, adresse, coordonnées) : `src/data/centres.js`, validé par un schéma Zod au build — une valeur manquante sur un centre marqué `pretPourPublication:true` fait échouer `npm run build` avec un message précis plutôt que de publier une fiche à moitié vide.

Après toute modification de contenu, relancer la boucle `npm run build` → `npm run preview` → `npm run verify` → `npm run verify:contrast` décrite plus haut avant de redéployer.
