<!-- Document de reconnaissance, lecture seule : aucun fichier de contenu n'a été modifié pour le produire. -->
# Contenu restant à fournir — inventaire complet

Ce document recense tout ce qui, dans le code actuel, est provisoire :
valeurs « À définir », données factices, espaces réservés, structures
créées mais vides, ou incohérences entre deux endroits qui devraient dire
la même chose. Aucune suggestion de texte n'y figure : seulement quoi
fournir, où, et sous quel format.

## 1. Équipe — fondateurs et enseignants

Structure déjà en place (`src/data/team.js`, composant `PersonCard.astro`),
entièrement remplie d'espaces réservés.

| Groupe | Nombre de fiches | Champs par fiche | Fichier |
| --- | --- | --- | --- |
| Fondateurs | 2 (`Nom du fondateur`, `Nom de la fondatrice`) | `name`, `role`, `bio`, `photo` | `src/data/team.js:31-32` |
| Enseignants | 4 (`Enseignant 1` à `4`) | `name`, `role`, `bio`, `photo` | `src/data/team.js:36-39` |

Pour chacune des 6 fiches : un nom réel, un rôle/titre, une biographie
(actuellement `"Biographie à venir."` sur les 6), une photo (actuellement
`photo: null` sur les 6 — la carte affiche des initiales en attendant).

**Format photo attendu** : portrait recadré en 3:4, environ 600 × 800 px
minimum, `.jpg` ou `.png`, à déposer dans `src/assets/photos/` (détail
complet de la procédure dans `docs/EQUIPE.md`).

Le nombre de fiches n'est pas figé (la grille s'adapte automatiquement) :
si le nombre réel de fondateurs ou d'enseignants à mettre en avant diffère
de 2/4, il suffit d'ajouter ou retirer des entrées dans le tableau.

## 2. Centres

5 centres (`Pissy`, `Tampouy`, `Saaba`, `SIAO`, `Nagrin`), tous dans
`src/data/centres.js`. Nom, description et photo sont déjà renseignés et
individualisés par centre (une photo distincte pour chacun). Restent
provisoires, identiquement vides sur les 5 fiches :

| Champ | État actuel (5 centres) | Format attendu | Lignes (`src/data/centres.js`) |
| --- | --- | --- | --- |
| `adresse` | `''` (vide) | Adresse postale complète, une ligne | 37, 51, 65, 79, 93 (`adresse:`) |
| `latitude` / `longitude` | `null` | Coordonnées GPS décimales (ex. `12.3714`) | 39-40, 53-54, 67-68, 81-82, 95-96 |
| `googleMapsUrl` | `''` (vide) | Lien Google Maps du centre | 41, 55, 69, 83, 97 |
| `classesOuvertes` | `''` (vide) | Une phrase : classes réellement ouvertes dans ce centre précis | 36, 50, 64, 78, 92 |
| `horaires` | Identique mot pour mot sur les 5 : `"Du lundi au samedi, 8h à 18h"` | Soit confirmer que c'est la même chose partout, soit fournir le détail par centre | 26 (fonction), 36, 50, 64, 78, 92 |

Le champ `horaires` est structuré `{ resume, grille: [] }` : `grille` est
prêt à recevoir un tableau détaillé (jour, créneau, niveau) si vous
souhaitez remplacer la phrase résumée par un vrai emploi du temps.

Tant qu'`adresse` et les coordonnées GPS ne sont pas les deux renseignées,
chaque fiche centre affiche un message de repli invitant à appeler
(`src/pages/centres/[slug].astro:80-84`) et aucun balisage `LocalBusiness`
n'est émis pour le référencement local (même fichier, ligne 27).

## 3. Manuels et productions

### Prix

7 manuels, prix identique et provisoire sur les 7 : `"À définir"`.

