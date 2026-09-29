// Art page: play videos only while visible; one with sound at a time.
(function () {
  var vids = document.querySelectorAll('.art-media video');
  if (!vids.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else { v.pause(); }
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { io.observe(v); });
  }
  vids.forEach(function (v) {
    v.addEventListener('volumechange', function () {
      if (!v.muted) vids.forEach(function (o) { if (o !== v) o.muted = true; });
    });
  });
})();
