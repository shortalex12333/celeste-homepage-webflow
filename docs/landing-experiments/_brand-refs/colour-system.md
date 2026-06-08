# `/Brand/colour-system.md`

## CelesteOS — Colour System

### Purpose of this document

This document defines **how colour is used in CelesteOS** and, more importantly, **how it is restricted**.

Colour in CelesteOS is **functional**, not expressive.
If colour is used to decorate, excite, or brand the UI, it has failed.

This document exists to prevent:

* SaaS brightness
* emotional colour usage
* visual noise
* loss of authority

---

## 1. Core Philosophy

> **Colour is a signal of state, not personality.**

CelesteOS relies on:

* typography
* spacing
* structure

Colour is secondary and deliberate.

If the interface looks “nice” because of colour, it is wrong.

---

## 2. Palette Overview

### Neutral Foundation (Primary)

These colours form **80–90%** of the interface.

**Whites**

* `#FFFFFF`
* `#FAFAFA`
* `#F8F8F0`
* `#F4F4F4`

**Blacks**

* `#020202`
* `#181818`
* `#242424`

Purpose:

* documentation clarity
* night/day adaptability
* seriousness
* fatigue resistance

These colours carry **authority**.

---

### Functional Accent (Secondary)

**Blue Teal**
────────┬─────────────────────────────────────┐
  │        Context        │   Hex   │                Name                 │                                                             
  ├───────────────────────┼─────────┼─────────────────────────────────────┤                                                           
  │ Dark backgrounds      │ #5AABCC │ Brand teal — interactive affordance │                                                             
  ├───────────────────────┼─────────┼─────────────────────────────────────┤                                                           
  │ Light backgrounds     │ #2B7BA3 │ Brand teal — darker for legibility  │                                                             
  ├───────────────────────┼─────────┼─────────────────────────────────────┤                                                             
  │ CTA buttons           │ #2B8FB3 │ Button teal (hover: #239AB8)        │                                                             
  ├───────────────────────┼─────────┼─────────────────────────────────────┤                                                             
  │ Cormorant accent text │ #2B7BA3 │ Emotional accent words              │                                                           
  └───────────────────────┴─────────┴─────────────────────────────────────┘      

Purpose:

* focus
* selection
* verified information
* active context

Blue is not branding.
Blue is **functional instrumentation**.

---

### Identity Gradient (Restricted)

**Gradient**

* `#BADDE9 → #2FB9E8`

Purpose:

* brand identity only

Allowed locations:

* website hero
* launch materials
* physical collateral

Forbidden locations:

* inside product UI
* cards
* buttons
* microactions
* backgrounds

If gradient appears inside the product, it is a violation.

---

## 3. Colour Roles (Strict Mapping)

Every colour usage must map to **one role only**.

| Role              | Colour Use                 |
| ----------------- | -------------------------- |
| State             | Neutral only               |
| Read Action       | Neutral only               |
| Mutate Action     | Neutral only               |
| Selection / Focus | Blue                       |
| Commitment        | Neutral + dimming          |
| Record            | Neutral (reduced contrast) |

If colour is used without a role, remove it.

---

## 4. Read vs Mutate Colour Rules

### Read Actions

* Same colour as body text
* No accent colour
* No hover colour change beyond underline

Read actions must feel **harmless**.

---

### Mutate Actions

* Never use blue
* Never use red by default
* Express seriousness through spacing, not colour

Mutation must feel heavier because of **ritual**, not warning colour.

---

## 5. Red, Orange, Green Usage (Restricted)

These colours are **not part of the core palette**.

### Red

Allowed only for:

* irreversible destructive actions
* safety-critical alerts

Never for:

* errors that did not mutate state
* validation feedback
* emphasis

---

### Orange / Yellow

Allowed only for:

* inspection warnings
* time-sensitive advisories

Never for:

* branding
* attention-grabbing UI

---

### Green

Allowed only for:

* confirmation that a committed action succeeded

Never for:

* encouragement
* progress
* optimism

Colour must not reward behaviour.

---

## 6. Night Mode Priority

CelesteOS is **night-first**.

Rules:

* dark backgrounds are primary
* contrast is carefully controlled
* no pure white text on pure black
* blue usage reduced at night

The interface must remain calm at 2am.

---

## 7. What Colour Must Never Do

Colour must never:

* express emotion
* indicate friendliness
* create excitement
* suggest intelligence
* replace structure

If colour carries meaning that spacing or text could carry, remove it.

---

## 8. Accessibility & Fatigue

* High contrast, but not harsh
* Avoid flicker, glow, saturation
* No colour-only meaning (text always present)

Accessibility is not a feature.
It is a requirement.

---

## 9. Colour Review Checklist

Before approving any colour usage, ask:

1. What role does this colour serve?
2. Could this be neutral instead?
3. Does this introduce emotion?
4. Would this distract a tired engineer?

If unsure, default to neutral.

---

## End of Document

---

### Self-review

* ✅ Prevents SaaS visual brightness
* ✅ Reinforces authority and calm
* ✅ Supports night operations
* ✅ Aligns with UX grammar & tokens
* ✅ Scales across platforms

---
