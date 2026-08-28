# Rapport technique complet — Hakili Lab

Document de référence pour quiconque reprend ce projet. Chaque affirmation ci-dessous a été vérifiée en lisant le fichier concerné (imports tracés, contenu comparé octet à octet pour les doublons, historique Git consulté) — pas déduite d'un nom de fichier ou d'un commentaire.

Généré le 28 août 2026.

---

## 1. Outils et stack utilisés

### Framework

- **Astro 7.2.0** (`package.json` demande `^7.2.0`, version réellement installée : `7.2.0`). Rendu 100 % statique — aucun `output: 'server'`/`'hybrid'` dans `astro.config.mjs`, aucun adaptateur (`@astrojs/node`, `@astrojs/vercel`, etc.) configuré ni installé. Le site se déploie donc comme un simple dossier de fichiers statiques (`dist/`), compatible avec n'importe quel hébergeur statique.
- Node.js requis : `>=22.12.0` (`package.json` → `engines`). Poste de développement actuel : Node v22.13.0, npm 11.19.1 — compatible.

### Intégrations Astro configurées (`astro.config.mjs`)

- **`@astrojs/sitemap` 3.7.3** — seule intégration déclarée. Génère `sitemap-index.xml` au build. Configurée avec un filtre qui exclut `/404` du sitemap. Les entrées de contenu non prêtes (`pretPourPublication:false`, articles `brouillon:true`) n'y apparaissent jamais car elles ne produisent aucune route (`getStaticPaths` les exclut en amont).
- `site: SITE_URL` — pointe vers `src/data/site.js`. **Actuellement `https://example.com`** (domaine réservé RFC 2606, volontairement provisoire — voir section 4).

### Dépendances de production (`dependencies`)

| Paquet | Version | Usage réel vérifié |
|---|---|---|
| `astro` | `^7.2.0` | Le framework lui-même — toutes les pages/composants. |
| `@astrojs/sitemap` | `^3.7.3` | Importé une seule fois, dans `astro.config.mjs`. |

### Dépendances de développement (`devDependencies`)

