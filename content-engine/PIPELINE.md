# PIPELINE.md — design of the celeste7.ai content pipeline

This is the design doc for what's actually built in `content-engine/`. It walks
the stage flow, and for each stage names the obstacle, the chosen solution, and
why that solution over the alternatives. It is kept accurate to the code — every
script and contract named here exists and is wired through `run.mjs`.

## The thesis

celeste7.ai is a restraint brand: a superyacht maintenance product that wins by
**not** over-promising. The marketing site is a static Webflow export on Vercel
with ~11 existing `/blogs/*` posts. The job of this pipeline is to retarget those
and add new ones **without ever shipping a claim the product can't back** — and
without drowning the site in volume. Quality is the whole strategy, so the
pipeline is built around two human gates and one code firewall, not around
throughput.

```
idea → target → BRIEF → (Claude drafts) → GATE → founder review → PUBLISH → MEASURE → iterate
```

| Stage | Owner | Artifact | Tool |
|---|---|---|---|
| target → brief | script | `posts/<slug>/brief.md` + starter `meta.json` | `brief.mjs` (via `run.mjs new`) |
| draft | **Claude** | `posts/<slug>/draft.html` | human-in-the-loop (Claude Code / API) |
| gate | script | pass/fail + line-numbered violations | `gate.mjs` (via `run.mjs gate`) |
| review → publish | **founder** | `../blogs/<slug>.html`, `../images/blog/*`, `../sitemap.xml` | `publish.mjs` (via `run.mjs ship`) |
| measure | script | `scorecard-latest.json` | `scorecard.mjs` (via `run.mjs score`) |
| iterate | human | re-brief the stalled/dead URLs | back to stage 1 |

---

## Stage 1 — target → brief (`brief.mjs`)

**Obstacle.** A drafter (human or model) handed a bare keyword will reach for
whatever claim sounds good — which is how overclaims enter copy. They also won't
know which of 15 screenshots is approved for which chapter, or which existing
post owns the keyword (cannibalization risk).

**Solution.** `brief.mjs` compiles a per-post spec from the two registries: the
SAFE claim phrasings for the chapter, 3–5 suggested registry assets *with their
NEVER lines*, the SERP angle pulled from `REFRESH-PLAN.md` when `--refresh`
matches an existing slug, recommended internal links, and the required structure
by format. It seeds `meta.json` but never writes `draft.html`. Re-running never
stomps a drafted `meta.json`.

**Why this, not the alternatives.** A free-form prompt to the drafter would lose
the registries' constraints. A full CMS content model would be heavier than a
static site needs. The brief is a plain Markdown file because both a human and
Claude read it — and because it diffs cleanly in git alongside the draft.

---

## Stage 2 — draft (Claude, not a local LLM)

**Obstacle.** This is the stage where overclaims are born. The draft has to be
in the brand's voice, map every product claim to shipped code, place the right
asset at the right moment, and never use the banned lexicon.

**Solution.** The draft author is **Claude** (`claude-opus-4-8` — the
quality-first default; adaptive thinking; no sampling-parameter knobs, per the
Anthropic guidance). It runs as the human-in-the-loop step: a person opens
`brief.md` and has Claude write `draft.html` against it, then iterates against the
gate. The pipeline scripts make **zero** LLM API calls — drafting is deliberately
the one place a capable model + a human sit in the loop, not an automated call.

**Why Claude, not Ollama / a local 8B.**
- **Truth is the product.** Every claim must survive `gate.mjs` *and* map to real
  Cloud_PMS behavior. A small local model confidently manufactures the exact
  banned overclaims the brand refuses ("the handover writes itself", "searches
  every domain", "sealed PDF", "real-time") — it has no model of what shipped.
  We'd spend more cycles catching its hallucinated claims than drafting saves.
- **Voice + restraint.** The brand's register (Apple-style ledes, one media one
  focal point, teal accent words, calm CTAs) is subtle; a frontier model holds it,
  an 8B drifts to hype.
- **Cost is not the bottleneck.** At celeste's volume (consolidate, don't pump),
  a handful of high-quality drafts a month is trivial spend. Optimizing for the
  cheaper model optimizes the wrong axis.
- The trade we accept: a human must be in the loop to drive Claude. That's a
  feature here — it's the same human who will later gate publish.

---

## Stage 3 — gate (`gate.mjs`): code firewall, not manual review

**Obstacle.** Even a careful drafter slips: a price sneaks into a sentence, a
`verify.` typo for `verifier.`, an internal component name, an asset id that
doesn't exist. Manual proofreading misses these under deadline, and "be careful"
is not enforceable.

**Solution.** `gate.mjs` reads `lib/claims.json` + `lib/assets.json` and **fails
closed (exit 1)** on:
- any `banned_lexicon` / `banned_overclaim` / `call_only` (pricing) regex match;
- the dead host `verify.celeste7.ai` (must be `verifier.`);
- internal code/file names (`HandoverDraftPanel`, `executeAction(`, `*.tsx`,
  `POST /v1/…`, `combined_service`, `f1_search_cards`);
- any **unbound** `{{asset:}}` placeholder (id not in the registry);
- structural defects on full pages (missing canonical, >1 `<h1>`, `<title>` not
  30–65 chars, meta description >155, no JSON-LD).

