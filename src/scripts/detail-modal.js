import { detail } from '../data/details.js';

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
  html+='</ul></div></div><div class="modal-facts">';
  d.f.forEach(function(x){html+='<div class="fact"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>'});
  html+='</div><div class="modal-actions"><a class="btn btn-green" href="#contact" data-close="1">'+d.cta+'</a>'
    +'<a class="btn btn-outline" href="#contact" data-close="1">Poser une question</a></div>';
  modalBody.innerHTML=html;
  lastFocus=document.activeElement;
  modal.classList.add('is-open');
  document.body.style.overflow='hidden';
  document.getElementById('modalClose').focus();
}

function closeDetail(){
  modal.classList.remove('is-open');
  document.body.style.overflow='';
  if(lastFocus) lastFocus.focus();
}

document.getElementById('modalClose').addEventListener('click',closeDetail);
modal.addEventListener('click',function(e){
  if(e.target===modal||e.target.getAttribute('data-close')) closeDetail();
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('is-open')) closeDetail()});

(function(){
  var items=[];
  [].forEach.call(document.querySelectorAll('#services .card'),function(el){items.push([el,el.querySelector('h3')])});
  [].forEach.call(document.querySelectorAll('#productions .book'),function(el){items.push([el,el.querySelector('h3')])});
  [].forEach.call(document.querySelectorAll('#productions .app'),function(el){items.push([el,el.querySelector('h3')])});

  items.forEach(function(pair){
    var el=pair[0],h=pair[1]; if(!h) return;
    var key=norm(h.textContent);
    if(!detail[key]) return;
    el.setAttribute('data-detail',key);
    el.setAttribute('tabindex','0');
    el.setAttribute('role','button');
    var more=document.createElement('span');
    more.className='card-more';
    more.innerHTML='En savoir plus &rarr;';
    el.appendChild(more);
    function fire(e){
      if(e.target.closest('.btn')) return;
      openDetail(key,h.innerHTML);
    }
    el.addEventListener('click',fire);
    el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fire(e)}});
  });
})();
