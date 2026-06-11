#!/usr/bin/env node
// publish.mjs — the GATE-GUARDED publish step of the celeste7.ai content pipeline.
// Node stdlib only. The FOUNDER runs this after Claude has drafted and they approve.
//
// Usage:
//   node publish.mjs <slug> [--date YYYY-MM-DD] [--check]
//
// Pipeline position:  brief → (Claude drafts) → GATE → founder review → PUBLISH → measure
//
// What it does, in order (fail-closed — a draft that fails the gate is NEVER published):
//   1. load  posts/<slug>/draft.html  (BODY html with {{asset:id}} placeholders)
//            posts/<slug>/meta.json    {title, description, canonical, slug, keyword, chapter, jsonld?, updated}
//   2. RUN gate.mjs (child_process) on the post dir; ABORT (exit 1) if it exits non-zero
//   3. resolve every {{asset:id}} via lib/assets.json →
//        <figure><img src="/images/blog/<file>" alt="<approved alt>" loading="lazy" width.. height..><figcaption/></figure>
//      and COPY  content-engine/assets/<file>  →  /tmp/celeste-pipeline/images/blog/<file>  (the served path)
//   4. inject TITLE / META / CANONICAL / BODY / JSONLD / UPDATED into templates/post.html
//   5. write  /tmp/celeste-pipeline/blogs/<slug>.html
//   6. add/update the <url> entry in /tmp/celeste-pipeline/sitemap.xml (honest lastmod = today, via --date)
//   7. print the git / PR next-steps
//
// --date  honest lastmod / "Updated" date (Date is unavailable in some sandbox contexts).
// --check dry-run: gate + resolve + render in memory, write/copy NOTHING.

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, statSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
// The site root is the parent of content-engine: /tmp/celeste-pipeline.
const SITE_ROOT = dirname(HERE);
const BLOGS_DIR = join(SITE_ROOT, 'blogs');
const IMAGES_BLOG_DIR = join(SITE_ROOT, 'images', 'blog');
const SITEMAP_PATH = join(SITE_ROOT, 'sitemap.xml');
const TEMPLATE_PATH = join(HERE, 'templates', 'post.html');
const ASSETS_PATH = join(HERE, 'lib', 'assets.json');

// ─── args ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const checkOnly = argv.includes('--check');
let date = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--date') { date = argv[i + 1]; i++; }
}
date = date || safeToday();
const slug = argv.find(a => !a.startsWith('--') && a !== date);

if (!slug) {
  console.error('usage: node publish.mjs <slug> [--date YYYY-MM-DD] [--check]');
  process.exit(2);
}

// ─── 1. load draft + meta ────────────────────────────────────────────────────
const postDir = join(HERE, 'posts', slug);
const draftPath = join(postDir, 'draft.html');
const metaPath = join(postDir, 'meta.json');

if (!existsSync(postDir) || !statSync(postDir).isDirectory()) {
  console.error(`publish: posts/${slug}/ not found. Run brief.mjs first, then have Claude draft.`);
  process.exit(2);
}
if (!existsSync(draftPath)) {
  console.error(`publish: posts/${slug}/draft.html missing — nothing to publish (Claude drafts this).`);
  process.exit(2);
}
if (!existsSync(metaPath)) {
  console.error(`publish: posts/${slug}/meta.json missing.`);
  process.exit(2);
}

let meta;
try { meta = JSON.parse(readFileSync(metaPath, 'utf8')); }
catch (e) { console.error(`publish: posts/${slug}/meta.json is not valid JSON: ${e.message}`); process.exit(2); }

for (const k of ['title', 'description', 'canonical']) {
  if (!meta[k]) { console.error(`publish: meta.json is missing required field "${k}".`); process.exit(2); }
}
const canonical = meta.canonical || `https://celeste7.ai/blogs/${slug}`;