Each violation prints with a **line number and the safe substitute** when known.
The AI/ML lexicon family is a WARN (editorial exception via `data-editorial`),
everything else is a hard FAIL. `node gate.mjs --self-test` runs PASS/FAIL
fixtures — including a clean-page fixture that must pass and a dirty fixture that
must catch "writes itself", `$450`, `verify.celeste7.ai`, and an unbound asset —
so the firewall itself is verified, not assumed.

**Why code, not manual review.** A regex firewall is deterministic, runs in
milliseconds, runs identically in `run.mjs gate` and inside `publish.mjs`, and
can't be tired or rushed. Manual review is still there — it's the founder at
stage 4 — but it reviews *substance*, freed from policing a checklist a machine
enforces perfectly. The gate is also the contract that lets us trust a model-
authored draft: the draft is only as safe as the gate, so the gate is the thing
we hardened and self-test.

**Proven on real content.** The flagship draft
`posts/crew-turnover-knowledge-loss/draft.html` passes the gate clean (draft +
meta). Injecting six realistic slips into a copy of that exact file — a `$4,000`
price, `Our AI walks the knowledge graph`, `the handover writes itself`, the
`verify.` host, an unbound `{{asset:does-not-exist}}` — makes the gate report 10
line-numbered violations with the correct safe substitutes and exit 1. The gate
bites on real copy, not just fixtures, and was not weakened to pass piece #1.

---

## Stage 4 — review → publish (`publish.mjs`): static git, not a CMS

**Obstacle.** The site is a static Webflow export. Getting a new post live means
producing a real HTML file in the served tree, with the right `<figure>`s, honest
image dimensions, the page shell, structured data, and a sitemap entry — and it
must be impossible to publish a draft the gate rejected.

**Solution.** `publish.mjs` is **fail-closed**: it shells out to the same
`gate.mjs` first and aborts on any non-zero exit. Then it resolves each
`{{asset:id}}` to a `<figure>` with the registry alt and **real PNG dimensions**
read from the IHDR (stdlib, no deps → no layout shift), copies the asset to
`../images/blog/`, injects title/meta/canonical/body/JSON-LD into
`templates/post.html`, writes `../blogs/<slug>.html`, and upserts the `<url>` in
`../sitemap.xml` with an honest `lastmod`. `--check` is a dry-run that renders
nothing. It finishes by printing the git add/commit/push + PR + GSC
request-indexing steps.

**Why git on a static site, not a CMS / live API push.**
- The site already *is* a git-deployed static export on Vercel — publishing a
  file and pushing is the native motion; deploy + rollback are free.
- A CMS would add a database, an admin surface, and a moving part to secure, for
  a handful of posts a month. Wrong weight.
- Git gives the founder a reviewable diff (`blogs/<slug>.html`, the copied
  images, the sitemap line) before anything is public — the review gate is the
  PR. Nothing reaches the served tree without a human running `ship`, and nothing
  reaches the public without a human running `git push`. Two human checkpoints,
  zero auto-publish.

**The asset firewall, not free LLM media.** Images are **only** registry assets,
referenced by `{{asset:id}}`; an unknown id fails the gate and a surviving
placeholder aborts publish. We never let a model generate or free-float an image:
the 15 screenshots are QA'd, each with an approved alt and explicit NEVER lines,
because a fabricated or mis-captioned product screenshot is the most damaging
overclaim of all — it *looks* like proof. The registry is the single source of
truth; the gate enforces it; publish resolves it.

---

## Stage 5 — measure → iterate (`scorecard.mjs`)

**Obstacle.** Without feedback, "quality not volume" becomes "publish and hope".
We need to know which shipped posts are working and which are wasting a slot.

**Solution.** `scorecard.mjs` pulls the last 28 days vs the prior 28 from Google
Search Console (by page, for `sc-domain:celeste7.ai`), computes position and
impression deltas, and classifies each `/blogs/*` URL **climbing / stalled /
dead**. It writes `scorecard-latest.json` and prints a table. It does **not** tell
you to pump out posts — it tells you which already-shipped post to re-brief for
Claude to rewrite against a sharper keyword. The loop returns to stage 1 for the
stalled/dead URLs only.

**Why GSC position-delta, not vanity counts.** On a low-traffic founder site
absolute clicks are noisy; rank movement on a settled 28-day window is the
honest signal of whether a retarget worked. The measure leg shares the pipeline's
restraint: it steers consolidation, never volume.

---

## Cross-cutting decisions

- **Node stdlib only, zero deps.** A content pipeline that itself pulls a tree of
  npm packages is a supply-chain and maintenance liability for a static marketing
  site. Everything — arg parsing, PNG dimension reading, sitemap upsert, the GSC
  OAuth refresh — is hand-rolled on the standard library. It runs anywhere Node 24
  runs, forever, with nothing to update.
- **Two registries → two JSON contracts.** `ASSET-REGISTRY.md` → `lib/assets.json`
  and `claims-allowlist.md` → `lib/claims.json` are the single sources of truth.
  `brief.mjs`, `gate.mjs`, and `publish.mjs` all read the JSON, so the brief that
  suggests an asset, the gate that bans a phrase, and the publish that resolves a
  placeholder can never disagree.
- **`run.mjs` is a thin seam.** It forwards to the real scripts with the exact
  argument shapes they expect and prints the next human action at each hand-off.
  Validation stays in the scripts (one source of truth); the orchestrator only
  makes the contract impossible to forget — and surfaces the dir-slug vs
  canonical-slug mismatch before a refresh ships to the wrong filename.
