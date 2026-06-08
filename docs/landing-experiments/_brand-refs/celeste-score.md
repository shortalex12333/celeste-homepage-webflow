# The Celeste Score — Vision & Thesis

*Canonical vision document. Plain language on purpose. This is the thesis the REVIEW docs (01–10) feed into. If anything below conflicts with a feature you want to build, the doc wins until the doc is changed.*

---

## The one-line thesis

> Every 30m+ yacht is quietly decaying behind a good-looking facade, and **nobody can see how fast — not the owner, not the buyer, not the insurer.** Celeste makes that invisible decline measurable, and turns it into money at the exact moment someone has to trust the boat: a sale, an insurance renewal, a claim.

We are not a PMS. We are not a brokerage. We are the company that owns the **operational truth** of a yacht over time.

---

## 1. Two halves: the outside view and the inside view

- **Care Proxy (public AIS / yard data) = the outside view.** How looked-after the boat *appears* — yard periods, spend pattern, survey timing. Anyone could observe this from the dock. It cannot be faked by the crew, because we didn't ask the crew — we watched the boat.
- **Celeste PMS = the inside view.** What is *actually* breaking and how fast it is being fixed. Only visible if you are on the boat's system.

**The product is not either one. It is the gap between them.**

### Either extreme tells you nothing

A boat always in the water could be neglected — or just well-run and busy. A boat always in the yard could be a careful owner — or a disaster. The public number alone is ambiguous. **That is exactly why it is only a hook, not the answer.** The PMS resolves the ambiguity. The Care Proxy's job is to *start the conversation*; the PMS's job is to *tell the truth*.

---

## 2. What the PMS adds — the 3 numbers that make it real

Public data cannot see these. Celeste can:

1. **Fault frequency trend** — is stuff breaking more often over time? (the trend, not the count)
2. **Rectify velocity** — how fast does a fault go from raised → fixed-with-evidence, and is it *slowing down*? A slowing fix-rate is the operation decaying even when the equipment still looks fine.
3. **Repeat-fault rate** — the same thing breaking again = the knowledge walked off the boat at handover. This is the original pain, now a measurable number.

> **Wear** = faults rising + fixes slowing + repeats climbing.
> **Care** = yard time + spend + on-schedule maintenance.
> **The delta** = wear accelerating while care looks normal from outside = the hidden decline nobody can see today.

That is the money sentence.

---

## 3. The killer point — why combining the two is the whole business

Self-reported maintenance is **worthless** to an insurer or a buyer — of course the crew says it is well maintained. But self-reported maintenance **corroborated by independent outside behaviour data** is something an underwriter can actually trust.

So the Care Proxy's biggest value is not the number itself. It is that **the outside view is what makes the inside (Celeste) number believable to someone who is not on the boat.** The cross-check — *"their PMS says healthy, and the independent yard/AIS pattern agrees"* — is what turns a maintenance record into an **insurable signal.** That is the bridge to the Marsh endgame, and it only exists when the two halves are combined. Neither half gets there alone.

---

## 4. Three things, not one (the part people get confused by)

These are **separate** and must never be collapsed:

1. **The Score** — the headline number (wear-vs-care health). "This boat is 84."
2. **The immutable record** — the signed, tamper-proof evidence underneath it. The proof the 84 is real.
3. **The moment** — sale / renewal / claim. When an outsider must trust the boat.

How they connect: at the moment, "trust me, my score is 84" is worthless. What moves money is **the Score (headline) + the immutable export (proof), released at the moment someone needs to trust it.**

So the immutable-record export is **not a side feature. It is the payload of the paid product.** It is literally what changes hands when money moves.

### The analogy that settles it

Your credit score: free in an app all year — nobody pays for that. The day you apply for a mortgage, the lender pulls a **verified, official report** — *that pull, at that moment,* is monetised. Celeste is identical. Carfax is identical (free to know a report exists; you pay for it at the moment of buying the car).

---

## 5. Who sees the number — the visibility model

Four layers, decided:

