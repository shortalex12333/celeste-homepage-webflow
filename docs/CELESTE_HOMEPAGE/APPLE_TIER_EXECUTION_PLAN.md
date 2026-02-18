# APPLE-TIER HOMEPAGE EXECUTION PLAN

> Zero bullshit. Execute relentlessly until done.

---

## CURRENT STATE (BROKEN)

I destroyed the homepage by:
1. **Forcing dark mode** when the original was light mode (#fafafa)
2. **Using font-weight 700** when original used 500
3. **Adding excessive animations** (parallax, stagger, counters)
4. **Overriding the Webflow CSS variables** that were already correct
5. **Adding shadows, gradients, glows** that the original didn't have

The original Webflow site was ALREADY Apple-tier:
- Light background (#fafafa)
- Dark text (#0a0a0a)
- Teal accent (#3A7C9D) on CTAs
- Weight 500 headlines, 400 body
- Clean, generous white space
- Professional restraint

---

## TARGET STATE

Restore the original light mode design with ONLY these micro-refinements:

### 1. Nav blur on scroll
```css
.navbar-section.scrolled {
  background: rgba(250, 250, 250, 0.85);  /* Light mode blur */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
```

### 2. Subtle scroll fade (barely perceptible)
```css
.scroll-reveal {
  opacity: 0;
  transform: translateY(10px);  /* 10px MAX */
  transition: opacity 500ms ease, transform 500ms ease;
}
.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 3. Screenshot/image refinement (if needed)
```css
/* Only add if images look flat */
.product-screenshot {
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);  /* Apple-level subtle */
}
```

### 4. Section number teal (if not already)
The original already has `--_colors---accent: #3A7C9D`. Verify it's applied to section numbers.

### 5. Typography check
Verify original weights are preserved:
- Headlines: 500 (NOT 700)
- Body: 400
- No changes needed if original is correct

---

## EXECUTION STEPS

### STEP 1: FULL REVERT
Remove ALL custom CSS overrides. Delete or empty these files:
- `css/hp-tokens.css` → DELETE or empty
- `css/hp-animations.css` → Rewrite to ONLY scroll-reveal
- `css/hp-nav.css` → Rewrite to ONLY nav blur
- `js/hp-scroll.js` → Rewrite to ONLY IntersectionObserver
- `js/hp-nav.js` → Rewrite to ONLY scroll detection

Update `index.html` to remove any CSS that overrides Webflow variables.

### STEP 2: VERIFY ORIGINAL RESTORATION
Take screenshot at 1440px. Compare to `.claude/audit/screenshots/desktop-fullpage.png`.
The site should look IDENTICAL to the original except for:
- Nav blur on scroll
- Subtle scroll fade

### STEP 3: APPLY MICRO-REFINEMENTS
Only if the original is fully restored:
1. Add nav blur CSS (light mode appropriate)
2. Add scroll-reveal CSS (10px, 500ms)
3. Add IntersectionObserver JS
4. Add nav scroll detection JS

### STEP 4: COMPREHENSIVE QA

#### Desktop (1440px)
- [ ] Background is light (#fafafa)
- [ ] Text is dark
- [ ] Headlines are weight 500
- [ ] Teal appears ONLY on CTAs and section numbers
- [ ] White space is generous
- [ ] No dark mode anywhere
- [ ] Nav blurs on scroll (light blur, not dark)
- [ ] Scroll animations are barely perceptible

#### Tablet (768px)
- [ ] Layout adapts correctly
- [ ] No horizontal scroll
- [ ] Touch targets are 44px+

#### Mobile (375px)
- [ ] Full width content
- [ ] Readable typography
- [ ] No overflow

#### Animation Check
- [ ] Scroll reveals are subtle (10px movement, 500ms)
- [ ] No stagger between elements
- [ ] No parallax
- [ ] No counters or typewriter effects
- [ ] prefers-reduced-motion disables all motion

#### Performance
- [ ] Lighthouse performance > 90
- [ ] No layout shift
- [ ] Images lazy loaded

### STEP 5: FINAL COMPARISON
Side-by-side comparison:
- Original (`.claude/audit/screenshots/desktop-fullpage.png`)
- Current (new screenshot)

The ONLY visible differences should be:
1. Nav has blur when scrolled
2. Content fades in subtly on scroll

Everything else MUST be identical.

---

## FILES TO MODIFY

### css/hp-tokens.css
```css
/* EMPTY - No overrides. Original Webflow CSS is correct. */
```

### css/hp-nav.css
```css
/* Nav blur on scroll - LIGHT MODE */
.navbar-section.scrolled {
  background: rgba(250, 250, 250, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
```

### css/hp-animations.css
```css
/* Minimal scroll fade - barely perceptible */
.scroll-reveal {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 500ms ease, transform 500ms ease;
}
.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .scroll-reveal {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

### js/hp-nav.js
```javascript
(function() {
  'use strict';
  const nav = document.querySelector('.navbar-section');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
})();
```

### js/hp-scroll.js
```javascript
(function() {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
})();
```

### index.html changes
Remove any CSS links that override Webflow variables. Keep only:
- normalize.css
- webflow.css
- celeste7homepage.webflow.css
- hp-nav.css (nav blur only)
- hp-animations.css (scroll reveal only)

---

## APPLE DESIGN PRINCIPLES TO FOLLOW

### From VISUAL_REFERENCE.md:
- **Depth from luminance steps, not shadows**
- **Shadows are nearly invisible** in light mode
- **One accent color** for ALL interactive elements
- **Weight + color create hierarchy**, not size
- **Touch targets: 44px minimum**
- **Generous padding** - if it feels full, add more space

### From UI_SPEC.md:
- **Typography range is tight**: 14px body to 24px title
- **Weight creates hierarchy**: 400 → 500 → 600
- **Never use bold (700) in body text**
- **Borders are structural, never decorative**
- **Cards and sections: NO shadow** - surface color IS the depth

### The Test:
> "When you blur your eyes, do you see a calm column of content, or a dashboard of boxes?"

The original Webflow site passes this test. My dark mode version failed it.

---

## COMMIT STRATEGY

1. **Commit 1**: "revert: Remove all dark mode overrides, restore original light mode"
2. **Commit 2**: "feat: Add nav blur on scroll (light mode)"
3. **Commit 3**: "feat: Add subtle scroll fade (10px, 500ms)"
4. **Commit 4**: "test: QA screenshots at all breakpoints"

---

## SUCCESS CRITERIA

The homepage rebuild is DONE when:

1. [ ] Site is LIGHT MODE (#fafafa background)
2. [ ] Text is dark (#0a0a0a)
3. [ ] Headlines are weight 500, NOT 700
4. [ ] Teal appears ONLY on CTAs and section numbers
5. [ ] Nav blurs on scroll (light blur)
6. [ ] Scroll animations are barely perceptible (10px, 500ms)
7. [ ] No parallax, no counters, no stagger
8. [ ] Layout IDENTICAL to original
9. [ ] Lighthouse performance > 90
10. [ ] Screenshots match original (except nav blur + scroll fade)

---

## DO NOT

- Change background colors
- Add dark mode
- Use font-weight 700
- Add shadows to cards
- Add gradient backgrounds
- Add parallax effects
- Add counter animations
- Add stagger/cascade animations
- Change the layout structure
- Move sections around
- Add decorative elements

The original was correct. Just add nav blur and scroll fade. That's it.