| Paquet | Version | Rôle réel vérifié |
|---|---|---|
| `playwright` | `^1.62.1` | Pilote un vrai Chromium headless dans `scripts/verifier-pages.mjs` (navigation, capture d'écran, lecture du DOM). |
| `@axe-core/playwright` | `^4.13.0` | `AxeBuilder`, utilisé dans `scripts/verifier-pages.mjs` pour l'audit WCAG de chaque route buildée. |
| `axe-core` | `^4.13.0` | Moteur de règles utilisé par `@axe-core/playwright` (dépendance directe, pas seulement transitive). |

### Dépendance non déclarée mais utilisée directement (à corriger)

- **`sharp`** (version résolue : `0.35.3`) est importé directement par `scripts/optimiser-images.mjs` (`import sharp from 'sharp'`), mais **n'apparaît nulle part dans `package.json`**. Le script fonctionne aujourd'hui uniquement parce que `sharp` est une dépendance transitive du pipeline d'images intégré à Astro (`astro:assets`), donc déjà présent dans `node_modules/`. Si Astro change un jour de moteur d'image par défaut, ce script cassera silencieusement avec une erreur de module introuvable. **Recommandation** : ajouter `sharp` en `devDependency` explicite si ce script doit continuer à être utilisé.

### Services externes dont le site dépend en production

| Service | Où / comment | Clé ou config nécessaire |
|---|---|---|
| **Web3Forms** (`web3forms.com`) | Envoi du formulaire de contact (`src/scripts/contact-form.js`) et du champ e-mail de la plaquette (`src/scripts/brochure-form.js`, voir alerte plus bas) — requête `POST` vers `https://api.web3forms.com/submit`. | `PUBLIC_WEB3FORMS_KEY`, déclarée dans `.env` (non versionné, gitignored) en local ; à renseigner comme variable d'environnement équivalente chez l'hébergeur en production. Voir `.env.example` (versionné, sert de modèle). Le préfixe `PUBLIC_` d'Astro l'expose côté client — c'est voulu (Web3Forms attend la clé dans le navigateur), mais cette clé n'est donc jamais secrète une fois le site en ligne. |
| **WhatsApp** (`wa.me`) | Lien de contact direct sur `/inscription` (`src/pages/inscription/index.astro`) et dans `src/scripts/contact-form.js`. | Aucune clé — simple lien `https://wa.me/<numéro>`, le numéro est en dur dans le code. |
| **YouTube** | Un lien sortant (pas un lecteur intégré) vers une vidéo de présentation, sur `/a-propos`. | Aucune clé — lien externe simple (`target="_blank"`). |
| **Google Maps** | Mécanisme prêt (`googleMapsUrl` par centre dans `src/data/centres.js`, bouton conditionnel dans `/centres/[slug].astro`) mais **actuellement vide (`''`) pour les 5 centres** : le bouton ne s'affiche donc encore nulle part. Pas une intégration API, juste un lien externe une fois l'URL renseignée. | Aucune clé nécessaire (pas d'API Maps utilisée, juste des liens `google.com/maps/...`). |
| **Google Forms** | Formulaire d'inscription externe (`forms.gle/FMWP9KZtjrxyVT3x6`), cible de tous les boutons "Inscrire mon enfant" / CTA d'inscription du site. | Aucune clé — lien externe en dur, `target="_blank"`. |
| **Google Fonts** | `fonts.googleapis.com` / `fonts.gstatic.com`, chargées via `<link>` dans `BaseLayout.astro` (Poppins, Inter, Playfair Display). | Aucune clé. |

### Mécanisme de déploiement actuellement configuré

**Aucun.** Vérifié explicitement :
- Aucun fichier `netlify.toml`, `vercel.json`, `wrangler.toml`/`.jsonc` à la racine.
- Aucun dossier `.github/workflows/` (pas de GitHub Actions).
- `git remote -v` ne retourne **aucun remote** — ce dépôt n'est connecté à aucun service distant (pas de GitHub/GitLab/Bitbucket configuré). Une seule branche locale, `master`.

Voir `README-DEPLOIEMENT.md` pour la marche à suivre.

---

## 2. Inventaire des fichiers

### Utilisés et référencés

Vérification effectuée en traçant chaque import (composants `.astro`, scripts `.js`, styles `.css` via les `@import` de `src/styles/main.css`, données `.js`, contenu `.md` via `getCollection`/`getStaticPaths`) plutôt qu'en supposant qu'un fichier présent est forcément utilisé — c'est cette vérification qui a fait remonter les cas listés en "Orphelins" ci-dessous.

Résultat : **la quasi-totalité de l'arborescence `src/` est effectivement utilisée** — chaque composant de `src/components/`, chaque page de `src/pages/`, chaque module de `src/data/`, chaque fichier `src/content/**/*.md`, et 9 des 10 scripts de `src/scripts/` sont importés par au moins un autre fichier ou constituent une route Astro valide. Le détail (quel script importé par quelle page, quel composant par quel autre) figure dans la section 5 pour les fichiers structurants ; l'exception (le 10e script) est documentée ci-dessous.

Cas particuliers vérifiés individuellement, à connaître :

- `src/pages/robots.txt.ts` — pas une page HTML, une route API Astro qui génère `/robots.txt` dynamiquement au build (contenu vérifié : `User-agent: *`, `Allow: /`, référence au sitemap). Absence de fichier `public/robots.txt` statique : normal, pas un oubli.
- `src/content.config.ts` — définit les 3 collections de contenu (`blog`, `services`, `manuels`) avec schémas Zod ; la 4e collection historique (`centres`) a été volontairement remplacée par `src/data/centres.js` (commentaire daté du 22/08/2026 dans le fichier lui-même).

### Orphelins

Fichiers qui existent mais que rien n'importe ni ne référence — vérifié par recherche de chaque nom de fichier dans tout `src/`, pas par déduction.

| Fichier | Depuis quand à l'écart | Nature |
|---|---|---|
| **`src/scripts/brochure-form.js`** | ⚠️ **Régression récente, non commitée.** Le dernier commit Git (`e3dcdf7`, 25/08/2026) importe encore ce script dans `src/pages/index.astro`. Dans l'état actuel du dossier de travail (non commité), cet import a disparu du bloc `<script>` de `index.astro` — probablement perdu lors d'une édition ultérieure de ce même bloc (ajout de `nav-active.js`). | **Ce n'est pas un script abandonné — c'est un bug fonctionnel actif.** Le formulaire "Recevez la plaquette de la rentrée" (`src/components/Brochure.astro`, affiché sur l'accueil) a un `id="brochureForm"` mais son gestionnaire de soumission JS n'est plus jamais chargé sur la page. Le `<form>` n'a pas d'attribut `action` : sans le script, un clic sur "Télécharger" déclenche une soumission par défaut du navigateur (rechargement de la page avec les champs en paramètres d'URL), sans jamais envoyer l'e-mail ni proposer le téléchargement. **À corriger avant mise en ligne** — voir section 3. |
| `src/assets/photos/846A2755.jpg` | Présent dès les tout premiers commits (photo de banque d'images du gabarit d'origine, mentionnée comme telle dans `AMELIORATIONS.md` et `scripts/README-images.md`). | Photo de démonstration jamais remplacée par un import réel, laissée sur le disque après le remplacement par les vraies photos (`1.jpg`–`42.jpeg`). |
| `src/assets/photos/846A26820.jpg` | Idem. | Idem. |
| `src/assets/photos/banner1.jpg` | Idem. | Idem. |
| `src/assets/photos/mahamadou.jpg` | Déposé en cours de session (photo composite/montage refusée, remplacée par un vrai portrait). | Superseded par `portrait-mahamadou-bikienga.jpg`, qui est le fichier réellement importé dans `src/data/team.js`. |
| `src/assets/photos/salfo.jpg` | Idem. | Superseded par `portrait-salfo-bikienga.jpg`. |
| `src/assets/photos/siaoPhoto.jpeg` | Reliquat d'un renommage de fichier en cours de session. | `src/data/centres.js` importe `siaoPhoto.jpg` (sans "e") — le fichier `.jpeg` est un doublon inutilisé du même renommage. |
| `public/favicon.png` | Modifié le 27/08 (activement maintenu), mais jamais câblé. | Aucun fichier du projet ne contient de balise `<link rel="icon">` — vérifié dans `src/layouts/BaseLayout.astro` (le seul `<head>` du site) : absente. `favicon.ico` fonctionne par convention implicite du navigateur (récupéré automatiquement à la racine du domaine), mais `favicon.png` et `favicon.svg` ne sont référencés par aucune balise. Voir section 4. |

### Dupliqués

Vérifiés par comparaison **de contenu** (somme MD5), pas seulement par nom de fichier identique.

| Doublon | Original (référence utilisée par le code) | Détail |
|---|---|---|
| **`src/assets/photos/hero/`** (45 fichiers, ~11 Mo) | `src/assets/photos/` (racine) | Dossier entier composé de copies **strictement identiques, octet pour octet** (vérifié par échantillonnage MD5 sur 5 fichiers pris au hasard : `1.jpg`, `5.jpeg`, `20.jpeg`, `37.jpeg`, `42.jpeg` — hachages identiques dans les deux emplacements) des photos déjà présentes à la racine de `src/assets/photos/`. Sur les 45 fichiers de ce dossier, **seuls 3 sont réellement importés** (`hero/37.jpeg`, `hero/36.jpeg`, `hero/40.jpeg`, par `src/components/Hero.astro`) — et même ces 3-là dupliquent un fichier de même nom déjà utilisé ailleurs à la racine (`37.jpeg` est aussi importé directement par `src/pages/a-propos/index.astro` et `src/pages/index.astro` pour la citation). Les 42 autres fichiers du dossier ne sont importés par rien. |
| **`src/assets/photos/Images/`** (44 fichiers + 1 document, ~9,6 Mo) | `src/assets/photos/` (racine) | Dossier entier, lui aussi identique octet pour octet à la racine (même vérification MD5). **Zéro fichier de ce dossier n'est importé nulle part** — contrairement à `hero/`, aucune exception. Ce dossier n'est en plus **suivi par Git nulle part** (`git ls-files` y retourne 0 résultat), contrairement à `hero/` qui a 3 fichiers commités. Contient aussi deux fichiers sans équivalent à la racine, tout aussi inutilisés : `Saaba.jpg` et `siao.jpeg` (noms capitalisés différemment des fichiers réellement utilisés `saabaPhoto.jpg`/`siaoPhoto.jpg`). |
| `src/assets/photos/Images/cahier_des_charges_lot2_moteur_IA.docx` (16,9 Ko) | — pas une image, pas un doublon d'image | À part : ce n'est pas une photo dupliquée mais un document Word égaré dans le dossier de photos. Peut contenir des spécifications projet réelles ("lot 2, moteur IA" — probablement lié aux articles de blog sur Amira/Dr Maya) : **à ouvrir et vérifier son contenu avant toute suppression** — s'il s'agit d'un vrai document de spécifications, il aurait sa place dans `docs/`, pas dans `src/assets/photos/`. |

### Générés/temporaires qui ne devraient pas être versionnés

`.gitignore` vérifié ligne par ligne face à ce qui existe réellement sur le disque :

| Dossier/fichier | Statut dans `.gitignore` | Constat |
|---|---|---|
| `dist/` | Ignoré (`dist/`) | Correct — présent sur le disque (dernier build), correctement absent de Git. |
| `captures/` | Ignoré (`captures/`) | Correct — 33 captures d'écran PNG issues de `scripts/verifier-pages.mjs --shots=`, correctement ignorées. |
| `.astro/` | Ignoré (`.astro/`) | Correct (types générés par Astro). |
| `node_modules/` | Ignoré | Correct. |
| `.env`, `.env.production` | Ignoré | Correct — la clé Web3Forms réelle n'est jamais versionnée. |
| `.env.example` | **Non ignoré, et suivi par Git** | Correct — c'est le modèle sans valeur, il doit être versionné. |

**Rien n'échappe au `.gitignore` en sens inverse** (rien de généré/temporaire n'est versionné par erreur). En revanche, voir l'alerte majeure de la section suivante : le problème inverse existe — des fichiers **sources, réels, non temporaires** ne sont eux, pas versionnés du tout.

### ⚠️ Constat transversal, hors des 4 catégories demandées mais essentiel

`git status` révèle **111 fichiers non suivis par Git** (`??`), dont une bonne partie n'a rien d'orphelin ou de temporaire — ce sont des fichiers sources actifs, jamais commités depuis leur création :

- Modules de données entiers : `src/data/centres.js`, `src/data/team.js`
- Composants : `src/components/PersonCard.astro`
- Une page entière : `src/pages/dr-maya/`
- Scripts : `src/scripts/gallery-lightbox.js`, `src/scripts/nav-active.js`
- Styles : `src/styles/components/lightbox.css`, `src/styles/components/person-card.css`
- 3 articles de blog, 3 fiches manuels (`src/content/manuels/mathematiques-1re.md`, `-2nde.md`, `-terminale.md`)
- Toutes les photos réellement utilisées par le site (aucune des photos en usage — portraits, photos de centre, `37.jpeg`, etc. — n'est suivie par Git, y compris celles qui SONT référencées par du code lui-même commité)
- `docs/EQUIPE.md`, tout `public/extraits/`, `public/favicon.png`, `public/horaires.pdf`, `public/plaquette-rentree.pdf`, tout `public/videos/`

Le dernier commit date du 25/08/2026 ; nous sommes le 28/08/2026. **Tout ce qui a été construit depuis (page Dr Maya, migration des centres vers `centres.js`, l'équipe, la galerie avec lightbox, l'indicateur de section actif, les articles de blog, les extraits PDF de manuels, la plaquette téléchargeable, les vidéos) n'existe que dans le dossier de travail local, jamais dans l'historique Git.** Voir le résumé en fin de tâche pour la priorité que représente ce point.

---

## 3. Fichiers ou routes à supprimer

Rien n'a été supprimé — liste uniquement, par ordre de priorité.

| # | Chemin | Pourquoi | Vérification à faire avant suppression |
|---|---|---|---|
| 1 | *(ne pas supprimer — re-brancher)* `src/scripts/brochure-form.js` | Ce n'est **pas** un candidat à la suppression : c'est le fichier manquant à ré-importer dans `src/pages/index.astro` (voir section 2). Listé ici pour mémoire, à traiter en premier. | Aucune — c'est un ajout d'une ligne, pas une suppression. |
| 2 | `src/assets/photos/Images/` (dossier entier, 44 fichiers image) | Doublon 100 % confirmé de la racine, zéro référence, jamais suivi par Git — le plus sûr des trois à supprimer. | Aucune dépendance externe possible (dossier jamais commité, donc jamais publié). |
| 3 | `src/assets/photos/Images/Saaba.jpg`, `Images/siao.jpeg` | Mêmes garanties que ci-dessus (dans le même dossier), mais pas des doublons d'un fichier racine — noms uniques, toujours inutilisés. | Idem. |
| 4 | `src/assets/photos/Images/cahier_des_charges_lot2_moteur_IA.docx` | Pas une image, sans rapport avec le dossier — mais **ouvrir le fichier avant de le supprimer**, voir remarque section 2 (pourrait être un document de spécifications à déplacer vers `docs/` plutôt qu'à supprimer). | Lire le contenu d'abord. |
| 5 | `src/assets/photos/hero/` — 42 des 45 fichiers (tous sauf `36.jpeg`, `37.jpeg`, `40.jpeg`) | Doublons confirmés de la racine, non importés. | Vérifier qu'aucun autre composant que `Hero.astro` ne référence ce dossier avant de vider le reste (déjà vérifié dans ce rapport, à re-vérifier si le code a changé entre-temps). |
| 6 | `src/assets/photos/hero/36.jpeg`, `37.jpeg`, `40.jpeg` (les 3 restants) | Utilisés, mais redondants : `Hero.astro` pourrait importer directement `../assets/photos/36.jpeg` etc. (déjà présents à la racine) au lieu de maintenir une copie séparée dans `hero/`. Suppression du dossier `hero/` entier possible **après** avoir changé les 3 imports dans `Hero.astro`. | Modifier les 3 lignes d'import dans `src/components/Hero.astro` avant de supprimer les fichiers, sinon le build casse. |
| 7 | `src/assets/photos/846A2755.jpg`, `846A26820.jpg`, `banner1.jpg` | Photos de banque d'images du gabarit d'origine, zéro référence. | Aucune — confirmé sans usage. |
| 8 | `src/assets/photos/mahamadou.jpg`, `salfo.jpg` | Anciennes photos composites refusées, remplacées. | Aucune — confirmé sans usage. |
| 9 | `src/assets/photos/siaoPhoto.jpeg` | Doublon de renommage, `siaoPhoto.jpg` (sans e) est le fichier réellement utilisé. | Vérifier une dernière fois `grep -r "siaoPhoto" src/` avant de supprimer, au cas où une modification récente y aurait touché. |
| 10 | `public/favicon.png` | Soit à supprimer (si `favicon.ico`/`favicon.svg` suffisent), soit — **recommandé** — à garder et câbler via une balise `<link rel="icon">` dans `BaseLayout.astro` (voir section 4). Ne pas supprimer sans trancher ce point d'abord. | Décider d'abord de la stratégie favicon. |

**Aucune route de page** (`.astro` sous `src/pages/`) n'est candidate à la suppression — toutes celles qui existent sont liées depuis la navigation ou une autre page (vérifié dans les sessions de travail précédentes via `scripts/verifier-pages.mjs`, qui rapporte 0 lien mort et 0 ancre orpheline sur les 35 routes construites).

---

## 4. Ce qui manque

**Section revérifiée le 28 août 2026, après les commits et le push.** Le tableau précédent datait d'avant et affichait encore comme 🔴 critiques quatre points depuis résolus. Chaque ligne ci-dessous a été reconfrontée au dépôt réel, pas recopiée.

### 4.1 Résolu depuis la première rédaction

| Point | Résolu par | Vérification faite |
|---|---|---|
| Formulaire de plaquette non fonctionnel | commit `48f945a` (25/08/2026) | `src/components/Brochure.astro` est un lien de téléchargement direct (`<a href="/plaquette-rentree.pdf" download>`), sans JS ni Web3Forms. `brochure-form.js` a été retiré du dépôt. |
| Fichiers sources jamais commités | commits `64d4381` puis `e204cfe` | `git status` propre. Pages, données, photos, guides : tout est dans l'historique. |
| Aucun remote Git | — | `git remote -v` → `origin` = `github.com/hakili-lab/hakili-lab-website` ; branche `main` poussée et à jour. |
| Domaine de production (`SITE_URL`) | — | `src/data/site.js` → `SITE_URL = 'https://www.hakililab.com'`. `astro.config.mjs` (`site`), `src/pages/robots.txt.ts`, les URLs canoniques, Open Graph, JSON-LD et le sitemap en dérivent tous automatiquement. Il reste à choisir un hébergeur et à faire pointer le DNS du domaine vers lui : action d'exploitation, pas un manque dans le code (voir `README-DEPLOIEMENT.md`). |
| Favicon non câblé | commit `046aca2` | `src/layouts/BaseLayout.astro` porte `<link rel="icon">` (svg, png 32×32, ico) + `<link rel="apple-touch-icon">`. Les fichiers ont été recompressés : `favicon.png` ≈ 2 Ko, `favicon.ico` ≈ 5,5 Ko, `apple-touch-icon.png` ≈ 12 Ko (contre le ~1 Mo signalé à l'origine). |
| `apple-touch-icon` + manifest PWA | — | `public/apple-touch-icon.png` câblé ; `public/site.webmanifest` ajouté (nom « Hakili Lab », icônes, `theme_color` `#005CB9`, `display: standalone`) et `<link rel="manifest">` dans `BaseLayout.astro`. |
| Raccourcis npm pour les scripts de vérification | — | `package.json` définit `verify` (`node scripts/verifier-pages.mjs`) et `verify:contrast` (`node scripts/verifier-contrastes.mjs`). |

### 4.2 Reste à traiter

| Manque | Bloquant ? | Détail |
|---|---|---|
| **Image de partage Open Graph** | 🟡 Souhaitable, non bloquant | Toujours pas d'`og:image`/`twitter:image` (commentaires `TODO(url)` restants dans `BaseLayout.astro`). En attente d'un visuel 1200×630 fourni par le propriétaire du projet. Sans lui, les partages sur réseaux sociaux n'ont pas de vignette. |
| **Tests automatisés** | 🟡 Peut attendre | Aucun framework de test (Vitest, Playwright Test en assertions…). `npm run verify` et `npm run verify:contrast` (section 6) tiennent ce rôle, à lancer manuellement. |

### 4.3 Décisions explicites (pas des oublis)

| Sujet | Décision | Raison |
|---|---|---|
| CI/CD (`.github/workflows/`) | Pas mise en place pour l'instant | Projet piloté par une seule personne. L'hébergeur statique (Cloudflare Pages / Netlify / Vercel) exécute déjà `npm run build` à chaque déploiement et ne publie pas un build en échec. À reconsidérer si des contributeurs rejoignent le projet. |
| `LICENSE` | Pas de fichier de licence | Site vitrine commercial, pas un projet open source. |
| `CONTRIBUTING.md` | Pas de guide de contribution | Sans objet tant que le projet reste piloté par une seule personne. |

### 4.4 Vérifié non manquant (faux positifs confirmés)

| Élément | Constat |
|---|---|
| `robots.txt` | Généré par `src/pages/robots.txt.ts` à chaque build (route API Astro). Contenu vérifié : `User-agent: *`, `Allow: /`, `Sitemap: https://www.hakililab.com/sitemap-index.xml`. |
| `sitemap.xml` | Généré par `@astrojs/sitemap` (`dist/sitemap-index.xml` + fichiers associés), présent à chaque build. |
| Page 404 personnalisée | `src/pages/404.astro`, stylée comme le reste du site, avec liens de secours (accueil, centres, inscription, contact). |

---

## 5. Fichiers particulièrement utiles à connaître

Les 10 fichiers à lire en premier pour comprendre comment ce projet est construit, par ordre de lecture recommandé :

1. **`src/data/site.js`** — 3 constantes (URL, titre, description du site). Tout ce qui touche au SEO/JSON-LD/sitemap en dépend. Le premier fichier à modifier une fois le vrai domaine connu.
2. **`src/layouts/BaseLayout.astro`** — le `<head>` unique du site (meta, Open Graph, JSON-LD `EducationalOrganization`, polices). Toute page passe par lui, directement ou via `SiteLayout.astro`.
3. **`src/layouts/SiteLayout.astro`** — la coquille commune à presque toutes les pages (TopBar + Header + `<main id="contenu">` + fil d'Ariane optionnel + Footer + scripts globaux). `src/pages/index.astro` est la seule page qui ne l'utilise pas (elle assemble `BaseLayout` directement, avec sa propre liste de scripts — voir l'alerte du `brochure-form.js` manquant, section 2).
4. **`src/content.config.ts`** — les schémas Zod des 3 collections de contenu (`blog`, `services`, `manuels`), avec le garde-fou `requireWhenReady()` qui fait échouer le build si une entrée `pretPourPublication:true` a un champ vide ou "À définir".
5. **`src/data/centres.js`** — les 5 centres, validés par un schéma Zod maison (pas une collection de contenu — remplace l'ancienne collection `centres`, voir le commentaire daté dans `content.config.ts`). Structure `horaires` prête pour une grille détaillée future.
6. **`src/data/details.js`** — les fiches "En savoir plus" (services, manuels, applications), affichées en modale. La clé de chaque fiche doit correspondre exactement au titre normalisé de la carte qui l'ouvre (voir `src/scripts/detail-modal.js`, point suivant).
7. **`src/scripts/detail-modal.js`** — logique d'ouverture des fiches détail : normalise le texte d'un titre de carte (minuscules, sans accents/ponctuation) pour retrouver la clé correspondante dans `details.js`. Piège documenté : une carte devenue un vrai lien `<a>`, ou contenant déjà un lien "En savoir plus", n'ouvre jamais de modale même si sa clé existe.
8. **`src/lib/placeholders.js`** — `isPlaceholder()`, la fonction utilisée partout (schémas Zod, pages) pour distinguer un vrai contenu d'une formule d'attente ("À définir", "À préciser"…) plutôt qu'une simple vérification "le champ n'est pas vide".
9. **`src/styles/tokens.css`** — les variables CSS (`--blue`, `--green`, `--r` pour le rayon des coins, etc.) dont dépend chaque fichier de `src/styles/components/`.
10. **`scripts/verifier-pages.mjs`** — la suite de vérification automatisée (détaillée section 6) : c'est elle qui garantit qu'un changement n'a introduit ni lien mort, ni violation d'accessibilité, ni contenu répété.

---

## 6. Scripts de vérification existants

Trois scripts dans `scripts/`, tous à lancer **manuellement** — aucun n'est automatisé (pas de hook Git pre-commit dans `.git/hooks/`, aucun `.husky/`, aucune CI). Deux d'entre eux ont un raccourci `package.json` : `npm run verify` (→ `verifier-pages.mjs`) et `npm run verify:contrast` (→ `verifier-contrastes.mjs`).

### `scripts/verifier-pages.mjs`

Le plus complet. Pilote un vrai Chromium (Playwright) sur chaque route d'un **build déjà généré et servi** (`npm run build && npm run preview`, servi sur `http://localhost:4321` — port fixé dans le script `preview` —, override possible avec `--base=`). Pour chaque route, vérifie :

- **Accessibilité** : audit `axe-core` complet (règles WCAG 2.0/2.1 niveaux A et AA).
- **Liens internes morts** : tout `<a href="/...">` doit correspondre à une route réellement construite (ou, depuis la dernière correction, à un fichier statique réellement présent dans `dist/`, comme un PDF).
- **Ancres orphelines** : tout `href="#id"` ou `href="/page#id"` doit correspondre à un élément `id="id"` réellement présent sur la page ciblée.
- **Images déformées** : toute image en `object-fit:fill` (comportement par défaut si `object-fit` n'est pas précisé) dont le ratio affiché s'écarte de plus de 2 % de son ratio naturel.
- **Répétitions de contenu** : détecteur de doublons (blocs de texte identiques sur une même page, blocs identiques sur plus de 2 pages, quasi-doublons à ≥85 % de similarité par trigrammes, chiffres-clés répétés) avec une liste d'exceptions documentées et justifiées dans le script lui-même.

Commande : `npm run verify` (ou `node scripts/verifier-pages.mjs [--shots=dossier] [--base=http://localhost:4321]` ; passer des options via `npm run verify -- --shots=…`). L'option `--shots` ajoute une capture d'écran plein-page par route, à 1280 px et 390 px de large.

### `scripts/verifier-contrastes.mjs`

Calculateur de contraste WCAG 2.1 écrit à la main (luminance relative), sans dépendance à un navigateur. Contient une table de toutes les paires texte/fond utilisées sur le site, tenue à jour manuellement à chaque nouvelle combinaison de couleurs introduite. Compare chaque paire au seuil requis (4,5:1 texte normal, 3:1 grand texte/composants d'interface). Commande : `npm run verify:contrast` (ou `node scripts/verifier-contrastes.mjs`).

### `scripts/optimiser-images.mjs`

Pas un script de vérification — un outil de pré-traitement. Réduit des photos brutes (export appareil photo/téléphone, 3000–6000 px, plusieurs Mo) à une résolution "maîtresse" raisonnable avant dépôt dans `src/assets/photos/`, via `sharp` (voir alerte dépendance non déclarée, section 1). Documenté dans `scripts/README-images.md`, avec les largeurs cibles recommandées par emplacement (hero, centre, galerie…). Ce script **ne remplace pas** le pipeline responsive d'Astro (`<Picture>`/`astro:assets`), qui génère de toute façon les variantes AVIF/WebP/tailles au build — il sert seulement à éviter de committer des fichiers sources démesurés.

---

## 7. Notes historiques et décisions de structure

Cette section reprend le contenu de l'ancien `AMELIORATIONS.md` (racine du projet, supprimé après cette fusion pour ne garder qu'un seul document de référence). Ce fichier datait de la toute première session — la conversion d'une maquette HTML unique (`hakililab.html`, aujourd'hui supprimée du dépôt) vers la structure Astro actuelle. **Chaque affirmation qu'il contenait a été revérifiée avant d'être reportée ici** : ce qui est toujours vrai est gardé et daté, ce qui a été corrigé depuis est marqué comme tel, ce qui n'a plus de sens (le fichier `hakililab.html` qu'il décrivait comme "conservé à la racine" n'existe plus, par exemple) a été retiré plutôt que recopié tel quel.

### 7.1 Toujours vrai — incohérence de formatage des ordinaux

Le HTML/Markdown du site (menus, sélecteurs, contenu) utilise la vraie balise `<sup>e</sup>` pour les ordinaux (`6<sup>e</sup>`, mise en exposant CSS réelle), alors que `src/data/details.js` utilise directement le caractère Unicode `ᵉ` dans le texte (ex. `"6ᵉ à Terminale"` à la ligne 17, `"L'élève qui entre en 6ᵉ"` à la ligne 19). **Toujours présent, vérifié à nouveau le 28/08/2026.** Les deux s'affichent différemment (vraie mise en exposant vs caractère de taille normale dans le flux du texte). Jamais harmonisé depuis l'origine du projet — à corriger si la cohérence visuelle stricte est souhaitée, sans urgence fonctionnelle.

### 7.2 Corrigé depuis — à ne plus traiter

- **Accents manquants** ("Elève"/"Elèves" sans é initial, "Etablissement" sans É, "A définir" sans À) : recherchés à nouveau dans tout `src/` le 28/08/2026, **plus aucune occurrence trouvée**. Corrigés au fil des sessions suivantes.
- **Contenu placeholder** (témoignages, FAQ, partenaires génériques, tarifs "À définir") : le suivi de ce point a été repris par un document dédié et bien plus à jour, `docs/A-FAIRE-CONTENU.md` — c'est lui qui fait référence désormais, pas cette note historique.
- **Écarts de comptage avec le brief initial** (images "4 attendues / 3 réelles", "17 fiches / 16 réelles") : trivia propre à un document de brief qui n'existe plus dans le dépôt — sans objet aujourd'hui.

### 7.3 Découverte en vérifiant ce point (nouvelle, pas dans l'original)

En revérifiant la zone de `details.js` concernée par 7.1, une autre incohérence d'accent, non signalée à l'époque, a été repérée : `"Evaluations régulières et bilan aux parents"` (`src/data/details.js`, entrée `"mathematiques au secondaire"`) — sans É initial. Un seul cas trouvé lors de cette vérification ponctuelle ; **pas un audit exhaustif des accents**, juste ce qui est apparu en repassant sur ce fichier précis.

### 7.4 Décisions de découpage CSS (toujours valables, vérifiées)

Choix pris par déduction lors du découpage initial du CSS monolithique, toujours en place aujourd'hui :

- `.cards-4` (grille à 4 colonnes) placée dans `src/styles/components/cards.css`, à côté de `.cards-3` — confirmé toujours le cas.
- `.mobile-cta` (barre CTA mobile fixe) dans `components/footer.css`, faute de fichier dédié.
- Le bloc partagé `.brand-line`/`.claim`/`.hero-meta`/`.footer-claim` regroupé dans `components/hero.css`.
- La règle partagée `.card[data-detail],.book[data-detail],.app[data-detail]{cursor:pointer}` dans `components/modal.css`.
- Ordre des `@import` dans `main.css` : suit la ligne de première apparition du contenu de chaque fichier dans le CSS source d'origine, pas un ordre alphabétique ou thématique.

### 7.5 Retiré, obsolète

L'original signalait qu'une vérification visuelle multi-largeurs (1440/1080/980/680px) n'avait pas pu être faite depuis l'environnement d'exécution de la toute première session (serveur local inaccessible à l'époque). **Ce point n'a plus lieu d'être** : de très nombreuses vérifications visuelles par capture d'écran (Playwright, plusieurs largeurs) ont eu lieu à chaque chantier depuis, y compris pour ce rapport. Retiré pour ne pas laisser croire que ce contrôle n'a toujours pas été fait.

---

## 8. Historique et décisions design/accessibilité (repris de l'ancien `RAPPORT-SITE.md`)

`RAPPORT-SITE.md` (racine du projet, 734 lignes, supprimé après cette fusion) documentait, chantier après chantier, toute la transformation du site d'une page unique (composants `About.astro`, `Teachers.astro`, `Services.astro`, `Centres.astro`, `Productions.astro`, `Contact.astro`, `Testimonials.astro`, `Partners.astro`, `Faq.astro`, `Gallery.astro`, `Blog.astro` — **aucun de ces fichiers n'existe plus aujourd'hui**, tous supprimés une fois remplacés par de vraies pages) vers la structure multipage actuelle.

**Ce n'est pas recopié tel quel.** Un journal de bord de 734 lignes, avec décomptes de routes et tableaux de contraste figés à un instant passé, aurait fait doublon avec ce rapport-ci (qui décrit l'état réel *actuel*, vérifié aujourd'hui) et l'aurait rendu trompeur par endroits (le site avait alors 27 routes ; il en a 35 aujourd'hui — voir section 2). Ce qui suit condense uniquement ce qui a une valeur durable : les règles et décisions encore en vigueur, pas les instantanés de mesure.

### 8.1 Règles de contenu toujours en vigueur

- **Jamais de contenu d'attente affiché.** Distinction stricte entre un champ vide et un champ rempli d'une formule d'attente ("À définir", "À confirmer"...) — les deux sont traités pareil, via `isPlaceholder()` (`src/lib/placeholders.js`, voir section 5). Un champ obligatoire manquant sur une entrée `pretPourPublication:true` fait échouer `npm run build`, pas seulement un avertissement.
- **Jamais un texte de repli qui a l'air d'une vraie donnée.** Ex. une fiche de centre sans adresse n'affiche ni "Adresse : —" ni "à confirmer", mais un encart honnête invitant à appeler.
- **Jamais un balisage structuré (JSON-LD) creux** : le `LocalBusiness` d'un centre n'est émis que si adresse **et** coordonnées GPS sont toutes les deux réelles.
- **Un seul mécanisme de retour par page** : fil d'Ariane (pages de 3ᵉ niveau : fiches service/centre/manuel/article) *ou* lien de retour simple `← Accueil` (pages de 2ᵉ niveau), jamais les deux, jamais aucun. Implémenté via la prop `hideBreadcrumb` de `SiteLayout.astro`, qui ne joue que sur l'affichage — le JSON-LD `BreadcrumbList` continue d'être émis dans les deux cas.

### 8.2 Accessibilité — dispositifs en place

- Lien d'évitement (`.skip-link`, premier élément du `<body>`, cible `#contenu`).
- Sélecteur de niveau (accueil) : motif ARIA "tabs" complet (`role="tablist"/"tab"/"tabpanel"`, `aria-selected`, `tabindex` "roving", navigation flèches/Home/Fin).
- Menu mobile et fiche détail (modale) : piège de focus (Tab/Maj+Tab reste à l'intérieur tant qu'ouvert), fermeture Échap avec retour du focus à l'élément d'origine.
- `aria-expanded` synchronisé en JS sur les entrées de menu à tiroir.
- Hiérarchie de titres sans saut de niveau — vérifiée à chaque nouvelle page, pas seulement à l'origine.

### 8.3 Décisions de contenu explicites, encore valables

- La carte "Diagnostic et remédiation" (autrefois classée à tort sous "Productions") est fusionnée dans `/services/remediation` — les deux décrivaient la même offre.
- Les effectifs ("Effectif : ...") ont été retirés des fiches détail individuelles (services/manuels), à l'exception explicite des sections globales qui annoncent un nombre d'enseignants (bandeau `.stats`, encart `.recruit` d'`/enseignants`) — celles-là non touchées, sur demande.
- Tarifs reçus et appliqués à l'époque : primaire 18 000 FCFA/mois, secondaire 1 250 FCFA/heure (toujours les valeurs actuelles dans `src/data/details.js`, vérifié section 2 de ce rapport). Le reste (formules, manuels, Amira, Dr Maya) reste `À définir`, faute de valeur communiquée.
- Détecteur de répétitions de contenu (`scripts/verifier-pages.mjs`) : méthode encore active aujourd'hui (voir section 6) — blocs `p/li/h2/h3/blockquote/figcaption` de 20 à 200 caractères, exclusion des zones de gabarit et des relations ancêtre/descendant, normalisation (minuscules, sans accents, sans ponctuation), quatre contrôles (doublon exact même page, doublon exact >2 pages, quasi-doublon ≥85% par trigrammes, chiffre-clé répété), avec une `Map` d'exceptions documentées et justifiées une par une plutôt que des cas simplement retirés de la détection.

### 8.4 Direction visuelle "isga.ma" — pourquoi le site a cet aspect

Quatre choix appliqués en une passe, toujours en place : en-tête allégé (barre du haut réduite, un seul bouton), une police supplémentaire Playfair Display (un seul poids 600, italique uniquement — utilisée pour les sur-titres `.eyebrow`), deux "respirations" pleine largeur maximum par page (bande chiffre-clé + bande citation, jamais plus), et des révélations au défilement en fondu (`src/scripts/scroll-reveal.js`, `IntersectionObserver`, jamais sur le hero ni les boutons). Cette dernière a une clause de sécurité vérifiée à trois niveaux : sans JavaScript, avec `prefers-reduced-motion:reduce`, et à l'impression (`@media print`), le contenu reste toujours visible par défaut — jamais masqué si le mécanisme qui le révèle ne s'exécute pas.

### 8.5 Un bug caractéristique, résolu — pourquoi le contrôle d'images déformées existe

Le logo du pied de page a été trouvé écrasé verticalement (90×42px affiché pour un fichier source 90×84px) : `height:42px` sans `width:auto` ni `object-fit`. C'est ce bug précis qui a motivé l'ajout, permanent, du contrôle "images déformées" dans `scripts/verifier-pages.mjs` (toute `<img>` en `object-fit:fill` — la valeur par défaut si non précisée — dont le ratio affiché s'écarte de plus de 2% du ratio naturel). Toujours actif aujourd'hui (0 image déformée à la dernière exécution, voir section 6).

### 8.6 Ce qui est explicitement daté et n'a pas été reporté ici

Le plan de migration monopage → multipage (arborescence proposée, ordre de migration, effort estimé) : la migration a depuis été terminée dans son intégralité — cette partie était un plan, devenu sans objet une fois exécuté. Le tableau de contraste figé (33, puis 41, puis 43 combinaisons selon la version) : périmé par construction, le nombre de combinaisons réelles a changé depuis (`node scripts/verifier-contrastes.mjs` donne l'état actuel, voir section 6). Les décomptes de routes (4, puis 9, puis 27) et les poids de page mesurés à chaque étape : instantanés historiques d'un site qui compte aujourd'hui 35 routes — remplacés par l'inventaire à jour de ce rapport. Le script de démonstration ("ce qu'il faut montrer / éviter devant votre public") : propre à une présentation ponctuelle, sans valeur de référence.