// ─── 2. fail-closed gate ─────────────────────────────────────────────────────
// publish refuses any draft the gate rejects. We run the SAME gate.mjs the
// pipeline uses everywhere, so there is one source of truth.
console.log(`publish: running the truth gate on posts/${slug} …`);
const g = spawnSync(process.execPath, [join(HERE, 'gate.mjs'), postDir], { stdio: 'inherit' });
if (g.status !== 0) {
  console.error(`\npublish: ABORTED — gate exited ${g.status}. A failing draft is never published. Fix the violations, re-gate, then publish.`);
  process.exit(1);
}
console.log('publish: gate PASSED.\n');

// ─── 3. resolve {{asset:id}} → <figure>, collect files to copy ───────────────
const assets = JSON.parse(readFileSync(ASSETS_PATH, 'utf8'));
const assetById = new Map(assets.map(a => [a.id, a]));

let body = readFileSync(draftPath, 'utf8');
const toCopy = [];
let unresolved = null;

body = body.replace(/\{\{\s*asset:\s*([a-z0-9-]+)\s*\}\}/gi, (_, id) => {
  const a = assetById.get(id);
  if (!a) { unresolved = id; return `{{asset:${id}}}`; }
  const file = basename(a.file);
  const served = `/images/blog/${file}`;
  const dims = pngDims(join(HERE, a.file)) || { w: 1440, h: 900 };
  toCopy.push(a);
  // <figcaption/> stays EMPTY by default — the draft owns visible captions, and the
  // registry alt is the accessibility text. Keep one media = one focal point.
  return [
    `<figure class="article-figure">`,
    `  <img src="${served}" alt="${escapeAttr(a.alt)}" loading="lazy" width="${dims.w}" height="${dims.h}">`,
    `  <figcaption></figcaption>`,
    `</figure>`,
  ].join('\n');
});

if (unresolved) {
  // Belt-and-braces: the gate should already have caught this, but never ship a placeholder.
  console.error(`publish: ABORTED — unbound asset id "${unresolved}" survived to publish. Add it to lib/assets.json or fix the draft.`);
  process.exit(1);
}

// ─── 4. inject into templates/post.html ─────────────────────────────────────
if (!existsSync(TEMPLATE_PATH)) {
  console.error(`publish: templates/post.html missing — cannot render.`);
  process.exit(2);
}
let tpl = readFileSync(TEMPLATE_PATH, 'utf8');
const jsonldBlock = meta.jsonld
  ? `<script type="application/ld+json">\n${JSON.stringify(meta.jsonld, null, 2)}\n  </script>`
  : '';
const updatedLabel = meta.updated || monthYear(date);
const relatedLinks = renderRelatedLinks(meta.related);

// The template vocabulary is owned upstream (templates/post.html) and has drifted;
// inject by SEMANTIC field, supporting every known token alias so publish stays
// robust to template edits. {{TITLE}} appears in <title>, og, twitter, h1, breadcrumb —
// it is HTML-escaped for the visible/text positions and is safe inside the quoted
// attributes too (escapeHtml also encodes the quote-adjacent chars we care about).
const subs = {
  // title (text + attribute positions)
  TITLE: escapeHtml(meta.title),
  // description / meta description (attribute + visible lede)
  DESCRIPTION: escapeAttr(meta.description),
  META_DESCRIPTION: escapeAttr(meta.description),
  // canonical / page url
  CANONICAL: escapeAttr(canonical),
  CANONICAL_URL: escapeAttr(canonical),
  // structured data
  JSONLD: jsonldBlock,
  ARTICLE_JSONLD: jsonldBlock,
  // body + chrome
  BODY: body,
  UPDATED: escapeHtml(updatedLabel),
  SLUG: escapeAttr(slug),
  RELATED_LINKS: relatedLinks,
};
let page = tpl;
for (const [token, value] of Object.entries(subs)) {
  page = page.split(`{{${token}}}`).join(value);
}

