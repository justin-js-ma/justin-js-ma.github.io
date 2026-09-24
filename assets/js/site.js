// Theme toggle (light / dark). Falls back to the OS setting when nothing is saved.
(function () {
  var root = document.documentElement;
  var btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var current = root.getAttribute('data-theme');
    if (!current) {
      current = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();

// Stats: count up when the row scrolls into view.
(function () {
  var row = document.querySelector('[data-stats]');
  if (!row) return;
  var nums = row.querySelectorAll('[data-count]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { row.classList.add('is-in'); return; }
  row.classList.add('is-armed');
  nums.forEach(function (n) { n.textContent = '0'; });
  function run() {
    row.classList.add('is-in');
    nums.forEach(function (n, i) {
      var target = parseInt(n.getAttribute('data-count'), 10), dur = 1500, delay = i * 140, start = null;
      function tick(ts) {
        if (start === null) start = ts + delay;
        var t = Math.min(1, Math.max(0, (ts - start) / dur));
        var e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        n.textContent = Math.round(target * e);
        if (t < 1) requestAnimationFrame(tick); else n.classList.add('done');
      }
      requestAnimationFrame(tick);
    });
  }
  var io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { io.disconnect(); run(); }
  }, { threshold: 0.4 });
  io.observe(row);
})();
