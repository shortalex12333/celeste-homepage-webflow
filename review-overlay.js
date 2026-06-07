/* CelesteOS landing — review/annotation overlay.
   Self-contained. Inject with <script src="review-overlay.js"></script> before </body>.
   Hover = highlight nearest block; click = comment; Alt-click = select parent block.
   Comments persist in localStorage and Export downloads celeste-review.md (which the
   engineer reads back). */
(function () {
  if (!/[?&]review\b/.test(location.search)) return;   // only active at ?review
  if (window.__celesteReview) return; window.__celesteReview = true;
  var KEY = 'celeste-review-v1';
  var COMMENTABLE = 'section,[class],h1,h2,h3,p,.iframe-product-wrap';
  var store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  var on = true, hovered = null, current = null;

  // assign stable ids to every page block up-front (before overlay elements exist) so saved comments re-resolve on reload
  document.querySelectorAll(COMMENTABLE).forEach(function (el, i) { el.dataset.crId = 'r' + (i + 1); });

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '.cr-hl{outline:2px solid #2B7BA3!important;outline-offset:-2px;cursor:crosshair!important;background:rgba(43,123,163,.06)!important;}',
    '.cr-has{outline:2px dashed #c97a2b!important;outline-offset:-2px;position:relative;}',
    '.cr-badge{position:absolute;top:0;left:0;z-index:2147483000;background:#c97a2b;color:#fff;font:600 11px/1 IBM Plex Mono,monospace;padding:3px 6px;border-radius:0 0 6px 0;pointer-events:none;}',
    '.cr-bar{position:fixed;top:14px;right:14px;z-index:2147483600;display:flex;gap:8px;align-items:center;background:#0c0b0a;color:#eee;border:1px solid #333;border-radius:10px;padding:8px 10px;font:500 12px/1.2 IBM Plex Mono,monospace;box-shadow:0 8px 30px rgba(0,0,0,.4);}',
    '.cr-bar button{font:600 12px IBM Plex Mono,monospace;border:1px solid #444;background:#171614;color:#eee;border-radius:7px;padding:6px 10px;cursor:pointer;}',
    '.cr-bar button.cr-primary{background:#2B7BA3;border-color:#2B7BA3;color:#fff;}',
    '.cr-bar .cr-off{opacity:.5;}',
    '.cr-pop{position:fixed;z-index:2147483601;width:340px;max-width:92vw;background:#0c0b0a;color:#eee;border:1px solid #2B7BA3;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.55);font:13px/1.5 -apple-system,sans-serif;overflow:hidden;}',
    '.cr-pop header{padding:10px 12px;border-bottom:1px solid #222;font:600 11px IBM Plex Mono,monospace;color:#7fbcd6;word-break:break-word;}',
    '.cr-pop textarea{width:100%;min-height:96px;border:0;background:#111;color:#eee;padding:12px;font:13px/1.5 -apple-system,sans-serif;resize:vertical;outline:none;box-sizing:border-box;}',
    '.cr-pop footer{display:flex;gap:8px;justify-content:flex-end;padding:10px 12px;border-top:1px solid #222;}',
    '.cr-pop footer button{font:600 12px IBM Plex Mono,monospace;border:1px solid #444;background:#171614;color:#eee;border-radius:7px;padding:7px 12px;cursor:pointer;}',
    '.cr-pop footer .cr-save{background:#2B7BA3;border-color:#2B7BA3;color:#fff;}',
    '.cr-pop footer .cr-del{color:#c0503a;border-color:#5a2a22;}',
    '.cr-export{position:fixed;inset:0;z-index:2147483602;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;}',
    '.cr-export .box{width:680px;max-width:92vw;max-height:80vh;display:flex;flex-direction:column;background:#0c0b0a;color:#eee;border:1px solid #333;border-radius:12px;overflow:hidden;}',
    '.cr-export textarea{flex:1;min-height:340px;border:0;background:#111;color:#dfe;padding:14px;font:12px/1.5 IBM Plex Mono,monospace;}',
    '.cr-export .row{display:flex;gap:8px;justify-content:flex-end;padding:12px;border-top:1px solid #222;}'
  ].join('');
  document.head.appendChild(css);

  /* ---------- helpers ---------- */
  function label(el) {
    var id = el.id ? '#' + el.id : '';
    var cls = (el.className && el.className.baseVal !== undefined) ? '' : (typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).map(function (c) { return '.' + c; }).join('') : '');
    var tag = el.tagName.toLowerCase();
    var txt = (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 70);
    return { sel: tag + id + cls, snippet: txt };
  }
  function keyFor(el) {
    return el.dataset.crId || (el.dataset.crId = 'r' + (Array.prototype.indexOf.call(document.querySelectorAll(COMMENTABLE), el) + 1));
  }
  function elByKey(k) { return document.querySelector('[data-cr-id="' + k + '"]'); }

  function paintBadges() {
    document.querySelectorAll('.cr-has').forEach(function (e) { e.classList.remove('cr-has'); });
    document.querySelectorAll('.cr-badge').forEach(function (e) { e.remove(); });
    Object.keys(store).forEach(function (k, i) {
      var el = elByKey(k); if (!el) return;
      el.classList.add('cr-has');
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      var b = document.createElement('div'); b.className = 'cr-badge'; b.textContent = '💬 ' + (i + 1);
      el.appendChild(b);
    });
    var n = Object.keys(store).length;
    exportBtn.textContent = '⬇ Export (' + n + ')';
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(store)); paintBadges(); }

  /* ---------- toolbar ---------- */
  var bar = document.createElement('div'); bar.className = 'cr-bar';
  var toggle = document.createElement('button'); toggle.textContent = '✎ Review: ON';
  var exportBtn = document.createElement('button'); exportBtn.className = 'cr-primary'; exportBtn.textContent = '⬇ Export (0)';
  var clearBtn = document.createElement('button'); clearBtn.textContent = '✕ Clear';
  clearBtn.onclick = function () { if (confirm('Clear ALL comments on this page and start fresh?')) { Object.keys(store).forEach(function (k) { delete store[k]; }); save(); } };
  var hint = document.createElement('span'); hint.textContent = 'click a block · Alt-click = parent';
  bar.appendChild(toggle); bar.appendChild(exportBtn); bar.appendChild(clearBtn); bar.appendChild(hint);
  document.body.appendChild(bar);

  toggle.onclick = function () { on = !on; toggle.textContent = '✎ Review: ' + (on ? 'ON' : 'OFF'); toggle.classList.toggle('cr-off', !on); if (hovered) { hovered.classList.remove('cr-hl'); hovered = null; } };

  /* ---------- hover ---------- */
  document.addEventListener('mousemove', function (e) {
    if (!on) return;
    var t = e.target.closest(COMMENTABLE);
    if (t && (t.closest('.cr-bar') || t.closest('.cr-pop') || t.closest('.cr-export'))) t = null;
    if (t === hovered) return;
    if (hovered) hovered.classList.remove('cr-hl');
    hovered = t; if (t) t.classList.add('cr-hl');
  }, true);

  /* ---------- click to comment ---------- */
  document.addEventListener('click', function (e) {
    if (!on) return;
    if (e.target.closest('.cr-bar') || e.target.closest('.cr-pop') || e.target.closest('.cr-export')) return;
    var t = e.target.closest(COMMENTABLE); if (!t) return;
    if (e.altKey && t.parentElement) t = t.parentElement.closest(COMMENTABLE) || t;
    e.preventDefault(); e.stopPropagation();
    openPop(t, e.clientX, e.clientY);
  }, true);

  function openPop(el, x, y) {
    if (current) current.remove();
    var k = keyFor(el), info = label(el);
    var pop = document.createElement('div'); pop.className = 'cr-pop'; current = pop;
    pop.innerHTML = '<header>' + info.sel + (info.snippet ? '<br><span style="color:#888;font-weight:400">“' + info.snippet.replace(/</g, '&lt;') + '”</span>' : '') + '</header>';
    var ta = document.createElement('textarea'); ta.placeholder = 'Your comment for this block…'; ta.value = (store[k] && store[k].comment) || '';
    pop.appendChild(ta);
    var ft = document.createElement('footer');
    var del = document.createElement('button'); del.className = 'cr-del'; del.textContent = 'Delete';
    var sv = document.createElement('button'); sv.className = 'cr-save'; sv.textContent = 'Save';
    ft.appendChild(del); ft.appendChild(sv); pop.appendChild(ft);
    document.body.appendChild(pop);
    var px = Math.min(x, window.innerWidth - 360), py = Math.min(y, window.innerHeight - 230);
    pop.style.left = Math.max(8, px) + 'px'; pop.style.top = Math.max(8, py) + 'px';
    ta.focus();
    sv.onclick = function () { var v = ta.value.trim(); if (v) { store[k] = { comment: v, sel: info.sel, snippet: info.snippet }; } else { delete store[k]; } save(); pop.remove(); current = null; };
    del.onclick = function () { delete store[k]; save(); pop.remove(); current = null; };
    pop.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) sv.onclick(); if (ev.key === 'Escape') { pop.remove(); current = null; } });
  }

  /* ---------- export ---------- */
  exportBtn.onclick = function () {
    var keys = Object.keys(store);
    var md = '# CelesteOS landing — review comments\n\n_' + keys.length + ' comments · render-pro.html_\n\n';
    keys.forEach(function (k, i) {
      var c = store[k];
      md += '## ' + (i + 1) + '. `' + c.sel + '`  [' + k + ']\n';
      if (c.snippet) md += '> on: “' + c.snippet + '”\n\n';
      md += c.comment + '\n\n---\n\n';
    });
    // download
    var blob = new Blob([md], { type: 'text/markdown' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'celeste-review.md'; a.click();
    // also show copyable
    var ov = document.createElement('div'); ov.className = 'cr-export';
    ov.innerHTML = '<div class="box"><textarea readonly></textarea><div class="row"><button class="cr-copy">Copy</button><button class="cr-close">Close</button></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('textarea').value = md;
    ov.querySelector('.cr-copy').onclick = function () { navigator.clipboard && navigator.clipboard.writeText(md); };
    ov.querySelector('.cr-close').onclick = function () { ov.remove(); };
    ov.onclick = function (e) { if (e.target === ov) ov.remove(); };
  };

  paintBadges();
  console.log('[celeste-review] overlay ready —', Object.keys(store).length, 'saved comments');
})();
