# Content Engine — architecture & decisions

The design, stage by stage: what it does, the obstacle it faces, the chosen solution, and **why this and not the alternatives.**

## The shape, and the decision everything hangs on
A **Claude-authored, script-enforced, founder-gated, git-published quality line.** Scripts do the mechanical work and the *enforcement*; **Claude does the writing**; **you** gate publish. Low volume (~2–3/week), every piece true and useful.

---

## Stage 1 — TARGET (pick the next keyword × chapter × format)
- **Obstacle:** "handover handover handover", or chasing high-volume keywords that never convert.
- **Solution:** the candidate set is constrained to the **validated keyword tiers** (Linear ALE-232) + the 11-post refresh queue. A target only exists if demand is proven (GSC / SERP-validated).
- **Why not** a free LLM picking topics: it invents plausible-but-dead keywords. **Demand data gates the matrix.**

## Stage 2 — BRIEF (`brief.mjs`)
- **What:** turns a target into a spec — the keyword, the **SAFE claim phrasings for that chapter** (from `claims.json`), the **assets allowed** (from `assets.json`, with their NEVER lines), the SERP angle, internal-link targets, required structure.
- **Obstacle:** a writer over-claims because they don't know where the truth line is.
- **Solution:** the brief *hands them only the safe phrasings and the allowed media* — the constraints travel with the task.
- **Why not** write briefs by hand: doesn't scale, drifts; the machine-assembled brief pulls live from the truth gate every time.

## Stage 3 — DRAFT — **Claude, not Ollama** (the load-bearing decision)
- **Obstacle:** the mandate is *no AI slop, no bulk volume, always provide value.* A local 8B model (what the MYI2 pipeline uses) cannot hold the truth-gate + brand voice — it manufactures the exact overclaims that are banned.
- **Solution:** the drafting model **is Claude** (this Claude Code loop, or the headless `claude -p` run the scheduler invokes).
- **Why not Ollama** (MYI2's engine): MYI2 is a keyword *factory* — volume is the product, a thin model is fine, the gate just downgrades junk. Celeste is the opposite — **brand-critical, every claim = shipped code, restraint is the moat.** Quality must live in the *generator*, not be bolted on after. Cost (Claude ≫ Ollama per token) is irrelevant at 2–3 pieces/week.

## Stage 4 — GATE (`gate.mjs`) — the truth firewall as code
- **Obstacle:** "the handover that writes itself", "$450", `verify.celeste7.ai`, "auto-generates" — these *had shipped to the live site*. Human review misses them under deadline.
- **Solution:** a deterministic linter — the banned-lexicon + overclaim + pricing regexes from `claims-allowlist.md`, plus structural checks (canonical, single `<h1>`, title/description length, JSON-LD, dead host, internal code names, unbound `{{asset}}`). It runs on the **draft AND the final rendered page**. `publish.mjs` refuses anything it fails.
- **Why not** manual review only: that is precisely what let real violations reach production. **Why not** an LLM-judge gate: non-deterministic and arguable. The lexicon is **mechanical and unbribable.** (An LLM-judge may be added *on top* for nuance — never *instead*.)
- **Proof it works:** 28/28 self-tests; a poisoned fixture is caught on every violation (exit 1); it caught a template-level money-finder overclaim and a double-`<h1>` that the draft-only gate couldn't see.

## Stage 5 — REVIEW (you)
- **Obstacle:** even a gate-passing, on-brand piece is a brand statement you must own.
- **Solution:** publish is a **git PR you merge** — the gate kills the mechanical errors so your review is about judgment and taste, not typo-hunting.
- **Why not** auto-publish: it's your brand; founder-gated, full stop.

## Stage 6 — PUBLISH (`publish.mjs`) → static HTML + sitemap, via git
- **Obstacle:** celeste7.ai is a **static Webflow export** — no CMS, no DB to write to.
- **Solution:** render the draft into the **brand post template** (Eloquia Display / DM Sans / Cormorant italic / IBM Plex Mono, canonical, Article+FAQ schema), bind `{{asset:id}}` → the real product screenshot (copied to `images/blog/`), write `/blogs/<slug>.html`, upsert `sitemap.xml`. The output filename is derived from the **canonical** so a *refresh* overwrites the trusted URL instead of spawning a new one. Commit → PR → Vercel.
- **Why not** a CMS / headless: massive overkill at 2–3/wk and it would fight the team's live Webflow workflow. **Git is the CMS** — indexable, versioned, reviewable, zero new infra.

## Stage 7 — MEASURE (`scorecard.mjs`, via GSC)
- **Obstacle:** most content ops never close the loop — they publish into the void.
- **Solution:** per-URL position + impressions over 28d vs the prior 28d → classify **climbing / stalled / dead**. Climbing → expand + interlink. Stalled → refresh title/depth. Dead after 2 cycles → kill, and log *why* into the brief templates so the corpus learns.
- **Why not** GA4 vanity metrics: GSC position/impressions is the *causal* ranking signal; GA4 is downstream.

## Stage 8 — ITERATE
The scorecard re-ranks the target matrix. The loop closes.

---

## The media bottleneck — solved once, at the door (the Asset Registry)
- **Obstacle (the stated worry):** "if our render has errors, the LLM places it verbatim."
- **Solution:** 16 product renders were **visually QA'd once** — 15 admitted, **3 rejected** (one because *the image is the banned claim*). Each accepted asset carries its chapter, the claims it can support, its **NEVER** lines, and approved alt text. The draft only emits typed `{{asset:id}}` placeholders; binding is deterministic from the registry. **A bad or overclaiming render physically cannot reach a page** — it never entered the registry. New media is made in small Claude batches and QA'd before admission. Free LLM media generation is never in the loop.

## What this deliberately is NOT (and why)
- **Not autonomous** — Claude drafts, you merge. Autonomy is where slop ships.
- **Not high-volume** — a few excellent pieces beat 30 thin ones on a low-authority domain (Google won't index the thin ones anyway — proven in the indexing audit).
- **Not a new stack** — Node stdlib scripts + git + existing Webflow/Vercel. Zero deps.
- **Not machine learning** — a fixed model + your written rules + deterministic scripts. The only "learning" is the human/Claude reading the scorecard.

## Honest limits
- The *draft* step needs a Claude in the loop (interactive, or the scheduled headless run) — it is **not** an unattended cron that needs no model.
- Backlinks / domain authority (the real ranking unlock) are **outreach**, not pipeline. The SERP research named the targets (SuperyachtNews, Hill Robinson, Quay Group…).
