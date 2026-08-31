// Menu mobile (Header.astro) : ouverture/fermeture du panneau et de son
// bouton hamburger, fermeture au clic exterieur ou sur Echap.
var toggle = document.getElementById('navToggle'), nav = document.getElementById('nav');

function isMobileMenuOpen() { return nav.classList.contains('open'); }

function closeMobileMenu() {
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}

function openMobileMenu() {
  nav.classList.add('open');
  toggle.setAttribute('aria-expanded', 'true');
}

toggle.addEventListener('click', function () {
  if (isMobileMenuOpen()) { closeMobileMenu(); } else { openMobileMenu(); }
});

nav.addEventListener('click', function (e) {
  if (e.target.tagName === 'A' && window.innerWidth <= 980) { closeMobileMenu(); }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && isMobileMenuOpen()) {
    closeMobileMenu();
    toggle.focus();
  }
});

// Piege le focus dans le menu mobile tant qu'il est ouvert (Tab / Shift+Tab)
nav.addEventListener('keydown', function (e) {
  if (e.key !== 'Tab' || !isMobileMenuOpen() || window.innerWidth > 980) return;
  var focusables = [].filter.call(nav.querySelectorAll('a,button'), function (el) {
    return el.offsetParent !== null;
  });
  if (!focusables.length) return;
  var first = focusables[0], last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

// Sous-menus desktop (A propos, Services, Productions) : synchronise aria-expanded
[].forEach.call(document.querySelectorAll('.navitem'), function (item) {
  var trigger = item.querySelector('a'), submenu = item.querySelector('.submenu');
  if (!trigger || !submenu) return;
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-haspopup', 'true');
  function open() { trigger.setAttribute('aria-expanded', 'true'); }
  function close() { trigger.setAttribute('aria-expanded', 'false'); }
  item.addEventListener('mouseenter', open);
  item.addEventListener('mouseleave', close);
  item.addEventListener('focusin', open);
  item.addEventListener('focusout', function (e) {
    if (!item.contains(e.relatedTarget)) close();
  });
});
