(function () {
  var section = document.getElementById('operational-context');
  if (!section) return;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function update() {
    var rect = section.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    var sectionTop = scrollTop + rect.top; // distance from document top
    var total = Math.max(1, section.offsetHeight - window.innerHeight);
    var progress = clamp((scrollTop - sectionTop) / total, 0, 1);
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
  window.addEventListener('resize', onScroll);
  document.addEventListener('DOMContentLoaded', update);
  update();
})();