| Fichier | Ligne |
| --- | --- |
| `src/content/manuels/mathematiques-6e.md` | 21 |
| `src/content/manuels/mathematiques-5e.md` | 21 |
| `src/content/manuels/mathematiques-4e.md` | 21 |
| `src/content/manuels/mathematiques-3e.md` | 21 |
| `src/content/manuels/mathematiques-2nde.md` | 21 |
| `src/content/manuels/mathematiques-1re.md` | 21 |
| `src/content/manuels/mathematiques-terminale.md` | 21 |

Tarifs des formules et programmes, également `"À définir"` :

| Formule/Programme | Fichier | Ligne |
| --- | --- | --- |
| Cours d'appui | `src/content/services/cours-appui.md` | 18 |
| Cours de remédiation | `src/content/services/remediation.md` | 18 |
| Camp Vacances | `src/content/services/camp-vacances.md` | 19 |
| Préparation aux examens | `src/content/services/preparation-examens.md` | 20 |
| Amira (application) | `src/data/details.js` | 16 (`f:[...["Tarif","À définir"]]`) |
| Diagnostic et remédiation (application) | `src/data/details.js` | 17 |

Autres champs `"À définir"`/`"À préciser"` sur ces mêmes fiches : rythme
des cours d'appui (`cours-appui.md:16`), durée du Camp Vacances
(`camp-vacances.md:17`), démarrage de la préparation aux examens
(`preparation-examens.md:18`), classes couvertes par le cours de
physique-chimie (`src/data/details.js:4`), centres proposant l'anglais
(`src/data/details.js:5`), fréquence du suivi des parents
(`src/data/details.js:11`).

### Descriptions des tomes 2nde/1re/Terminale

Ces 3 tomes ont été ajoutés avec un texte neutre en une phrase (pas un
texte d'exemple générique comme le blog, mais volontairement minimal en
attendant votre contenu réel) :

| Fichier | Ligne (paragraphe) |
| --- | --- |
| `src/content/manuels/mathematiques-2nde.md` | 26 |
| `src/content/manuels/mathematiques-1re.md` | 26 |
| `src/content/manuels/mathematiques-terminale.md` | 26 |

