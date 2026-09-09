// Indicateur de page (et de section) courante dans le menu principal.
//
// Deux besoins distincts, donc deux mecanismes distincts :
//
//   1. La PAGE courante. Le lien du menu dont le chemin est celui de la page
//      affichee est actif en permanence : des le chargement, quel que soit le
//      defilement, et sans dependre d'IntersectionObserver. C'est un simple
//      rapprochement d'URL — la page ou l'on se trouve ne change pas selon
//      l'endroit ou l'on a defile.
//
//   2. La SECTION courante, pour un lien du menu qui pointerait vers une
//      ancre de la page affichee (par exemple href="/#contact" quand on est
//      deja sur l'accueil). La, et la seulement, un IntersectionObserver suit
//      la section correspondante. Aucun lien du menu n'utilise d'ancre
//      aujourd'hui : ce second mecanisme ne s'installe donc pas, mais il
//      reste pret si le menu en reintroduit un.
//
// Pourquoi cette separation — les deux etaient auparavant confondus dans un
// seul observateur, dont les cibles etaient tous les enfants directs de
// #contenu portant un id. Deux pages y perdaient leur soulignement :
//
//   - /galerie : ses seuls enfants directs porteurs d'un id sont la fenetre
//     d'agrandissement (attribut `hidden`) et un <script> de donnees. Deux
//     elements de hauteur nulle, qui n'entrent jamais dans le champ de
//     l'observateur — et comme la liste de cibles n'etait pas vide, le repli
//     sur #contenu (toute la page) ne se declenchait pas non plus. Aucun lien
//     ne s'allumait donc jamais.
//
//   - /a-propos : son seul enfant direct porteur d'un id est la section
//     teaser « valeurs », trop courte et trop basse dans la page pour croiser
//     la bande d'observation au fil d'une lecture normale.
//
// Les autres pages fonctionnaient par chance : ou bien elles n'avaient aucun
// id de premier niveau (repli sur #contenu, qui couvre toute la page), ou
// bien leur section portant un id occupait presque toute la hauteur.
(function () {
  var navLinks = [].slice.call(document.querySelectorAll('.mainnav > .navitem > a[href]'));
  if (!navLinks.length) return;

  function urlDuLien(a) {
    try {
      return new URL(a.getAttribute('href'), location.href);
    } catch (e) {
      return null;
    }
  }

  // "/galerie" et "/galerie/" designent la meme page : Astro sert les pages
  // dans un dossier (barre oblique finale) alors que le menu ecrit les liens
  // sans, et l'inverse peut arriver aussi.
  function memeChemin(a, b) {
    return a.replace(/\/+$/, '') === b.replace(/\/+$/, '');
  }

  var liens = navLinks.map(function (a) {
    var url = urlDuLien(a);
    var surLaPage = !!url && memeChemin(url.pathname, location.pathname);
    return {
      element: a,
      // Lien vers la page affichee elle-meme : actif en permanence.
      pageCourante: surLaPage && !url.hash,
      // Lien vers une ancre de la page affichee : actif seulement quand la
      // section correspondante est en vue.
      ancre: surLaPage && url.hash ? url.hash : '',
    };
  });

  var ancresEnVue = {};

  function appliquer() {
    liens.forEach(function (lien) {
      var actif = lien.pageCourante || (lien.ancre && ancresEnVue[lien.ancre] === true);
      lien.element.classList.toggle('is-current', !!actif);
    });
  }

  // Pose immediatement l'etat de la page courante, avant tout defilement et
  // sans attendre quoi que ce soit.
  appliquer();

  var liensAncre = liens.filter(function (lien) {
    return lien.ancre;
  });
  if (!liensAncre.length || !('IntersectionObserver' in window)) return;

  // Seules les sections reellement visees par un lien du menu sont observees.
  // Un element decoratif, masque ou de hauteur nulle qui porterait un id ne
  // peut donc plus perturber l'indicateur.
  var cibles = [];
  liensAncre.forEach(function (lien) {
    var element = null;
    try {
      element = document.getElementById(decodeURIComponent(lien.ancre.slice(1)));
    } catch (e) {
      element = null;
    }
    if (element && cibles.indexOf(element) === -1) cibles.push(element);
  });
  if (!cibles.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        ancresEnVue['#' + entry.target.id] = entry.isIntersecting;
      });
      appliquer();
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  cibles.forEach(function (cible) {
    observer.observe(cible);
  });
})();
