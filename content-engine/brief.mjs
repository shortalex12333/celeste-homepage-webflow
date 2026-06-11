#!/usr/bin/env node
// brief.mjs — the FIRST step of the celeste7.ai content pipeline.
// It produces the brief that CLAUDE then drafts against (Claude writes; the gate
// enforces; the founder gates publish). Node stdlib only — zero npm deps.
//
// Usage:
//   node brief.mjs --slug <s> --keyword "<kw>" --chapter <c> --format <pillar|guide|comparison> [--refresh <existing-slug>] [--date YYYY-MM-DD]
//
// It mkdir's posts/<slug>/ and writes:
//   - brief.md   : keyword + intent, the SAFE claim phrasings for the chapter,
//                  3–5 suggested assets (id + what-it-shows + its NEVER lines),
//                  the SERP angle/title from REFRESH-PLAN.md when --refresh matches,
//                  recommended internal-link targets, and the required structure
//                  (H1, sections, FAQ, closing CTA → /#pilot or /trust).
//   - meta.json  : a starter meta the drafter fills in.
//
// The brief is human + Claude readable. It never writes draft.html — that's Claude's job.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const claims = JSON.parse(readFileSync(join(HERE, 'lib', 'claims.json'), 'utf8'));
const assets = JSON.parse(readFileSync(join(HERE, 'lib', 'assets.json'), 'utf8'));

// ─── argument parsing (tiny, dependency-free) ──────────────────────────────
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) { out[key] = true; }
      else { out[key] = next; i++; }
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const { slug, keyword, chapter, format } = args;
const refresh = args.refresh && args.refresh !== true ? args.refresh : null;
// Date may be unavailable in some sandboxes — accept --date, fall back to today.
const today = (args.date && args.date !== true) ? args.date : safeToday();

const FORMATS = new Set(['pillar', 'guide', 'comparison']);
const errs = [];
if (!slug || slug === true) errs.push('--slug <s> is required');
if (!keyword || keyword === true) errs.push('--keyword "<kw>" is required');
if (!chapter || chapter === true) errs.push('--chapter <c> is required');
if (!format || format === true) errs.push('--format <pillar|guide|comparison> is required');
else if (!FORMATS.has(format)) errs.push(`--format must be one of: ${[...FORMATS].join(', ')}`);
if (chapter && chapter !== true && !claims.chapters[chapter]) {
  errs.push(`--chapter "${chapter}" is not a known chapter. Known: ${Object.keys(claims.chapters).join(', ')}`);
}
if (errs.length) {
  console.error('brief: cannot proceed —');
  for (const e of errs) console.error('  · ' + e);
  console.error('\nusage: node brief.mjs --slug <s> --keyword "<kw>" --chapter <c> --format <pillar|guide|comparison> [--refresh <existing-slug>] [--date YYYY-MM-DD]');
  process.exit(2);
}

// ─── chapter → SAFE claims + the chapter's own banned table (for the drafter) ─
const chap = claims.chapters[chapter];
const safeClaims = chap.safe || [];
const chapterBanned = chap.banned || [];

// ─── chapter → suggested assets (3–5) ──────────────────────────────────────
// assets.json `chapter` is a comma-separated multi-chapter string, so split + match.
function assetChapters(a) {
  return String(a.chapter).split(',').map(s => s.trim()).filter(Boolean);
}
const matchingAssets = assets.filter(a => assetChapters(a).includes(chapter));
// Prefer assets whose PRIMARY (first) chapter is this one — they are the strongest fit.
matchingAssets.sort((a, b) => {
  const ap = assetChapters(a)[0] === chapter ? 0 : 1;
  const bp = assetChapters(b)[0] === chapter ? 0 : 1;
  return ap - bp;
});
const suggestedAssets = matchingAssets.slice(0, 5);

// ─── --refresh → SERP angle/title + per-post spec from REFRESH-PLAN.md ──────
const refreshSpec = refresh ? extractRefreshSpec(refresh) : null;

// ─── recommended internal links (chapter-aware, from the ownership map) ─────
const internalLinks = recommendInternalLinks(chapter, slug, refresh);

// ─── required structure by format ──────────────────────────────────────────
const structure = requiredStructure(format, chapter);

