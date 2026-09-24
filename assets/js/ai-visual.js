// "AI × Electromagnetics" visual: a surrogate-guided search over a design space.
// Particles (candidate designs) swarm over a shifting performance landscape; the
// best candidate drives a radiation pattern in the corner. Purely illustrative.
(function () {
  var canvases = document.querySelectorAll('canvas[data-ai-visual]');
  if (!canvases.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  canvases.forEach(function (cv) { init(cv); });

  function init(cv) {
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, dpr = 1, running = false, raf = 0, t0 = performance.now();
    var compact = cv.hasAttribute('data-compact');
    var peaks = [], parts = [], best = null, iter = 0, epochStart = 0;
    var CYAN = '95,227,255', VIOLET = '139,123,255', AMBER = '255,196,107';

    function rand(a, b) { return a + Math.random() * (b - a); }

    function newLandscape() {
      peaks = [];
      var n = 4;
      for (var i = 0; i < n; i++) peaks.push({ x: rand(0.12, i === 0 ? 0.62 : 0.9), y: rand(0.18, i === 0 ? 0.6 : 0.85), s: rand(0.08, 0.17), a: i === 0 ? 1 : rand(0.35, 0.75), vx: rand(-0.02, 0.02), vy: rand(-0.02, 0.02) });
      parts = [];
      var m = compact ? 18 : 28;
      for (var k = 0; k < m; k++) {
        var p = { x: rand(0.02, 0.98), y: rand(0.02, 0.98), vx: rand(-0.004, 0.004), vy: rand(-0.004, 0.004) };
        p.bx = p.x; p.by = p.y; p.bf = f(p.x, p.y);
        parts.push(p);
      }
      best = parts.reduce(function (a, b) { return a.bf > b.bf ? a : b; });
      best = { x: best.bx, y: best.by, f: best.bf };
      iter = 0;
    }

    function f(x, y) {
      var v = 0;
      for (var i = 0; i < peaks.length; i++) {
        var p = peaks[i], dx = x - p.x, dy = y - p.y;
        v += p.a * Math.exp(-(dx * dx + dy * dy) / (2 * p.s * p.s));
      }
      return v;
    }

    function resize() {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(10, r.width); H = Math.max(10, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function step() {
      iter++;
      for (var i = 0; i < peaks.length; i++) {
        var p = peaks[i];
        p.x += p.vx * 0.02; p.y += p.vy * 0.02;
        if (p.x < 0.1 || p.x > 0.9) p.vx *= -1;
        if (p.y < 0.15 || p.y > 0.85) p.vy *= -1;
      }
      for (var k = 0; k < parts.length; k++) {
        var q = parts[k];
        q.vx = 0.9 * q.vx + 0.004 * Math.random() * (q.bx - q.x) + 0.0045 * Math.random() * (best.x - q.x) + rand(-0.0016, 0.0016);
        q.vy = 0.9 * q.vy + 0.004 * Math.random() * (q.by - q.y) + 0.0045 * Math.random() * (best.y - q.y) + rand(-0.0016, 0.0016);
        q.x = Math.min(0.99, Math.max(0.01, q.x + q.vx));
        q.y = Math.min(0.99, Math.max(0.01, q.y + q.vy));
        var v = f(q.x, q.y);
        if (v > q.bf) { q.bf = v; q.bx = q.x; q.by = q.y; }
        if (v > best.f) { best = { x: q.x, y: q.y, f: v }; }
      }
    }

    function drawField() {
      var g = compact ? 16 : 14;
      for (var x = g / 2; x < W; x += g) {
        for (var y = g / 2; y < H; y += g) {
          var v = f(x / W, y / H);
          var a = Math.min(0.95, 0.12 + v * 0.7);
          ctx.fillStyle = 'rgba(' + (v > 0.7 ? VIOLET : CYAN) + ',' + a.toFixed(3) + ')';
          var r = 0.9 + v * 1.8;
          ctx.fillRect(x - r / 2, y - r / 2, r, r);
        }
      }
    }

    function drawGrid() {
      ctx.strokeStyle = 'rgba(' + CYAN + ',0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var x = 0; x < W; x += 56) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
      for (var y = 0; y < H; y += 56) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
      ctx.stroke();
    }

    function drawParticles() {
      for (var k = 0; k < parts.length; k++) {
        var q = parts[k], px = q.x * W, py = q.y * H;
        ctx.strokeStyle = 'rgba(' + CYAN + ',0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - q.vx * W * 6, py - q.vy * H * 6); ctx.stroke();
        ctx.fillStyle = 'rgba(' + CYAN + ',0.95)';
        ctx.beginPath(); ctx.arc(px, py, 1.8, 0, 6.2832); ctx.fill();
      }
      // links from a few particles to the best
      ctx.strokeStyle = 'rgba(' + VIOLET + ',0.18)';
      ctx.beginPath();
      for (var j = 0; j < parts.length; j += 3) { ctx.moveTo(parts[j].x * W, parts[j].y * H); ctx.lineTo(best.x * W, best.y * H); }
      ctx.stroke();
    }

    function drawReticle(time) {
      var bx = best.x * W, by = best.y * H, r = 12 + 2 * Math.sin(time / 300);
      ctx.strokeStyle = 'rgba(' + AMBER + ',0.95)';
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(bx, by, r, 0, 6.2832); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx - r - 6, by); ctx.lineTo(bx - r + 3, by);
      ctx.moveTo(bx + r - 3, by); ctx.lineTo(bx + r + 6, by);
      ctx.moveTo(bx, by - r - 6); ctx.lineTo(bx, by - r + 3);
      ctx.moveTo(bx, by + r - 3); ctx.lineTo(bx, by + r + 6);
      ctx.stroke();
      ctx.fillStyle = 'rgba(' + AMBER + ',0.95)';
      ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace';
      var label = 'best candidate';
      var lx = bx + r + 8, ly = by - r - 4;
      if (lx + 90 > W || (bx > W * 0.6 && by > H * 0.55)) lx = bx - r - 96;
      if (ly < 14) ly = by + r + 14;
      ctx.fillText(label, lx, ly);
    }

    function drawPattern(time) {
      var R = compact ? 34 : 46, cx = W - R - 16, cy = H - R - 16;
      ctx.fillStyle = 'rgba(5,8,16,0.72)';
      ctx.beginPath(); ctx.arc(cx, cy, R + 8, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = 'rgba(' + CYAN + ',0.18)';
      ctx.lineWidth = 1;
      for (var k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(cx, cy, R * k / 3, 0, 6.2832); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
      var steer = (best.x - 0.5) * 1.6, n = 4 + best.f * 10;
      ctx.strokeStyle = 'rgba(' + AMBER + ',0.95)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var a = 0; a <= 6.2832 + 0.01; a += 0.04) {
        var d = a - (-Math.PI / 2 + steer);
        var main = Math.pow(Math.max(0, Math.cos(d)), n);
        var side = 0.18 * Math.abs(Math.sin(3 * d)) * (1 - main);
        var rr = R * Math.min(1, main + side);
        var x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
        if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = 'rgba(' + AMBER + ',0.10)'; ctx.fill();
      ctx.fillStyle = 'rgba(' + CYAN + ',0.7)';
      ctx.font = '500 9.5px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillText('pattern', cx - R, cy - R - 6);
    }

    function drawHud(time) {
      ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = 'rgba(' + CYAN + ',0.8)';
      ctx.fillText('SURROGATE-GUIDED SEARCH', 14, 20);
      ctx.fillStyle = 'rgba(' + CYAN + ',0.45)';
      var it = ('00' + (iter % 1000)).slice(-3);
      ctx.fillText('iter ' + it + '   objective ▲', 14, 34);
      // scanline
      var sy = (time / 18) % (H + 40) - 20;
      var grd = ctx.createLinearGradient(0, sy - 20, 0, sy + 2);
      grd.addColorStop(0, 'rgba(' + CYAN + ',0)');
      grd.addColorStop(1, 'rgba(' + CYAN + ',0.05)');
      ctx.fillStyle = grd; ctx.fillRect(0, sy - 20, W, 22);
    }

    function frame(now) {
      if (!running) return;
      var time = now - t0;
      if (time - epochStart > 11000) { newLandscape(); epochStart = time; }
      step();
      ctx.fillStyle = 'rgba(5,8,16,0.55)';
      ctx.fillRect(0, 0, W, H);
      drawGrid(); drawField(); drawParticles(); drawReticle(time); drawPattern(time); drawHud(time);
      raf = requestAnimationFrame(frame);
    }

    function still() {
      ctx.fillStyle = '#05080f'; ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < 160; i++) step();
      drawGrid(); drawField(); drawParticles(); drawReticle(0); drawPattern(0); drawHud(0);
    }

    resize(); newLandscape();
    ctx.fillStyle = '#05080f'; ctx.fillRect(0, 0, W, H);
    if (reduce) { still(); }
    window.addEventListener('resize', function () { resize(); if (reduce || !running) still(); });

    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(frame); }
          else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
        });
      }, { threshold: 0.05 }).observe(cv);
    } else if (!reduce) { running = true; raf = requestAnimationFrame(frame); }
  }
})();
