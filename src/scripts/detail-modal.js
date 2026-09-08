// Pilote la fenetre modale partagee du site (la coquille #modal de
// DetailModal.astro, rendue sur toutes les pages par SiteLayout).
//
// Deux usages, une seule mecanique - meme coquille, meme bouton de fermeture,
// meme piege de focus, meme touche Echap :
//   1. la fiche detail au clic sur une carte "En savoir plus", remplie depuis
//      src/data/details.js d'apres le titre normalise de la carte ;
//   2. la video en incrustation au clic sur un element [data-video-id]
//      (la vignette de /a-propos), remplie avec une iframe YouTube.
import { detail } from '../data/details.js';
import { isPlaceholder } from '../lib/placeholders.js';

function norm(s){
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim();
}

var modal=document.getElementById('modal'),
    modalBody=document.getElementById('modalBody'),
    lastFocus=null;

function openDetail(key,title){
  var d=detail[key]; if(!d) return;
  var html='<span class="modal-kicker">'+d.k+'</span><h2 id="modalTitle">'+title+'</h2>'
    +'<p class="modal-intro">'+d.p+'</p><div class="modal-cols"><div><h3>Pour qui</h3><ul>';
  d.who.forEach(function(x){html+='<li>'+x+'</li>'});
  html+='</ul></div><div><h3>Comment cela se passe</h3><ul>';
  d.how.forEach(function(x){html+='<li>'+x+'</li>'});
  html+='</ul></div></div>';
  var realFacts=d.f.filter(function(x){return !isPlaceholder(x[1])});
  if(realFacts.length){
    html+='<div class="modal-facts">';
    realFacts.forEach(function(x){html+='<div class="fact"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>'});
    html+='</div>';
  }
  html+='<div class="modal-actions"><a class="btn btn-green" href="#contact" data-close="1">'+d.cta+'</a>'
    +'<a class="btn btn-outline" href="#contact" data-close="1">Poser une question</a></div>';
  modalBody.innerHTML=html;
  lastFocus=document.activeElement;
  modal.classList.add('is-open');
  document.body.style.overflow='hidden';
  document.getElementById('modalClose').focus();
}

function closeDetail(){
  modal.classList.remove('is-open');
  // Vider la coquille retire l'iframe du document : la video s'arrete pour de
  // bon, au lieu de continuer a jouer derriere un conteneur simplement masque.
  modalBody.innerHTML='';
  document.body.style.overflow='';
  if(lastFocus) lastFocus.focus();
}

document.getElementById('modalClose').addEventListener('click',closeDetail);
modal.addEventListener('click',function(e){
  if(e.target===modal||e.target.getAttribute('data-close')) closeDetail();
});
document.addEventListener('keydown',function(e){
  if(!modal.classList.contains('is-open')) return;
  if(e.key==='Escape'){ closeDetail(); return; }
  if(e.key!=='Tab') return;
  // iframe est inclus pour que les commandes de lecture de la video restent
  // atteignables au clavier sans sortir du piege de focus.
  var focusables=[].filter.call(modal.querySelectorAll('a,button,iframe'),function(el){return el.offsetParent!==null});
  if(!focusables.length) return;
  var first=focusables[0], last=focusables[focusables.length-1];
  if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
});

// Video en incrustation : l'identifiant et le titre viennent du declencheur
// lui-meme (data-video-id / data-video-titre), ecrits une seule fois dans la
// page qui le porte. Ce script n'en connait aucun.
[].forEach.call(document.querySelectorAll('[data-video-id]'),function(btn){
  btn.addEventListener('click',function(){
    var id=btn.getAttribute('data-video-id');
    var titre=btn.getAttribute('data-video-titre')||'Vidéo';
    modalBody.innerHTML='<h2 id="modalTitle">'+titre+'</h2>'
      +'<div class="modal-video"><iframe src="https://www.youtube.com/embed/'
      +encodeURIComponent(id)+'?autoplay=1" title="'+titre+'" '
      +'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" '
      +'allowfullscreen></iframe></div>';
    lastFocus=btn;
    modal.classList.add('is-open');
    document.body.style.overflow='hidden';
    document.getElementById('modalClose').focus();
  });
});

(function(){
  var items=[];
  // Les cartes deja transformees en vrai lien vers une page dediee
  // (ex. les 4 formules promues sur /services) sont exclues : y ajouter un
  // <button> imbriquerait un second controle interactif dans le <a>.
  // h2 (pages dediees) et h3 (accueil) sont acceptes, seule la hierarchie
  // de titres correcte differe d'une page a l'autre.
  function collect(selector){
    [].forEach.call(document.querySelectorAll(selector),function(el){
      if(el.tagName==='A'||el.querySelector('.card-more')) return;
      items.push([el,el.querySelector('h2, h3')]);
    });
  }
  collect('#services .card');
  collect('#productions .book');
  collect('#productions .app');

  items.forEach(function(pair){
    var el=pair[0],h=pair[1]; if(!h) return;
    var key=norm(h.textContent);
    if(!detail[key]) return;
    el.setAttribute('data-detail',key);
    // Le bouton "En savoir plus" est le seul declencheur focusable : certaines
    // cartes (les applications) contiennent deja un vrai <a class="btn">
    // (ex. "Essayer Amira"). Rendre toute la carte role="button" empecherait
    // ce lien d'etre correctement focusable (controles imbriques, invalide en
    // ARIA) - verifie avec axe-core (regle nested-interactive).
    var more=document.createElement('button');
    more.type='button';
    more.className='card-more';
    more.innerHTML='En savoir plus &rarr;';
    more.addEventListener('click',function(e){ e.stopPropagation(); openDetail(key,h.innerHTML); });
    el.appendChild(more);
    el.addEventListener('click',function(e){
      if(e.target.closest('.btn')||e.target.closest('.card-more')) return;
      openDetail(key,h.innerHTML);
    });
  });
})();
