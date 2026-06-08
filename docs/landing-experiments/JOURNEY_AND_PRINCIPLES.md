# Landing Page · Journey & Principles

*The full record of what was attempted, what failed, what landed, and what the next implementor must hold. Pairs with `B3.html` and `B4.html` in this folder. Will be implemented on celeste7.ai at a later date — this document is the brief for that work.*

---

## 0. What this folder contains

| File | What it is | When to refer to it |
|---|---|---|
| `B3.html` | Mid-journey render. Iframes the real Cloud_PMS lens prototypes. Heavier. Loud. Still violates several brand rules. | Reference for "what we tried and learnt against." Not the target. |
| `B4.html` | Final render of this journey. No iframes — custom editorial UI cards. Smaller type. Light+dark theme toggle. Off-axis composition. Clinical voice. | **This is the format target.** When implementation begins, this is the visual+composition spec. |
| `JOURNEY_AND_PRINCIPLES.md` | This file. The brief. | Read first. |

Both renders open from this folder (`open B4.html` in browser). Eloquia fonts resolve from the repo's `fonts/` directory via `../../fonts/`.

---

## 1. The journey — eight iterations, one direction

### Render A · "Rolex-grade" (early concept)
Maximum whitespace, one sentence per section, click-to-reveal heavy. Conceptually correct but couldn't communicate the product at all. **Lesson:** total restraint with no media = invisible product.

### Render B · "Apple-product"
Alternating image-left / image-right sections. Big media. **Lesson:** the alternation became repetitive across all sections — mono-rhythm. The user (CEO) called it "each section is the exact same."

### Render C · "Linear-demo"
Every section anchored by a product mock. Dense mono. **Lesson:** still too SaaS in framing. Headlines were small but the cumulative density was high.

