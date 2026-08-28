// Indicateur de section courante dans le menu principal, via IntersectionObserver
// (jamais un ecouteur de scroll). L'accueil a plusieurs sections observables
// (#accueil, #services, #centres, #faq, #contact) : chacune est comparee aux
// liens du menu qui pointent vers elle par ancre ("#id"). Une page dediee
// (une seule section, generalement sans id) retombe sur l'observation de
// <main id="contenu"> lui-meme, compare au chemin de la page courante — donc
// le lien "Nos centres" s'allume des qu'on est sur /centres, par exemple.
(function () {
  var navLinks = [].slice.call(document.querySelectorAll('.mainnav > .navitem > a[href]'));
  if (!navLinks.length || !('IntersectionObserver' in window)) return;

  function linksFor(target) {
    var hash = target.id ? '#' + target.id : '';
    return navLinks.filter(function (a) {
      var url;
      try { url = new URL(a.getAttribute('href'), location.href); } catch (e) { return false; }
      if (url.hash) return url.hash === hash;
      return url.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '');
    });
  }

  var targets = [].slice.call(document.querySelectorAll('#contenu > [id]'));
  var main = document.getElementById('contenu');
  if (!targets.length && main) targets = [main];
  if (!targets.length) return;

  // Plusieurs sections peuvent correspondre au meme lien (ex. "Accueil"
  // represente toute la page /, donc chacune de ses sections y correspond).
  // Un lot d'entrees IntersectionObserver contient alors a la fois des
  // sections qui entrent et qui sortent : appliquer les deltas un par un,
  // dans l'ordre du lot, ecraserait l'etat "actif" pose par une entree
  // anterieure du meme lot. On recalcule donc l'etat complet a chaque lot,
  // a partir de l'ensemble des cibles actuellement intersectantes.
  var intersecting = new Set();

  function refresh() {
    var activeLinks = new Set();
    intersecting.forEach(function (target) {
      linksFor(target).forEach(function (a) { activeLinks.add(a); });
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('is-current', activeLinks.has(a));
    });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) intersecting.add(entry.target);
        else intersecting.delete(entry.target);
      });
      refresh();
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  targets.forEach(function (t) { observer.observe(t); });
})();
