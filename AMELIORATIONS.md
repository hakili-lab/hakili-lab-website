# Améliorations repérées, volontairement non appliquées

Conformément à la consigne de fidélité stricte, rien ci-dessous n'a été corrigé
dans le code. Cette liste sert de base de discussion.

## Incohérences de contenu déjà présentes dans la maquette d'origine

- **Superscript incohérent entre le HTML et les données JS.** Le HTML du menu,
  du sélecteur de niveau et des sections utilise `<sup>e</sup>` (ex. `6<sup>e</sup>`),
  alors que l'objet `detail` (fiches "En savoir plus") utilise le caractère
  Unicode `ᵉ` directement dans le texte (ex. `"6ᵉ à Terminale"`). Les deux
  s'affichent différemment (vraie mise en exposant CSS vs. caractère de taille
  normale). Non harmonisé, conservé à l'identique dans `src/data/details.js` et
  dans les composants `.astro`.
- **Fautes/absences d'accents conservées telles quelles** : "A définir",
  "A compléter", "A préciser", "Elève"/"Elèves" (sans é initial),
  "Etablissement" (sans É initial), "reçoivent" etc. Ce sont des choix de la
  maquette d'origine, pas des erreurs de découpage.
- **Contenu de type placeholder** (témoignages, FAQ "à rédiger", partenaires
  génériques, tarifs "A définir", horaires/effectifs à préciser) : tout est
  resté en l'état, à remplacer par le contenu réel avant mise en ligne.
- **Incohérences du brief lui-même** : la demande mentionne "les 4 images
  distantes (846A2755.jpg, 846A26820.jpg, banner1.jpg …)" mais seules 3 URLs
  distinctes existent réellement dans le HTML source (chacune réutilisée
  plusieurs fois). Les 3 fichiers trouvés ont été téléchargés dans
  `src/assets/photos/`. De même, le brief parle des "17 fiches" /
  "17 clés" de l'objet `detail`, mais celui-ci n'en contient réellement que
  16 (comptage vérifié). La documentation (`README.md`) reflète le chiffre
  réel de 16.

## Choix de découpage pris par déduction (le brief ne listait pas chaque règle CSS)

Le document de brief donnait une liste indicative de sélecteurs par fichier
CSS, pas une énumération exhaustive de chaque règle. Les règles suivantes,
non nommées explicitement, ont été placées par déduction thématique, sans
qu'aucune n'ait été reformulée :

- `.cards-4` (grille à 4 colonnes) → `cards.css`, à côté de `.cards-3`.
- `.mobile-cta` (barre CTA mobile fixe) → `components/footer.css`, faute de
  fichier dédié dans l'arborescence cible et parce qu'elle suit directement
  `</footer>` dans le HTML.
- Le bloc partagé `.brand-line` / `.claim` / `.hero-meta` / `.footer-claim`
  (lignes 54–72 de l'original) a été placé entièrement dans
  `components/hero.css` avec le commentaire `/* bloc partagé : hero + header
  + footer */` demandé par le brief.
- La règle `.card[data-detail],.book[data-detail],.app[data-detail]{cursor:pointer}`
  mélange trois familles de composants (cards, books, apps). Elle a été
  laissée intacte (une seule règle, un seul sélecteur composé) et placée dans
  `components/modal.css` avec un commentaire `/* bloc partagé : cards + books
  + apps (déclenchement de la fiche détail) */`, par analogie avec le
  traitement du bloc partagé hero/header/footer.
- **Ordre des `@import` dans `main.css`** : comme un même fichier cible
  (ex. `books-apps.css`) rassemble des règles qui n'étaient pas contiguës dans
  le fichier source, l'ordre exact "ligne par ligne" du CSS d'origine ne peut
  pas être reproduit littéralement par une liste d'`@import` de fichiers
  entiers. L'ordre retenu suit la ligne de **première apparition** du contenu
  de chaque fichier dans le CSS source. Comme la quasi-totalité des sélecteurs
  d'un composant à l'autre sont disjoints (aucun conflit de spécificité
  possible), cet ordre ne change aucun rendu — vérifié par comparaison triée
  (toutes les lignes du CSS source retrouvées à l'identique dans les fichiers
  découpés, sans ajout ni perte).

## Vérification visuelle non effectuée par l'agent

Le brief demande une comparaison visuelle côte à côte à 1440/1080/980/680px.
L'environnement d'exécution utilisé pour ce découpage ne permet pas de lancer
un serveur local qui écoute sur le réseau (`npm run dev` et `npm run preview`
échouent tous les deux au démarrage avec "process exited before becoming
ready", ce qui pointe vers une restriction du bac à sable plutôt qu'un bug du
projet — `npm run build` réussit sans erreur).

À la place, la fidélité a été vérifiée par :
- diff trié (ordre indifférent) de tout le CSS source vs. tout le CSS
  découpé : 305 déclarations de chaque côté, aucune différence en dehors des
  deux commentaires ajoutés ;
- diff ligne à ligne de chaque section HTML source vs. chaque composant
  `.astro` correspondant ;
- diff normalisé (espaces ignorés, `src=` neutralisé) entre le HTML source
  complet et le HTML généré par `npm run build` : 33 669 caractères des deux
  côtés, aucune différence de structure ou de texte ;
- présence vérifiée des chaînes clés du JavaScript (`is-open`, `modalTitle`,
  `aria-expanded`, `closest`, `keydown`, `Escape`, les clés de `detail`,
  `̀-ͯ`) dans le bundle JS de build ;
- les 16 clés de `detail` recalculées à la main avec la même logique que
  `norm()` et comparées aux titres réels des cartes/manuels/applications :
  toutes correspondent.

**Il reste nécessaire de lancer `npm run dev` sur un poste normal et de
contrôler visuellement les points de la checklist du brief** (mega-menu au
survol, menu mobile, sélecteur de niveau, les 17 fiches, la modale, le scroll
d'ancre, le header collant) — cette étape n'a pas pu être faite depuis cet
environnement.
