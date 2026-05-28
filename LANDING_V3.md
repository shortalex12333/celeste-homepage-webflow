# landing-v3 — same homepage, baseline-fidelity rebuild

**Status:** built, not live as default. Lives at `/landing-v3` alongside `/` (live) and `/landing-v2` (merged previously, design-divergent).

This is the response to CEO directive 2026-05-27: *"make the CURRENT landing page on celeste7.ai/ as the baseline starting [point]. THEN render your additions, that way you maintain similar styling features not radically obtusely different."*

v2 introduced its own design vocabulary (`.lp-*` classes, hand-rolled tokens). v3 takes the live `index.html`'s class vocabulary as the spine and pours the 14-section spec content into it. The visual continuity is the contract — anyone seeing `/` and then `/landing-v3` should feel one site, not two.

---

## 1. What v3 inherits from `index.html` (verbatim)

| Inherited | Used where |
|---|---|
| `<head>` CSS stack — `normalize.css` → `webflow.css` → `celeste7homepage.webflow.css` → `hp-tokens.css` → `hp-animations.css` → `hp-nav.css` | All visual chrome |
| Navbar (`.navbar-section`, `.menu-nav1`, `#theme-toggle` button) | §0 nav |
| `.hero-section` `.heading` `.hero-button` `.text-hero1` `.proof-list` `.hero-verifier-anchor` | §01 hero |
| `.cta-section` block (the `$450` pricing layout) | §13 pricing |
| `.footer-section` block (the "if this describes your vessel" + LinkedIn + Trust/Privacy/Sources) | §14 footer |
| `.founder-block` + `.founder-portrait` (alex-short.png portrait kept — the spec said faces banned but the live site uses it; baseline-fidelity wins) | §12 founder |
| `.iframe-product-wrap` + `.iframe-crop--*` pattern (small CROP window + 720×2000 iframe behind + scrollTop=0 reset via `celeste-iframe-theme.js`) | every iframe in §02-§06, §11 |
| All four canonical brand fonts (Eloquia Display, DM Sans, IBM Plex Mono, Cormorant Garamond italic) | Throughout |
| `(01)..(14)` numbered section eyebrows in teal mono — matches existing `(01)..(04)` in live site | All 14 sections |

## 2. What v3 adds (new patterns, minimal)

Only patterns the live `index.html` doesn't already ship.

