# HANDOVER — reframe work (studio/reframe-prototypes branch)

This file only exists on the `studio/reframe-prototypes` branch. It's a short companion to the main `HANDOVER.md`, summarising what the reframe work was, why it paused, and how to pick it up.

---

## 1. What this branch is

A set of four full-homepage prototypes that reposition celeste7.ai around the **handover** painkiller and demote search and cryptographic receipts to supporting / invisible roles. The reframe is driven by an internal review document the CEO commissioned:

> `/Users/celeste7/Documents/CelesteOS-Score/review/11_site_copy_reframe.md`

Read that file end-to-end before deciding anything. It's the canonical plan. Everything in this branch executes against it.

For full context, the same directory has six sibling docs that produced the §11 plan — they cover the market pressure test (`01`), problem validation (`02`), competition map (`03`), first-10-customers playbook (`04`), the scalar / FICO-of-yachts thinking (`08`), the actioned-decisions doc (`09`), and the data-sourcing map (`10`).

The condensed version: the site currently leads with **search**, treats **cryptographic receipts** as a primary feature, and presents **insurance** language nowhere — but the score / insurance endgame is the long-term moat being built in parallel (CelesteOS-Score). The §11 plan re-leads the site with **handover** (the validated painkiller), demotes search to support, and removes the receipts / verifier surface from the conversion path entirely while keeping the substrate intact.

---

## 2. The four prototypes

All four use production CSS via absolute `https://celeste7.ai/...` URLs, so opening them via `file://` renders with the live brand chrome (Eloquia, Cormorant italic accents, IBM Plex Mono labels, dashed dividers).

