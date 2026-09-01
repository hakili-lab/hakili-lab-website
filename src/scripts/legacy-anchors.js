// Des liens vers l'ancien monopage (hakililab.com/#services, partages avant
// le decoupage multipage) peuvent encore circuler (WhatsApp, favoris). Un
// fragment ne se redirige pas cote serveur : on le lit au chargement de
// l'accueil et on renvoie vers la nouvelle route correspondante.
var LEGACY_ANCHORS = {
  '#apropos': '/a-propos',
  '#methode': '/methode',
  '#enseignants': '/enseignants',
  '#services': '/services',
  '#centres': '/centres',
  '#productions': '/manuels',
  '#galerie': '/galerie',
  '#faq': '/faq',
  '#contact': '/contact',
  '#accueil': '/',
};

var target = LEGACY_ANCHORS[window.location.hash];
if (target) {
  window.location.replace(target);
}
