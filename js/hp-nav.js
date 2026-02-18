/**
 * Celeste Homepage Navigation
 * Scroll-triggered blur and mobile menu
 * Reference: docs/CELESTE_HOMEPAGE/HOMEPAGE_SPEC.md
 */

(function() {
  'use strict';

  const nav = document.querySelector('.navbar-section');
  const menuButton = document.querySelector('.menu-button');
  const body = document.body;

  // Scroll threshold for nav blur
  const SCROLL_THRESHOLD = 100;

  // ═══ SCROLL BLUR EFFECT ═══
  let ticking = false;

  const updateNavState = () => {
    const scrollY = window.scrollY;

    if (scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavState);
      ticking = true;
    }
  }, { passive: true });

  // Initial check
  updateNavState();

  // ═══ MOBILE MENU ═══
  let mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

  // Create mobile menu overlay if it doesn't exist
  if (!mobileMenuOverlay && menuButton) {
    mobileMenuOverlay = document.createElement('div');
    mobileMenuOverlay.className = 'mobile-menu-overlay';

    // Clone menu links
    const menuLinks = document.querySelectorAll('.menu .menu-nav1');
    menuLinks.forEach(link => {
      const clone = link.cloneNode(true);
      mobileMenuOverlay.appendChild(clone);
    });

    // Add close button using safe DOM methods
    const closeButton = document.createElement('div');
    closeButton.className = 'mobile-close';
    closeButton.textContent = '\u00D7'; // Unicode multiplication sign (×)
    closeButton.setAttribute('aria-label', 'Close menu');
    closeButton.setAttribute('role', 'button');
    closeButton.setAttribute('tabindex', '0');
    mobileMenuOverlay.appendChild(closeButton);

    document.body.appendChild(mobileMenuOverlay);

    // Close button click
    closeButton.addEventListener('click', closeMobileMenu);

    // Close button keyboard accessibility
    closeButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeMobileMenu();
      }
    });

    // Close on link click
    mobileMenuOverlay.querySelectorAll('.menu-nav1').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  function openMobileMenu() {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add('open');
      body.classList.add('mobile-menu-open');
    }
  }

  function closeMobileMenu() {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove('open');
      body.classList.remove('mobile-menu-open');
    }
  }

  // Hamburger click
  if (menuButton) {
    menuButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (mobileMenuOverlay && mobileMenuOverlay.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOverlay && mobileMenuOverlay.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 991 && mobileMenuOverlay && mobileMenuOverlay.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  console.log('[HP] Navigation initialized');
})();
