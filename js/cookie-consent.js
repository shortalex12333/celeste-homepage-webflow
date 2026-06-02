/* CelesteOS cookie-consent banner — UK PECR / EU ePrivacy compliant, vanilla, no dependencies.
 * Pairs with Google Consent Mode v2: each page sets consent 'default' = denied BEFORE gtag config,
 * so GA4 (G-230QN4JY4P) and Google Ads (AW-17947526022) store NOTHING until the user accepts.
 * This script restores a prior choice, or shows the banner (Accept / Reject / More info) on first visit.
 * Choice persisted in localStorage. Reset/withdraw via window.celesteCookieSettings().
 */
(function () {
  'use strict';
  var KEY = 'celeste_cookie_consent_v1';

  function applyConsent(state) {
    if (typeof window.gtag !== 'function') return;
    var granted = state === 'granted';
    window.gtag('consent', 'update', {
      ad_storage:          granted ? 'granted' : 'denied',
      ad_user_data:        granted ? 'granted' : 'denied',
      ad_personalization:  granted ? 'granted' : 'denied',
      analytics_storage:   granted ? 'granted' : 'denied'
    });
  }

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // Allow re-opening the choice (e.g. a footer "Cookie settings" link → onclick="celesteCookieSettings()")
  window.celesteCookieSettings = function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };

  var prior = read();
  if (prior === 'granted' || prior === 'denied') { applyConsent(prior); return; }  // already decided — no banner

  function build() {
    var style = document.createElement('style');
    style.textContent = [
      '.cc-banner{position:fixed;left:50%;transform:translateX(-50%);bottom:1rem;z-index:2147483000;',
      'width:min(680px,calc(100vw - 2rem));box-sizing:border-box;display:flex;flex-wrap:wrap;gap:.9rem 1.25rem;',
      'align-items:center;justify-content:space-between;padding:1rem 1.15rem;border-radius:12px;',
      'background:var(--_colors---surface,#ffffff);border:1px solid var(--_colors---border,rgba(0,0,0,.12));',
      'box-shadow:0 10px 30px rgba(0,0,0,.16);font-family:"DM Sans",system-ui,-apple-system,sans-serif;}',
      '.cc-text{margin:0;flex:1 1 320px;font-size:.86rem;line-height:1.5;color:var(--_colors---color-6,#525252);}',
      '.cc-text a{color:var(--_colors---accent,#2B7BA3);text-decoration:underline;font-weight:500;}',
      '.cc-actions{display:flex;gap:.6rem;flex:0 0 auto;}',
      '.cc-btn{font-family:inherit;font-size:.82rem;font-weight:500;padding:.55rem 1.1rem;border-radius:8px;',
      'cursor:pointer;border:1px solid var(--_colors---accent,#2B7BA3);line-height:1;}',
      '.cc-reject{background:transparent;color:var(--_colors---accent,#2B7BA3);}',
      '.cc-reject:hover{background:rgba(43,123,163,.08);}',
      '.cc-accept{background:var(--_colors---accent,#2B7BA3);color:#fff;}',
      '.cc-accept:hover{filter:brightness(1.06);}',
      '@media(max-width:560px){.cc-banner{flex-direction:column;align-items:stretch;}.cc-actions{justify-content:flex-end;}}'
    ].join('');
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.className = 'cc-banner';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML =
      '<p class="cc-text">We use cookies to measure how the site is used and how our ads perform. ' +
      'Strictly necessary cookies are always on. You can accept or reject the rest. ' +
      '<a href="/privacy-policy">More info</a>.</p>' +
      '<div class="cc-actions">' +
      '<button type="button" class="cc-btn cc-reject">Reject</button>' +
      '<button type="button" class="cc-btn cc-accept">Accept</button>' +
      '</div>';

    function choose(state) { write(state); applyConsent(state); if (bar.parentNode) bar.parentNode.removeChild(bar); }
    bar.querySelector('.cc-accept').addEventListener('click', function () { choose('granted'); });
    bar.querySelector('.cc-reject').addEventListener('click', function () { choose('denied'); });
    document.body.appendChild(bar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