// ─── write the post dir ────────────────────────────────────────────────────
const postDir = join(HERE, 'posts', slug);
mkdirSync(postDir, { recursive: true });

const briefMd = renderBrief();
writeFileSync(join(postDir, 'brief.md'), briefMd, 'utf8');

// Starter meta.json — only created if absent, so re-running brief never stomps a drafted meta.
const metaPath = join(postDir, 'meta.json');
if (!existsSync(metaPath)) {
  const starterTitle = refreshSpec?.title || titleCase(keyword) + ' — Celeste';
  const meta = {
    title: starterTitle,
    description: refreshSpec?.metaHint || `${capitalize(keyword)}. ` + (safeClaims[0] || ''),
    canonical: `https://celeste7.ai/blogs/${slug}`,
    slug,
    keyword,
    chapter,
    jsonld: starterJsonLd(starterTitle, slug, today),
    updated: monthYear(today),
  };
  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf8');
  console.log(`brief: wrote posts/${slug}/brief.md + starter meta.json`);
} else {
  console.log(`brief: wrote posts/${slug}/brief.md (meta.json already exists — left untouched)`);
}
console.log(`        chapter "${chapter}": ${safeClaims.length} SAFE claims, ${suggestedAssets.length} suggested assets`);
if (refreshSpec) console.log(`        --refresh ${refresh}: SERP angle pulled from REFRESH-PLAN.md`);
console.log('\nNext: Claude drafts posts/' + slug + '/draft.html against this brief, then `node gate.mjs posts/' + slug + '`, then `node publish.mjs ' + slug + '`.');

// ═══════════════════════════════════════════════════════════════════════════
// helpers
// ═══════════════════════════════════════════════════════════════════════════

