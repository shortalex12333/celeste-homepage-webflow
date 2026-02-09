(function () {
  const section = document.getElementById('operational-context');
  if (!section) return;

  const panelA = section.querySelector('.oc-panel--ledger');
  const panelB = section.querySelector('.oc-panel--related');
  if (!panelA || !panelB) return;

  // Default state: show A
  panelA.classList.add('is-active');
  panelB.classList.remove('is-active');

  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (reduce || isMobile) return; // stacked fallback renders both

  function onScroll() {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const viewport = window.innerHeight;
    const raw = (window.scrollY - top) / (height - viewport);
    const p = clamp01(raw);
    // Soft handover window: 0.48-0.52 for smoother transition perception
    if (p < 0.48) {
      panelA.classList.add('is-active');
      panelB.classList.remove('is-active');
    } else if (p > 0.52) {
      panelA.classList.remove('is-active');
      panelB.classList.add('is-active');
    }
    // Between 0.48-0.52: maintain current state (no change)
  }

  let ticking = false;
  function onScrollTick() {
    if (!ticking) {
      window.requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScrollTick, { passive: true });
  window.addEventListener('resize', onScrollTick);
  onScroll();
})();
