# CelesteOS Content Engine — documentation

> **Private.** This folder is excluded from the Vercel deploy (`.vercelignore`). It documents internal strategy, the truth gate, and the automation. Do not move it out of the ignore scope.

The content engine produces SEO blog posts for **celeste7.ai** that are *true to the shipped product, on-brand, and genuinely useful* — **quality over volume.** It is a **conducted** engine, not a self-driving one: **Claude writes, a deterministic gate enforces truth + brand, you approve the merge.** It is **not** machine learning (no training, no model that drifts).

```
TARGET → BRIEF → DRAFT (Claude) → GATE (script) → REVIEW (you) → PUBLISH (git) → MEASURE (GSC) → ITERATE
  ▲                                                                                              │
  └──────────────────────────── scorecard reprioritises ─────────────────────────────────────────┘
```

## Read these in order
1. **[ARCHITECTURE.md](ARCHITECTURE.md)** — the design: every stage, the obstacle it faces, the solution, and *why this solution and not the alternatives* (Claude vs Ollama, gate-as-code vs manual review, consolidate vs volume, git vs CMS, the asset firewall).
2. **[SCHEDULER.md](SCHEDULER.md)** — the twice-weekly automation: what runs, when, how to pause/resume/run-now, the queue, notifications, troubleshooting.

## Where everything lives

| Thing | Path | In repo? | Deployed? |
|---|---|---|---|
| Pipeline scripts (gate, brief, publish, scorecard, run) | `content-engine/*.mjs` | ✅ | ❌ (`.vercelignore`) |
| Truth gate rules | `content-engine/lib/claims.json` ← `claims-allowlist.md` | ✅ | ❌ |
| Asset registry (QA'd product shots + allowed claims per image) | `content-engine/lib/assets.json` ← `ASSET-REGISTRY.md` + `content-engine/assets/` | ✅ | ❌ |
| Brand post template | `content-engine/templates/post.html` | ✅ | ❌ |
| Drafts (one folder per piece) | `content-engine/posts/<slug>/{brief,draft,meta}` | ✅ | ❌ |
| **Published posts** | `blogs/<slug>.html` + `images/blog/*` | ✅ | ✅ **(public)** |
| Scheduler runner | `~/.celeste-content-engine/engine-run.mjs` | ❌ (local) | ❌ |
| Scheduler queue | `~/.celeste-content-engine/queue.json` | ❌ (local) | ❌ |
| launchd schedule | `~/Library/LaunchAgents/com.celeste.content-engine.plist` | ❌ (local) | ❌ |
| Run log | `/tmp/celeste-engine.log` | ❌ | ❌ |

## The two non-negotiables
- **Truth.** Every product claim maps to shipped code. `gate.mjs` hard-fails any banned overclaim ("writes itself", "auto-generates", money-finder, "every domain cited"…), any hype word (AI-as-magic, smart, automate, seamless, optimize…), any pricing (CALL-ONLY), the dead `verify.celeste7.ai` host, and structural faults (missing canonical, multiple `<h1>`, over-long title/meta, no JSON-LD). Nothing un-gated ships — `publish.mjs` refuses it.
- **You gate publish.** The engine opens a **PR**. It never merges. Your brand, your call.

## Day-to-day
- A new piece, by hand: `cd content-engine && node run.mjs new --slug <s> --keyword "<kw>" --chapter <c> --format <f>` → have Claude draft `posts/<s>/draft.html` → `node run.mjs ship <s>`.
- Automated: it runs **Mon + Thu 09:00**, drafts the next queued piece, and opens a PR for you to review + merge (see SCHEDULER.md).
- Measure: `cd content-engine && node run.mjs score` → climbing / stalled / dead per URL (needs GSC; access is wired via JARVIS analytics-node).

## Current state (2026-06-11)
- Engine built + proven (gate self-test 28/28; proven catching real violations).
- **5 posts shipped** (PR #41, merged + live): `knowledge-crisis-superyachts` (refresh), `engineering-handover-superyacht` (refresh), `ism-internal-audit-checklist-yacht`, `digitize-yacht-maintenance-records`, `yacht-maintenance-log-spreadsheet-template`.
- Scheduler installed + loaded; queue holds the 5 remaining first-10 pieces.