function renderBrief() {
  const L = [];
  L.push(`# Brief — ${slug}`);
  L.push('');
  L.push(`> Generated by brief.mjs on ${today}. This is the spec **Claude drafts against**.`);
  L.push(`> Claude writes \`posts/${slug}/draft.html\` (BODY html + \`{{asset:id}}\` placeholders), then it passes \`gate.mjs\`, then the founder gates \`publish.mjs\`.`);
  L.push('');
  L.push('## Target');
  L.push('');
  L.push(`- **Keyword:** \`${keyword}\``);
  L.push(`- **Chapter:** \`${chapter}\``);
  L.push(`- **Format:** ${format}`);
  L.push(`- **Slug / URL:** \`/blogs/${slug}\``);
  if (refresh) L.push(`- **Retarget of:** \`/blogs/${refresh}\` (do NOT change the slug — it is the trusted asset)`);
  L.push(`- **Search intent:** ${intentFor(format, keyword)}`);
  L.push('');

  if (refreshSpec) {
    L.push('## SERP angle (from REFRESH-PLAN.md)');
    L.push('');
    if (refreshSpec.title) L.push(`- **Title direction:** ${refreshSpec.title}`);
    if (refreshSpec.verdict) L.push(`- **Plan verdict:** ${refreshSpec.verdict}`);
    if (refreshSpec.gsc) L.push(`- **GSC signal:** ${refreshSpec.gsc}`);
    L.push('');
    L.push('  Per-post spec excerpt (read the full block in REFRESH-PLAN.md before drafting):');
    L.push('');
    for (const line of refreshSpec.body) L.push(`  ${line}`);
    L.push('');
  }

  L.push('## SAFE claim phrasings available for this chapter');
  L.push('');
  L.push('Use these **verbatim or trivially inflected**. They are the only product claims pre-cleared for this chapter. Anything stronger must be added to the allowlist first.');
  L.push('');
  for (const s of safeClaims) L.push(`- ${s}`);
  L.push('');

  if (chapterBanned.length) {
    L.push('## Do NOT write (chapter banned table — the gate hard-fails these)');
    L.push('');
    L.push('| Banned phrasing | Why | Write instead |');
    L.push('|---|---|---|');
    for (const b of chapterBanned) {
      L.push(`| ${mdCell(b.pattern)} | ${mdCell(b.why)} | ${mdCell(b.safe)} |`);
    }
    L.push('');
    L.push('Plus the GLOBAL gate: no AI/smart/automate/seamless/optimize/magic/revolutionary lexicon; no "writes itself / every domain / sealed PDF / sub-second / real-time" overclaims; **no pricing or numbers** (CALL-ONLY); the host is `verifier.celeste7.ai` (never `verify.`).');
    L.push('');
  }

  L.push('## Suggested assets for this chapter (' + suggestedAssets.length + ')');
  L.push('');
  L.push('Drop the placeholder `{{asset:<id>}}` where you want each image; `publish.mjs` resolves it to a `<figure>` with the approved alt and copies the file to the served path. **One media = one focal point per section.**');
  L.push('');
  for (const a of suggestedAssets) {
    L.push(`### {{asset:${a.id}}}`);
    L.push('');
    L.push(`- **Shows:** ${a.alt}`);
    if (a.supports && a.supports.length) {
      L.push(`- **Supports:** ${a.supports.map(s => '"' + s + '"').join('; ')}`);
    }
    if (a.never && a.never.length) {
      L.push(`- **NEVER:**`);
      for (const n of a.never) L.push(`  - ${n}`);
    } else {
      L.push(`- **NEVER:** (no special restriction recorded — global gate still applies)`);
    }
    if (a.usage) L.push(`- **Usage note:** ${a.usage}`);
    L.push('');
  }
  if (!suggestedAssets.length) {
    L.push('_No registry asset is tagged to this chapter. Use a chapter-adjacent asset deliberately, or ship text-only._');
    L.push('');
  }

  L.push('## Recommended internal links');
  L.push('');
  if (internalLinks.length) {
    for (const l of internalLinks) L.push(`- ${l.anchor} → \`${l.href}\`${l.note ? '  — ' + l.note : ''}`);
  } else {
    L.push('- Link up to the chapter pillar and to `/#pilot`; avoid cannibalizing the keyword owner (see REFRESH-PLAN.md §D).');
  }
  L.push('');

  L.push('## Required structure');
  L.push('');
  for (const s of structure) L.push(`- ${s}`);
  L.push('');
  L.push('### Closing CTA');
  L.push('');
  L.push(`- End on a calm, short CTA. Conversion link → \`/#pilot\` (request pilot access). For proof/compliance angles, link → \`/trust\`.`);
  L.push('- No pricing. No urgency theatre. The page converts traffic; the founder converts the prospect.');
  L.push('');

  L.push('## Drafting checklist (before you hand off to the gate)');
  L.push('');
  L.push(`- [ ] Exactly one \`<h1>\` (the rest are \`<h2>/<h3>\`).`);
  L.push(`- [ ] Body uses only the SAFE claims above (or weaker).`);
  L.push(`- [ ] Every image is a \`{{asset:id}}\` placeholder from the suggested list (or another registry id), never a raw \`<img>\`.`);
  L.push(`- [ ] No banned lexicon / overclaim / pricing; host is \`verifier.celeste7.ai\`.`);
  L.push(`- [ ] FAQ section present with question \`<h3>\`s (drives FAQPage schema in meta.json).`);
  L.push(`- [ ] \`meta.json\`: title 30–65 chars, description ≤155 chars, JSON-LD present, \`updated\` set.`);
  L.push(`- [ ] Run \`node gate.mjs posts/${slug}\` until clean.`);
  L.push('');
  return L.join('\n') + '\n';
}

function intentFor(fmt, kw) {
  if (fmt === 'comparison') return `Commercial-investigation: the reader is comparing options behind "${kw}" and wants an honest, criteria-led answer.`;
  if (fmt === 'guide') return `How-to / informational: the reader wants to *do* the thing in "${kw}"; lead with the practical steps, land the product as the payoff.`;
  return `Top-of-funnel pillar: "${kw}" is a broad problem term; own the topic, link the cluster, convert the patient reader.`;
}

