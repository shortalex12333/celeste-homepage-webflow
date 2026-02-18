# GSD Phase Plan — Homepage Workstream

> Prefixed HP- to avoid collision with app ROADMAP.md (Phases 1-13) and app frontend (FE-Phases).
> This is the marketing homepage at celeste-homepage-webflow.vercel.app.

---

## HP-Audit: Codebase Scan

Before building anything, understand what exists.

1. Navigate to repo, identify tech stack (Next.js? Plain HTML? Webflow export?)
2. `find . -name "*.css" -o -name "*.scss" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.html" | head -50` — understand file structure
3. `grep -rn '#[0-9a-fA-F]\{3,8\}' src/ | head -30` — find hardcoded colors
4. Identify: is this a Webflow export we're rebuilding, or a Next.js project we're enhancing?
5. Take Playwright screenshots of every section at desktop (1440px) and mobile (375px)
6. Log findings to PROGRESS_LOG.md

**HP-Audit exit criteria:**
- [ ] Tech stack identified
- [ ] File structure documented
- [ ] Current screenshots captured (desktop + mobile, every section)
- [ ] Hardcoded styles inventoried
- [ ] Decision made: rebuild from scratch in Next.js, or enhance existing codebase

---

## HP-Phase 0: Foundation

### Sub-agent tasks (parallel):

| Agent | Task | Done when |
|-------|------|-----------|
| A | Implement homepage design tokens (from CLAUDE.md) as CSS vars or Tailwind config. Wire into project root. | All `--hp-*` tokens available globally. Both themes if applicable. |
| B | Set up animation infrastructure: Framer Motion (if React) or IntersectionObserver + CSS animation classes. Create reusable `ScrollReveal` wrapper component. | `<ScrollReveal>` component works: children fade+slide on viewport entry. Stagger prop works. |
| C | Build fixed nav with scroll-triggered blur background. Desktop + mobile hamburger. | Nav fixed, transparent at top, blurred on scroll. Mobile menu opens/closes. CTA button styled. |
| D | Audit all images: convert to WebP if not already, verify lazy loading, verify alt text. Optimize any images >200KB. | All images WebP, lazy-loaded, < 200KB each, descriptive alt text. Lighthouse performance > 90. |

**HP-Phase 0 exit criteria:**
- [ ] Tokens loaded, animation system ready, nav rebuilt, images optimized
- [ ] Playwright screenshots showing nav blur effect on scroll
- [ ] Mobile nav tested via Playwright

---

## HP-Phase 1: Hero Section

### Sub-agent tasks (parallel):

| Agent | Task | Done when |
|-------|------|-----------|
| A | Rebuild hero layout: centered text, responsive type (clamp), correct spacing, gradient background. | Desktop + mobile screenshots match HOMEPAGE_SPEC.md hero spec. |
| B | Implement hero entrance animations (page load, not scroll): overline → headline → subtitle → CTA → image, staggered per ANIMATION_PLAYBOOK.md. | Page loads, all 6 elements animate in sequence. Timing matches spec. |
| C | Style the explainer line ("Type: DG1 overheating") as the terminal-like block. Teal highlight on the query text. | Block renders correctly, "DG1 overheating" highlighted in teal. |
| D | Implement subtle parallax on hero yacht image (0.08x scroll speed). Respect prefers-reduced-motion. | Image parallax visible on scroll. Disabled when reduced-motion is on. |

**HP-Phase 1 exit criteria:**
- [ ] Hero visually matches Linear/Vercel quality level
- [ ] All animations fire on page load, correct timing
- [ ] Responsive at all breakpoints
- [ ] Parallax working (desktop only)
- [ ] prefers-reduced-motion disables all motion
- [ ] Screenshots in PROGRESS_LOG.md

---

## HP-Phase 2: Sections 01 + 02

### Sub-agent tasks (parallel):

| Agent | Task | Done when |
|-------|------|-----------|
| A | Rebuild Section 01 ("Traditional Software"): two-column layout, scroll-reveal on all children, staggered. Section number in teal. | Section reveals on scroll with staggered children. Layout responsive. |
| B | Rebuild Section 02 ("Deterministic"): interactive tab switcher (Read/Mutate/Sign/Record) with screenshot crossfade animation. Auto-advance timer with progress bar. | Tabs switch with animation. Auto-advance works (5s interval). User click pauses auto-advance. Screenshots crossfade. |
| C | Style Section 02 body text: staggered line reveal, key phrases highlighted. | 4 lines fade in staggered on scroll. Key phrases brighter weight. |

---

## HP-Phase 3: Sections 03 + 04

### Sub-agent tasks (parallel):

| Agent | Task | Done when |
|-------|------|-----------|
| A | Rebuild Section 03 ("Show Related"): 2×2 feature card grid with staggered scroll entrance, hover effects (translateY + shadow + image scale). | Cards reveal staggered on scroll. Hover effects per spec. Responsive 2×2 → 1-col. |
| B | Rebuild Section 04 ("Built for Pressure"): large typography stat blocks with dramatic reveal animation (counter, typewriter, or fade-up). | Stat blocks animate on scroll. Typography matches spec (large, bold, impactful). |
| C | Rebuild Receiving section: split layout, image stack with converging entrance animation. | Two-column renders, images animate in from opposite sides. |

---

## HP-Phase 4: Day One + CTA + Footer

### Sub-agent tasks (parallel):

| Agent | Task | Done when |
|-------|------|-----------|
| A | Rebuild Day One onboarding: step indicator with progress animation, content transitions between steps. | Steps transition on click/auto. Progress indicator animates. |
| B | Rebuild CTA footer: dramatic centered statement, large typography, glow CTA button, yacht image bg or dark gradient. | Full viewport section, slow fade-in on scroll, CTA has glow. |
| C | Rebuild footer: minimal, one line, border-top, contact link. | Footer renders correctly, mailto link works. |

---

## HP-Phase 5: Polish, Performance, QA

| Task | Method |
|------|--------|
| Desktop QA (1440px) | Playwright full-page screenshot, compare against spec |
| Laptop QA (1280px) | Playwright screenshot |
| Tablet QA (768px) | Playwright screenshot |
| Mobile QA (375px) | Playwright screenshot, verify no horizontal scroll |
| Animation QA | Screen recording of full page scroll, verify all sections animate |
| prefers-reduced-motion | Enable reduced motion, verify all content visible without animation |
| Performance | Lighthouse audit: target 90+ performance, 100 accessibility |
| SEO | Verify meta tags, OG image, title, description |
| Deploy | Vercel deploy, verify live URL |

---

## PHASE EXECUTION RULES

1. Never start HP-Phase N+1 until HP-Phase N exit criteria ALL have evidence
2. Every phase: `/gsd:plan-phase` → `/gsd:execute-phase` → verify → log
3. Token management: /compact at 60% context
4. Evidence: Playwright screenshots, Lighthouse scores, screen recordings. Not "it works."
5. These HP-Phases are independent of ROADMAP.md and FE-Phases.
