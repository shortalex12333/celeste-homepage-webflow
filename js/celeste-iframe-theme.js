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
  // visible crop. The browser auto-scrolls overflow:hidden wraps when
  // their child iframe (forced 720x2000) is taller than the wrap (590x540),
  // centering the iframe inside the wrap and hiding the artifact. The
  // auto-scroll fires on load AND again when the wrap enters the viewport,
  // so we both attach load listeners and use IntersectionObserver to keep
  // scrollTop pinned to 0.
  function resetWrap(wrap) {
    if (wrap && wrap.scrollTop !== 0) wrap.scrollTop = 0;
  }
  function resetAllWraps() {
    var wraps = document.querySelectorAll('.iframe-product-wrap');
    for (var i = 0; i < wraps.length; i++) resetWrap(wraps[i]);
  }

  // Sync on load for each iframe
  function attachLoadListeners() {
    var iframes = document.querySelectorAll('.iframe-product-wrap iframe');
    for (var i = 0; i < iframes.length; i++) {
      iframes[i].addEventListener('load', function (e) {
        syncIframeThemes();
        var wrap = e.target.parentElement;
        resetWrap(wrap);
        setTimeout(function () { resetWrap(wrap); }, 50);
        setTimeout(function () { resetWrap(wrap); }, 200);
        setTimeout(function () { resetWrap(wrap); }, 1000);
      });
    }
  }

  // Keep scrollTop=0 on every visibility transition (browser re-centers
  // when the wrap enters viewport).
  function attachIntersectionObservers() {
    if (typeof IntersectionObserver !== 'function') return;
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          var w = entries[i].target;
          resetWrap(w);
          setTimeout(function (el) { return function () { resetWrap(el); }; }(w), 50);
          setTimeout(function (el) { return function () { resetWrap(el); }; }(w), 200);
        }
      }
    }, { threshold: [0, 0.01, 0.5, 1] });
    var wraps = document.querySelectorAll('.iframe-product-wrap');
    for (var i = 0; i < wraps.length; i++) io.observe(wraps[i]);
  }

  // Also catch any direct scroll on the wrap (browser-initiated).
  function attachScrollListeners() {
    var wraps = document.querySelectorAll('.iframe-product-wrap');
    for (var i = 0; i < wraps.length; i++) {
      (function (w) {
        w.addEventListener('scroll', function () { if (w.scrollTop !== 0) w.scrollTop = 0; }, { passive: true });
      })(wraps[i]);
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
    attachIntersectionObservers();
    attachScrollListeners();
    syncIframeThemes();
    resetAllWraps();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
