// Revelation sobre au defilement : fondu + translation verticale de 12px sur
// les titres de section et les grilles de cartes uniquement. Rien sur le
// hero ni sur les boutons d'action.
//
// Securite : sans JavaScript (ou si ce script echoue), rien n'est jamais
// masque - la classe "reveal-ready" (seule chose qui active le
// opacity:0 initial en CSS) n'est ajoutee qu'ici, apres verification de
// prefers-reduced-motion et de la disponibilite d'IntersectionObserver.
// L'etat CSS par defaut, sans cette classe, est "visible".
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion && 'IntersectionObserver' in window) {
  var targets = [].slice.call(document.querySelectorAll('.section h2, .cards-3, .cards-4, .centres, .books, .apps'));

  if (targets.length) {
    targets.forEach(function (el) { el.classList.add('reveal'); });
    document.documentElement.classList.add('reveal-ready');

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }
}
