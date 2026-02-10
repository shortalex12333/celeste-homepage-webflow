/**
 * Celeste mailto handler
 * Converts data-mailto attributes to actual mailto: links
 */
(function() {
  'use strict';

  const MAILTO_CONFIG = {
    pilot: 'contact@celeste7.ai',
    support: 'support@celeste7.ai',
    default: 'contact@celeste7.ai'
  };

  function initMailtoLinks() {
    const links = document.querySelectorAll('[data-mailto]');

    links.forEach(function(link) {
      const type = link.getAttribute('data-mailto') || 'default';
      const email = MAILTO_CONFIG[type] || MAILTO_CONFIG.default;

      // Build subject based on link type
      let subject = '';
      if (type === 'pilot') {
        subject = 'Pilot Access Request';
      }

      // Set the href
      const mailtoUrl = 'mailto:' + email + (subject ? '?subject=' + encodeURIComponent(subject) : '');
      link.setAttribute('href', mailtoUrl);
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMailtoLinks);
  } else {
    initMailtoLinks();
  }
})();
