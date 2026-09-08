# Commentaires sur les articles de blog (Giscus)

> **État : préparé mais pas activé.** Rien n'est visible ni chargé pour les
> visiteurs. Tout ce qui suit décrit ce qui est déjà en place et les quelques
> étapes qui restent le jour où vous voudrez ouvrir les commentaires.

## Pourquoi Giscus

Un système de commentaires classique demande un serveur, une base de données
et de la modération anti-spam. Ce site est un site statique : il est compilé
une fois puis servi tel quel, sans back-end. Ajouter un serveur uniquement
pour les commentaires reviendrait à changer la nature du projet.

[Giscus](https://giscus.app) contourne le problème : les commentaires sont
stockés dans les **GitHub Discussions du dépôt lui-même**. Concrètement :

- **Aucun back-end à héberger ni à maintenir.** Une seule balise `<script>`
  dans la page, le reste se passe chez GitHub.
- **Gratuit**, sans quota ni offre payante à surveiller.
- **Pas de base de données à sauvegarder** : chaque fil de commentaires est
  une discussion GitHub, visible et modérable depuis l'onglet Discussions du
  dépôt, avec les outils GitHub habituels (masquer, verrouiller, supprimer).
- **Pas de traceur publicitaire**, contrairement à la plupart des services de
  commentaires gratuits.

La contrepartie, à connaître avant d'activer : **pour écrire un commentaire,
il faut un compte GitHub**. Lire les commentaires ne demande rien, mais
répondre suppose un compte. Pour un public de parents d'élèves, c'est une
barrière réelle : à mettre en balance avec la simplicité technique.

## Ce qui est déjà prêt

Tout se trouve dans **`src/pages/blog/[slug].astro`**, le gabarit d'un
article, juste après la fin de l'article et avant le pied de page.

Un bloc y est écrit **entièrement en commentaire Astro** (`{/* ... */}`), et
contient déjà :

- la section réservée, `<section class="section" id="commentaires">`, avec le
  titre « Commentaires » ;
- la balise `<script>` de Giscus, avec `data-repo` déjà renseigné à
  `hakili-lab/hakili-lab-website`, `data-mapping="pathname"` (une discussion
  par adresse d'article) et `data-theme="light"` ;
- trois valeurs à remplacer, toutes écrites `A_VOIR_SUR_GISCUS_APP`.

Étant commenté, ce bloc ne produit **aucun HTML** : la page d'un article est
octet pour octet la même qu'avant. Pas de section vide, pas de titre
« Commentaires » orphelin au-dessus du pied de page.

## Ce qu'il reste à faire pour activer

1. **Vérifier que les Discussions sont activées sur le dépôt.**
   Sur GitHub : dépôt `hakili-lab/hakili-lab-website` → **Settings** →
   section **Features** → cocher **Discussions**. Sans cela, giscus.app
   refusera la configuration.

2. **Installer l'application Giscus sur le dépôt.**
   Depuis [github.com/apps/giscus](https://github.com/apps/giscus), donner
   l'accès à ce dépôt uniquement.

3. **Configurer sur [giscus.app](https://giscus.app).**
   Saisir `hakili-lab/hakili-lab-website` dans le champ du dépôt. La page
   confirme que le dépôt est éligible, puis demande :
   - le **mapping** : choisir **« Discussion title contains page pathname »**,
     ce qui correspond au `data-mapping="pathname"` déjà en place ;
   - la **catégorie** de discussion : créer ou choisir une catégorie de type
     **Announcements** (seuls les mainteneurs peuvent y ouvrir un fil, ce qui
     évite que n'importe qui crée des discussions parasites).

4. **Récupérer les vraies valeurs.**
   En bas de giscus.app, un extrait `<script>` est généré. Y lire :
   - `data-repo-id` (commence par `R_`) ;
   - `data-category` (le nom lisible, par exemple `Announcements`) ;
   - `data-category-id` (commence par `DIC_`).

5. **Coller les valeurs et décommenter.**
   Dans `src/pages/blog/[slug].astro`, remplacer les trois
   `A_VOIR_SUR_GISCUS_APP` par ces valeurs, puis retirer la ligne d'ouverture
   du commentaire et sa ligne de fermeture, qui encadrent le bloc.

   Faire les deux dans le même mouvement : décommenter sans les vraies
   valeurs chargerait le script sans qu'il puisse se rattacher à une
   discussion.

6. **Vérifier.**

   ```
   npm run build
   npm run preview
   ```

   Ouvrir un article, par exemple `/blog/aider-enfant-maths-sans-faire-exercices`,
   et confirmer que le cadre Giscus s'affiche sous l'article. Puis :

   ```
   node scripts/verifier-pages.mjs
   ```

   pour vérifier qu'aucun lien mort ni problème d'accessibilité n'apparaît.

## Points à garder en tête

- **Le dépôt doit rester public** pour que les visiteurs puissent lire et
  écrire les commentaires. C'est le cas aujourd'hui.
- **Le thème est figé en clair** (`data-theme="light"`), cohérent avec le
  site. Giscus propose d'autres thèmes si besoin.
- **La modération se fait sur GitHub**, dans l'onglet Discussions du dépôt.
  Prévoir de le surveiller une fois les commentaires ouverts.
- **Un fil par adresse d'article** : renommer le `slug` d'un article déjà
  commenté le détacherait de sa discussion. C'est une raison de plus pour ne
  pas changer le slug d'un article en ligne.
