# ANIMATION PLAYBOOK — Every Motion in Celeste Homepage

> Animation is not decoration. It's communication.
> Each motion answers: "what just changed, and why should I care?"
> If an animation doesn't answer that question, remove it.

---

## LIBRARY

Use **Framer Motion** for React (or CSS-only with Intersection Observer if the project is static HTML).

```bash
npm install framer-motion
```

If the project is NOT React, use CSS animations + `IntersectionObserver` for scroll triggers. The specs below include both approaches.

---

## GLOBAL ANIMATION TOKENS

```css
:root {
  --anim-ease: cubic-bezier(0.16, 1, 0.3, 1);      /* Fast start, gentle deceleration */
  --anim-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Slight overshoot — buttons only */
  --anim-duration-fast: 150ms;
  --anim-duration-normal: 400ms;
  --anim-duration-slow: 600ms;
  --anim-duration-scroll: 800ms;
  --anim-stagger: 80ms;              /* Delay between sibling elements */
}
```

---

## SCROLL ENTRANCE ANIMATIONS

### The Universal Pattern

Every section and its children use this scroll-reveal pattern:

```
Initial state (off-screen):
  opacity: 0
  transform: translateY(20px)

Visible state (in viewport):
  opacity: 1
  transform: translateY(0)
  transition: opacity var(--anim-duration-scroll) var(--anim-ease),
              transform var(--anim-duration-scroll) var(--anim-ease)
```

**Intersection Observer setup:**
- Trigger when 15% of element is visible (`threshold: 0.15`)
- Once triggered, stays visible (no exit animation)
- Each child within a section is staggered by `var(--anim-stagger)` (80ms)

### Framer Motion version:

```jsx
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.08,
    },
  }),
};

<motion.div
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.15 }}
  custom={0} // increment for stagger: 0, 1, 2, 3...
>
```

### CSS-only version:

```css
.scroll-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 800ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
}

.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
.scroll-reveal.visible > :nth-child(1) { transition-delay: 0ms; }
.scroll-reveal.visible > :nth-child(2) { transition-delay: 80ms; }
.scroll-reveal.visible > :nth-child(3) { transition-delay: 160ms; }
.scroll-reveal.visible > :nth-child(4) { transition-delay: 240ms; }
.scroll-reveal.visible > :nth-child(5) { transition-delay: 320ms; }
```

```js
// IntersectionObserver setup
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // once only
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
```

---

## PER-SECTION MOTION SPECS

### Hero (page load — NOT scroll-triggered)

Elements animate on page load, staggered:

| Element | Animation | Duration | Delay | Easing |
|---------|-----------|----------|-------|--------|
| Overline ("Celeste") | Fade in + translateY(12px→0) | 400ms | 0ms | ease-out |
| Headline | Fade in + translateY(16px→0) | 600ms | 100ms | var(--anim-ease) |
| Subtitle | Fade in + translateY(12px→0) | 600ms | 200ms | var(--anim-ease) |
| CTA button | Fade in + scale(0.95→1) | 400ms | 400ms | var(--anim-ease-bounce) |
| Hero image | Fade in + translateY(24px→0) | 800ms | 300ms | var(--anim-ease) |
| Explainer line | Fade in | 600ms | 800ms | var(--anim-ease) |

**Note:** Hero animations fire on page load, NOT on scroll. The user should see movement immediately.

### Section 01: Traditional Software

| Element | Animation | Delay (relative to section entry) |
|---------|-----------|----------------------------------|
| Section number "(01)" | Fade in + translateX(-8px→0) | 0ms |
| Headline | Fade in + translateY(16px→0) | 80ms |
| Body text | Fade in + translateY(12px→0) | 160ms |
| Accent lines | Fade in + translateY(8px→0) | 240ms |
| Visual (right side) | Fade in + translateX(20px→0) | 160ms |

### Section 02: Deterministic (Tab Switcher)

**Tab switch animation:**
```
Outgoing tab content:
  opacity: 1 → 0
  transform: scale(1) → scale(0.98)
  duration: 200ms

Incoming tab content:
  opacity: 0 → 1
  transform: scale(0.98) → scale(1)
  duration: 400ms
  delay: 100ms (slight overlap with outgoing)
```

**Auto-advance progress bar:**
```
Below active tab:
  height: 2px
  background: var(--hp-brand-interactive)
  width: 0% → 100%
  duration: 5000ms (matches auto-advance interval)
  animation: linear (constant speed, not eased)
  resets on tab change
```

**Staggered text below screenshots:**
```
"Every interaction is a micro-action." → delay 0ms
"If something changes, it is previewed." → delay 80ms
"Signed. Logged. Immutable." → delay 160ms
"Nothing auto-executes. Nothing hides state." → delay 240ms
```

### Section 03: Show Related (Feature Cards)

