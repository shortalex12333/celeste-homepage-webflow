(function () {
  const section = document.getElementById('operational-context');
  if (!section) return;

  const scroll = section.querySelector('.oc-scroll');
  if (!scroll) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (reduce || isMobile) return; // Mobile: natural scroll, no transform

  // Total scroll content height (4 items × 100vh)
  const itemCount = 4;

  function onScroll() {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // Progress through section: 0 at top, 1 at bottom
    const scrollRange = sectionHeight - viewportHeight;
    const progress = Math.max(0, Math.min(1, (scrollY - sectionTop) / scrollRange));

    // Total content height inside scroll container
    const contentHeight = itemCount * viewportHeight;

    // How far to translate: at progress=0, show first item (translateY=0)
    // At progress=1, show last item (translateY = -(contentHeight - viewportHeight))
    const maxTranslate = contentHeight - viewportHeight;
    const translateY = -progress * maxTranslate;

    scroll.style.transform = `translateY(${translateY}px)`;
  }

  let ticking = false;
  function onScrollTick() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScrollTick, { passive: true });
  window.addEventListener('resize', onScrollTick);
  onScroll();
})();