function requiredStructure(fmt, ch) {
  const base = [
    '**H1:** one exact-or-near-match of the keyword; honest, specific, no hype.',
    '**Lede / deck:** Apple-style — first sentence carries the claim (can be white-emphasis on render), rest is context.',
  ];
  if (fmt === 'pillar') {
    base.push('**Sections (H2):** 4–6 problem→consequence→what-good-looks-like sections; each cluster post links in once.');
    base.push('**Evidence section:** one product moment with a suggested asset — show, do not claim.');
  } else if (fmt === 'guide') {
    base.push('**Sections (H2 + ordered H3 steps):** the practical how-to is the bulk; use `<ol>` for steps (drives ItemList schema).');
    base.push('**Payoff section:** the product as the reason the manual work stops mattering — one suggested asset.');
  } else if (fmt === 'comparison') {
    base.push('**Comparison section (H2):** honest two-column / criteria table; name what the alternative does *well*, then where it fails.');
    base.push('**Criteria H3s:** one per evaluation dimension; map to the SAFE claims, never overclaim coverage.');
  }
  base.push('**FAQ (H2 + 3–4 question H3s):** match People-Also-Ask; FAQPage JSON-LD in meta.json.');
  base.push('**Summary list:** `<ul class="summary-list">` of the post\'s honest takeaways.');
  base.push('**Sources:** cite external claims with a numbered `<div class="article-sources">` (E-E-A-T).');
  return base;
}

function recommendInternalLinks(ch, thisSlug, refreshSlug) {
  // Chapter pillar/owner map distilled from REFRESH-PLAN.md §D (anti-cannibalization).
  const OWNERS = {
    handover: { slug: 'engineering-handover-superyacht', anchor: 'chief engineer handover checklist' },
    search: { slug: 'natural-language-search-yacht', anchor: 'how to organize yacht manuals onboard' },
    ledger: { slug: 'audit-trail-superyacht', anchor: 'append-only audit trail' },
    'show related': { slug: 'fault-patterns-superyachts', anchor: 'fault history surfaced via Show Related' },
    'cloud-based': { slug: 'software-bypass-superyachts', anchor: 'ship management software vs Excel' },
  };
  const FLAGSHIP = { slug: 'knowledge-crisis-superyachts', anchor: 'crew turnover and knowledge loss' };
  const links = [];
  const owner = OWNERS[ch];
  if (owner && owner.slug !== thisSlug && owner.slug !== refreshSlug) {
    links.push({ anchor: `"${owner.anchor}"`, href: `/blogs/${owner.slug}`, note: 'chapter pillar/owner — link in, do not compete on its keyword' });
  }
  if (FLAGSHIP.slug !== thisSlug && FLAGSHIP.slug !== refreshSlug) {
    links.push({ anchor: `"${FLAGSHIP.anchor}"`, href: `/blogs/${FLAGSHIP.slug}`, note: 'flagship handover pillar' });
  }
  // Chapter-specific proof payoff.
  if (ch === 'ledger' || ch === 'verifier.celeste7.ai' || ch === 'security') {
    links.push({ anchor: 'verify a sample receipt', href: 'https://verifier.celeste7.ai', note: 'the proof payoff (host is verifier., never verify.)' });
    links.push({ anchor: 'verifiable, auditable maintenance records', href: '/blogs/warranty-claim-documentation', note: 'Tier-A money page' });
  }
  if (ch === 'search' || ch === 'show related') {
    links.push({ anchor: 'natural-language search', href: '/search', note: 'product page' });
  }
  if (ch === 'handover') {
    links.push({ anchor: 'the handover', href: '/handover', note: 'product page (two-signature image)' });
  }
  // Always offer the conversion target.
  links.push({ anchor: 'request pilot access', href: '/#pilot', note: 'conversion CTA' });
  return links;
}

