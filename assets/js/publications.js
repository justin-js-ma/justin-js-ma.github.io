// Publication filters: All / First author / Journal / Conference / Patent
(function () {
  var buttons = document.querySelectorAll('.filter[data-filter]');
  var cards = document.querySelectorAll('.pubcard');
  var groups = document.querySelectorAll('.pub-group');
  function apply(f) {
    cards.forEach(function (c) {
      var show = f === 'all' || (f === 'first' ? c.dataset.first === 'true' : c.dataset.type === f);
      c.hidden = !show;
    });
    document.querySelectorAll('.pub-yeardiv').forEach(function (d) {
      var el = d.nextElementSibling, any = false;
      while (el && !el.classList.contains('pub-yeardiv')) { if (el.classList.contains('pubcard') && !el.hidden) { any = true; break; } el = el.nextElementSibling; }
      d.hidden = !any;
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector('.pubcard:not([hidden])'); });
    buttons.forEach(function (b) { b.classList.toggle('is-active', b.dataset.filter === f); b.setAttribute('aria-pressed', b.dataset.filter === f); });
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { apply(b.dataset.filter); }); });
})();
