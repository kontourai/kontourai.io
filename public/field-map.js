// Field map terrain + mobile ergonomics for the /developers/ territory section.
// External file (not an Astro component script) because the site CSP is
// script-src 'self' with no inline allowance — an inlined module is blocked
// at the edge even though it runs fine from a local dist server.
(function () {
  "use strict";

  // One gaussian hill per problem-domain region; Surface at the summit.
  var bumps = [
    [0.52, 0.55, 0.15, 1.7],
    [0.19, 0.24, 0.25, 0.85],
    [0.2, 0.76, 0.22, 0.75],
    [0.82, 0.46, 0.24, 0.8],
    [0.55, 0.1, 0.18, 0.6],
    [0.84, 0.82, 0.15, 0.55],
    [0.93, 0.9, 0.06, 0.4],
  ];

  function field(x, y) {
    var v = 0;
    for (var i = 0; i < bumps.length; i++) {
      var dx = x - bumps[i][0];
      var dy = y - bumps[i][1];
      var r = bumps[i][2];
      v += bumps[i][3] * Math.exp(-(dx * dx + dy * dy) / (r * r));
    }
    return v;
  }

  function draw() {
    var canvas = document.getElementById("fm-terrain");
    if (!canvas || !canvas.getContext) return;
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (!w || !h) return;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var styles = getComputedStyle(document.documentElement);
    var faint = styles.getPropertyValue("--color-edge").trim() || "#1e2538";
    var strong = styles.getPropertyValue("--color-edge-2").trim() || "#2a3450";

    var step = 10;
    var cols = Math.ceil(w / step) + 1;
    var rows = Math.ceil(h / step) + 1;
    var vals = [];
    var vmin = Infinity;
    var vmax = -Infinity;
    for (var r = 0; r < rows; r++) {
      vals[r] = [];
      for (var c = 0; c < cols; c++) {
        var v = field((c * step) / w, (r * step) / h);
        vals[r][c] = v;
        if (v < vmin) vmin = v;
        if (v > vmax) vmax = v;
      }
    }

    var levels = 20;
    for (var li = 1; li < levels; li++) {
      var t = vmin + ((vmax - vmin) * li) / levels;
      ctx.strokeStyle = li % 4 === 0 ? strong : faint;
      ctx.lineWidth = li % 4 === 0 ? 1.4 : 1;
      ctx.beginPath();
      for (var r2 = 0; r2 < rows - 1; r2++) {
        for (var c2 = 0; c2 < cols - 1; c2++) {
          var tl = vals[r2][c2];
          var tr = vals[r2][c2 + 1];
          var br = vals[r2 + 1][c2 + 1];
          var bl = vals[r2 + 1][c2];
          var x0 = c2 * step;
          var y0 = r2 * step;
          var state = (tl > t ? 8 : 0) | (tr > t ? 4 : 0) | (br > t ? 2 : 0) | (bl > t ? 1 : 0);
          if (state === 0 || state === 15) continue;
          var ix = function (a, b) { return (t - a) / (b - a); };
          var top = [x0 + step * ix(tl, tr), y0];
          var right = [x0 + step, y0 + step * ix(tr, br)];
          var bottom = [x0 + step * ix(bl, br), y0 + step];
          var left = [x0, y0 + step * ix(tl, bl)];
          var segs = [];
          switch (state) {
            case 1: case 14: segs = [[left, bottom]]; break;
            case 2: case 13: segs = [[bottom, right]]; break;
            case 3: case 12: segs = [[left, right]]; break;
            case 4: case 11: segs = [[top, right]]; break;
            case 5: segs = [[left, top], [bottom, right]]; break;
            case 6: case 9: segs = [[top, bottom]]; break;
            case 7: case 8: segs = [[left, top]]; break;
            case 10: segs = [[top, right], [left, bottom]]; break;
          }
          for (var s = 0; s < segs.length; s++) {
            ctx.moveTo(segs[s][0][0], segs[s][0][1]);
            ctx.lineTo(segs[s][1][0], segs[s][1][1]);
          }
        }
      }
      ctx.stroke();
    }
  }

  var raf = null;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      draw();
    });
  }

  function centerOnSummit() {
    // On narrow screens the frame scrolls horizontally; start centered on the
    // summit instead of the map's west edge so the first paint reads.
    var scroll = document.querySelector(".fm-scroll");
    var frame = document.querySelector(".fm-frame");
    if (!scroll || !frame) return;
    if (scroll.clientWidth < frame.scrollWidth) {
      scroll.scrollLeft = Math.max(0, frame.offsetWidth * 0.52 - scroll.clientWidth / 2);
    }
  }

  function init() {
    var canvas = document.getElementById("fm-terrain");
    if (!canvas) return;
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(schedule).observe(canvas);
    window.addEventListener("resize", schedule);
    schedule();
    centerOnSummit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
