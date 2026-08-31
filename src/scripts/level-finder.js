// Logique d'onglets du selecteur de niveau (LevelFinder.astro) : peint la
// description du niveau choisi a partir de src/data/levels.js.
import { data } from '../data/levels.js';

function paint(k, tabEl) {
  var d = data[k];
  document.getElementById('lvTitle').innerHTML = d.t;
  document.getElementById('lvDesc').innerHTML = d.d;
  document.getElementById('lvMat').textContent = d.m;
  document.getElementById('lvObj').textContent = d.o;
  var panel = document.getElementById('level-panel');
  if (panel && tabEl) panel.setAttribute('aria-labelledby', tabEl.id);
}

function selectTab(tab, tabs) {
  tabs.forEach(function (t) {
    var on = t === tab;
    t.classList.toggle('is-active', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
    t.tabIndex = on ? 0 : -1;
  });
}

function wireTablist(tabs, onSelect) {
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { onSelect(tab); });
    tab.addEventListener('keydown', function (e) {
      var idx = tabs.indexOf(tab), next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(idx + 1) % tabs.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(idx - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        next.focus();
        onSelect(next);
      }
    });
  });
}

// Onglets de cycle (Primaire / Secondaire)
var cycleTabs = [].slice.call(document.querySelectorAll('#cycles .cycle'));
wireTablist(cycleTabs, function (tab) {
  selectTab(tab, cycleTabs);
  var target = tab.getAttribute('data-c');
  [].forEach.call(document.querySelectorAll('.classes-panel'), function (panel) {
    var row = panel.querySelector('.classes');
    var on = row && row.getAttribute('data-c') === target;
    if (on) { panel.removeAttribute('hidden'); } else { panel.setAttribute('hidden', ''); }
  });
  var activeRow = document.querySelector('.classes[data-c="' + target + '"]');
  if (!activeRow) return;
  var klassTabs = [].slice.call(activeRow.querySelectorAll('.klass'));
  var first = klassTabs[0];
  if (first) {
    selectTab(first, klassTabs);
    paint(first.getAttribute('data-k'), first);
  }
});

// Onglets de classe (CP1 a Terminale), un groupe d'onglets par cycle
[].forEach.call(document.querySelectorAll('.classes'), function (row) {
  var klassTabs = [].slice.call(row.querySelectorAll('.klass'));
  wireTablist(klassTabs, function (tab) {
    selectTab(tab, klassTabs);
    paint(tab.getAttribute('data-k'), tab);
  });
});
