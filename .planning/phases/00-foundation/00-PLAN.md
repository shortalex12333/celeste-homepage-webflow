# HP-Phase 0: Foundation

## Phase Goal
Establish the design token system, animation infrastructure, nav component, and image optimization that all subsequent phases depend on.

## Exit Criteria
- [ ] All `--hp-*` tokens available globally via `css/hp-tokens.css`
- [ ] `<ScrollReveal>` behavior works: children fade+slide on viewport entry with stagger
- [ ] Nav fixed, transparent at top, blurred on scroll (`backdrop-filter: blur(12px)`)
- [ ] Mobile nav hamburger opens/closes
- [ ] All images WebP, lazy-loaded, <200KB each
- [ ] Playwright screenshots showing nav blur effect on scroll
- [ ] prefers-reduced-motion disables all animations

---

## Wave 1: Parallel Foundation Tasks

### Plan 01: Design Tokens
**File:** `css/hp-tokens.css`
**Depends on:** None

Create homepage design tokens CSS file with dark mode overrides:

```
<task id="01-tokens">
<objective>Create hp-tokens.css with all homepage design tokens from CLAUDE.md spec</objective>
<files_modified>
- css/hp-tokens.css (create)
- index.html (add link to hp-tokens.css)
</files_modified>
<steps>
1. Create css/hp-tokens.css with all --hp-* variables from CLAUDE.md:
   - Surfaces: --hp-bg (#0A0A0A), --hp-surface, --hp-surface-elevated, --hp-border
   - Text: --hp-text-hero, --hp-text-primary, --hp-text-secondary, --hp-text-muted
   - Brand: --hp-brand (#3A7C9D), --hp-brand-interactive, --hp-brand-hover, --hp-brand-glow
   - Gradients: --hp-gradient-hero, --hp-gradient-section, --hp-gradient-card
   - Typography: --hp-hero-size (clamp), --hp-h2-size, --hp-h3-size, --hp-body-size, --hp-label-size
   - Spacing: --hp-section-gap, --hp-content-max, --hp-content-narrow, --hp-padding-x
   - Radius: --hp-radius-sm through --hp-radius-full
   - Shadows: --hp-shadow-card, --hp-shadow-screenshot, --hp-shadow-cta
   - Transitions: --hp-ease, --hp-duration-fast/normal/slow/scroll
   - Z-index: --hp-z-nav, --hp-z-hero, --hp-z-content

2. Add dark mode body override:
   body { background-color: var(--hp-bg); color: var(--hp-text-primary); }

3. Override Webflow light mode variables:
   --_colors---surface: var(--hp-bg);
   --_colors---text-color: var(--hp-text-primary);

4. Add link tag to index.html AFTER celeste7homepage.webflow.css
</steps>
<verification>
- Open index.html in browser
- Background should be #0A0A0A dark
- Text should be light colored
- Inspect :root and verify all --hp-* variables present
</verification>
</task>
```

### Plan 02: Animation System
**File:** `css/hp-animations.css`, `js/hp-scroll.js`
**Depends on:** None

Create scroll-reveal animation system using IntersectionObserver:

```
<task id="02-animations">
<objective>Create animation CSS and IntersectionObserver JS for scroll-triggered reveals</objective>
<files_modified>
- css/hp-animations.css (create)
- js/hp-scroll.js (create)
- index.html (add links)
</files_modified>
<steps>
1. Create css/hp-animations.css with:
   - Animation tokens: --anim-ease, --anim-duration-*, --anim-stagger
   - .scroll-reveal class: opacity 0, translateY(20px)
   - .scroll-reveal.visible: opacity 1, translateY(0), transition 800ms
   - Stagger delays for :nth-child(1-5): 0ms, 80ms, 160ms, 240ms, 320ms
   - prefers-reduced-motion media query that disables all animations
   - Button hover effects: .btn-ghost, .btn-primary
   - Card hover effects: .feature-card
   - Screenshot hover: subtle scale(1.01)

2. Create js/hp-scroll.js with:
   - IntersectionObserver setup (threshold: 0.15)
   - Add .visible class when element enters viewport
   - Unobserve after triggering (once only)
   - Query all .scroll-reveal elements

3. Add link/script tags to index.html:
   - <link href="css/hp-animations.css"> after hp-tokens.css
   - <script src="js/hp-scroll.js"> before </body>
</steps>
<verification>
- Add .scroll-reveal class to a test section
- Scroll down, section should fade in + slide up
- Enable prefers-reduced-motion in browser, animations should be disabled
</verification>
</task>
```

