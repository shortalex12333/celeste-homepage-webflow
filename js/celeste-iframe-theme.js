/**
 * Celeste Iframe Theme Sync
 * Synchronises the landing page's light/dark mode with embedded prototype iframes.
 * Prototypes support [data-theme="light"] / [data-theme="dark"] via prototype-tokens.css.
 */
(function () {
  'use strict';

  var DARK_CLASS = 'dark-mode';

  function syncIframeThemes() {
    var isDark = document.documentElement.classList.contains(DARK_CLASS);
    var theme = isDark ? 'dark' : 'light';
    var iframes = document.querySelectorAll('.iframe-product-wrap iframe');
    for (var i = 0; i < iframes.length; i++) {
      try {
        var doc = iframes[i].contentDocument;
        if (doc && doc.documentElement) {
          doc.documentElement.setAttribute('data-theme', theme);
        }
      } catch (e) {
        // cross-origin safety — ignore
      }
    }
  }

  // Sync on load for each iframe
  function attachLoadListeners() {
    var iframes = document.querySelectorAll('.iframe-product-wrap iframe');
    for (var i = 0; i < iframes.length; i++) {
      iframes[i].addEventListener('load', syncIframeThemes);
    }
  }

  // Watch for class changes on <html> (theme toggle adds/removes dark-mode)
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === 'class') {
        syncIframeThemes();
        break;
      }
    }
  });

  function init() {
    observer.observe(document.documentElement, { attributes: true });
    attachLoadListeners();
    syncIframeThemes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
