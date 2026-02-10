# Test Baseline Report
**Date:** 2026-02-10
**Browser:** Chromium (Playwright)
**Site:** https://celeste-homepage-webflow.vercel.app

## Summary
- **Total Tests:** 33
- **Passed:** 28
- **Failed:** 4
- **Skipped:** 1

---

## PASSED Tests (28)

### OC Section Tests (5/5)
All critical OC section functionality working:
- Pair 1: Ledger text locks while image scrolls in
- Pair 2: Related text locks while image scrolls in
- OC content has proper padding from edges (200px inset verified)
- Images are 16:9 aspect ratio (480x270, ratio: 1.78)
- Text position is `sticky` as expected

### Mobile Tests (6/6)
- No horizontal overflow on mobile
- OC section stacks vertically on mobile
- Touch targets logged (some small, but test passes)
- All images fit within viewport
- CTAs are tappable
- Text is readable (not too small)

### Visual Regression (10/10)
- Full page screenshots at all breakpoints (1440, 1280, 768, 390)
- Section screenshots captured (hero, product, metrics, oc-pair1, oc-pair2, pricing)
- OC scroll states captured at multiple positions

### Journey 1 Desktop (2/4)
- Page load performance: DOM Content Loaded 1255ms, Fully Loaded 8547ms
- No layout shift on scroll

### Accessibility (4/7)
- Page has valid heading hierarchy
- Links have discernible text (1 empty link logged)
- Color contrast check (3 light text items logged, not failing)
- Form inputs have labels
- Focus indicators are visible

---

## FAILED Tests (4)

### 1. All images have alt text
**File:** `tests/accessibility/a11y.spec.js:10`
**Issue:** 20 images missing alt text
**Images without alt:**
- menu-1.svg
- Frame-5_1Frame-5.png (2x)
- Frame-4_2Frame-4.png (2x)
- Hero-Image-1.png
- Image-15_1Image-15.webp
- Image-16_1Image-16.webp
- IMG-1_1IMG-1.webp
- Image-17_1Image-17.webp
- Image-8_1Image-8.webp
- Image-11_1Image-11.webp
- Image-9_1Image-9.webp
- Image-10_1Image-10.webp
- Frame-6.png
- Frame-7.png
- Frame-8.png
- Image-22_1Image-22.webp
- arrow-right.svg (2x)

**Priority:** HIGH (accessibility requirement)
**Fix:** Add alt attributes to all images in index.html

---

### 2. Keyboard navigation works
**File:** `tests/accessibility/a11y.spec.js:133`
**Issue:** Tab only focuses one element type (expected >1 unique tags)
**Received:** uniqueTags.size = 1

**Priority:** MEDIUM (accessibility)
**Possible causes:**
- Elements missing tabindex
- Focus trapped in one area
- Interactive elements not keyboard-accessible

**Fix:** Review tabindex on interactive elements, ensure links/buttons are focusable

---

### 3. Complete scroll journey without errors
**File:** `tests/journeys/01-first-visit.spec.js:33`
**Issue:** 13 "broken" images detected
**Root cause:** Test checks `img.complete && img.naturalWidth > 0` but lazy-loaded or offscreen images may not be loaded yet

**Priority:** MEDIUM (false positive likely)
**Fix options:**
1. Add `loading="eager"` to critical images
2. Adjust test to wait for images to load
3. Filter out lazy-loaded images from check

---

### 4. All CTAs are clickable and have valid hrefs
**File:** `tests/journeys/01-first-visit.spec.js:83`
**Issue:** No mailto links found (expected >0)
**Selector:** `a[href^="mailto:"]`

**Priority:** HIGH (business-critical)
**Fix:** Verify mailto links exist in HTML, check if href uses different format

---

## SKIPPED Tests (1)

### Safari sticky works correctly
**File:** `tests/journeys/03-oc-section.spec.js:178`
**Reason:** Correctly skipped when browser is not WebKit
**Status:** Expected behavior

---

## Action Items for Day 2-3

### Priority 1 (Blocking)
1. Add alt text to all 20 images
2. Verify/fix mailto CTA links

### Priority 2 (Important)
3. Fix keyboard navigation - ensure Tab moves through multiple element types
4. Adjust broken image test to handle lazy loading

### Priority 3 (Enhancement)
5. Run WebKit tests to verify Safari sticky behavior
6. Review the 1 empty link found (href="#")

---

## Test Artifacts
Screenshots saved to: `./screenshots/`
- desktop-1440-full.png
- desktop-1280-full.png
- tablet-768-full.png
- mobile-390-full.png
- section-*.png
- oc-scroll-*.png