### Plan 03: Nav Component
**File:** `css/hp-nav.css`, `js/hp-nav.js`
**Depends on:** Plan 01 (tokens)

Rebuild nav with blur-on-scroll and mobile hamburger:

```
<task id="03-nav">
<objective>Create fixed nav with blur background on scroll and functional mobile menu</objective>
<files_modified>
- css/hp-nav.css (create)
- js/hp-nav.js (create)
- index.html (add links, update nav classes)
</files_modified>
<steps>
1. Create css/hp-nav.css with:
   - .navbar-section: position fixed, top 0, z-index var(--hp-z-nav), height 64px
   - .navbar-section.scrolled: background rgba(10,10,10,0.8), backdrop-filter blur(12px), border-bottom
   - Logo styles: 16px, weight 600, var(--hp-text-primary)
   - Link styles: var(--hp-nav-size), color var(--hp-text-secondary), hover var(--hp-text-primary)
   - CTA button: ghost style, pill radius, hover fills teal
   - Mobile overlay: full-screen, var(--hp-bg), links stacked 56px height
   - Mobile hamburger icon styles

2. Create js/hp-nav.js with:
   - Scroll listener (throttled) that adds/removes .scrolled class at 100px
   - Mobile menu toggle: add/remove .mobile-open class
   - Close menu on link click
   - Close menu on escape key

3. Update index.html:
   - Add link/script tags
   - Ensure nav has correct base classes
</steps>
<verification>
- Scroll page: nav should blur after 100px scroll
- Click hamburger on mobile: menu should open full-screen
- Click link or escape: menu should close
- Playwright screenshot of nav in both states
</verification>
</task>
```

### Plan 04: Image Optimization
**Depends on:** None

Audit and optimize all images:

```
<task id="04-images">
<objective>Convert remaining PNGs to WebP, verify lazy loading, check file sizes</objective>
<files_modified>
- images/*.webp (convert)
- index.html (update src attributes if needed)
</files_modified>
<steps>
1. List all images and their sizes:
   find images/ -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.webp" \) -exec ls -la {} \;

2. Identify images >200KB or not WebP format

3. Convert large PNGs to WebP using cwebp or similar:
   for f in images/*.png; do cwebp -q 85 "$f" -o "${f%.png}.webp"; done

4. Update index.html src attributes to use WebP versions

5. Verify all images have:
   - loading="lazy" attribute
   - Descriptive alt text
   - srcset for responsive images where applicable

6. Delete original PNGs after WebP conversion confirmed
</steps>
<verification>
- No image >200KB
- All images WebP format (except SVGs)
- All images have loading="lazy"
- Lighthouse performance score >90
</verification>
</task>
```

---

## Wave 2: Integration

### Plan 05: Integration & Testing
**Depends on:** Plans 01-04

```
<task id="05-integration">
<objective>Integrate all foundation pieces and verify working together</objective>
<steps>
1. Verify index.html has all new CSS/JS links in correct order:
   - normalize.css
   - webflow.css
   - celeste7homepage.webflow.css
   - hp-tokens.css
   - hp-animations.css
   - hp-nav.css
   - webflow.js
   - hp-scroll.js
   - hp-nav.js

2. Add .scroll-reveal class to first major section after hero

3. Test in browser:
   - Page loads dark (#0A0A0A background)
   - Nav is transparent at top
   - Scroll: nav blurs, test section animates in
   - Mobile: hamburger works

4. Take Playwright screenshots:
   - Desktop nav at top (transparent)
   - Desktop nav scrolled (blurred)
   - Mobile nav closed
   - Mobile nav open
   - Section with scroll-reveal active

5. Run Lighthouse audit, document scores
</steps>
<verification>
- All foundation features working together
- No console errors
- Lighthouse: performance >90, accessibility 100
- Screenshots saved to .claude/audit/screenshots/phase0/
</verification>
</task>
```

---

## must_haves (Goal-Backward Verification)

Phase goal: "Establish design token system, animation infrastructure, nav component, and image optimization"

1. **Token system established** → hp-tokens.css exists with all --hp-* variables, page renders dark
2. **Animation infrastructure** → scroll-reveal works, prefers-reduced-motion respected
3. **Nav component** → fixed nav, blurs on scroll, mobile menu functional
4. **Image optimization** → all images WebP, <200KB, lazy-loaded

