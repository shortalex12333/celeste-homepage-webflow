#!/usr/bin/env node
// run.mjs — the ORCHESTRATOR for the celeste7.ai content pipeline.
// Node stdlib only. Zero npm deps. Node v24.
//
// The pipeline is:  idea → target → BRIEF → (Claude drafts) → GATE → founder review → PUBLISH → MEASURE → iterate
//
// Scripts do the mechanical work + enforcement. CLAUDE writes the draft (the
// human-in-the-loop step). The FOUNDER gates publish. This orchestrator is the
// thin seam that calls brief.mjs / gate.mjs / publish.mjs / scorecard.mjs with
// the exact argument shapes they expect, and prints the next human action at
// each hand-off so nobody has to remember the contract.
//
// Usage:
//   node run.mjs new   --slug <s> --keyword "<kw>" --chapter <c> --format <pillar|guide|comparison> [--refresh <slug>] [--date YYYY-MM-DD]
//       → runs brief.mjs, then STOPS and tells you to have Claude draft.
//
//   node run.mjs ship  <slug> [--date YYYY-MM-DD] [--check]
//       → runs gate.mjs (fail-closed), then publish.mjs. The founder runs this.
//
//   node run.mjs gate  <slug|path>
//       → runs gate.mjs on a post dir or a file (the firewall, on demand).
//
//   node run.mjs score
//       → runs scorecard.mjs (the GSC measure leg).
//
//   node run.mjs help

import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const NODE = process.execPath;

// ─── tiny arg parser (matches brief.mjs's own; --flag value | --bool) ───────
function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i++; }
    } else {
      out._.push(a);
    }
  }
  return out;
}

// Run a pipeline script as a child, inheriting stdio so its output is the user's
// output. Returns the exit status. We never swallow a non-zero status — the
// gate is fail-closed and the orchestrator must propagate that.
function run(script, args) {
  const r = spawnSync(NODE, [join(HERE, script), ...args], { stdio: 'inherit' });
  if (r.error) {
    console.error(`run: failed to launch ${script}: ${r.error.message}`);
    process.exit(1);
  }
  return r.status === null ? 1 : r.status;
}

function rule() { console.log('─'.repeat(72)); }

// ─── subcommands ────────────────────────────────────────────────────────────

function cmdNew(rest) {
  const a = parseArgs(rest);
  // brief.mjs validates required flags itself and prints precise errors; we just
  // forward everything through, so the single source of truth for "what's a valid
  // brief request" stays in brief.mjs.
  const fwd = [];
  for (const k of ['slug', 'keyword', 'chapter', 'format', 'refresh', 'date']) {
    if (a[k] !== undefined) {
      fwd.push(`--${k}`);
      if (a[k] !== true) fwd.push(String(a[k]));
    }
  }
  const status = run('brief.mjs', fwd);
  if (status !== 0) process.exit(status);

  // brief.mjs already printed where it wrote the brief. Print the human-in-loop
  // hand-off in the orchestrator's voice so the pipeline stage is unmistakable.
  const slug = a.slug && a.slug !== true ? a.slug : '<slug>';
  console.log('');
  rule();
  console.log('NEXT (human-in-the-loop) — the brief is the spec; CLAUDE writes the draft:');
  console.log('');
  console.log(`  1. Open  posts/${slug}/brief.md  and have Claude draft`);
  console.log(`     posts/${slug}/draft.html  (BODY html + {{asset:id}} placeholders)`);
  console.log(`     against it — only the SAFE chapter claims, registry assets only.`);
  console.log(`  2. Gate it until clean:   node run.mjs gate ${slug}`);
  console.log(`  3. Founder publishes:     node run.mjs ship ${slug} --date YYYY-MM-DD`);
  console.log('');
  console.log('  Claude is the drafter (not a local LLM): every product claim must map to');
  console.log('  shipped code and survive the truth gate — an 8B model manufactures the');
  console.log('  banned overclaims the brand exists to refuse.');
  rule();
}

function cmdGate(rest) {
  const a = parseArgs(rest);
  const target = a._[0];
  if (!target) {
    console.error('usage: node run.mjs gate <slug|path>');
    process.exit(2);
  }
  // Accept a bare slug (resolve to posts/<slug>) or any path/file.
  const asPost = join(HERE, 'posts', target);
  const arg = existsSync(asPost) ? asPost : target;
  process.exit(run('gate.mjs', [arg]));
}