// Guard: no stray placeholders left in the rendered page. We tolerate a tiny
// allowlist of optional tokens by blanking them (so an upstream template can add
// an optional slot without breaking publish), but FAIL on anything unknown.
const OPTIONAL_BLANK = new Set(['RELATED_LINKS', 'ARTICLE_JSONLD', 'JSONLD']);
let leftover = [...new Set((page.match(/\{\{[A-Z_]+\}\}/g) || []))];
for (const t of leftover) {
  const name = t.slice(2, -2);
  if (OPTIONAL_BLANK.has(name)) page = page.split(t).join('');
}
leftover = [...new Set((page.match(/\{\{[A-Z_]+\}\}/g) || []))];
if (leftover.length) {
  console.error(`publish: ABORTED — template placeholders left unfilled: ${leftover.join(', ')}`);
  console.error(`         add the matching field to meta.json, or extend the subs map in publish.mjs.`);
  process.exit(1);
}

// ─── 4b. FINAL gate on the RENDERED page ─────────────────────────────────────
// The draft already passed, but the template + footer wrap it. Re-gate the FULL
// rendered HTML so a template-level overclaim (a roadmap feature in the footer, a
// missing canonical, a dead host) can NEVER reach production. One gate, one truth.
{
  const tmp = join(postDir, '.rendered.tmp.html');
  writeFileSync(tmp, page, 'utf8');
  const gf = spawnSync(process.execPath, [join(HERE, 'gate.mjs'), tmp], { stdio: 'inherit' });
  try { unlinkSync(tmp); } catch {}
  if (gf.status !== 0) {
    console.error(`\npublish: ABORTED — the RENDERED page failed the gate. The violation is in the TEMPLATE/footer, not the draft. Fix templates/post.html, then publish.`);
    process.exit(1);
  }
  console.log('publish: rendered-page gate PASSED.\n');
}

