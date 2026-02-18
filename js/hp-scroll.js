/**
 * Celeste Homepage Scroll Animations
 * IntersectionObserver-based reveal system
 * Reference: docs/CELESTE_HOMEPAGE/ANIMATION_PLAYBOOK.md
 */

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Make all content visible immediately
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .stagger-children').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  // Intersection Observer for scroll-triggered animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const handleIntersection = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after triggering (animate once only)
        observer.unobserve(entry.target);
      }
    });
  };

  const scrollObserver = new IntersectionObserver(handleIntersection, observerOptions);

  // Observe all scroll-reveal elements
  const revealElements = document.querySelectorAll(
    '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .stagger-children'
  );

  revealElements.forEach(el => {
    scrollObserver.observe(el);
  });

  // Parallax effect for hero image (desktop only)
  const heroImage = document.querySelector('.hero-image-wrapper');

  if (heroImage && window.innerWidth > 1024) {
    let ticking = false;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      const maxDisplacement = 40;
      const displacement = Math.min(scrollY * 0.08, maxDisplacement);
      heroImage.style.transform = `translateY(${displacement}px)`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // Counter animation for stats (optional enhancement)
  const animateCounter = (element, target, duration = 1200) => {
    const start = 0;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    requestAnimationFrame(updateCounter);
  };

  // Expose for manual triggering if needed
  window.hpScrollReveal = {
    observe: (element) => scrollObserver.observe(element),
    animateCounter: animateCounter
  };

  console.log('[HP] Scroll animations initialized');
})();
