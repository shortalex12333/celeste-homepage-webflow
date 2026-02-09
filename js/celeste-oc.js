(function () {
  var section = document.getElementById('operational-context');
  if (!section) return;

  var track = section.querySelector('.oc-track');
  var start = 0, end = 0;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function recalc() {
    // Start when the track enters the viewport region
    start = section.offsetTop; // top of section
    end = start + Math.max(1, track.offsetHeight - window.innerHeight);
  }

  function update() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var progress = clamp((y - start) / (end - start), 0, 1);
    if (progress >= 0.5) section.classList.add('is-related');
    else section.classList.remove('is-related');
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function(){ update(); ticking = false; });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function(){ recalc(); onScroll(); });
  document.addEventListener('DOMContentLoaded', function(){ recalc(); update(); });
  recalc();
  update();
})();
