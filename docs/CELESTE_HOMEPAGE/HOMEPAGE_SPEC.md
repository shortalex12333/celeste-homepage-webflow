# HOMEPAGE SPEC — Section-by-Section Build Guide

> For every section: what exists → what's wrong → what it should be → exact specs.

---

## NAV (Fixed)

### Current
Simple links, hamburger for mobile. Flat, no blur, no scroll behavior.

### Target
Fixed nav that transforms on scroll. When user scrolls past hero:

```
Resting (top of page):
  background: transparent
  position: fixed, top: 0
  z-index: var(--hp-z-nav)
  height: 64px
  padding: 0 var(--hp-padding-x)
  max-width: 100%

Scrolled (past hero):
  background: rgba(10,10,10,0.8)
  backdrop-filter: blur(12px)
  border-bottom: 1px solid var(--hp-border)
  transition: background 300ms, border 300ms

Logo:
  "Celeste" — 16px, weight 600, var(--hp-text-primary)
  Or logo SVG if it exists. Left-aligned.

Links:
  font: var(--hp-nav-size) / var(--hp-nav-weight)
  color: var(--hp-text-secondary)
  hover: var(--hp-text-primary), transition 150ms
  gap: 32px between links
  Hide on mobile → hamburger menu

CTA (right side):
  "Request Access" — ghost button
  border: 1px solid var(--hp-border)
  color: var(--hp-text-primary)
  padding: 8px 20px
  radius: var(--hp-radius-full) (pill)
  hover: background var(--hp-brand-interactive), border-color var(--hp-brand-interactive), color white
  transition: all 300ms var(--hp-ease)

Mobile nav:
  Full-screen overlay, var(--hp-bg) background
  Links stacked vertically, 56px row height each
  Close button top-right
  Animate: fade in 200ms
```

---

## HERO

### Current
Headline + subtitle + CTA button + static yacht aerial image. Flat. No animation. No atmosphere.

### Target
The hero is the first 3 seconds. It must communicate: **this is serious software for serious operations.**

```
Layout:
  Full viewport height (100vh) or close to it (min 90vh)
  Content centered vertically
  Text column: max-width 800px, centered
  Padding-top: account for nav height (64px + breathing room)

Background:
  var(--hp-bg) base
  var(--hp-gradient-hero) radial gradient — subtle teal glow at top center
  Optional: very subtle grain/noise texture at 2-3% opacity for depth

Overline (above headline):
  "Celeste" or "Celeste PMS"
  var(--hp-label-size), var(--hp-label-tracking), uppercase
  var(--hp-brand) teal color
  Animate: fade in + slide up 12px, 400ms delay 0

Headline:
  "Operate your yacht from intent, not navigation."
  var(--hp-hero-size) / var(--hp-hero-weight) / var(--hp-hero-tracking)
  var(--hp-text-hero) pure white
  line-height: var(--hp-hero-line-height)
  text-align: center
  Animate: fade in + slide up 16px, 600ms delay 100ms

Subtitle:
  "One operating surface. Manuals, work orders, faults, inventory..."
  var(--hp-body-size) / var(--hp-body-weight)
  var(--hp-text-secondary)
  max-width: 600px, centered
  text-align: center
  Animate: fade in + slide up 12px, 600ms delay 200ms

CTA:
  "Request Private Demo" — primary button
  background: var(--hp-brand-interactive)
  color: white
  padding: 14px 32px
  radius: var(--hp-radius-full)
  font: 15px / weight 500
  box-shadow: var(--hp-shadow-cta)
  hover: var(--hp-brand-hover), shadow expands
  Animate: fade in + scale from 0.95, 400ms delay 400ms

Hero image (yacht aerial):
  Below the CTA, full-width up to 1200px
  border-radius: var(--hp-radius-lg)
  box-shadow: var(--hp-shadow-screenshot)
  border: 1px solid rgba(255,255,255,0.06)
  Animate: fade in + slide up 24px, 800ms delay 300ms
  Optional: subtle parallax on scroll (translateY at 0.1x scroll speed)

Explainer line ("Type: DG1 overheating..."):
  Below hero image
  var(--hp-body-size), var(--hp-text-muted)
  Styled as a code/terminal-like block:
    background: var(--hp-surface)
    border: 1px solid var(--hp-border)
    radius: var(--hp-radius-md)
    padding: 16px 24px
    font-family: var(--hp-font) (not monospace — keep brand consistency)
    "DG1 overheating" in var(--hp-brand) teal to highlight the query
  Animate: fade in on scroll, 600ms
```

---

## SECTION 01: "Traditional Software Assumes Navigation"

### Current
Simple heading + body text. Static. No visual weight.

### Target
This is the **problem statement**. It should feel like a revelation.