À noter, repéré via le schéma de validation (les mêmes champs sont
recopiés à l'identique sur les 7 tomes, signe d'un contenu non
individualisé au-delà du niveau/matière) :
- `resumeCourt` : exactement `"Cours, méthodes et situations d'intégration"` sur les 7 fiches (ligne 5 de chaque fichier).
- `caracteristiques` : 3 des 4 puces identiques sur les 7 fiches (seul le tome 3e a une puce différente — sujets d'entraînement au BEPC — les 6 autres partagent les 4 mêmes puces mot pour mot).
- `publicVise` inclut `"Enseignants et établissements"` sur les 7 fiches et `"Parents qui veulent suivre le travail à la maison"` sur 6 des 7.

### Extraits PDF à déposer

Dossier `public/extraits/` créé, structure prête, **aucun PDF déposé**
(seul un `README.md` explicatif s'y trouve actuellement). Deux
emplacements possibles, chacun avec sa propre convention de nom :
- Un extrait par manuel : `public/extraits/<slug-du-manuel>.pdf` (7 slugs possibles, voir liste dans le tableau ci-dessus).
- Un extrait général pour toute la collection : `public/extraits/collection-hakili-lab.pdf`.

Le bouton « Feuilleter un extrait » ne s'affiche que si le fichier
correspondant existe (`src/pages/manuels/[slug].astro:23-25` et
`src/pages/manuels/index.astro:21-25`) : actuellement invisible partout,
faute de fichier.

## 4. Blog

3 articles publiés (`brouillon: false`), tous les 3 avec un texte
d'exemple identique en dernière ligne du corps :

> *Contenu d'exemple. Cet article préfigure la page dédiée du site
> définitif : le texte complet reste à rédiger avant mise en ligne.*

| Fichier | Titre actuel |
| --- | --- |
| `src/content/blog/retour-camp-vacances-2026.md` | Retour sur le Camp Vacances 2026 et son concours de mathématiques |
| `src/content/blog/pourquoi-test-positionnement-debut-annee.md` | Pourquoi un test de positionnement change tout en début d'année |
| `src/content/blog/aider-enfant-maths-sans-faire-exercices.md` | Aider son enfant en maths sans faire les exercices à sa place |

Ce texte d'exemple est actuellement documenté comme exception
**temporaire** dans le détecteur de répétitions (`scripts/verifier-pages.mjs`,
commentaire « TEMPORAIRE, a retirer des que les 3 articles de blog ont
leur vrai texte ») : dès que le vrai texte remplace ce paragraphe sur les
3 fichiers, cette exception doit être retirée du script.

Titre, description et date de ces 3 articles sont déjà renseignés (pas
provisoires en soi) ; seul le corps de l'article est un texte d'exemple.
Le nombre d'articles réels nécessaires au lancement n'est pas déterminé
par le code : la page `/blog` et le menu s'adaptent automatiquement au
nombre d'articles non-brouillon présents dans `src/content/blog/`
(actuellement 3, ce nombre peut être augmenté ou réduit sans changement
de code — voir `docs/PUBLIER-UN-ARTICLE.md`).

## 5. Témoignages

**Aucun témoignage n'existe actuellement sur le site.** Le composant qui
les afficherait n'existe pas (pas de fichier `Testimonials.astro` ni
équivalent) ; seul le CSS correspondant est présent, importé mais jamais
utilisé par aucune page :

- `src/styles/components/testimonials.css` (classes `.quotes`, `.quote`, `.avatar`, jamais référencées ailleurs que dans ce fichier et `responsive.css`)

Ce CSS dessine une grille à 3 colonnes (`repeat(3,1fr)`) avec, pour
chaque témoignage, une citation, un avatar rond avec initiales (même
principe que les cartes d'équipe) et un nom/fonction en dessous — c'est
une indication structurelle du CSS existant, pas une recommandation de
ma part sur le nombre à fournir. Aucun fichier de données ni composant
n'existe pour recevoir des témoignages : il faudrait les créer si vous
souhaitez les publier.

## 6. Partenaires

**Aucun partenaire listé actuellement.** Même situation que les
témoignages : CSS présent et importé, jamais utilisé par aucune page :

- `src/styles/components/partners.css` (classes `.partners`, `.partner`, non référencées ailleurs)

Le CSS actuel affiche chaque partenaire comme un encadré texte
(`border`, fond blanc, aucune balise `<img>` prévue) — il n'y a donc pas
aujourd'hui de gabarit prêt pour des logos image. Si vous voulez des
logos plutôt que des noms texte, ce composant reste à concevoir. Aucune
indication dans le code sur le nombre de partenaires ni sur un format de
logo attendu (dimensions/résolution) : rien de existant à citer ici.

## 7. Coordonnées

### Téléphone — incohérence résolue

Deux numéros réels coexistent sur le site : `+226 57 91 91 91` et
`+226 58 79 50 50`. L'incohérence notée ici à l'origine (un bandeau
mobile collant dont le bouton « Appeler » composait le second numéro
alors que tout le reste du site traite le premier comme numéro
principal) **n'a plus lieu d'être** : ce bandeau a été retiré du site
(plus de `.mobile-cta`), et la page `/contact` qui portait le JSON-LD
`ContactPoint` a été retirée aussi (remplacée par des liens WhatsApp
directs). Le premier numéro (57 91 91 91) reste le numéro par défaut
partout où un seul est composé en un clic (barre du haut, JSON-LD
`Organization`/`LocalBusiness`) ; le second n'apparaît plus que comme
second lien `tel:` explicite (fiches centres), jamais comme numéro
« par défaut » implicite.

### Récapitulatif de toutes les occurrences

| Type | Valeur | Nombre d'occurrences | Fichiers |
| --- | --- | --- | --- |
| Téléphone (les deux numéros ensemble) | `57 91 91 91` / `58 79 50 50` | 3 | `TopBar.astro:12`, `BaseLayout.astro:24`, `centres/[slug].astro:39,85` |
| E-mail | `info@hakililab.com` | 3 | `BaseLayout.astro:23`, `TopBar.astro:13`, `centres/[slug].astro:38` |
| Facebook | `https://web.facebook.com/hakililab` | 2 | `BaseLayout.astro:27`, `Footer.astro:23` |
| TikTok | `https://www.tiktok.com/@hakililab` | 2 | `BaseLayout.astro:28`, `Footer.astro:23` |

Aucune incohérence trouvée sur l'e-mail ni les liens sociaux (valeurs
identiques partout). Aucun compte Instagram, LinkedIn ni X/Twitter
référencé nulle part dans le code.

## 8. Images génériques (photos réelles Hakili Lab réutilisées ailleurs que leur usage naturel)

Toutes les photos du site proviennent maintenant de vos vraies photos
(dossier `src/assets/photos/`, 42 fichiers) — il n'y a plus de photo de
banque d'images générique. En revanche, certaines de ces vraies photos
sont réutilisées à plusieurs endroits sans rapport direct avec leur
contenu réel, faute d'une photo dédiée à chaque usage :

| Photo | Réutilisée à | Nombre d'usages |
| --- | --- | --- |
| `37.jpeg` (enseignant au tableau, mur de briques) | Carrousel d'accueil, bandeau citation de l'accueil, vignette vidéo de `/a-propos`, image de l'article de blog « Retour sur le Camp Vacances 2026 » | 4 |
| `36.jpeg` (salle de classe, lumière naturelle) | Carrousel d'accueil, image de l'article « Pourquoi un test de positionnement... » | 2 |
| `40.jpeg` (élèves devant une fenêtre à grille) | Carrousel d'accueil, image de l'article « Aider son enfant en maths... » | 2 |

Si vous voulez qu'un article de blog ait une photo différente du
carrousel d'accueil, ou que la vignette vidéo de `/a-propos` montre
autre chose que le même enseignant que la citation juste en dessous sur
la même page, ce sont ces 8 emplacements qu'il faut individualiser.

La vidéo elle-même, liée depuis `/a-propos`
(`src/pages/a-propos/index.astro:30`, `https://youtu.be/wUX2iMeWs_4`),
n'a pas été vérifiée dans cet audit (lien externe, hors du dépôt) — à
confirmer que c'est bien la bonne vidéo.

## 9. Tout le reste

### Nom de domaine — résolu

**Ce point n'est plus d'actualité** (vérifié contre `src/data/site.js:5`) :
`SITE_URL` vaut maintenant `'https://www.hakililab.com'`, plus le domaine
réservé `https://example.com` cité à l'origine ici. `astro.config.mjs`
le réutilise automatiquement pour son champ `site`, comme prévu. Voir
`docs/RAPPORT-PROJET.md` section 4.1.

### Image de partage (Open Graph / réseaux sociaux)

Aucune image `og:image`/`twitter:image` définie actuellement — les
balises correspondantes sont absentes, avec un commentaire dans le code
signalant l'attente d'une photo dédiée : `src/layouts/BaseLayout.astro:51,56`.
**Format attendu (déjà écrit en commentaire dans le code)** : 1200 × 630 px.

### Entrées mortes dans `src/data/details.js` — nettoyées le 2026-08-22

**Correction par rapport à la première version de cet audit** : un premier
passage n'avait vérifié que le déclenchement par fenêtre modale et avait
classé à tort `"test de positionnement"` comme vivante. Une seconde
vérification (recherche de tous les `import { detail }` dans
`src/pages/`) a montré que `/methode` et `/amira` lisent chacune une
entrée directement dans leur frontmatter, hors du système de fenêtre
modale.

9 entrées mortes ont été retirées de `src/data/details.js` : `"cours
dappui"`, `"cours de remediation en mathematiques"`, `"camp vacances"`,
`"preparation aux examens"`, `"mathematiques 6e"`, `"mathematiques 5e"`,
`"mathematiques 4e"`, `"mathematiques 3e"`, `"diagnostic et remediation"`
— vérifié qu'aucune carte ni page ne les référence plus (le contenu réel
équivalent est déjà vivant dans `src/content/services/` et
`src/content/manuels/`). 7 entrées restent, toutes vérifiées vivantes :
les 4 fiches « Matière » (déjà avec un vrai tarif, voir section 3),
`"suivi des parents"` (fenêtre modale sur `/services`), et
`"test de positionnement"` / `"amira"` (lues directement par `/methode`
et `/amira`).
Signalé ici pour éviter de fournir un contenu (par exemple un tarif Amira)
en pensant qu'il sera visible quelque part alors qu'aucune page ni fenêtre
modale ne l'affiche plus actuellement.

