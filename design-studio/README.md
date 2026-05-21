# design-studio/

**Nothing in here is part of the production site.** No file in this directory is linked from the public site, included in `sitemap.xml`, or surfaced via `robots.txt`. The directory exists so design explorations have a home in the repo and aren't lost in someone's downloads folder.

If you're auditing what production serves, ignore this directory entirely. The only canonical surface is the HTML files at the repo root.

---

## What's in here

### Reframe prototypes (May 2026, on `studio/reframe-prototypes` branch only)

Four full-homepage prototypes built against the `CelesteOS-Score/review/11_site_copy_reframe.md` plan, plus an index page that compares them.

**These files are on the `studio/reframe-prototypes` branch only — they are not on `main`.**

| File | What it is |
|---|---|
| `INDEX-reframes.html` | Side-by-side comparison of the four variants with description, intended buyer, and risk profile per variant. **Start here.** |
| `reframe-v1.html` | Plan-literal — surgical execution of the §11 plan. Closest to production layout. |
| `reframe-v2.html` | Mission-as-hero — agentic search promoted up. Has the **fullest** treatment of the "five workers" section with media artefacts (draft email, certificate bundle, PO compare, timeline, cross-domain answer card). |
| `reframe-v3.html` | Two-persona pane — adds a second `(01b) For the office` block addressed to the management company / technical superintendent. |
| `reframe-v4.html` | Flow rebuild — four ample-height sections in order: 01 Handover, 02 Workers, 03 Search, 04 The boat's truth. Generous whitespace, one idea per viewport. |

All four use the production CSS via absolute `https://celeste7.ai/...` URLs. Open any of them via `file://` and they render with the live brand chrome (Eloquia font, dashed dividers, etc.).

To inspect:
```sh
open -a 'Google Chrome' design-studio/INDEX-reframes.html
```

### Handover document studies (May 2026, on `main`)

Four standalone design studies of what a generated handover document might look like. Used to pick the final design that became `prototypes/handover-cover.html` (the production iframe in Service 03).

| File | What it is |
|---|---|
| `INDEX.html` | Side-by-side comparison of the four handover document studies. |
| `handover-1-cover-floating.html` | Cover-style document, generous white space. |
| `handover-2-kpi-spread.html` | Document with KPI tiles up top. |
| `handover-3-signature-moment.html` | Focused on the signature moment. |
| `handover-4-dark-cinematic.html` | Dark, editorial. |

**The production design that shipped** is `prototypes/handover-cover.html` (an evolution of variant 1).

### Verifier studies (May 2026, on `main`)

Four standalone design studies of the verifier receipt visual. Used to pick the final design that became `prototypes/proof-receipt.html` (production iframe in Service 04).

| File | What it is |
|---|---|
| `verifier-1-drop-zone-dark.html` | Drop-zone for verification, dark. |
| `verifier-2-success-state.html` | The "verified" success state. |
| `verifier-3-hash-spotlight.html` | Hash-front-and-centre treatment. |
| `verifier-4-light-editorial.html` | Light editorial take. |

**The production design that shipped** is `prototypes/proof-receipt.html` (an evolution of variant 2).

---

## Why keep these around

1. **Provenance.** When someone asks "why does the production handover look this way and not the way I'd have done it?" — the answer is in the studies. They show the rejected alternatives.
2. **Recovery.** If the production design starts feeling stale, the studies are a head start — they're already styled to the brand and contain explored copy.
3. **Reframe pause.** The reframe prototypes are paused, not killed. If/when the CEO decides which variant ships, the work isn't redone from scratch.

---

## Adding new studies

Put a new file here. Don't link it from the public site. Update this README with a one-line description. Commit on whichever branch the work belongs on — if it's experimental and not yet for production, branch off `main` rather than push the study to `main` directly.

---

## See also

- `HANDOVER.md` (repo root) — the engineer-onboarding doc.
- `HANDOVER-REFRAME.md` (repo root, present on `studio/reframe-prototypes` only) — the short companion to the reframe work, summarising the §11 plan and what each prototype tests.
