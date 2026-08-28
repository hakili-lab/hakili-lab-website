// Galerie condensee : les vignettes au-dela des premieres restent visibles
// tant que ce script n'a pas tourne (jamais de contenu perdu sans JS). Ici,
// on les cache et on revele le bouton "Voir plus" qui les affiche toutes.
var galleryGrid = document.getElementById('galleryGrid');
var galleryMore = document.getElementById('galleryMore');
if (galleryGrid && galleryMore) {
  galleryGrid.classList.add('is-collapsed');
  galleryMore.hidden = false;
  galleryMore.addEventListener('click', function () {
    galleryGrid.classList.remove('is-collapsed');
    galleryMore.hidden = true;
  });
}

var dataEl = document.getElementById('galleryData');
if (dataEl) {
  var photos = JSON.parse(dataEl.textContent);
  var lightbox = document.getElementById('lightbox');
  var img = document.getElementById('lightboxImg');
  var count = document.getElementById('lightboxCount');
  var current = 0;
  var lastFocus = null;

  function show(i) {
    current = (i + photos.length) % photos.length;
    var p = photos[current];
    img.src = p.src;
    img.alt = p.alt;
    count.textContent = (current + 1) + ' / ' + photos.length;
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('lightboxBack').focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  [].forEach.call(document.querySelectorAll('.gallery-trigger'), function (btn, i) {
    btn.addEventListener('click', function () {
      open(i);
    });
  });

  document.getElementById('lightboxBack').addEventListener('click', close);
  document.getElementById('lightboxPrev').addEventListener('click', function () {
    show(current - 1);
  });
  document.getElementById('lightboxNext').addEventListener('click', function () {
    show(current + 1);
  });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowLeft') { show(current - 1); return; }
    if (e.key === 'ArrowRight') { show(current + 1); return; }
    if (e.key !== 'Tab') return;
    var focusables = [].filter.call(lightbox.querySelectorAll('a,button'), function (el) { return el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
}
