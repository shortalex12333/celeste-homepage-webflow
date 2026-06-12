#!/usr/bin/env node
/**
 * engine-run.mjs — the twice-weekly celeste7.ai content-engine runner (launchd).
 *
 * Flow (one piece per fire):
 *   clone repo → /tmp  (TCC-safe; launchd can't write ~/Documents)
 *   → pick the next queue item whose blogs/<slug>.html does NOT yet exist on main
 *   → brief.mjs  → CLAUDE (headless) drafts draft.html + meta.json and SELF-GATES
 *   → publish.mjs (gate-guarded; refuses anything the gate fails)
 *   → push a branch + open a PR  → notify
 *
 * It NEVER merges and NEVER publishes un-gated. Any failure → notify + clean exit,
 * leaving no broken state. The founder reviews + merges every PR.
 *
 * Flags:  --dry  (do everything EXCEPT push/PR — for a safe local test)
 *
 * Pause the schedule:  launchctl unload ~/Library/LaunchAgents/com.celeste.content-engine.plist
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, existsSync, appendFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir, homedir } from 'node:os';

const REPO   = 'https://github.com/shortalex12333/celeste-homepage-webflow';
const NTFY    = 'https://ntfy.sh/myi2-alerts-a9eb492b17a2b8db';
const HOME    = join(homedir(), '.celeste-content-engine');
const QUEUE   = join(HOME, 'queue.json');
const LOG     = '/tmp/celeste-engine.log';
const DRY     = process.argv.includes('--dry');
const TODAY   = new Date().toISOString().slice(0, 10);

function log(m){ const l = `[${new Date().toISOString()}] ${m}\n`; process.stdout.write(l); try { appendFileSync(LOG, l); } catch {} }
function notify(title, msg, prio = 'default'){
  try { execFileSync('curl', ['-s', '-H', `Title: ${title}`, '-H', `Priority: ${prio}`, '-d', msg, NTFY], { timeout: 15000 }); } catch {}
  try { execFileSync('osascript', ['-e', `display notification ${JSON.stringify(msg)} with title ${JSON.stringify(title)}`], { timeout: 8000 }); } catch {}
}
function sh(cmd, args, cwd, timeout = 0){
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: timeout || undefined });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exited ${r.status}: ${(r.stderr||r.stdout||'').slice(-400)}`);
  return r.stdout || '';
}

async function main(){
  log(`── content-engine fire ${DRY ? '(DRY)' : ''} ──`);
  if (!existsSync(QUEUE)) { log(`no queue at ${QUEUE} — nothing to do`); return; }
  const queue = JSON.parse(readFileSync(QUEUE, 'utf8'));

  // fresh shallow clone in /tmp (writable from launchd, unlike ~/Documents)
  const dir = mkdtempSync(join(tmpdir(), 'celeste-engine-'));
  log(`clone → ${dir}`);
  sh('git', ['clone', '--depth', '1', REPO, dir], undefined, 120000);
  const CE = join(dir, 'content-engine');
  if (!existsSync(join(CE, 'gate.mjs'))) { log('clone has no content-engine/ — abort'); rmSync(dir, { recursive: true, force: true }); return; }

  // next undone piece = its target blog file does not yet exist on main
  const item = queue.find(q => !existsSync(join(dir, 'blogs', `${q.canonicalSlug}.html`)));
  if (!item) { log('queue exhausted — all pieces published. Idle.'); rmSync(dir, { recursive: true, force: true }); return; }
  log(`target: ${item.slug}  (keyword "${item.keyword}", chapter ${item.chapter})`);

  try {
    // 1. brief
    const briefArgs = ['brief.mjs', '--slug', item.slug, '--keyword', item.keyword, '--chapter', item.chapter, '--format', item.format || 'guide'];
    if (item.refresh) briefArgs.push('--refresh', item.refresh);
    sh('node', briefArgs, CE, 60000);
    log('brief written');

    // 2. CLAUDE drafts + self-gates (the one creative step; headless)
    const prompt = [
      `You are the celeste7.ai content drafter. Working dir is the cloned site repo.`,
      `READ content-engine/posts/${item.slug}/brief.md AND content-engine/claims-allowlist.md AND an existing post content-engine/../blogs/knowledge-crisis-superyachts.html for structure.`,
      `WRITE content-engine/posts/${item.slug}/draft.html (a full article BODY: <header class="article-header"> with ONE <h1>=the angle title + a meta line + a lede <p>, then <div class="article-body"> with <h2> sections, accent/stat callouts, {{asset:<id>}} figure placeholders from the registry, a references list if you cite sources, then a <div class="article-cta"> ending at /#pilot) AND content-engine/posts/${item.slug}/meta.json {title (30-65 chars, end "— Celeste"), description (<=155), canonical:"${item.canonical}", slug:"${item.slug}", keyword:"${item.keyword}", chapter:"${item.chapter}"}.`,
      `VOICE: quietly confident, evidence-led, show-don't-claim, name CelesteOS late, "captured as you work" NEVER "writes itself", the system PROPOSES the engineer DECIDES. NO hype lexicon, NO invented metrics, NO pricing. Use ONLY SAFE phrasings from claims-allowlist.md; respect each asset's NEVER lines. ~1200-1400 words, genuinely useful to a chief engineer / superintendent.`,
      `THEN run: node content-engine/gate.mjs content-engine/posts/${item.slug}/draft.html  AND  node content-engine/gate.mjs content-engine/posts/${item.slug}/meta.json — and FIX every violation with the safe substitute until BOTH exit 0. Do not weaken the gate. When both pass, print exactly: ENGINE_DRAFT_OK`,
    ].join('\n');
    log('claude headless drafting …');
    const c = spawnSync('claude', ['-p', prompt, '--allowedTools', 'Read,Write,Edit,Bash', '--add-dir', dir], { cwd: dir, encoding: 'utf8', timeout: 900000 });
    log(`claude exit ${c.status}; tail: ${(c.stdout||'').slice(-200).replace(/\n/g,' ')}`);

    // 3. independent gate verdict (don't trust the model's word)
    const g1 = spawnSync('node', ['gate.mjs', `posts/${item.slug}/draft.html`], { cwd: CE });
    const g2 = spawnSync('node', ['gate.mjs', `posts/${item.slug}/meta.json`], { cwd: CE });
    if (g1.status !== 0 || g2.status !== 0) throw new Error(`draft failed the gate (draft=${g1.status}, meta=${g2.status}) — not publishing`);
    log('gate PASS on draft + meta');

    // 4. publish (gate-guarded again, incl. rendered page)
    sh('node', ['publish.mjs', item.slug, '--date', TODAY], CE, 120000);
    const out = join(dir, 'blogs', `${item.canonicalSlug}.html`);
    if (!existsSync(out)) throw new Error(`publish did not produce blogs/${item.canonicalSlug}.html`);
    log(`published blogs/${item.canonicalSlug}.html`);

    if (DRY) { log('DRY run — skipping push/PR'); notify('Content engine (dry)', `Drafted+gated+published ${item.slug} locally. No PR.`); rmSync(dir, { recursive: true, force: true }); return; }

    // 5. branch → push → PR (founder merges)
    const branch = `engine/${item.canonicalSlug}-${TODAY}`;
    sh('git', ['checkout', '-b', branch], dir);
    sh('git', ['add', 'blogs', 'images', 'sitemap.xml'], dir);
    sh('git', ['-c', 'user.name=CelesteOS Content Engine', '-c', 'user.email=dev@celeste7.ai', 'commit', '-m', `content: ${item.canonicalSlug} — "${item.keyword}" (engine, gate-clean)`], dir);
    sh('git', ['push', '-u', 'origin', branch], dir, 60000);
    const pr = sh('gh', ['pr', 'create', '--repo', 'shortalex12333/celeste-homepage-webflow', '--base', 'main', '--head', branch,
      '--title', `content: ${item.canonicalSlug} (engine, gate-clean) — review + merge`,
      '--body', `Auto-drafted by the twice-weekly content engine, gate-clean (truth + brand + structure), ${item.refresh ? 'refreshes the trusted /blogs/' + item.refresh + ' URL' : 'new post'} for "${item.keyword}".\n\nReview the writing, then merge to publish. Nothing is live until you merge.`], dir, 60000).trim();
    log(`PR: ${pr}`);
    notify('📝 Content engine: PR ready', `${item.canonicalSlug} drafted + gated. Review + merge: ${pr}`, 'high');
  } catch (e) {
    log(`ERROR: ${e.message}`);
    notify('⚠️ Content engine failed', `${item.slug}: ${e.message.slice(0,180)} — left for a manual session.`, 'high');
    rmSync(dir, { recursive: true, force: true });
    process.exit(1);
  }
  rmSync(dir, { recursive: true, force: true });
  log('done');
}
main().catch(e => { log(`FATAL: ${e.message}`); notify('⚠️ Content engine fatal', e.message.slice(0,180), 'high'); process.exit(1); });
