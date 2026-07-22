// Proof replay animation — loaded as a same-origin static asset (not bundled)
// so the strict CSP (script-src 'self', no unsafe-inline) allows it, matching
// the subscribe.js pattern. Without JS the full conversation renders static.
(function () {
  var root = document.querySelector('[data-proof-replay]');
  if (!root) return;
  var beats = Array.prototype.slice.call(root.querySelectorAll('[data-beat]'));
  var again = root.querySelector('[data-replay]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DELAYS = [0, 1200, 2400, 3400];
  var timers = [];

  function showAll() {
    beats.forEach(function (b) { b.classList.add('is-on'); });
  }
  function reset() {
    timers.forEach(clearTimeout);
    timers = [];
    beats.forEach(function (b) { b.classList.remove('is-on'); });
  }
  function play() {
    reset();
    beats.forEach(function (b, i) {
      timers.push(setTimeout(function () { b.classList.add('is-on'); }, DELAYS[i] != null ? DELAYS[i] : i * 1100));
    });
    if (again) again.hidden = false;
  }

  if (reduced) {
    showAll();
    return;
  }
  // JS is running: arm the animation (no-JS visitors keep the static render).
  root.classList.add('is-armed');
  var io = new IntersectionObserver(function (entries) {
    var hit = entries.some(function (e) { return e.isIntersecting; });
    if (hit) {
      io.disconnect();
      play();
    }
  }, { threshold: 0.4 });
  io.observe(root);
  if (again) again.addEventListener('click', play);
})();