1. **Your own score → always visible to that yacht, free.** The owner/manager always sees their number and the 3 gaps. Never hidden, never charged. Hiding your own number kills adoption.
2. **The benchmark → your *position*, not other boats' data.** "You: 62. Comparable 45–55m fleet: 78. Bottom 25%." You never see another named yacht's score. Anonymised percentile only — discretion is the trust.
3. **The market → a *badge* + owner-released, never published.** The world sees only that a Verified Celeste record *exists*. The number itself is released by the owner to one counterparty at the money-moment. (Carfax model.)
4. **Raw peer data → never public. Ever.** That is the asset.

---

## 6. Where the money is (free → paid → premium → enterprise)

- **Free — the meter:** your own score + gaps + anonymised percentile. Never charged. We need maximum density; a boat with no badge must look conspicuous.
- **Paid — the PMS subscription:** you don't pay for the score, you pay for the **workflows that move it** (handover, receiving, search). The score is the dashboard of the boat you are paying to run better.
- **Premium — the moment:** the **Verified, signed, exportable record** released at sale / renewal / claim. The broker, buyer or underwriter wants a *trusted* number at exactly the moment money moves. This is the high-margin product.
- **Enterprise — the endgame:** the aggregate benchmark licensed to insurers (the Marsh path). Separate, consented, years out. **Never** sold to crew. **Never** disclosed at point of sale.

---

## 7. The line we never cross (P0 vs P1)

- **AIS-vs-sale-price = the OUTSIDE hook (P0).** Public, rough, for boats not yet on Celeste. Its only job is to start the conversation.
- **The Celeste Score = the INSIDE number (P1).** Built from maintenance/operational data. Wear-vs-care. This is the product.

**The day these merge, we are a worse VesselsValue and we have lost.** Hold the line.

---

## 8. Do's & Don'ts of our presence

**Do**
- Lead with the painkiller: "15-minute onboarding, your whole history searchable and scored by tomorrow morning."
- Show people *their own number* and let it do the persuading. Never argue the problem exists — instrument it.
- Keep the score free and widely visible to build density and the negative-signal flywheel.
- Sell the *verified export at the moment*, not the score.
- Borrow trust from institutions the market already trusts (class, flag, the brokerage) until we are one.
- Be the company whose answer to "where did you get this data?" is always sayable out loud to an underwriter.

**Don't**
- **Don't disclose the insurance/data endgame** to a PMS prospect, ever. It converts the buyer into an adversary instantly.
- **Don't scrape** restricted or ToS-protected systems (ClaimSearch, MarineTraffic, brokerage sites). A trust company cannot be the one that got caught. License or capture — never scrape.
- **Don't sell the score** itself, or over-price the meter — that starves the moments that are the actual business.
- **Don't use engagement-bait or directive CTAs** in public (no "DM PILOT", no "comment X"). B&O / Rolex posture. The buyer cannot be seen replying in public.
- **Don't let "no data" become a score.** Blank = Unverified, never good and never bad.
- **Don't conflate the outside hook (P0) with the inside Score (P1).**
- **Don't "fake it till we make it" on access or credentials.** It is fatal to the endgame and possibly to you personally.

---

## 9. The thesis, restated in one breath

> Free score all year makes the invisible decline visible to the boat. Independent outside data makes that score *believable to an outsider*. At the moment money moves — sale, renewal, claim — the owner pays to release a **verified, immutable export** of it. The score gets us in; the proof-at-the-moment gets us paid; the pooled data over years becomes the thing insurers cannot live without. We do not sell software. We sell *proof of operational truth, at the second it is worth money.*


=====

  - Name: wear-care-score. Fine for now.
  - Care (outside): AIS → yard/refit itinerary. Public, observed, can't be faked.
  - Wear (inside): measured from Celeste's own PMS data — the same 3 numbers (fault-frequency
  trend, rectify/recovery %, repeat-fault rate), bucketed into ~5 coarse groups: navigation,
  propulsion, generation, HVAC, LSA.
  - Score = the delta between those two.
  - Side-car search: the 7,000 forum reports power "others who hit this did X, 73% resolved" —
  inside Celeste, subscriber-gated.

  That's the whole model. It's buildable. Your coarse-groups instinct is correct — coarse is a
  feature, not a limitation. Five is even slightly generous; propulsion + generation is where
  boats actually bleed.
