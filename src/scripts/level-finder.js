import { data } from '../data/levels.js';

  function paint(k){
    var d=data[k];
    document.getElementById('lvTitle').innerHTML=d.t;
    document.getElementById('lvDesc').innerHTML=d.d;
    document.getElementById('lvMat').textContent=d.m;
    document.getElementById('lvObj').textContent=d.o;
  }

  document.getElementById('cycles').addEventListener('click',function(e){
    var b=e.target.closest('.cycle'); if(!b) return;
    [].forEach.call(this.querySelectorAll('.cycle'),function(x){x.classList.remove('is-active')});
    b.classList.add('is-active');
    var active=null;
    [].forEach.call(document.querySelectorAll('.classes'),function(r){
      var on=r.getAttribute('data-c')===b.getAttribute('data-c');
      if(on){r.classList.add('is-shown');active=r}else{r.classList.remove('is-shown')}
    });
    if(!active) return;
    var first=active.querySelector('.klass');
    [].forEach.call(active.querySelectorAll('.klass'),function(x){x.classList.remove('is-active')});
    first.classList.add('is-active');
    paint(first.getAttribute('data-k'));
  });

  [].forEach.call(document.querySelectorAll('.classes'),function(row){
    row.addEventListener('click',function(e){
      var b=e.target.closest('.klass'); if(!b) return;
      [].forEach.call(this.querySelectorAll('.klass'),function(x){x.classList.remove('is-active')});
      b.classList.add('is-active');
      paint(b.getAttribute('data-k'));
    });
  });
