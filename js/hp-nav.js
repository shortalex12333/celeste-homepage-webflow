/**
 * Nav blur on scroll — ONLY change
 */
(function() {
  'use strict';

  const nav = document.querySelector('.navbar-section');
  if (!nav) return;

  let ticking = false;

  const updateNav = () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  updateNav();
})();