```
Layout:
  Two-column on desktop: text left (60%), visual right (40%)
  Single column on mobile: text on top, visual below
  max-width: var(--hp-content-max)
  padding-top: var(--hp-section-gap)

Section number:
  "(01)" — var(--hp-label-size), var(--hp-brand) teal
  Animate: fade in + slide right 8px, on scroll entry

Headline:
  var(--hp-h2-size) / var(--hp-h2-weight) / var(--hp-h2-tracking)
  var(--hp-text-hero)
  Animate: fade in + slide up 16px, staggered 100ms after number

Body:
  var(--hp-body-size) / var(--hp-body-line-height)
  var(--hp-text-secondary)
  max-width: 520px
  Animate: fade in + slide up 12px, staggered 200ms

Accent text ("No navigation trees. No module switching. No guesswork."):
  Weight 500, var(--hp-text-primary) — slightly brighter than body to emphasize
  Could be styled as a list with subtle teal dashes or dots instead of bullets

Visual (right side):
  Abstract representation of fragmented navigation vs. single surface
  Could be: a comparison graphic, or an animated diagram showing
  scattered pages collapsing into one surface
  Or: keep the existing concept but add subtle entrance animation
```

---

## SECTION 02: "Deterministic, Not Suggestive"

### Current
Read/Mutate/Sign/Record tabs with 4 screenshots. Static, flat.

### Target
Interactive tab switcher with animated screenshot transitions. This is the product showcase.

```
Layout:
  Centered, full-width within var(--hp-content-max)
  Section number + headline at top
  Tab bar below headline
  Screenshot/visual below tabs

Tab bar:
  4 tabs: Read, Mutate, Sign, Record
  Horizontal row, centered
  Each tab:
    padding: 10px 24px
    radius: var(--hp-radius-full)
    font: 14px / weight 500
    color: var(--hp-text-secondary)
    cursor: pointer

  Active tab:
    background: var(--hp-surface-elevated)
    color: var(--hp-text-primary)
    border: 1px solid var(--hp-border)
    transition: all 300ms var(--hp-ease)

  Hover (inactive):
    color: var(--hp-text-primary)

Screenshot area:
  border-radius: var(--hp-radius-lg)
  border: 1px solid rgba(255,255,255,0.06)
  box-shadow: var(--hp-shadow-screenshot)
  overflow: hidden
  height: auto (proportional to image)

  Tab switch animation:
    Outgoing: fade out + scale to 0.98, 200ms
    Incoming: fade in + scale from 0.98, 400ms
    OR: horizontal slide (left-to-right for forward, right-to-left for back)

  Auto-advance: tabs cycle every 5 seconds if user hasn't interacted
  On user click: pause auto-advance for 15 seconds, then resume

Body text below tabs:
  "Every interaction is a micro-action..."
  4 lines, each fading in staggered on scroll
  Key phrases in var(--hp-text-primary) (brighter), rest in var(--hp-text-secondary)
```

---

## SECTION 03: "Show Related"

### Current
4 feature cards with screenshots stacked vertically. Static.

### Target
Feature grid with staggered scroll entrance and hover interaction.

```
Layout:
  Section number + headline at top
  2×2 grid on desktop, 1-column on mobile
  gap: 24px
  max-width: var(--hp-content-max)

Each feature card:
  background: var(--hp-surface)
  background-image: var(--hp-gradient-card)  /* subtle top-left highlight */
  border: 1px solid var(--hp-border)
  border-radius: var(--hp-radius-lg)
  padding: 32px
  overflow: hidden

  Top section: screenshot/image
    border-radius: var(--hp-radius-md)
    box-shadow: inset shadow for depth
    Animate: image scales from 1.0 → 1.02 on card hover (zoom-in effect)
    transition: transform 600ms var(--hp-ease)

  Number: "(01)" in var(--hp-brand), var(--hp-label-size)
  
  Title: var(--hp-h3-size) / var(--hp-h3-weight) / var(--hp-text-primary)
  
  Subtitle (italic or lighter): "Not isolated nouns" — var(--hp-text-muted)
  
  Body: var(--hp-body-size) / var(--hp-text-secondary)

  Hover:
    border-color: rgba(255,255,255,0.1)  /* slightly more visible border */
    box-shadow: 0 8px 32px rgba(0,0,0,0.3)
    transform: translateY(-2px)
    transition: all 400ms var(--hp-ease)

  Scroll entrance:
    Each card: fade in + slide up 20px
    Stagger: 100ms between cards
    Duration: 600ms per card
```

---

## SECTION 04: "Built for Pressure"

### Current
"Faults", "Handovers", "02:00 alarms" as text blocks. Static, no impact.

### Target
This section should feel **urgent**. These are the moments that matter.

```
Layout:
  Full-width dark band (var(--hp-bg) or slightly darker)
  3 stat-like blocks in a horizontal row
  Centered within var(--hp-content-max)
  
Each block:
  Large text: "Faults", "Handovers", "02:00"
    font: clamp(40px, 5vw, 72px) / weight 700 / var(--hp-text-hero)
    
  Sub-text: "& inspections", "& disputes", "alarms"
    font: var(--hp-body-size) / var(--hp-text-muted)

  Animate: counter/number reveals with a stagger
    "02:00" could animate from "00:00" → "02:00" (like a clock)
    "Faults" could type in letter by letter
    OR: all three fade up simultaneously but at different Y offsets (8px, 12px, 16px)

  On mobile: stack vertically with 48px gaps
```

