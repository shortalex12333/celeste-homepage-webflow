/**
 * Minimal scroll fade — barely perceptible
 * No parallax, no counters, just basic IntersectionObserver
 */
(function() {
  'use strict';

  // Reduced motion check
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.scroll-reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  // Simple IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
})();