// ─── --check dry-run stops here ──────────────────────────────────────────────
// Output file matches the CANONICAL slug, so a REFRESH overwrites the trusted URL
// instead of spawning a new one (canonical .../blogs/<target> → blogs/<target>.html).
const outSlug = (canonical.match(/\/blogs\/([^/?#]+)/) || [, slug])[1];
const outPath = join(BLOGS_DIR, `${outSlug}.html`);
if (checkOnly) {
  console.log(`publish --check (dry-run):`);
  console.log(`  would write  ${outPath}  (${page.length} bytes)`);
  console.log(`  would copy   ${toCopy.length} asset(s) → ${IMAGES_BLOG_DIR}/`);
  for (const a of toCopy) console.log(`               ${basename(a.file)}`);
  console.log(`  would set    sitemap lastmod = ${date} for ${canonical}`);
  process.exit(0);
}

// ─── 5. write the page + copy assets ─────────────────────────────────────────
mkdirSync(BLOGS_DIR, { recursive: true });
mkdirSync(IMAGES_BLOG_DIR, { recursive: true });

for (const a of toCopy) {
  const src = join(HERE, a.file);
  const dst = join(IMAGES_BLOG_DIR, basename(a.file));
  if (existsSync(src)) copyFileSync(src, dst);
  else console.warn(`publish: WARN — asset file missing on disk, page references it but nothing copied: ${src}`);
}

writeFileSync(outPath, page, 'utf8');
console.log(`publish: wrote ${outPath} (${page.length} bytes)`);
console.log(`publish: copied ${toCopy.length} asset(s) → ${IMAGES_BLOG_DIR}/`);

// ─── 6. sitemap upsert (honest lastmod = --date) ─────────────────────────────
updateSitemap(canonical, date);

// ─── 7. git / PR next-steps ──────────────────────────────────────────────────
printNextSteps(slug, canonical, date, toCopy.length);

// ═══════════════════════════════════════════════════════════════════════════
// helpers
// ═══════════════════════════════════════════════════════════════════════════

function escapeAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// meta.related = [{href, text}, ...] → <li><a href>text</a></li> for the Read-next nav.
// Empty/absent → '' (the leftover guard blanks the optional slot).
function renderRelatedLinks(related) {
  if (!Array.isArray(related) || !related.length) return '';
  return related
    .filter(r => r && r.href && r.text)
    .map(r => `<li><a href="${escapeAttr(r.href)}">${escapeHtml(r.text)}</a></li>`)
    .join('\n        ');
}

// Read real width/height from a PNG IHDR (bytes 16–23, big-endian). stdlib only,
// so every <img> ships honest dimensions (no CLS) with zero deps. null if not a PNG.
function pngDims(path) {
  try {
    const fd = readFileSync(path);
    // PNG signature 8 bytes, then IHDR length(4)+type(4), width at offset 16.
    if (fd.length < 24) return null;
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    for (let i = 0; i < 8; i++) if (fd[i] !== sig[i]) return null;
    const w = fd.readUInt32BE(16);
    const h = fd.readUInt32BE(20);
    if (w > 0 && h > 0) return { w, h };
    return null;
  } catch { return null; }
}

// Insert or replace the <url> block for `loc` in sitemap.xml, with lastmod=date.
function updateSitemap(loc, lastmod) {
  if (!existsSync(SITEMAP_PATH)) {
    console.warn(`publish: WARN — ${SITEMAP_PATH} not found; skipping sitemap update.`);
    return;
  }
  let xml = readFileSync(SITEMAP_PATH, 'utf8');
  const locEsc = escapeXml(loc);

  // Does a <url> block with this <loc> already exist?
  const blockRe = new RegExp(`[ \\t]*<url>\\s*<loc>${escapeRe(locEsc)}</loc>[\\s\\S]*?</url>\\n?`, 'i');
  const newBlock =
`  <url>
    <loc>${locEsc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>0.9</priority>
  </url>
`;

  if (blockRe.test(xml)) {
    xml = xml.replace(blockRe, newBlock);
    console.log(`publish: sitemap — updated lastmod=${lastmod} for ${loc}`);
  } else {
    // insert before the closing </urlset>
    const close = xml.lastIndexOf('</urlset>');
    if (close === -1) { console.warn('publish: WARN — sitemap has no </urlset>; skipping.'); return; }
    xml = xml.slice(0, close) + newBlock + xml.slice(close);
    console.log(`publish: sitemap — added ${loc} (lastmod=${lastmod})`);
  }
  writeFileSync(SITEMAP_PATH, xml, 'utf8');
}

function printNextSteps(slug, canonical, date, nAssets) {
  const rel = `blogs/${slug}.html`;
  console.log('\n─── next steps (git / PR) ───────────────────────────────────────────');
  console.log(`  The page is written to the served tree. Review it, then ship:`);
  console.log('');
  console.log(`    git -C ${SITE_ROOT} add ${rel} images/blog/ sitemap.xml`);
  console.log(`    git -C ${SITE_ROOT} commit -m "blog: publish ${slug} (updated ${date})"`);
  console.log(`    git -C ${SITE_ROOT} push -u origin feat/content-engine`);
  console.log(`    gh pr create --fill   # or open the PR in the GitHub UI`);
  console.log('');
  console.log(`  After merge + Vercel deploy:`);
  console.log(`    · GSC URL Inspection → Request Indexing for ${canonical}`);
  console.log(`    · annotate the deploy date, then leave the URL alone 4–6 weeks (REFRESH-PLAN §5).`);
  console.log(`  Published with ${nAssets} registry asset(s); pricing stays CALL-ONLY; host = verifier.celeste7.ai.`);
  console.log('─────────────────────────────────────────────────────────────────────');
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function safeToday() {
  try { return new Date().toISOString().slice(0, 10); }
  catch { return 'UNSET-DATE'; }
}
function monthYear(d) {
  const m = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const mt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!mt) return d;
  return `${m[parseInt(mt[2], 10) - 1] || mt[2]} ${mt[1]}`;
}