**Scroll entrance — staggered grid:**
```
Card 1 (top-left):     delay 0ms
Card 2 (top-right):    delay 100ms
Card 3 (bottom-left):  delay 200ms
Card 4 (bottom-right): delay 300ms

Each card: fade in + translateY(20px→0), 600ms
```

**Card hover:**
```css
.feature-card {
  transition: transform 400ms var(--anim-ease),
              box-shadow 400ms var(--anim-ease),
              border-color 400ms var(--anim-ease);
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  border-color: rgba(255,255,255,0.1);
}

.feature-card:hover .card-image {
  transform: scale(1.02);
  transition: transform 600ms var(--anim-ease);
}
```

### Section 04: Built for Pressure

**Number/word reveal:**
```
Option A — Fade up stagger:
  "Faults":     fade in + translateY(16px→0), delay 0ms
  "Handovers":  fade in + translateY(16px→0), delay 150ms
  "02:00":      fade in + translateY(16px→0), delay 300ms

Option B — Counter animation (more dramatic):
  "02:00" animates from "00:00" → "02:00" over 1200ms
  Uses requestAnimationFrame counter
  Easing: ease-out (fast start, slow finish)

Option C — Character-by-character reveal:
  Each word reveals letter by letter, 40ms per character
  "F-a-u-l-t-s" → total 240ms
  Stagger between words: 200ms
```

### Receiving Section

```
Text side: standard scroll reveal, staggered children
Image stack:
  Image 1: fade in + translateX(-16px→0), delay 0ms
  Image 2: fade in + translateX(16px→0), delay 200ms
  Creates a "pinching in" effect where both images converge
```

### Day One Onboarding

**Step transitions:**
```
Step indicator progress:
  Circle fills: scale(0.8→1) + background color change, 300ms
  Line between steps: width 0%→100%, 400ms, triggered when step completes

Content per step:
  Outgoing: fade out + translateX(0→-20px), 200ms
  Incoming: fade in + translateX(20px→0), 400ms
  Image: cross-fade, 300ms
```

### CTA Footer

```
Headline: fade in, 800ms (slow and deliberate — this is the final statement)
Body: fade in, 600ms, delay 200ms
CTA button: fade in + scale(0.95→1), 400ms, delay 400ms, var(--anim-ease-bounce)
```

---

## HOVER & MICRO-INTERACTIONS

### Buttons

```css
/* Ghost button (nav CTA, secondary) */
.btn-ghost {
  transition: all 300ms var(--anim-ease);
}
.btn-ghost:hover {
  background: var(--hp-brand-interactive);
  border-color: var(--hp-brand-interactive);
  color: white;
  transform: translateY(-1px);
}

/* Primary button (hero CTA, footer CTA) */
.btn-primary {
  transition: all 300ms var(--anim-ease);
}
.btn-primary:hover {
  background: var(--hp-brand-hover);
  box-shadow: 0 0 32px rgba(43,143,179,0.3);
  transform: translateY(-1px);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 0 16px rgba(43,143,179,0.2);
}
```

### Nav links

```css
.nav-link {
  transition: color var(--anim-duration-fast) ease-out;
}
.nav-link:hover {
  color: var(--hp-text-primary);
}
```

### Feature cards (covered above)

### Screenshot images

```css
.screenshot {
  transition: transform 600ms var(--anim-ease);
}
.screenshot:hover {
  transform: scale(1.01);  /* Very subtle — barely perceptible but adds life */
}
```

---

## PARALLAX (subtle)

### Hero yacht image
```
On scroll:
  image translateY: scrollPosition * 0.08 (slow parallax)
  Creates depth — image moves slightly slower than content
  
  Max displacement: 40px (don't let it get extreme)
  Only active on desktop (>1024px)
  Disabled if prefers-reduced-motion
```

### Background gradient shifts
```
As user scrolls through the page:
  The subtle teal radial gradient at hero top position
  shifts downward very slowly (scrollPosition * 0.03)
  Creating a sense that the ambient light follows the content
  This is VERY subtle — if you can obviously see it, it's too much
```

---

## ACCESSIBILITY: prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .scroll-reveal {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

**This is non-negotiable.** Some users have vestibular disorders. Motion-reduced mode shows all content with no animation. Content is never hidden behind animation — it's always accessible.

---

## PERFORMANCE RULES

1. **No animation on page load that delays LCP.** Hero animations are CSS-only or Framer Motion (no heavy JS).
2. **Scroll animations use `will-change: transform, opacity`** — hint to browser for GPU acceleration.
3. **Remove `will-change` after animation completes** — don't leave it on permanently (wastes GPU memory).
4. **Use `transform` and `opacity` ONLY for animations** — never animate `width`, `height`, `margin`, `padding`, `left`, `top` (these trigger layout recalculation).
5. **Intersection Observer over scroll event listeners** — much more performant.
6. **Parallax: use `requestAnimationFrame`** — never raw scroll listeners.
7. **Test on throttled connection (3G)** — animations should not block content from appearing.
