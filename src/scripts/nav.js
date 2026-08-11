  var t=document.getElementById('navToggle'),n=document.getElementById('nav');
  t.addEventListener('click',function(){var o=n.classList.toggle('open');t.setAttribute('aria-expanded',o?'true':'false')});
  n.addEventListener('click',function(e){if(e.target.tagName==='A'&&window.innerWidth<=980){n.classList.remove('open');t.setAttribute('aria-expanded','false')}});
