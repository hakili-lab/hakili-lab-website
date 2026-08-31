// Diaporama en fondu du bandeau d'accueil (Hero.astro) : clone les <template>
// data-hero-slide dans le DOM puis fait tourner .is-active toutes les
// DURATION ms. Rien ne bouge sans JS ni avec prefers-reduced-motion.
var DURATION = 4000; // doit rester synchronisé avec la transition de .hero-media img (hero.css)
var media = document.querySelector('.hero-media');

if (media) {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var templates = [].slice.call(media.querySelectorAll('template[data-hero-slide]'));

  function hydrateSlides() {
    [].forEach.call(templates, function (tpl) {
      media.insertBefore(tpl.content.cloneNode(true), tpl);
      tpl.parentNode.removeChild(tpl);
    });
    runSlideshow();
  }

  function isReady(img) {
    return img.complete && img.naturalWidth > 0;
  }

  function runSlideshow() {
    var slides = [].slice.call(media.querySelectorAll('img'));
    if (slides.length < 2 || reduceMotion) return;

    var index = 0;
    var timer = null;
    var running = false;
    var pendingImg = null;

    function onPendingReady() {
      pendingImg.removeEventListener('load', onPendingReady);
      pendingImg.removeEventListener('error', onPendingReady);
      pendingImg = null;
      transition();
    }

    function transition() {
      var next = (index + 1) % slides.length;
      slides[index].classList.remove('is-active');
      index = next;
      slides[index].classList.add('is-active');
      if (running) timer = setTimeout(tick, DURATION);
    }

    function tick() {
      var img = slides[(index + 1) % slides.length];
      if (isReady(img)) {
        transition();
        return;
      }
      // pas encore prête à l'échéance : on reporte le fondu jusqu'à son chargement
      pendingImg = img;
      pendingImg.addEventListener('load', onPendingReady);
      pendingImg.addEventListener('error', onPendingReady);
    }

    function start() {
      if (running) return;
      running = true;
      timer = setTimeout(tick, DURATION);
    }

    function stop() {
      running = false;
      clearTimeout(timer);
      timer = null;
      if (pendingImg) {
        pendingImg.removeEventListener('load', onPendingReady);
        pendingImg.removeEventListener('error', onPendingReady);
        pendingImg = null;
      }
    }

    var hero = media.closest('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    start();
  }

  if (!templates.length || reduceMotion) {
    if (!reduceMotion) runSlideshow();
  } else if (document.readyState === 'complete') {
    hydrateSlides();
  } else {
    window.addEventListener('load', hydrateSlides);
  }
}
