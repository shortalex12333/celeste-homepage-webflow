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

  // Reset wrap scrollTop so the iframe content starts at the top of its
  // visible crop. Browser auto-scrolls overflow:hidden wraps when their
  // child iframe content is shorter than the iframe element's forced
  // height (e.g. 2000px), centering the iframe inside the wrap and
  // pushing the visible artifact mostly out of view. Forcing scrollTop=0
  // after load + on a short retry interval handles the auto-scroll race.
  function resetWrapScroll() {
    var wraps = document.querySelectorAll('.iframe-product-wrap');
    for (var i = 0; i < wraps.length; i++) {
      if (wraps[i].scrollTop !== 0) wraps[i].scrollTop = 0;
    }
  }

  // Sync on load for each iframe
  function attachLoadListeners() {
    var iframes = document.querySelectorAll('.iframe-product-wrap iframe');
    for (var i = 0; i < iframes.length; i++) {
      iframes[i].addEventListener('load', function () {
        syncIframeThemes();
        // Reset scroll a few times to defeat the browser's post-load
        // auto-centering of short content inside the wrap.
        resetWrapScroll();
        setTimeout(resetWrapScroll, 50);
        setTimeout(resetWrapScroll, 200);
        setTimeout(resetWrapScroll, 1000);
      });
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