| File | Pitch in one line | Risk |
|---|---|---|
| `design-studio/reframe-v1.html` | Plan-literal. Same homepage layout as production, surgical §11 edits applied. | Lowest. Closest to live. |
| `design-studio/reframe-v2.html` | Mission-as-hero. Same as V1 but the "five workers" catalog is promoted to the first section after the hero, and **each worker is rendered as a full-viewport block with its own media artefact** (draft email, certificate bundle, PO compare, repeat-fault timeline, cross-domain answer card). Most "show-don't-tell" of the four. | Low. |
| `design-studio/reframe-v3.html` | Two-persona pane. Adds a `(01b) For the office` block directly after Philosophy `(01)`, addressed to the management company / technical superintendent. Same brand chrome as the engineer pane. | Medium — names the buyer explicitly. |
| `design-studio/reframe-v4.html` | Flow rebuild. **Four ample-height sections** (01 Handover → 02 Workers → 03 Search → 04 The boat's truth). One idea per viewport, generous padding. Cryptography reframed as the vessel's ground truth, not legal defence. | Medium — strongest structural commitment. |

Plus `design-studio/INDEX-reframes.html` — a comparison grid that links to all four with descriptions and risk profiles. **Start there.**

```sh
open -a 'Google Chrome' design-studio/INDEX-reframes.html
```

---

## 3. The §11 rules every variant respects

Verified via grep across all four files:

- **Handover** is the lead. Hero subhead replaced with the §11 A2 sentence: "*CelesteOS keeps the vessel's operational knowledge in the vessel — so the next handover writes itself...*"
- **Search** is supporting, not headline. Mentioned across each variant but never the lead.
- **Receipts / verifier surface removed.** No hero verifier anchor. No "Proof, when proof matters" service block. No "audit trail is a legal defence" copy.
- **Insurance** appears **zero times** on any prospect-facing surface.
- **Integrity Score / FICO** appear **zero times** — the score is silent until validated on one real boat per §09 A29.
- **§4 coverage rule** appears on every variant: *every draft is a draft, you read the citation, you decide, CelesteOS records what you decided.*
- **Continuity & portability block** is present on every variant — answers the solo-founder bus-factor objection (§01 Flaw #4) in writing.
- **Trust** removed from primary nav. Still reachable from the footer.
- Hero "breath list" no longer says **Ledger**. Used-during bullet #4 swapped from "decisions cannot be reversed" to receiving-discrepancy.
- Pre-about closing rewritten from "*Nothing changes without review, signature, and record*" to "*Every answer cites its source. Every action is yours to confirm. CelesteOS proposes; the crew decides.*"
- Benefits item 3 reframed from receipts-language to fault-history / repeat-fault.

---

## 4. Why this paused

The CEO wanted to compare the variants visually before picking which one ships. The variants are tonally and structurally distinct (V1 ≈ surgical, V2 ≈ visual-show-don't-tell, V3 ≈ two-buyer voice, V4 ≈ ample-flow). The pause is to inspect them in Chrome, decide, and direct the next pass.

---

## 5. How to resume

1. Open `design-studio/INDEX-reframes.html` in Chrome. Open all four variants in tabs.
2. Read `11_site_copy_reframe.md` if you haven't already.
3. Pick one variant — or a hybrid (e.g. V4's flow + V2's media artefacts).
4. The chosen variant should be promoted to be the new `index.html` on `main`. Process:
   - Branch off `main` (e.g. `feat/site-reframe-vX`).
   - Replace the production hero / sections according to the chosen prototype.
   - **Don't** wholesale-copy the prototype file as `index.html` — that file uses absolute `celeste7.ai/css/...` URLs (so it can render via file://). Production needs relative paths.
   - Strip variant-specific scaffolding (the `.v4-stage-badge`, the `<title>` like "V4 · Flow...", the comments referencing variant numbers).
   - Open a PR, inspect on the Vercel preview, merge to main.

---

## 6. What the score system is doing in parallel (and why the site stays silent on it)

The CelesteOS-Score repo (`/Users/celeste7/Documents/CelesteOS-Score/`) is building the score system that will eventually become the **long-term moat** — the Phase 1 "Integrity Score" (a mirror of the customer's own data) → Phase 2 predictive score → Phase 3 authority phase. The site's silence is deliberate: per §09 A29, the public surface stays silent until one boat returns the gate test confirming the score is true.

When that happens, expect a separate set of homepage changes that introduce:
- Awareness instrument (P0 Exposure Estimate — a category model from public data)
- Free P1 self-check
- In-product Integrity Score with weekly delta during the pilot
- Verified vs Unverified language (per §09 A11-A16, two-axes resolution)

None of that is in scope for this branch. This branch only does the §11 painkiller-lead reframe.

---

## 7. What's wrong / not finished

- **Variants are inspection-only.** None has been validated against a real engineer/captain. The §11-L1 acceptance test ("a captain in 90 seconds repeats one sentence back") hasn't been run.
- **V1's mission catalog is in the old 2-column text-only format.** Only V2 has the full media-artefact treatment for the five workers. Before shipping V1 the worker section should be upgraded to V2's pattern.
- **V3's buyer pane is a single block.** A more developed two-buyer treatment would add a parallel section for family-office operators (§04 first-10 customers list).
- **V4's hero is light.** Each subsequent section has ample height, but the hero itself uses production hero markup that may look short relative to the rest. Consider adding the same min-height: 100vh treatment to the hero.

---

## 8. Files that exist only on this branch

```
HANDOVER-REFRAME.md           ← this file
design-studio/reframe-v1.html
design-studio/reframe-v2.html
design-studio/reframe-v3.html
design-studio/reframe-v4.html
design-studio/INDEX-reframes.html
```

Everything else on this branch is identical to `main` (this branch was branched from `main` at commit `eada87d`).

---

## 9. Branch hygiene

This branch is **not** merged into main. It's not intended to be — at least not as-is. The expected flow is: one of the four variants gets promoted into a new branch off `main`, the chosen design is adapted to use relative paths and production-ready content, and that new branch is what ships. This branch then either stays alive as a reference or is deleted once the reframe ships.

Don't merge this branch to main directly. The variants would all become live pages on celeste7.ai/design-studio/reframe-v*, which isn't the goal.