### Amira — lien externe

`src/pages/amira/index.astro:62` pointe vers
`https://amira.hakililab.com/` — un sous-domaine non vérifié dans cet
audit (hors du dépôt) : à confirmer qu'il s'agit bien de l'adresse réelle
de l'application.

---

## Résumé chiffré

- **Fiches personnes à compléter (nom déjà donné comme espace réservé) :** 6 (2 fondateurs + 4 enseignants), chacune avec 2 champs texte + 1 photo.
- **Centres à compléter :** 5 fiches × 4 champs vides chacune (adresse, GPS, lien Maps, classes ouvertes), + horaires à confirmer/détailler sur les 5.
- **Tarifs `"À définir"` :** 12 valeurs affichées quelque part sur le site (7 manuels + 4 formules/programmes + Amira, cette dernière lue directement par `/amira` — voir section 9), plus 1 valeur (diagnostic-remédiation) qui n'était plus affichée nulle part et dont l'entrée a été retirée de `src/data/details.js` le 2026-08-22.
- **Descriptions de tome à individualiser :** 3 tomes avec un texte minimal (2nde/1re/Terminale), plus des champs identiques recopiés sur 6-7 tomes (`resumeCourt`, 3 des 4 `caracteristiques`).
- **Extraits PDF à déposer :** 0 sur 8 emplacements possibles (7 manuels + 1 extrait général).
- **Articles de blog à réécrire :** 3 (texte d'exemple identique sur les 3).
- **Témoignages :** 0 existant, aucun composant pour les recevoir.
- **Partenaires :** 0 existant, aucun composant pour les recevoir.
- **Incohérence à trancher :** 0 — l'incohérence signalée à l'origine (numéro de téléphone par défaut, bandeau mobile vs reste du site) n'a plus lieu d'être, voir section 7.
- **Photos réelles réutilisées hors de leur contexte propre :** 3 photos, 8 emplacements au total.
- **Autres valeurs :** image de partage Open Graph (1200×630), lien externe Amira à confirmer. Le nom de domaine (`SITE_URL`) est résolu, voir section 9.

**Les deux qui bloquent le plus de choses, si je devais prioriser :**

1. **Les tarifs.** 13 valeurs manquantes qui touchent la quasi-totalité de l'offre commerciale (les 4 matières ont déjà un vrai tarif depuis une passe précédente, mais toutes les formules, programmes, manuels et applications restent à « À définir ») : c'est l'information la plus directement bloquante pour qu'un parent prenne sa décision.
2. **Adresses, coordonnées GPS et horaires réels des 5 centres.** Tant qu'ils manquent, aucune fiche centre n'affiche d'itinéraire ni de lien Google Maps, et aucun balisage `LocalBusiness` n'est émis pour le référencement local — l'information la plus basique pour un centre de tutorat physique (où et quand) est absente des 5 pages dédiées.