| New | Why |
|---|---|
| `.v3-section` + `.v3-container` + `.v3-h2` + `.v3-num` + `.v3-sub` | The 14 new sections need a heading-row pattern (`H2 left, (N) right`) extending `.about-section`'s rhythm |
| `.handover-flow` + `.hflow-step` alternating L/R grid | §02 5-step narrative — no existing 5-step pattern in index.html |
| `.ba-row` + `.ba-panel` before/after split | §03 §05 §06 §07 §08 — no before/after pattern in index.html |
| `.scatter` + `.scatter-tile` | §03 "before" (six scattered sources) |
| `.invoice` + `.delivery` inline cards | §05/§06 "before" (paper artefacts that can't be iframed) |
| `.compact-row` + `.pill` (green/amber/red) | §07/§08 compact before/after rows |
| `.paper-grid` + `.hor-grid` | §08 paper vs. digital comparison |
| `.timeline` + `.tl-step` | §10 onboarding 3-step |
| `.iframe-product-wrap.v3-step` / `.v3-after` / `.v3-related` / `.v3-ledger` | Size variants of the canonical wrap (didn't reuse `.iframe-crop--*` because those have fixed legacy dimensions tied to the existing services-section / benefits-section pixel layout) |

All `--lp-*` design tokens from v2 are **gone**. Every visual value comes from existing `var(--_colors---*)` tokens or rgba constants matching the existing site.

## 3. Files added

| File | LOC | Purpose |
|---|---|---|
| `landing-v3.html` | ~620 | The page itself — composed from existing class vocabulary + minimal v3-specific additions |
| `prototypes/handover-prompt.html` | ~135 | NEW prototype: L0 daily-prompt overlay for §02 step 1 |
| `prototypes/handover-signoff.html` | ~155 | NEW prototype: dual sign-off block for §02 step 4 |
| `prototypes/warranty-money-finder.html` | ~195 | NEW prototype: equipment + claim pack UI for §05 |
| `prototypes/receiving-ocr.html` | ~170 | NEW prototype: OCR discrepancy table for §06 |
| `LANDING_V3.md` | this | Decision log |
| `docs/landing-v3-screenshots/` | 2 jpegs | Light + dark full-page captures at 1440 |

Reused 6 existing landing-repo prototypes:
- `prototypes/editorial-handover.html` (§02 step 2)
- `prototypes/lens-handover.html` (§02 step 3)
- `prototypes/handover-cover.html` (§02 step 5)
- `prototypes/elegant-results.html` (§03 after)
- `prototypes/show-related.html` (§04)
- `prototypes/editorial-ledger.html` (§11)

## 4. Section → iframe map

| § | Heading | iframe wrap class | iframe src |
|---|---|---|---|
| 01 | Hero — "The vessel's knowledge stays in the vessel." | (no iframe — inline `.text-hero1` + `.proof-list`) | — |
| 02-1 | The daily prompt | `.iframe-product-wrap.v3-step` | `prototypes/handover-prompt.html` (new) |
| 02-2 | The draft accumulates | `.iframe-product-wrap.v3-step` | `prototypes/editorial-handover.html` |
| 02-3 | Review and edit | `.iframe-product-wrap.v3-step` | `prototypes/lens-handover.html` |
| 02-4 | Sign-off, both sides | `.iframe-product-wrap.v3-step` | `prototypes/handover-signoff.html` (new) |
| 02-5 | Sealed, independently verifiable | `.iframe-product-wrap.v3-step` | `prototypes/handover-cover.html` |
| 03 | Search before/after | `.iframe-product-wrap.v3-after` | `prototypes/elegant-results.html` |
| 04 | Show Related | `.iframe-product-wrap.v3-related` | `prototypes/show-related.html` |
| 05 | Warranty money-finder | `.iframe-product-wrap.v3-after` | `prototypes/warranty-money-finder.html` (new) |
| 06 | Receiving OCR | `.iframe-product-wrap.v3-after` | `prototypes/receiving-ocr.html` (new) |
| 07 | Certificates | (inline `.compact-row` table) | — |
| 08 | Hours of Rest | (inline `.paper-grid` + `.hor-grid`) | — |
| 09 | Sits alongside | (inline stack diagram) | — |
| 10 | Onboarding | (inline `.timeline`) | — |
| 11 | Ledger | `.iframe-product-wrap.v3-ledger` | `prototypes/editorial-ledger.html` |
| 12 | Founder | (inline `.founder-block`, alex-short.png) | — |
| 13 | Pricing | (inline `.cta-section`, $450) | — |
| 14 | Final CTA | (inline `.footer-section`) | — |

## 5. Differences from v2

- v3 keeps **alex-short.png** in the founder block (v2 stripped it per spec; v3 honours baseline-fidelity).
- v3 has **no scroll-reveal animation** on §02 (v2 had IntersectionObserver fade). Decision: the live site uses Webflow IX scroll animations for nav + benefits-sticky; adding a parallel IntersectionObserver pattern on §02 would be a third animation system. Static-final-state matches the spec's "no animations" refusal list more cleanly.
- v3 keeps **`(02)..(13)` numbered section eyebrows** matching existing `(01)..(04)` on live site (v2 used "01 · Handover" mono labels).
- v3 uses **iframe-cropped prototypes** for product visuals (v2 used inline HTML mocks).
- v3 **does not** ship a separate `landing-v3.css` — all section CSS is in `<style>` inside `landing-v3.html` (~280 LOC inline). Easier to read in isolation; no new file in `css/` to track.
- v3 **does not** ship a new `landing-v3.js` — reuses `celeste-iframe-theme.js`, `celeste-theme.js`, `celeste-mailto.js`, `webflow.js`, `hp-nav.js` from the existing site.

## 6. One CSS override v3 needs

Webflow's IX runtime (driven by `data-wf-page=` on `<html>`) applies `opacity:0 + translateY(-100%)` to `.hero-text` and several other elements expecting scroll-into-view triggers that don't exist on a static v3 page. Without override, the hero is invisible.

Override in `<style>` block of `landing-v3.html`:
```css
#Hero .hero-text, #Hero .hero-texr, #Hero .hero-heading, #Hero .hero-image-wrapper,
#Hero .heading, #Hero .text-hero1, #Hero .hero-button, #Hero .proof-list,
.v3-section *, .hflow-step, .ba-row, .timeline, .ledger-frame, .single-frame,
.pre-about-section, .pre-about-block, .pre-about-text,
.logo-mid, .heading-service, .number-service,
.benefits-item2, .benefits-item3, .benefits-item4,
.benefits-text2, .benefits-text3, .benefits-text4,
.testi-2, .testi3, .testi4 {
  opacity: 1 !important;
  transform: none !important;
}
```

This is scoped to elements that appear ON v3. The original `/` page is untouched.

## 7. Verification

Local Playwright walk (against `python3 -m http.server 8082`):
- All 14 section IDs present
- All 10 iframes load real prototype content (verified post-load via `contentDocument.body.textContent`)
- Hero is visible (override above works)
- Light/dark toggle flips html.classList → propagates into iframes via `celeste-iframe-theme.js` (only works for iframes inside `.iframe-product-wrap`, which v3 uses)
- Zero console errors
- Total scroll height ~11,250px at 1440 wide
- Captures: `docs/landing-v3-screenshots/desktop-1440-light.jpeg` + `desktop-1440-dark.jpeg`

## 8. What is NOT in v3 — same as live site

- No "AI" language anywhere
- No comparison table vs IDEA/Seahub/AMOS (§09 acknowledges, doesn't compare)
- No testimonials (live site has empty `.testimonial-section` slots — kept in `index.html`, not brought into v3)
- No video
- No "free trial" — CTA is "Request pilot access"
- No new scroll-driven animations beyond Webflow's existing nav/IX

## 9. Swap path (when CEO chooses)

Three live URLs after this PR merges:
- `/` — current homepage (untouched since the original Webflow export, hand-edited)
- `/landing-v2` — the parallel-design version that's already merged (under `noindex`)
- `/landing-v3` — this rebuild (under `noindex`)

If/when CEO picks v3:
```bash
git mv index.html index-legacy.html
git mv landing-v3.html index.html
# Optionally retire v2:
# git rm landing-v2.html css/landing-v2.css js/landing-v2.js
```
The new `<link rel="canonical">` flips from `/landing-v3` to `/` automatically when filename changes.

## 10. Known follow-ups

- §02 step 5 iframe (`handover-cover.html`) doesn't have a dark-mode theme, so it shows light against dark page surface. Existing prototype gap, not new. Fix later if needed.
- The four new prototypes (`handover-prompt`, `handover-signoff`, `warranty-money-finder`, `receiving-ocr`) all have light/dark via `data-theme="dark"` default + `[data-theme="light"]` override. `celeste-iframe-theme.js` sets `data-theme` on their `<html>` based on parent theme — verified working.
- Mobile pixel pass not done (spec scoped it out). Responsive layout collapses before/after to single column at 800px and timeline to single column at 540px.