function cmdShip(rest) {
  const a = parseArgs(rest);
  const slug = a._[0];
  if (!slug) {
    console.error('usage: node run.mjs ship <slug> [--date YYYY-MM-DD] [--check]');
    process.exit(2);
  }
  const postDir = join(HERE, 'posts', slug);
  if (!existsSync(postDir) || !statSync(postDir).isDirectory()) {
    console.error(`run ship: posts/${slug}/ not found. Run \`node run.mjs new --slug ${slug} …\` first, then have Claude draft.`);
    process.exit(2);
  }
  if (!existsSync(join(postDir, 'draft.html'))) {
    console.error(`run ship: posts/${slug}/draft.html is missing — Claude drafts this before you can ship.`);
    process.exit(2);
  }

  // Honesty surface: warn when the served filename (derived from the dir slug by
  // publish.mjs) won't match the canonical URL in meta.json. For a /blogs refresh
  // the post dir SHOULD be named exactly the canonical slug so the file lands at
  // the trusted URL; flag the mismatch loudly rather than ship a split-brain page.
  const metaPath = join(postDir, 'meta.json');
  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
      const canonical = String(meta.canonical || '');
      const m = canonical.match(/\/blogs\/([a-z0-9-]+)\/?$/i);
      const canonSlug = m ? m[1] : (meta.slug || null);
      if (canonSlug && canonSlug !== slug) {
        console.log('');
        console.log(`run ship: NOTE — publish writes blogs/${slug}.html, but the canonical URL`);
        console.log(`          is /blogs/${canonSlug} (meta.json). For a refresh, rename the post`);
        console.log(`          dir to "${canonSlug}" so the served file matches the trusted URL,`);
        console.log(`          or run:  node run.mjs ship ${canonSlug}`);
        console.log('');
      }
    } catch { /* publish.mjs will report a malformed meta.json */ }
  }

  // The truth gate runs INSIDE publish.mjs (fail-closed) — a draft that fails is
  // never published. We run gate.mjs here too, first, so a violation is reported
  // once, clearly, before publish even starts its work.
  rule();
  console.log(`run ship: 1/2 — truth gate on posts/${slug}`);
  rule();
  const gateStatus = run('gate.mjs', [postDir]);
  if (gateStatus !== 0) {
    console.error('');
    console.error(`run ship: ABORTED — the gate FAILED. A failing draft is never published.`);
    console.error(`          Fix the flagged lines with the printed safe substitutes, then re-run.`);
    process.exit(1);
  }

  console.log('');
  rule();
  console.log(`run ship: 2/2 — publish posts/${slug}${a.check ? '  (--check dry-run)' : ''}`);
  rule();
  const pubArgs = [slug];
  if (a.date && a.date !== true) { pubArgs.push('--date', String(a.date)); }
  if (a.check) pubArgs.push('--check');
  process.exit(run('publish.mjs', pubArgs));
}

function cmdScore(rest) {
  // scorecard.mjs handles --help and its own env; forward the rest verbatim.
  process.exit(run('scorecard.mjs', rest));
}

function help() {
  console.log(`run.mjs — orchestrator for the celeste7.ai content pipeline (Node stdlib only)

  brief → (Claude drafts) → GATE → founder review → publish → measure → iterate

Commands:
  new    --slug <s> --keyword "<kw>" --chapter <c> --format <pillar|guide|comparison>
         [--refresh <existing-slug>] [--date YYYY-MM-DD]
             Write the brief (brief.mjs), then stop for Claude to draft.

  gate   <slug|path>
             Run the truth + brand firewall (gate.mjs) on a post dir or any file.

  ship   <slug> [--date YYYY-MM-DD] [--check]
             Gate (fail-closed) then publish (publish.mjs). The founder runs this.
             --check is a dry-run: gate + resolve + render, write nothing.

  score
             Pull the GSC scorecard (scorecard.mjs) — the measure leg.

  help

Known chapters live in claims-allowlist.md → lib/claims.json. Registry assets in
ASSET-REGISTRY.md → lib/assets.json. Pricing is CALL-ONLY; host = verifier.celeste7.ai.`);
}

// ─── entry ──────────────────────────────────────────────────────────────────
const [, , cmd, ...rest] = process.argv;
switch (cmd) {
  case 'new': cmdNew(rest); break;
  case 'gate': cmdGate(rest); break;
  case 'ship': cmdShip(rest); break;
  case 'score': cmdScore(rest); break;
  case 'help': case '--help': case '-h': case undefined: help(); break;
  default:
    console.error(`run: unknown command "${cmd}". Try: node run.mjs help`);
    process.exit(2);
}
