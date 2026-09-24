// Research "screens": small animated, illustrative scenes for each research area.
// Usage: <canvas data-scene="mmwave|lc|optics|print|pattern|meta|health"></canvas>
(function () {
  var list = document.querySelectorAll('canvas[data-scene]');
  if (!list.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CY = '95,227,255', VI = '150,132,255', AM = '255,196,107', PK = '255,122,180', GR = '120,240,190';
  var MONO = '500 10px "JetBrains Mono", ui-monospace, monospace';
  function rgba(c, a) { return 'rgba(' + c + ',' + a + ')'; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }

  function bg(c, W, H) {
    c.fillStyle = '#060912'; c.fillRect(0, 0, W, H);
    c.strokeStyle = rgba(CY, 0.055); c.lineWidth = 1; c.beginPath();
    for (var x = 0; x < W; x += 22) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, H); }
    for (var y = 0; y < H; y += 22) { c.moveTo(0, y + 0.5); c.lineTo(W, y + 0.5); }
    c.stroke();
    var g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(6,9,18,0)'); g.addColorStop(1, 'rgba(3,5,10,0.75)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  function hud(c, W, H, title, read, t) {
    c.font = MONO; c.textBaseline = 'alphabetic';
    c.fillStyle = rgba(CY, 0.9); c.fillText(title, 12, 18);
    if (read) { c.fillStyle = rgba(CY, 0.55); var w = c.measureText(read).width; c.fillText(read, W - w - 12, H - 10); }
    var blink = (Math.floor(t / 600) % 2) ? 0.9 : 0.25;
    c.fillStyle = rgba(GR, blink); c.beginPath(); c.arc(W - 16, 14, 2.6, 0, 6.283); c.fill();
    var sy = (t / 22) % (H + 30) - 15, s = c.createLinearGradient(0, sy - 16, 0, sy);
    s.addColorStop(0, rgba(CY, 0)); s.addColorStop(1, rgba(CY, 0.05)); c.fillStyle = s; c.fillRect(0, sy - 16, W, 16);
  }
  function rod(c, x, y, a, L, col, w) {
    var dx = Math.cos(a) * L / 2, dy = Math.sin(a) * L / 2;
    c.strokeStyle = col; c.lineWidth = w || 2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - dx, y - dy); c.lineTo(x + dx, y + dy); c.stroke();
  }
  function glow(c, col, b) { c.shadowColor = col; c.shadowBlur = b; }
  function noGlow(c) { c.shadowBlur = 0; }

  // ---- scenes ----------------------------------------------------------------
  var scenes = {
    // Liquid-crystal director field switching under an applied field
    lc: function (c, W, H, t) {
      bg(c, W, H);
      var top = 30, bot = H - 22, nx = Math.round(W / 22), ny = 6, avg = 0;
      for (var i = 0; i < nx; i++) {
        var x = 16 + i * (W - 32) / (nx - 1);
        var on = smooth(0.5 + 0.9 * Math.sin(t / 1400 - (x / W) * 3.2));
        avg += on / nx;
        for (var j = 0; j < ny; j++) {
          var y = top + 8 + j * (bot - top - 16) / (ny - 1);
          var edge = Math.sin(Math.PI * (j + 0.5) / ny);
          var a = on * edge * (Math.PI / 2) + 0.05 * Math.sin(t / 500 + i + j);
          var col = 'rgb(' + Math.round(95 + 55 * on) + ',' + Math.round(227 - 95 * on) + ',255)';
          rod(c, x, y, a, 11, col, 2.2);
        }
      }
      glow(c, rgba(CY, 0.9), 10 * avg);
      c.strokeStyle = rgba(CY, 0.35 + 0.55 * avg); c.lineWidth = 2;
      c.beginPath(); c.moveTo(10, top); c.lineTo(W - 10, top); c.moveTo(10, bot); c.lineTo(W - 10, bot); c.stroke(); noGlow(c);
      hud(c, W, H, 'LC DIRECTOR FIELD', avg > 0.5 ? 'E-field  ON ▲' : 'E-field  OFF ▽', t);
    },

    // Light through a tunable LC cell: transmission and colour modulate
    optics: function (c, W, H, t) {
      bg(c, W, H);
      var cx = W * 0.5, cw = 26, top = 30, bot = H - 40, m = 0.5 + 0.5 * Math.sin(t / 1300);
      var rays = 7;
      for (var k = 0; k < rays; k++) {
        var y = top + 8 + k * (bot - top - 16) / (rays - 1);
        var hue = 190 + 150 * (k / (rays - 1));
        c.strokeStyle = 'hsla(' + hue + ',95%,65%,0.9)'; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(8, y); c.lineTo(cx - cw / 2, y); c.stroke();
        var pass = clamp(m * (0.35 + 0.65 * Math.sin(Math.PI * (k + m * 3) / rays) ** 2), 0.05, 1);
        c.strokeStyle = 'hsla(' + (hue + 60 * m) + ',95%,65%,' + pass.toFixed(2) + ')';
        glow(c, 'hsla(' + (hue + 60 * m) + ',95%,65%,0.9)', 8 * pass);
        c.beginPath(); c.moveTo(cx + cw / 2, y); c.lineTo(W - 8, y); c.stroke(); noGlow(c);
        var ph = ((t / 6 + k * 20) % (W / 2 - cw)) ;
        c.fillStyle = 'hsla(' + hue + ',95%,75%,0.9)'; c.fillRect(8 + ph, y - 1.2, 3, 2.4);
      }
      c.fillStyle = rgba(VI, 0.12); c.fillRect(cx - cw / 2, top, cw, bot - top);
      c.strokeStyle = rgba(VI, 0.6); c.lineWidth = 1; c.strokeRect(cx - cw / 2 + 0.5, top + 0.5, cw - 1, bot - top - 1);
      for (var r = 0; r < 7; r++) rod(c, cx, top + 8 + r * (bot - top - 16) / 6, m * Math.PI / 2 + r * 0.25, 12, rgba(VI, 0.95), 2);
      // T(λ) strip
      var sy = H - 24, sx0 = 12, sx1 = W - 110;
      c.strokeStyle = rgba(CY, 0.25); c.beginPath(); c.moveTo(sx0, sy); c.lineTo(sx1, sy); c.stroke();
      c.strokeStyle = rgba(AM, 0.95); c.lineWidth = 1.5; c.beginPath();
      for (var x = sx0; x <= sx1; x += 3) {
        var u = (x - sx0) / (sx1 - sx0);
        var v = 0.15 + 0.8 * Math.exp(-Math.pow((u - (0.25 + 0.5 * m)) / 0.16, 2));
        var yy = sy - v * 14; if (x === sx0) c.moveTo(x, yy); else c.lineTo(x, yy);
      }
      c.stroke();
      hud(c, W, H, 'TUNABLE TRANSMISSION', 'T(λ) · 400–700 nm', t);
    },

    // Phased array: LC phase shifters steer the beam
    mmwave: function (c, W, H, t) {
      bg(c, W, H);
      var n = 8, by = H - 26, span = Math.min(W * 0.62, 240), x0 = W / 2 - span / 2, th = 0.62 * Math.sin(t / 2200);
      var ox = W / 2, oy = by;
      // wavefronts
      for (var k = 0; k < 7; k++) {
        var d = ((t / 14) + k * 26) % 182;
        var a = 1 - d / 182;
        var nx = Math.sin(th), ny = -Math.cos(th);
        var px = ox + nx * d, py = oy + ny * d, hw = span * 0.62;
        c.strokeStyle = rgba(CY, 0.7 * a); c.lineWidth = 1.6;
        glow(c, rgba(CY, 0.9), 6 * a);
        c.beginPath(); c.moveTo(px - ny * hw, py + nx * hw); c.lineTo(px + ny * hw, py - nx * hw); c.stroke(); noGlow(c);
      }
      // beam lobe
      c.fillStyle = rgba(AM, 0.10); c.strokeStyle = rgba(AM, 0.9); c.lineWidth = 1.4; c.beginPath();
      for (var s = -1.2; s <= 1.2; s += 0.03) {
        var ang = th + s, g = Math.pow(Math.max(0, Math.cos(s * 1.6)), 10), r = 118 * g;
        var X = ox + Math.sin(ang) * r, Y = oy - Math.cos(ang) * r;
        if (s <= -1.19) c.moveTo(X, Y); else c.lineTo(X, Y);
      }
      c.closePath(); c.fill(); c.stroke();
      // elements with phase bars
      for (var i = 0; i < n; i++) {
        var ex = x0 + i * span / (n - 1), phase = ((i * th * 3.2) % 1 + 1) % 1;
        c.fillStyle = rgba(VI, 0.9); c.fillRect(ex - 6, by, 12, 4);
        c.fillStyle = rgba(CY, 0.25); c.fillRect(ex - 2, by + 6, 4, 14);
        c.fillStyle = rgba(CY, 0.95); c.fillRect(ex - 2, by + 20 - 14 * phase, 4, 14 * phase);
      }
      var deg = Math.round(th * 180 / Math.PI);
      hud(c, W, H, 'LC PHASED ARRAY', 'θ = ' + (deg >= 0 ? '+' : '') + deg + '°', t);
    },

    // Drop-on-demand printing: head drops droplets that build a pixel pattern
    print: function (c, W, H, t, st) {
      bg(c, W, H);
      var cols = Math.max(10, Math.floor((W - 30) / 16)), rows = 4, gx = (W - (cols - 1) * 16) / 2, gy = H - 34 - (rows - 1) * 16;
      var cycle = 9000, tt = t % cycle, total = cols * rows, placed = Math.floor(smooth(tt / (cycle * 0.8)) * total);
      var pal = [CY, VI, AM, PK];
      for (var q = 0; q < placed; q++) {
        var r = Math.floor(q / cols), col = r % 2 ? cols - 1 - (q % cols) : q % cols;
        var x = gx + col * 16, y = gy + r * 16, ci = (col * 7 + r * 3) % 4;
        var fade = tt > cycle * 0.88 ? 1 - (tt - cycle * 0.88) / (cycle * 0.12) : 1;
        c.fillStyle = rgba(pal[ci], 0.85 * fade); glow(c, rgba(pal[ci], 0.8), 6);
        c.beginPath(); c.arc(x, y, 5.2, 0, 6.283); c.fill(); noGlow(c);
        rod(c, x, y, (col + r) * 0.6 + t / 1600, 6, rgba('255,255,255', 0.55 * fade), 1.2);
      }
      var nxt = Math.min(placed, total - 1), rr = Math.floor(nxt / cols), cc = rr % 2 ? cols - 1 - (nxt % cols) : nxt % cols;
      var hx = gx + cc * 16, hy = 34;
      c.fillStyle = rgba(CY, 0.18); c.fillRect(hx - 16, hy - 12, 32, 12);
      c.strokeStyle = rgba(CY, 0.9); c.lineWidth = 1.2; c.strokeRect(hx - 16 + 0.5, hy - 12 + 0.5, 31, 11);
      c.beginPath(); c.moveTo(hx - 4, hy); c.lineTo(hx, hy + 5); c.lineTo(hx + 4, hy); c.stroke();
      var fall = ((t % 260) / 260), dy = hy + 6 + fall * (gy + rr * 16 - hy - 10);
      c.fillStyle = rgba(pal[(cc * 7 + rr * 3) % 4], 0.95); c.beginPath(); c.arc(hx, dy, 2.6, 0, 6.283); c.fill();
      hud(c, W, H, 'DROP-ON-DEMAND', 'drop ' + ('00' + placed).slice(-3) + ' / ' + total, t);
    },

    // mm-to-µm patterning: zooming into patterned LC domains
    pattern: function (c, W, H, t) {
      bg(c, W, H);
      var z = 1 + 3 * smooth(0.5 + 0.5 * Math.sin(t / 2600)), cx = W / 2, cy = H / 2 + 4, band = 30 * z;
      c.save(); c.beginPath(); c.rect(10, 26, W - 20, H - 40); c.clip();
      for (var i = -12; i < 12; i++) {
        var bx = cx + i * band - ((t / 40) % band);
        if (i % 2 === 0) { c.fillStyle = rgba(VI, 0.10); c.fillRect(bx, 26, band, H - 40); }
        var step = Math.max(9, 9 * z * 0.7);
        for (var y = 34; y < H - 14; y += step) {
          for (var x = bx + step / 2; x < bx + band; x += step) {
            var a = i % 2 === 0 ? Math.PI / 2 : 0.1 * Math.sin(y / 20 + t / 800);
            rod(c, x, y, a, Math.min(14, 5 + 2 * z), i % 2 === 0 ? rgba(VI, 0.9) : rgba(CY, 0.9), 1.8);
          }
        }
      }
      c.restore();
      c.strokeStyle = rgba(AM, 0.95); c.lineWidth = 1.2; var R = 22;
      c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.stroke();
      c.beginPath(); c.moveTo(cx - R - 6, cy); c.lineTo(cx - R + 4, cy); c.moveTo(cx + R - 4, cy); c.lineTo(cx + R + 6, cy); c.stroke();
      var um = Math.round(1000 / z / 10) * 10, lab = um >= 1000 ? '1 mm' : um + ' µm';
      c.fillStyle = rgba(AM, 0.95); c.fillRect(12, H - 12, 40, 2); c.font = MONO; c.fillText(lab, 58, H - 8);
      hud(c, W, H, 'mm → µm PATTERNING', 'zoom ×' + z.toFixed(1), t);
    },

    // Metasurface: phase-gradient elements deflect an incoming beam
    meta: function (c, W, H, t) {
      bg(c, W, H);
      var n = Math.max(12, Math.floor((W - 30) / 12)), my = H * 0.56, x0 = (W - (n - 1) * 12) / 2;
      var grad = 0.5 + 0.5 * Math.sin(t / 2000), period = 3 + Math.round(grad * 5);
      for (var i = 0; i < n; i++) {
        var ph = (i % period) / period, h = 6 + 26 * ph, x = x0 + i * 12;
        c.fillStyle = rgba(VI, 0.35 + 0.6 * ph); c.fillRect(x - 3, my - h, 6, h);
      }
      c.fillStyle = rgba(CY, 0.35); c.fillRect(x0 - 8, my, (n - 1) * 12 + 16, 3);
      // incoming rays
      for (var k = 0; k < 6; k++) {
        var rx = W * 0.25 + k * 14, d = ((t / 9 + k * 17) % 60) / 60;
        c.strokeStyle = rgba(CY, 0.5); c.lineWidth = 1.2; c.beginPath(); c.moveTo(rx - 40, 26); c.lineTo(rx, my - 30); c.stroke();
        c.fillStyle = rgba(CY, 0.95); c.fillRect(rx - 40 + 40 * d - 1.5, 26 + (my - 56) * d - 1.5, 3, 3);
      }
      // deflected rays (anomalous angle depends on gradient)
      var ang = 0.2 + 0.9 * (1 - (period - 3) / 5);
      for (var k2 = 0; k2 < 6; k2++) {
        var sx = W * 0.25 + k2 * 14;
        var ex = sx + Math.sin(ang) * 140, ey = my - 30 - Math.cos(ang) * 140 * 0.55;
        c.strokeStyle = rgba(AM, 0.8); glow(c, rgba(AM, 0.8), 6);
        c.beginPath(); c.moveTo(sx, my - 30); c.lineTo(ex, ey); c.stroke(); noGlow(c);
      }
      hud(c, W, H, 'METASURFACE φ(x)', 'period ' + period + ' cells', t);
    },

    // Flexible, skin-conformal sensing (vision): bending film + scrolling signal
    health: function (c, W, H, t) {
      bg(c, W, H);
      var base = H * 0.5;
      for (var L = 0; L < 5; L++) {
        c.strokeStyle = rgba(CY, 0.22 + L * 0.14); c.lineWidth = 1.3; c.beginPath();
        for (var x = 10; x <= W - 10; x += 4) {
          var y = base - 18 + L * 7 + 10 * Math.sin(x / 38 + t / 700 + L * 0.2);
          if (x === 10) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
      }
      for (var s = 0; s < 5; s++) {
        var sx = 30 + s * (W - 60) / 4, sy = base + 10 + 10 * Math.sin(sx / 38 + t / 700 + 0.8);
        var p = 0.5 + 0.5 * Math.sin(t / 300 + s);
        glow(c, rgba(GR, 0.9), 10 * p); c.fillStyle = rgba(GR, 0.5 + 0.5 * p);
        c.beginPath(); c.arc(sx, sy, 3.2, 0, 6.283); c.fill(); noGlow(c);
      }
      var yb = H - 22; c.strokeStyle = rgba(AM, 0.95); c.lineWidth = 1.5; c.beginPath();
      for (var x2 = 10; x2 <= W - 10; x2 += 2) {
        var u = ((x2 + t / 8) % 90) / 90, v = 0;
        if (u > 0.40 && u < 0.44) v = -12 * Math.sin((u - 0.40) / 0.04 * Math.PI);
        else if (u > 0.44 && u < 0.48) v = 6 * Math.sin((u - 0.44) / 0.04 * Math.PI);
        else v = 1.5 * Math.sin(u * 20);
        if (x2 === 10) c.moveTo(x2, yb + v); else c.lineTo(x2, yb + v);
      }
      c.stroke();
      hud(c, W, H, 'FLEXIBLE LC SENSING', 'concept', t);
    }
  };

  list.forEach(function (cv) {
    var fn = scenes[cv.getAttribute('data-scene')]; if (!fn) return;
    var c = cv.getContext('2d'), W = 0, H = 0, running = false, raf = 0, t0 = performance.now() - Math.random() * 4000, st = {};
    function size() {
      var r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(10, r.width); H = Math.max(10, r.height);
      cv.width = Math.round(W * d); cv.height = Math.round(H * d); c.setTransform(d, 0, 0, d, 0, 0);
    }
    function draw(now) { fn(c, W, H, now - t0, st); }
    function loop(now) { if (!running) return; draw(now); raf = requestAnimationFrame(loop); }
    size(); draw(performance.now() + 2500);
    window.addEventListener('resize', function () { size(); draw(performance.now()); });
    if (reduce) return;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(loop); }
          else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
        });
      }, { threshold: 0.05 }).observe(cv);
    } else { running = true; raf = requestAnimationFrame(loop); }
  });
})();
