/**
 * LANDING-V2.JS — narrative scroll-reveal for §02 handover-flow steps
 *
 * Behaviour:
 *  - Each .lp-step starts at opacity:0 + translateY(28px) per landing-v2.css.
 *  - As each step enters the viewport (15% threshold), it receives .is-visible
 *    which transitions it to opacity:1 + translateY(0).
 *  - Reduced-motion users get all five steps revealed instantly (CSS bypass
 *    already handles the visual via @media query; this script still flips
 *    the class so any future :is-visible-only behaviour stays consistent).
 *  - One-shot: each step is unobserved after reveal so scroll-back doesn't
 *    re-trigger the animation.
 *  - Defensive: if IntersectionObserver is unavailable (old browser), all
 *    steps are revealed immediately. No reliance on a polyfill.
 */
(function () {
  'use strict';

  function reveal(el) { el.classList.add('is-visible'); }

  function init() {
    var steps = document.querySelectorAll('.lp-step');
    if (!steps.length) return;

    var prefersReducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Reduced motion OR no IntersectionObserver → reveal all immediately.
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      steps.forEach(reveal);
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, {
      // 15% of step in viewport triggers reveal — matches narrative timing
      // (caption read by the time the mock comes into view).
      threshold: 0.15,
      // Start reveal slightly before the step crosses the fold so the
      // motion lands rather than fires at the very edge.
      rootMargin: '0px 0px -8% 0px'
    });

    steps.forEach(function (step) { observer.observe(step); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
