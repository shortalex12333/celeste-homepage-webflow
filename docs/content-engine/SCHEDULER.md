# Content Engine — the twice-weekly scheduler

Local automation (macOS `launchd`) that runs the engine **Monday + Thursday at 09:00**, drafts the next queued post with headless Claude, gates it, and **opens a PR for you to review + merge.** It never merges and never publishes un-gated.

## What it is, in one line
> Twice a week it wakes, writes the next post itself (Claude, gate-enforced), and drops a ready-to-merge PR in your inbox (ntfy + macOS notification). Your only job: read it, merge it — or skip it.

## Files (all local, not in the deployed repo)
| File | Purpose |
|---|---|
| `~/.celeste-content-engine/engine-run.mjs` | the runner (Node, stdlib only) |
| `~/.celeste-content-engine/queue.json` | the target queue — one piece per fire |
| `~/Library/LaunchAgents/com.celeste.content-engine.plist` | the schedule (Mon + Thu 09:00) |
| `/tmp/celeste-engine.log` | the run log |

## What one fire does (TCC-safe, fail-closed)
1. **Clone** the repo fresh into `/tmp` (launchd cannot write `~/Documents`, so it never touches the working tree).
2. **Pick** the next queue item whose `blogs/<canonicalSlug>.html` does **not** yet exist on `main` (so merged pieces are skipped automatically — no state to maintain).
3. **Brief** — `brief.mjs`.
4. **Draft** — invoke headless `claude -p` to write `draft.html` + `meta.json` against the brief + claims + asset registry, and **self-gate until clean** (`--allowedTools Read,Write,Edit,Bash`, 15-min cap).
5. **Verify** — the runner re-runs `gate.mjs` itself (does not trust the model's word). Fail → notify + abort, nothing published.
6. **Publish** — `publish.mjs` (gates the rendered page again; refuses anything failing).
7. **PR** — push `engine/<slug>-<date>` and open a PR titled "review + merge".
8. **Notify** — ntfy (`myi2-alerts-…`) + a macOS notification: "PR ready" or "failed — left for a manual session."
9. **Clean up** the `/tmp` clone.

Any error at any step → a single notification + clean exit. No broken state, nothing un-reviewed goes live.

## Your controls
```bash
# Pause / resume the schedule
launchctl unload ~/Library/LaunchAgents/com.celeste.content-engine.plist   # pause
launchctl load   ~/Library/LaunchAgents/com.celeste.content-engine.plist   # resume

# Run one piece right now (opens a real PR)
node ~/.celeste-content-engine/engine-run.mjs

# Dry run — draft + gate + publish locally, NO push/PR (safe test)
node ~/.celeste-content-engine/engine-run.mjs --dry

# Watch it
tail -f /tmp/celeste-engine.log

# Is it registered?
launchctl list | grep celeste.content
```

## The queue
`~/.celeste-content-engine/queue.json` is an array; each item:
```json
{
  "slug": "engine-room-handover-checklist",
  "canonicalSlug": "engine-room-handover-checklist",   // the blogs/<this>.html file; for a REFRESH use the existing post's slug
  "canonical": "https://celeste7.ai/blogs/engine-room-handover-checklist",
  "keyword": "engine room handover checklist",
  "chapter": "handover",                                // search | handover | ledger | suggested | show-related | cloud | security | certificate | verifier
  "format": "guide",                                    // guide | pillar | comparison
  "angle": "The Engine Room Handover Checklist (the ICS items people skip)",
  "note": "context for the drafter"
}
```
- **Add work:** append items. The engine takes them in order, one per fire.
- **A refresh** (improve an existing trusted URL): set `canonicalSlug`/`canonical` to the **existing** post; the publisher overwrites it.
- **Idle:** when every item's blog file exists, the engine logs "queue exhausted" and does nothing until you add more.

Loaded queue (the remaining first-10): organize-yacht-manuals-onboard · engine-room-handover-checklist · ism-code-yacht-requirements · yacht-logbook-digital-records · manage-maintenance-superyacht.

## Notifications
- **ntfy** topic `myi2-alerts-…` (same as the MYI2 pipeline — subscribe the ntfy app to it for phone push).
- **macOS** notification as a fallback.
- Two messages only: ✅ "PR ready: <slug> → <url>" or ⚠️ "failed: <reason> — left for a manual session."

## Troubleshooting
| Symptom | Check |
|---|---|
| No PR after a fire | `tail /tmp/celeste-engine.log`; look for the claude exit code or a gate FAIL |
| "draft failed the gate" | the headless draft couldn't reach truth-clean — run `--dry` to see the gate output, then hand-draft that piece |
| Nothing fired | `launchctl list \| grep celeste.content`; confirm the Mac was awake at 09:00 (launchd runs a missed job at next wake) |
| Auth error on push | `gh auth status` — the runner uses the gh credential helper |
| Want it off | `launchctl unload …plist` (above) |

## Cadence math
Mon + Thu = ~2 posts/week → the 5 queued pieces clear in ~2.5 weeks, then add the next batch of validated targets. Tune the days/times in the plist's `StartCalendarInterval`.

## Safety summary
- **Never auto-merges** — every piece is a PR you approve.
- **Never publishes un-gated** — the gate runs three times (draft, runner re-check, rendered page).
- **Never touches the live working tree** — operates in a `/tmp` clone, pushes a branch.
- **Easy off switch** — one `launchctl unload`.
