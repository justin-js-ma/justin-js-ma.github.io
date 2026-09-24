// Publication filters: All / First author / Journal / Conference
(function () {
  var buttons = document.querySelectorAll('.filter[data-filter]');
  var cards = document.querySelectorAll('.pubcard');
  var groups = document.querySelectorAll('.pub-group');
  function apply(f) {
    cards.forEach(function (c) {
      var show = f === 'all' || (f === 'first' ? c.dataset.first === 'true' : c.dataset.type === f);
      c.hidden = !show;
    });
    groups.forEach(function (g) {
      g.hidden = !g.querySelector('.pubcard:not([hidden])');
    });
    buttons.forEach(function (b) { b.classList.toggle('is-active', b.dataset.filter === f); b.setAttribute('aria-pressed', b.dataset.filter === f); });
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { apply(b.dataset.filter); }); });
})();
