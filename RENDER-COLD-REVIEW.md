# RENDER — Cold Review

**The honest data-continuity rebuild, truth-locked. Two built variants, one register decision underneath them.**

Branch: `render/landing-hormozi-variants`
Index: `render-index.html` (open this first — C1 and C2 lead; A1/A2/B1/B2 are demoted as *superseded — money-first, retired*)

This is a cold review, not a recommendation. It states the pivot, reads C1 against C2 on tone alone, records exactly what was de-claimed to match shipped reality, and flags what is still owned by the founder. Both live variants are truth-locked. The call is yours.

---

## The pivot — in three lines

1. **Money-first is retired; the why is the hero.** A1/A2/B1/B2 led on capabilities that aren't shippable today. C1/C2 lead on the one thing the product genuinely does now — *the vessel's memory stays in the vessel.*
2. **Receiving is removed (beta); the live moments carry the page.** The page no longer leans on the receiving discrepancy. It now stands on what ships: assisted one-tap capture, manual document linking with discovery, cited search, an append-only record, and show-related as the one fully-live moment.
3. **The guarantee is a value-promise, not a savings promise.** No figure, no money-back claim. *Cancel anytime. Every record exports with you.* That's a promise the product can keep without a number behind it.

The money-finder isn't deleted — it survives as **one quiet roadmap line** (warranty-window flagging, clearly future-tense, no figure). See the flags for its exact kill-location.

---

## C1 vs C2 — tone only, both honest

The two live variants make the **same claims** and carry the **same honesty**. Nothing structural moves between them — only the register.

### C1 — continuity · narrative
`render-C1-continuity-narrative.html`

Long-scroll, warmer-operational. The why breathes; each moment gets its own room. The founder voice sits near the hero in the first person and the page unfolds the argument beat by beat. Reads cold as *"someone who's actually done handovers built this."* The fuller, more human read; it earns trust by taking its time.

### C2 — continuity · editorial
`render-C2-continuity-editorial.html`

Tightened, one beat per viewport, maximal restraint. The same story in fewer words and more white space — calmer and denser at once. Reads cold as *"this is the system of record, stated plainly."* The most premium of the two; it earns trust by saying less. Where C1 persuades, C2 simply asserts and lets the white space carry the weight.

**The decision between them is voice, not substance.** Open `C1 ↔ C2` side by side: whatever feels different is register alone — warmer narrative against calmer editorial. Neither is more or less honest than the other.

---

## PRODUCTION-TRUTH CORRECTIONS

What was de-claimed during the truth-lock pass, and why. Each line below was pulled back to match shipped behaviour — nothing here is aspirational, and nothing claims more than the product does today.

- **Handover — "assisted one-tap capture," not "automatic."** The product does not auto-assemble a handover. The chief triggers it and confirms what goes in; the system makes that a one-tap action against the existing record. De-claimed any "auto-generated handover" framing → the page describes assisted one-tap capture only.
- **Linked documents — "manual link + discovery," not "auto-propagation."** Documents are linked by a person, and the value is that once one person links a manual, everyone else can *discover* it. There is **no automatic propagation** of a document across faults/equipment. De-claimed "documents follow the equipment automatically" → the page says one person links it, everyone finds it.
- **Search — "cited-core," no domain over-promise.** Search returns answers with citations back to the record. The page does **not** promise full-domain / whole-fleet coverage. The full F1 search surface **may be gated** (see flag (b)) — so the copy stays at *cited search over your records* and makes no coverage claim that a live gate could contradict.
- **Ledger — "append-only," NO hop-back, NO sealed-PDF.** The record is append-only: timestamped, attributable, never quietly edited, only grows. De-claimed everything in the FORBIDDEN register — no "hop back," no "resume where you left off," no "sealed," "tamper-proof," "court-grade," "evidence," "forensic." Sealing is v1.0-planned, not shipped, so the word *sealed* was removed from all body copy (this also resolved the C1 audit flag: line 495 now reads *"See what a signed handover looks like,"* since the live feature is signature/countersignature, not sealing).
- **Show-related — the one fully-live moment.** This is the single moment the page can demonstrate end-to-end as shipped today: open a fault, see the related faults / work orders / parts / documents already connected on the record. It is the page's strongest honest proof point — everything else is described, this one can be *shown*.