### B (selected as base)
CEO chose B as the spine. Critique: still SaaS. Whitespace degraded. Real fonts wrong (system Inter, not the brand's Eloquia). False numbers everywhere ("482,917 records").

### B2 · expanded
Added: Wear-Care Score concept (no per-yacht number per `celeste-score.md §5`), Money Finder with cursor-illumination, Show Related, Cryptography section, Onboarding timeline, Trust. Multi-frame flows. **Lesson:** still SaaS-feeling. Fonts were Inter system stack — wrong for the homepage which uses Eloquia + DM Sans + Cormorant + Plex Mono. Radius 6–12 px violated ULTRA scale (1–4 px).

### B3 · "Eloquia + ULTRA radius + multi-tempo motion"
Correct font system (Eloquia 300/400/500 + DM Sans + Cormorant italic accents + IBM Plex Mono). Correct ULTRA radius (1–4 px). Spine rail on the left. Cursor illumination on Money Finder. Multi-tempo animation. **Then:** iframed the real Cloud_PMS prototypes (`lens-handover.html`, `elegant.html`, `show-related.html`, `lens-warranty.html`, `ledger-drawer.html`). Hover-expand on Agentic catalog.

**B3 critique by CEO:** Loud. Bold. Shouting. Whitespace degraded. Iframes show entire prototypes naked — like Apple slapping the next iPhone on the front page. Scrollbars present. Iframes don't fit width. Collapsibles weak/repetitive/don't look like buttons. No light-mode toggle.

### B4 · "clinical · editorial · multi-theme"
**The final render of this journey.** Rewrote from scratch against:
- `frontend_ux.md` — ULTRA radius, asymmetric borders, 4px grid, glass on chrome only
- `brand-voice.md` — "Celeste is a person with no mouth"
- `brand-refusal-list.md` — no SaaS UX patterns, no engagement nudges
- `brand-positioning.md` — Rolex restraint, clinical not emotive
- `colour-system.md` — teal as affordance, gradient only in brand contexts
- `IMAGE_DOCTRINE.md` — 1 card · 2–3 rows · 1 status · negative space mandatory · edge bleed

Replaced every iframe with a custom editorial `ucard` component (2–3 rows max, 1 status badge). Cards edge-bleed off the canvas where appropriate. Light+dark theme toggle in header (`◐`). Half the previous type sizes. Collapsibles redesigned as proper buttons with hairline border, hover state, chevron rotation.

---

## 2. Section order (final, after reorder pass)

| # | Section | Composition archetype | Purpose |
|---|---|---|---|
| 01 | Hero | Text-left 40% / negative-right 60% | The belief — "knowledge stays in the vessel" |
| 02 | Handover | Text-left / card right-edge-bleeds | The painkiller every chief recognises |
| 03 | Money found | Card-left-bleeds / text-right | Top of the brief's pitch hierarchy |
| 04 | Search | Card-left-bleeds / text-right | The mechanism, shown |
| 05 | Show Related | Single centered card, vast vertical breathing | The NLP magic, visible |
| 06 | Agentic catalog | Long-form vertical list, hover-expands to cropped card | Five missions on autopilot |
| 07 | Consolidate | Before/after asymmetric (0.85 / 1.15) | Value crystallised |
| 08 | Alongside | Centered diagram | Kill rip-and-replace objection |
| 09 | Onboarding | Horizontal timeline (4 dots) | Kill slow-implementation objection |
| 10 | Cryptography | Text-left / sealed-pdf card right-bleeds | The proof |
| 11 | Trust | Rule-separated rows (no cards) | Compliance · continuity · verifier |
| 12 | Score | Centered manifesto, narrow column | Long-game hook (Carfax/Zillow analogy) |
| 13 | Founder | Centered manifesto | Authenticity |
| 14 | Pricing | Centered manifesto, $450 in Eloquia 300 | The commitment |
| 15 | Final CTA | Centered manifesto | The ask |

**The score sits at position 12, not 2.** It is not the top-of-funnel hook for the engineer audience. It is the long-term value-build, mentioned after painkillers, mechanism, defensibility have done their work.

---

## 3. Composition archetypes (4 patterns, used in rotation)

| Archetype | Class in B4 | Used for |
|---|---|---|
| **A · Manifesto** | `.arch-manifesto` | Score · Founder · Pricing · Final CTA. Narrow column, text-only, intentionally quiet. |
| **B · Bleed-right** | `.arch-bleed-right` | Handover · Cryptography. Text-left, card right-edge-bleeds (Apple iPhone-off-frame technique). |
| **B-flip · Bleed-left** | `.arch-bleed-left` | Money · Search. Card-left-bleeds, text-right. |
| **C · Centered card** | `.arch-centered-card` | Show Related. Single dominant card, massive vertical breathing. |
| **D · Long-form list** | `.arch-list` | Agentic catalog · Trust · Consolidate · Alongside · Onboarding. Headers + structured rows, no media-as-card. |

**Why rotation matters:** the user (CEO) flagged "each section is the exact same" as fatal. Adjacent sections never share an archetype. Rhythm becomes A → B → Bf → Bf → C → D → D → D → D → B → D → A → A → A → A. (Last four are intentional triplet to slow the closing.)

---

## 4. The 4-font system (NON-NEGOTIABLE)

Per `celeste-brand-typography` skill. The PMS app uses Inter + Mono. **The homepage is different** — four fonts:

| Font | Role | Weight | Bundled |
|---|---|---|---|
| **Eloquia Display** | Headlines · section titles | 300 Light (≥48px) · 400 Regular (36–48px) · 500 Medium (emphasis) | Self-hosted WOFF2 in `/fonts/` (commercial · Typekiln) |
| **DM Sans** | Body · descriptions · button labels · workhorse | 300 · 400 · 500 | Google Fonts |
| **Cormorant Garamond Italic** | Accent — 3–4 words per page max, in teal | 300 italic only | Google Fonts |
| **IBM Plex Mono** | IDs · timestamps · technical labels · system voice | 400 · 500 · 600 | Google Fonts |

**Hard rules:**
- Eloquia 300 Light at ≥48 px. Eloquia 400 Regular at 36–48 px. Never Eloquia 500+ at large sizes (reads as alarm).
- Cormorant: ONLY italic. ONLY teal. ONLY 1–4 phrases per page. Banned for full sentences or paragraphs.
- DM Sans: the safe default for anything that isn't headline / accent / mono.
- Plex Mono: machine-generated data only. Never humans.

**Accent phrases used in B4** (from across the page):
*"in the vessel."* / *"writes itself."* / *"Not you."* / *"the source."* / *"Every linked record."* / *"the boat knows."* / *"Keep IDEA."* / *"hours."* / *"independently verifiable."* / *"is the vessel's."* / *"a number."* / *"lived this."* / *"we should talk."*

That's 13 across the page — at the edge of "too many." If the page were tightened further, drop to 8–10.

---

## 5. ULTRA radius scale (NON-NEGOTIABLE · CEO 2026-05-15)

The entire homepage and product app is FLAT.

| Token | Value | Use |
|---|---|---|
| `--r-pill` | 1px | Pills, tags, status badges |
| `--r-sm` | 2px | Buttons, inputs, cards |
| `--r-md` | 2px | Same as sm for consistency |
| `--r-lg` | 3px | Modals only |
| `--r-xl` | 4px | Large containers |
| `--r-full` | 9999px | Status dots, avatars (only place "round" is permitted) |

*"Radius is information, not decoration."* No `border-radius: 8px` because "it looks nicer." If you see anything >4px, it's a violation.

---

## 6. Colour discipline (NON-NEGOTIABLE)

Per `colour-system.md`:

- **Neutral whites/blacks form 80–90% of the interface.** Everything else is restraint.
- **Teal (`--mark`) = interactive affordance ONLY.** Never branding decoration. Never status indicator. Never "personality."
  - Dark theme: `#5AABCC`
  - Light theme: `#2B7BA3`
- **Signal colours = status ONLY.** Never affordance, never branding.
  - Red `#C0503A` — destructive / critical
  - Amber `#C4893B` — pending / warning
  - Green `#4A9468` — committed / success
  - Blue `#5B8DEF` — informational
- **Identity gradient (`#BADDE9 → #2FB9E8`)** lives in brand contexts only (logo, marketing hero atmospheric, collateral). Never inside product UI. **Not used in B4 at all** — replaced with subtle radial-gradient atmosphere on hero right column.

Golden rule: teal = affordance. Status colours = state. Never overlap.

---

## 7. Voice (NON-NEGOTIABLE)

Per `brand-voice.md`:

> Celeste is a person with no mouth. It does not talk. It only shows. The source is the answer.

Practical checklist for any new copy:

1. **Banned words** (grep these and reject): `AI-powered`, `Smart`, `Intelligent assistant`, `Cutting-edge`, `Next-gen`, `Seamless`, `Automate`, `Optimize`, `Leverage`, `Powered by AI`.
2. **No reassurance language:** `Don't worry`, `It's okay`, `We've got you`, `No need to stress`.
3. **No anthropomorphism:** `I think`, `I believe`, `I'm not sure`, `I'm learning`.
4. **No filler:** rhetorical questions, conversational bridges, emotional qualifiers.
5. **Allowed questions:** yes/no, ≤7 words, neutral, explicit about artefact ("Add to handover draft?").
6. **Sentence shape:** short declarative, present tense, technical nouns, neutral verbs.

Voice review test — for any text:
1. Does this sound like SaaS?
2. Does this explain more than necessary?
3. Does this try to reassure emotionally?
4. Would a Chief Engineer respect this tone?

If any answer is "no," rewrite.

---

## 8. Image doctrine (NON-NEGOTIABLE)

Per `/Brand/Media/moodboards/IMAGE_DOCTRINE.md`:

The CEO's words: *"the handover we are just placing an entire document on their frontpage of suer and never explaining, just a blob of over information."*

Rules B4 follows (and any future render must follow):

1. **One frame = one idea.** Do not show five ideas at once.
2. **Reduce density.** 1 main card · 2–3 rows · 1 status badge max. Not 12 rows of a full lens prototype.
3. **Strong negative space.** "More empty space than content on desktop" (per `hp-tokens.css` comment in the live site).
4. **Off-axis composition.** Centered is the default to escape, not the default to use.
5. **Edge bleed.** Cards extend beyond the frame, signalling *"this object is larger than this frame can contain."*
6. **No iframes.** Build editorial HTML scenes. The iframe is a documentation tool, not a marketing artefact.
7. **No scrollbars in media.** If a card has a scrollbar, it's wrong.
8. **No lifestyle photography. No faces. No stock. No AI-generated imagery.**

The Apple/Rolex/Linear test the CEO referenced: *"Apple doesn't slap the next iPhone on the front page nakedly."* Same principle for the lens prototypes.

---

## 9. Refusals (kill-switch list)

Per `brand-refusal-list.md`. If any of these creep in, reject immediately:

- Chatbot · friendly tone · "I think"
- AI theatre · "confidence scores" · brain visuals (the brain in the current logo violates this — see §11)
- Silent state changes · auto-execute
- Confidence collapse · auto-selected "best match"
- Navigation-first product · dashboard-led
- Decorative branding · gradients in product UI
- Discounts as strategy
- Friendliness at expense of clarity
- Designing for owners as primary users
- Split-brain systems (Celeste sits alongside legacy as the work surface, not as an overlay)

The kill-switch test: if a change feels *faster but less explicit*, *smarter but less accountable*, *nicer but less serious*, *modern but less timeless* — reject.

---

## 10. Multi-tempo animation (lift from B3, kept in B4)

Per `motion.dev` and the CEO's "best animations are dual difference contrasting in speed/distance":

| Tempo | Duration | Used for |
|---|---|---|
| **Fast** | 120 ms ease-out | Hover · commit · micro-interaction |
| **Medium** | 280 ms ease-out | State transitions · disclosure rotation |
| **Slow** | 720 ms ease-out | Scroll-fade · page-level reveal |
| **Continuous** | n/a | Cursor blink in search input (1.5s blink) |

`--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` — spring-like decel. Same curve everywhere.

**Banned animations** per `frontend_ux.md`:
- Page transitions
- Row entrance animations
- Loading skeletons on <100ms operations
- Hover-to-reveal feature animations (B4's hover-expand on Agentic is the only exception — it's a discovery mechanism, not a marketing flourish)

---

## 11. Open decisions for later implementation

These were deliberately not resolved in B4. Resolve before implementation begins.

### 11.1 — The brand mark
The current brain logo (in `/Media/LOGO/CelesteOS.png`) violates `brand-refusal-list.md §2` ("design visuals that suggest brain / mind / thinking"). B3 and B4 replace it with a placeholder seal (circle + notch + dot). The real designed brand mark is a designer task, not engineering. Until then: wordmark + placeholder seal.

### 11.2 — The Wear-Care Score visualization
B4 keeps the score as text-only manifesto. No fake gauge, no fake yacht number (would violate `feedback_no_named_yachts_on_public_surfaces.md` and `celeste-score.md §5 — never publish a per-yacht number to the public`). When the score is actually live, a designer can spec the public-facing visualisation: aggregate band ranges only, never specific yachts.

### 11.3 — Spine rail
B3 had a fixed left rail with section markers + travelling teal glow. B4 dropped it because `IMAGE_DOCTRINE` values negative space over decorative interface elements. Open question: re-add subtler, or stay without?

### 11.4 — Real product screenshots
B4 uses custom editorial `ucard` mocks. The eventual implementation may need real product screenshots — but per `IMAGE_DOCTRINE`, they must be stripped down to one card, edge-cropped, never the full prototype. A designer will need to produce these as rendered PNG/WebP, not iframes.

### 11.5 — Origin story
The canonical doc gap flagged in earlier turns: there's no one-paragraph origin story beyond Alex's bio. When ready, anchor it on one specific moment (the handover where a year of knowledge walked off).

### 11.6 — Ethics statement
The procurement-level commitments — data ownership, AI use, vendor independence, lock-in policy — are not on the Trust page yet. Required before enterprise / management-company sales. Draft separately, link from Trust.

### 11.7 — Customer-facing artefacts
No real customer quotes, no real pilot numbers, no real money-found events yet. Per `feedback_no_named_yachts_on_public_surfaces.md`, even when pilots exist, public surfaces show aggregate bands. Plan the artefact production discipline before first pilot quote.

### 11.8 — Mobile composition
B4 has a responsive breakpoint at 1024px and 640px. The compositions collapse to single column. Acceptable for now. A separate mobile-first pass should refine ordering and section sizing for phones.

---

## 12. Implementation pickup checklist (for the agent who lands this)

When the time comes to implement B4 into the live celeste7.ai (the Webflow export at the root of this repo):

1. **Read this document first.** Then `frontend_ux.md`, `brand-voice.md`, `brand-refusal-list.md`, `brand-positioning.md`, `colour-system.md`, `IMAGE_DOCTRINE.md`, `celeste-score.md`.
2. **Open `B4.html` from this folder.** Toggle theme. Scroll. Inspect every section.
3. **Audit against this document's §§ 4–10.** Each non-negotiable rule must be honoured.
4. **Decide on §11 open questions** with CEO before writing any production code.
5. **The Webflow export at the repo root** is the existing site. The integration path is:
   - Migrate B4's editorial `ucard` components into Webflow as reusable elements
   - Carry over the light/dark theme toggle script
   - Replace existing sections one at a time (not all at once)
   - Keep the existing site live throughout; deploy in surgical PRs
6. **Do not commit B4.html, B3.html, or this folder to apps/web/public/** (per `feedback_no_preview_html_in_prod_public.md`) — `docs/` is fine because it's not served on the production origin.
7. **Verify against the existing site's hp-tokens.css** for spacing/colour values that already exist. Reuse before reinventing.
8. **The kill-switch test** at §9 is the final gate. Run it on every section before ship.

---

## 13. What this document is, and isn't

**Is:**
- A faithful record of what was tried, what failed, and what landed.
- The canonical pickup brief for whoever implements B4 into the live site.
- A checklist against every brand document we hold.

**Isn't:**
- A definitive design spec. B4.html is closer to that — but B4 is itself an interpretation. A designer should still pass over it before code.
- A guarantee that B4 is final. There are 8 open decisions in §11. Each one may move B4.
- Production code. None of B4 should land in apps/web/public/ without first being adapted to Webflow / the production stack.

---

## 14. Files referenced

| Brand doc | Location | What it enforces |
|---|---|---|
| brand-voice.md | `/Brand/brand-voice.md` | Language, banned words, person-with-no-mouth |
| brand-refusal-list.md | `/Brand/brand-refusal-list.md` | Kill-switch list, SaaS UX refusals |
| brand-positioning.md | `/Brand/brand-positioning.md` | Rolex restraint, $15k+ rationale, who we're for |
| colour-system.md | `/Brand/colour-system.md` | Teal = affordance, signal = state, gradient restrictions |
| frontend_ux.md | `/Brand/frontend_ux.md` | ULTRA radius, asymmetric borders, glass-on-chrome |
| IMAGE_DOCTRINE.md | `/Brand/Media/moodboards/IMAGE_DOCTRINE.md` | One card, edge bleed, negative space mandatory |
| celeste-score.md | `/CelesteOS-Score/celeste-score.md` | Score thesis, free meter / paid moment, never per-yacht public |
| signature-direction.md | `/Brand/signature-direction.md` | Chain of seals creative direction (not yet implemented) |
| celeste-brand-typography skill | `~/.claude/skills/celeste-brand-typography/` | The four-font system |

---

## 15. The single test (for B4 and anything that comes after)

A captain spends 30 seconds on the page. Closes the tab. Tells the chief next to him about it.

The sentence they say: **"The vessel's knowledge stays in the vessel."**

If they say anything else — "It's some maritime SaaS thing" / "Search for boat documents" / "AI for yachts" — the page failed.

That is the only test that matters.

---

*End of document. Land carefully when implementation begins.*