---

## RECEIVING SECTION

### Current
Description text + two images side by side. Static.

### Target
Split layout: text left, visual right. Process feels real.

```
Layout:
  Two-column, text left (50%), visual stack right (50%)
  max-width: var(--hp-content-max)

Text side:
  Sub-headline: "Receiving Done Correctly"
    var(--hp-h3-size) / var(--hp-h3-weight)
  
  Tagline: "Operational reality, not a checkbox"
    var(--hp-label-size), var(--hp-text-muted), italic or distinct style
    
  Body: detailed receiving flow description
    var(--hp-body-size) / var(--hp-text-secondary)
    Key terms (OCR, signature, ledger) in var(--hp-text-primary) weight 500

  Animate: staggered fade in, 100ms between elements

Visual side:
  Two screenshots stacked with slight overlap (second offset 20px right, 20px down)
  Each: border, radius, shadow per screenshot standard
  Animate: first image fades in + slides left, second follows 200ms later slides from right
  Creates depth and visual interest
```

---

## DAY ONE ONBOARDING

### Current
4 steps with images. Tab-like selector. Static.

### Target
Step-by-step reveal with progress indicator.

```
Layout:
  Headline: "Day One" — var(--hp-h2-size), centered
  Subtitle: "Sync PMS. Index manuals..." — var(--hp-text-secondary), centered
  
  4 steps in a horizontal stepper (desktop) / vertical stack (mobile)

Step indicator:
  Horizontal line with 4 numbered circles (01, 02, 03, 04)
  Active step: circle filled var(--hp-brand-interactive), text white
  Completed step: circle filled var(--hp-brand), text white, line segment solid teal
  Upcoming step: circle border var(--hp-border), text var(--hp-text-muted)
  Connecting line: var(--hp-border) → var(--hp-brand) as steps complete

Content per step:
  Image/screenshot on one side
  Step title + description on other side
  
  Interaction options:
    A) Auto-advance every 4 seconds with progress bar
    B) Click step number to jump
    C) Scroll-triggered: each step reveals as user scrolls through section

  Animate: image cross-fades between steps (300ms)
  Text slides right → left between steps
```

---

## CTA FOOTER

### Current
"Celeste is not decorative software." + Request Access button. Flat.

### Target
Dramatic closing statement. The last impression.

```
Layout:
  Full viewport height (or min 80vh)
  Content centered vertically and horizontally
  Yacht image as background with dark overlay (80% opacity)
  OR: no image, just dramatic typography on dark

Headline:
  "Celeste is not decorative software."
  var(--hp-h2-size) or larger / weight 700
  var(--hp-text-hero)
  text-align: center
  Animate: fade in on scroll, slow (800ms)

Body:
  "A deterministic operating surface for vessels that expect..."
  var(--hp-body-size) / var(--hp-text-secondary)
  max-width: 640px, centered
  Animate: fade in 200ms after headline

CTA:
  "Request Access" — primary button (same as hero CTA)
  Larger than other CTAs: padding 16px 40px, font 16px
  Glow effect: box-shadow var(--hp-shadow-cta)
  Animate: fade in + scale, 200ms after body

  Below CTA:
    "contact@celeste7.ai" — var(--hp-text-muted), 13px
    Clickable mailto: link
```

---

## FOOTER

```
Minimal. One line.
  Logo left, copyright center, contact right
  OR: just centered: "Celeste · contact@celeste7.ai · © 2026"
  font: 13px / var(--hp-text-muted)
  padding: 40px var(--hp-padding-x)
  border-top: 1px solid var(--hp-border)
```

---

## RESPONSIVE

| Breakpoint | Layout changes |
|-----------|---------------|
| Desktop (>1200px) | Full layouts, 2-column sections, grid features |
| Laptop (1024-1200px) | Same but tighter padding |
| Tablet (768-1024px) | Single column, stacked sections, smaller hero type |
| Mobile (<768px) | Full single column, hamburger nav, vertical feature cards, reduced section gaps (80px) |

### Mobile-specific:
- Hero font: clamp handles this automatically
- Feature cards: 1 column, full width
- Tab bar (section 02): horizontal scroll if needed, or stack vertically
- Screenshots: full width with 16px horizontal padding
- Touch targets: 48px minimum for all interactive elements
- No horizontal scroll. Ever. Test this.

---

## SEO & PERFORMANCE

- All images: WebP format, lazy-loaded, with descriptive alt text (already good in current site)
- Fonts: system font stack loads instantly. If Inter is added, preload weight 400/500/600/700 only.
- Above-the-fold content (hero): no layout shift, critical CSS inlined
- Animations: `prefers-reduced-motion` media query disables all motion for accessibility
- Meta tags: title, description, OG image for social sharing
- Lighthouse target: 90+ performance, 100 accessibility