---

## FOUNDER DECISIONS / FLAGS

### (a) S3 linked-docs overlaps S2 show-related — and the auto-propagation you asked for is NOT shipped
S3 (linked documents) and S2 (show-related) are telling overlapping stories. Both are "things already connected on the record surface together." More to the point: the **automatic propagation** behind the original S3 ask — link a manual once and have it follow the equipment everywhere on its own — **is not shipped.** What ships is manual link + discovery. Decision is yours, three honest options:
- **Keep-honest-recast:** keep S3 but reframe it strictly as *manual link → everyone discovers it*, and differentiate it from S2 so the two beats don't read as one. Ship-safe today.
- **Cut:** fold S3 into S2 and let show-related carry the "everything's connected" story alone. Tightest, removes the overlap entirely.
- **Wait-for-feature:** hold S3 in its fuller form until auto-propagation actually ships, then restore the original claim truthfully.

Recommendation is not made here — but only keep-honest-recast and cut are shippable **now**; wait-for-feature parks the beat.

### (b) The search gate needs a live confirm before any coverage promise
There is a **contradiction to resolve before the copy can widen:** the code path reads as **gated to a single yacht**, while the live audit reports the **gate is open.** Until that is confirmed against the live environment, the page must **not** promise search coverage (domain, fleet, or "everything"). The copy currently stays at cited-core for exactly this reason. **Action:** confirm live whether full F1 search is gated to one yacht or open across the tenant — *then* decide whether the page may claim broader coverage. Do not widen the claim on the strength of either source alone.

### (c) Money-finder roadmap line — kill-location (one edit per file)
The money-finder is no longer load-bearing anywhere on the page. It exists only as a single future-tense roadmap row — no figure, visually minor, an isolated block with no styling dependents downstream. Deleting either block leaves the page intact:
- **C1:** `render-C1-continuity-narrative.html` — the `<!-- ROADMAP LINE — money-finder … -->` block, the roadmap row at **≈ lines 443–448** (*"Warranty-window flagging … In development."*).
- **C2:** `render-C2-continuity-editorial.html` — the matching `<!-- ROADMAP LINE — money-finder … -->` block at **≈ lines 429–435**.

Removable in one edit per file whenever you decide it shouldn't be hinted at yet.

### (d) The 2-minute walkthrough must show shipped behaviour only
Whichever variant ships, the walkthrough/demo it points to must contain **only shipped behaviour** — no auto-handover, no document auto-propagation, no sealed-PDF, no money-finder. The safest spine for a 2-minute demo is the live chain the page already stands on: **show-related** (the one fully-live moment) → assisted one-tap handover capture → cited search over the record → the append-only record growing. Anything outside that set is a claim the demo can't keep.

### (e) The guarantee value-promise is attorney-gate-able
The guarantee block (*"Cancel anytime. Every record exports with you."*) is a value-promise, not a contractual term, and reads honestly as written. But the moment this wording is pointed at real customers or cited in a contract, **it must clear attorney review** — "cancel anytime" and "every record exports with you" become enforceable commitments if quoted in terms. Location: `guarantee__body` in both files (C1 ≈ line 393; C2 ≈ line 364). Flagged, not changed — the gate is legal, not design.

---

## §7 — the standing limit: this converts; it does not generate

These pages **convert traffic; they do not generate it.** And there is **still no lead-capture surface on the page** — no form, no email field, no booking embed. The walkthrough is ungated (*No signup. No sales call.*), which is good for trust and bad for capture: a visitor who is sold has nowhere to act and leaves no trace. Whichever variant ships, the page is a destination with no front door behind it.

**The real next work is the cold-outbound engine** — the thing that puts qualified traffic in front of this page in the first place. Polishing C1 vs C2 is a register decision on an asset that, today, has nothing pointed at it. The honest framing: the rebuild is done, honest, and truth-locked; the conversion surface is the smaller remaining gap; **demand generation is the actual open frontier.**