// Extract the per-post block for a slug out of REFRESH-PLAN.md.
function extractRefreshSpec(refreshSlug) {
  let plan;
  try { plan = readFileSync(join(HERE, 'REFRESH-PLAN.md'), 'utf8'); }
  catch { return null; }
  const lines = plan.split(/\r?\n/);

  // 1) the priority-table row (| # | slug | keyword | verdict | gsc | effort |)
  let verdict = null, gsc = null, tableKeyword = null;
  for (const line of lines) {
    if (line.includes('`' + refreshSlug + '`') && line.trim().startsWith('|')) {
      const cells = line.split('|').map(c => c.trim());
      // cells: ['', '#', 'slug', 'keyword', 'verdict', 'gsc', 'effort', '']
      if (cells.length >= 7) {
        tableKeyword = cells[3] || null;
        verdict = cells[4] || null;
        gsc = cells[5] || null;
      }
      break;
    }
  }

  // 2) the bold per-post spec block: a line like "**N. <slug>** — <title direction>"
  //    followed by bullet lines until the next "**N." header or a "---".
  let title = null;
  const body = [];
  const headerRe = new RegExp('^\\*\\*\\d+\\.\\s+' + escapeRe(refreshSlug) + '\\*\\*\\s*[—-]\\s*(.*)$');
  let i = 0;
  for (; i < lines.length; i++) {
    const m = lines[i].match(headerRe);
    if (m) { title = m[1].trim() || null; break; }
  }
  if (i < lines.length) {
    for (let j = i + 1; j < lines.length; j++) {
      const l = lines[j];
      if (/^\*\*\d+\.\s+/.test(l)) break;        // next per-post header
      if (/^---\s*$/.test(l)) break;             // section rule
      if (/^##\s/.test(l)) break;                // next ## section
      body.push(l.replace(/\s+$/,''));
    }
  }
  // Prefer an explicit Title: bullet for the title direction if present.
  // The plan packs several directives onto one "Title:" line ("...Celeste"; H1 "..."; meta ...);
  // keep ONLY the first quoted/clause-leading title so the starter meta.json title is usable.
  let titleHint = title;
  let metaHint = null;
  for (const l of body) {
    const tm = l.match(/^\s*-\s*\*?\*?Title\*?\*?:\s*(.+)$/i);
    if (tm) { titleHint = cleanTitle(tm[1]); }
    const mm = l.match(/^\s*-\s*\*?\*?[Mm]eta\*?\*?:?\s*(.+)$/i);
    if (mm && !metaHint) { metaHint = mm[1].trim(); }
  }
  if (title) title = cleanTitle(title);

  if (!title && !body.length && !verdict && !gsc) return null;
  return {
    title: titleHint || title,
    verdict,
    gsc,
    metaHint,
    body: body.filter(l => l.trim().length),
  };
}

// ─── tiny formatting helpers ───────────────────────────────────────────────
// The REFRESH-PLAN "Title:" line crams Title + H1 + meta directives together.
// Pull only the first title clause and strip wrapping quotes/trailing punctuation,
// so the starter meta.json title is a sane default the drafter can keep or refine.
function cleanTitle(s) {
  let t = String(s).trim();
  // cut at the first "; H1" / "; meta" / "; og" hand-off to another directive
  t = t.split(/;\s*(?:H1|meta|og|twitter|breadcrumb|schema)\b/i)[0];
  // if it opens with a quote, keep up to the matching closing quote
  const q = t.match(/^[“"]([^”"]+)[”"]/);
  if (q) t = q[1];
  // strip any leftover wrapping quotes and trailing separators
  t = t.replace(/^[“"']+|[”"';.\s]+$/g, '').trim();
  return t;
}
function mdCell(s) { return String(s || '').replace(/\|/g, '\\|').replace(/\n+/g, ' '); }
function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function capitalize(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }
function titleCase(s) {
  return String(s).split(/\s+/).map(w => w.length > 3 ? capitalize(w) : w).map((w, i) => i === 0 ? capitalize(w) : w).join(' ');
}
function safeToday() {
  try { return new Date().toISOString().slice(0, 10); }
  catch { return 'UNSET-DATE'; }
}
function monthYear(d) {
  // d is YYYY-MM-DD; format as "Month YYYY" without locale assumptions.
  const m = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const mt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!mt) return d;
  const mi = parseInt(mt[2], 10) - 1;
  return `${m[mi] || mt[2]} ${mt[1]}`;
}
function starterJsonLd(title, slug, date) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    datePublished: date,
    dateModified: date,
    author: { '@type': 'Organization', name: 'Celeste', url: 'https://celeste7.ai' },
    publisher: { '@type': 'Organization', name: 'Celeste', url: 'https://celeste7.ai' },
    mainEntityOfPage: `https://celeste7.ai/blogs/${slug}`,
  };
}
