#!/usr/bin/env node
// scorecard.mjs — GSC FEEDBACK-LOOP for the celeste7.ai content pipeline.
//
// The "measure" leg of: brief -> (Claude drafts) -> GATE -> founder review ->
// git publish -> MEASURE -> iterate. This script closes the loop: it pulls the
// last 28 days vs the prior 28 days of Google Search Console performance for
// sc-domain:celeste7.ai, broken down by PAGE, computes the position +
// impressions delta per URL, and classifies each /blogs/* (and key) URL as
// climbing / stalled / dead so the next REFRESH-PLAN pass knows what to retarget.
//
// QUALITY-not-volume: this does NOT tell you to pump out posts. It tells you
// which already-shipped posts are working (climbing) and which are wasting a
// slot (dead) and should be re-briefed for Claude to rewrite against a sharper
// keyword — the same restraint discipline as the rest of the pipeline.
//
// Node stdlib ONLY. No npm deps. Node v24.
//
// Usage:
//   node scorecard.mjs           # live pull, prints table, writes scorecard-latest.json
//   node scorecard.mjs --help
//
// Auth: reads the JARVIS GSC OAuth token (client_id, client_secret,
// refresh_token), mints a short-lived access token via the refresh-token grant,
// then queries Search Console. Read-only (webmasters.readonly scope).

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ----------------------------------------------------------------------------
// Config
// ----------------------------------------------------------------------------
const TOKEN_PATH =
  process.env.GSC_OAUTH_TOKEN ||
  '/Users/celeste7/Documents/JARVIS/analytics-node/secrets/gsc_token.json';

const SITE_URL = process.env.GSC_SITE_URL || 'sc-domain:celeste7.ai';

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GSC_ENDPOINT = (siteUrl) =>
  `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    siteUrl,
  )}/searchAnalytics/query`;

const WINDOW_DAYS = 28;
// GSC data lags ~2-3 days; start the "current" window from 3 days ago so we
// compare two equal-length SETTLED windows and avoid the partial-day tail.
const LAG_DAYS = 3;
const ROW_LIMIT = 25000;

const OUT_PATH = path.join(__dirname, 'scorecard-latest.json');

// Classification thresholds (tuned for a low-traffic founder site — small
// absolute numbers, so position movement is the primary signal).
const POS_IMPROVE = 0.5; // avg position improved by >= this many places
const POS_WORSEN = 0.5; // avg position dropped by >= this many places
const IMPR_GROWTH = 0.15; // impressions grew >= 15%
const IMPR_DECLINE = 0.15; // impressions fell >= 15%
const DEAD_IMPR = 2; // current-window impressions at/under this = dead

// ----------------------------------------------------------------------------
// Date helpers
// ----------------------------------------------------------------------------
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function addDays(d, n) {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

/** Two adjacent settled 28-day windows ending LAG_DAYS ago. */
function buildWindows(now = new Date()) {
  const curEnd = addDays(now, -LAG_DAYS);
  const curStart = addDays(curEnd, -(WINDOW_DAYS - 1));
  const prevEnd = addDays(curStart, -1);
  const prevStart = addDays(prevEnd, -(WINDOW_DAYS - 1));
  return {
    current: { startDate: isoDate(curStart), endDate: isoDate(curEnd) },
    previous: { startDate: isoDate(prevStart), endDate: isoDate(prevEnd) },
  };
}

// ----------------------------------------------------------------------------
// OAuth — mint an access token from the stored refresh token
// ----------------------------------------------------------------------------
async function loadToken() {
  let raw;
  try {
    raw = await readFile(TOKEN_PATH, 'utf8');
  } catch (e) {
    throw new Error(
      `GSC token not readable at ${TOKEN_PATH}: ${e.message}. ` +
        `Set GSC_OAUTH_TOKEN or run the JARVIS auth flow (make auth-gsc).`,
    );
  }
  let tok;
  try {
    tok = JSON.parse(raw);
  } catch (e) {
    throw new Error(`GSC token at ${TOKEN_PATH} is not valid JSON: ${e.message}`);
  }
  const missing = ['client_id', 'client_secret', 'refresh_token'].filter(
    (k) => !tok[k],
  );
  if (missing.length) {
    throw new Error(
      `GSC token at ${TOKEN_PATH} missing fields: ${missing.join(', ')}`,
    );
  }
  return tok;
}

async function mintAccessToken(tok) {
  const body = new URLSearchParams({
    client_id: tok.client_id,
    client_secret: tok.client_secret,
    refresh_token: tok.refresh_token,
    grant_type: 'refresh_token',
  });

  let resp;
  try {
    resp = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  } catch (e) {
    throw new Error(`Network error reaching ${TOKEN_ENDPOINT}: ${e.message}`);
  }

  const text = await resp.text();
  if (!resp.ok) {
    // Google returns {error, error_description} — surface it clearly.
    let detail = text;
    try {
      const j = JSON.parse(text);
      detail = `${j.error || 'unknown'}: ${j.error_description || text}`;
    } catch {
      /* keep raw text */
    }
    throw new Error(
      `Token refresh failed (HTTP ${resp.status}). ${detail}\n` +
        `If 'invalid_grant', the refresh token is revoked/expired — re-run ` +
        `the JARVIS Google OAuth consent (make auth-gsc).`,
    );
  }

  let j;
  try {
    j = JSON.parse(text);
  } catch (e) {
    throw new Error(`Token endpoint returned non-JSON: ${e.message}`);
  }
  if (!j.access_token) {
    throw new Error(`Token endpoint returned no access_token: ${text}`);
  }
  return j.access_token;
}

// ----------------------------------------------------------------------------
// GSC query — by PAGE, paginated
// ----------------------------------------------------------------------------
async function queryByPage(accessToken, siteUrl, win) {
  const rows = [];
  let startRow = 0;
  // Paginate in case the property ever grows past 25k pages (it won't soon,
  // but the loop costs nothing and matches the proven analytics-node client).
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const reqBody = {
      startDate: win.startDate,
      endDate: win.endDate,
      dimensions: ['page'],
      rowLimit: ROW_LIMIT,
      startRow,
      dataState: 'final',
    };

    let resp;
    try {
      resp = await fetch(GSC_ENDPOINT(siteUrl), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody),
      });
    } catch (e) {
      throw new Error(`Network error reaching Search Console: ${e.message}`);
    }

    const text = await resp.text();
    if (!resp.ok) {
      let detail = text;
      try {
        const j = JSON.parse(text);
        detail = j.error?.message || text;
      } catch {
        /* keep raw */
      }
      throw new Error(
        `GSC query failed (HTTP ${resp.status}) for ${siteUrl} ` +
          `[${win.startDate}..${win.endDate}]: ${detail}`,
      );
    }

    let j;
    try {
      j = JSON.parse(text);
    } catch (e) {
      throw new Error(`GSC returned non-JSON: ${e.message}`);
    }

    const batch = j.rows || [];
    for (const r of batch) {
      rows.push({
        page: (r.keys && r.keys[0]) || '',
        clicks: Number(r.clicks || 0),
        impressions: Number(r.impressions || 0),
        ctr: Number(r.ctr || 0),
        position: Number(r.position || 0),
      });
    }
    if (batch.length < ROW_LIMIT) break;
    startRow += ROW_LIMIT;
  }
  return rows;
}

// ----------------------------------------------------------------------------
// Classification
// ----------------------------------------------------------------------------
function pathOf(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}
/**
 * Display label: bare path for the apex/www host, host-qualified for any other
 * subdomain (e.g. verifier.celeste7.ai/) — because sc-domain: covers ALL
 * subdomains and two distinct URLs can share a path.
 */
function labelOf(url) {
  const host = hostOf(url);
  const p = pathOf(url);
  const apex = host === 'celeste7.ai' || host === 'www.celeste7.ai';
  return apex || !host ? p : `${host}${p}`;
}
function isTracked(url) {
  const host = hostOf(url);
  // Only steer the apex/www content site — exclude verifier. and other
  // subdomains the domain property happens to capture.
  if (host && host !== 'celeste7.ai' && host !== 'www.celeste7.ai') return false;
  const p = pathOf(url);
  // /blogs/* posts plus the key pages we steer (home + /blog index).
  return (
    p.startsWith('/blogs/') ||
    p === '/' ||
    p === '' ||
    p === '/blog' ||
    p === '/blogs' ||
    p === '/blog/' ||
    p === '/blogs/'
  );
}

/**
 * Classify a page from current vs previous window.
 * Lower position number = better rank, so a NEGATIVE position delta = improvement.
 */
function classify(cur, prev) {
  const curImpr = cur ? cur.impressions : 0;
  const prevImpr = prev ? prev.impressions : 0;
  const curPos = cur ? cur.position : 0;
  const prevPos = prev ? prev.position : 0;

  // Brand new in current window (no prior data) but getting impressions.
  const isNew = !prev && cur;

  // Dead: effectively no impressions now (regardless of past).
  if (curImpr <= DEAD_IMPR) {
    if (prevImpr > DEAD_IMPR) return 'dead'; // had reach, lost it — clearest dead
    return 'dead'; // never had meaningful reach
  }

  const imprDeltaPct = prevImpr > 0 ? (curImpr - prevImpr) / prevImpr : isNew ? 1 : 0;
  // Position delta only meaningful if it ranked in both windows.
  const posDelta = cur && prev && curPos > 0 && prevPos > 0 ? curPos - prevPos : 0;

  const positionImproved = posDelta <= -POS_IMPROVE;
  const positionWorsened = posDelta >= POS_WORSEN;
  const imprGrew = imprDeltaPct >= IMPR_GROWTH;
  const imprFell = imprDeltaPct <= -IMPR_DECLINE;

  if (isNew) return curImpr > DEAD_IMPR ? 'climbing' : 'stalled';

  // Climbing: ranking better OR materially more reach (and not worsening rank).
  if ((positionImproved || imprGrew) && !positionWorsened) return 'climbing';
  // Sliding the wrong way but still alive — flag as stalled (needs attention).
  if (positionWorsened || imprFell) return 'stalled';
  return 'stalled';
}

function round(n, d = 2) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

function buildScorecard(curRows, prevRows, windows) {
  const curMap = new Map(curRows.map((r) => [r.page, r]));
  const prevMap = new Map(prevRows.map((r) => [r.page, r]));
  const allPages = new Set([...curMap.keys(), ...prevMap.keys()]);

  const items = [];
  for (const page of allPages) {
    if (!isTracked(page)) continue;
    const cur = curMap.get(page) || null;
    const prev = prevMap.get(page) || null;
    const curImpr = cur ? cur.impressions : 0;
    const prevImpr = prev ? prev.impressions : 0;
    const curPos = cur ? cur.position : null;
    const prevPos = prev ? prev.position : null;

    items.push({
      url: page,
      path: pathOf(page),
      label: labelOf(page),
      status: classify(cur, prev),
      impressions: curImpr,
      impressions_prev: prevImpr,
      impressions_delta: curImpr - prevImpr,
      clicks: cur ? cur.clicks : 0,
      clicks_prev: prev ? prev.clicks : 0,
      position: curPos != null ? round(curPos, 1) : null,
      position_prev: prevPos != null ? round(prevPos, 1) : null,
      // Negative = rank improved (moved up the page).
      position_delta:
        curPos != null && prevPos != null ? round(curPos - prevPos, 1) : null,
      ctr: cur ? round(cur.ctr, 4) : 0,
    });
  }

  // Sort by current impressions desc, then by clicks desc.
  items.sort(
    (a, b) => b.impressions - a.impressions || b.clicks - a.clicks,
  );

  const counts = { climbing: 0, stalled: 0, dead: 0 };
  for (const it of items) counts[it.status]++;

  return {
    site: SITE_URL,
    generated_at: new Date().toISOString(),
    window_current: windows.current,
    window_previous: windows.previous,
    window_days: WINDOW_DAYS,
    lag_days: LAG_DAYS,
    thresholds: {
      pos_improve: POS_IMPROVE,
      pos_worsen: POS_WORSEN,
      impr_growth: IMPR_GROWTH,
      impr_decline: IMPR_DECLINE,
      dead_impr: DEAD_IMPR,
    },
    totals: {
      tracked_pages: items.length,
      ...counts,
      current_impressions: items.reduce((s, i) => s + i.impressions, 0),
      current_clicks: items.reduce((s, i) => s + i.clicks, 0),
    },
    pages: items,
  };
}

// ----------------------------------------------------------------------------
// Table printer
// ----------------------------------------------------------------------------
function fmtDelta(n, invert = false) {
  if (n == null) return '   —  ';
  const sign = n > 0 ? '+' : '';
  // invert=true means lower-is-better (position): show ▲ for improvement.
  let arrow = '';
  if (n !== 0) {
    const better = invert ? n < 0 : n > 0;
    arrow = better ? '▲' : '▼';
  }
  return `${sign}${n}${arrow}`;
}

function pad(s, w) {
  s = String(s);
  return s.length >= w ? s.slice(0, w) : s + ' '.repeat(w - s.length);
}
function padL(s, w) {
  s = String(s);
  return s.length >= w ? s.slice(0, w) : ' '.repeat(w - s.length) + s;
}

function printTable(sc) {
  const C = {
    climbing: '\x1b[32m', // green
    stalled: '\x1b[33m', // yellow
    dead: '\x1b[31m', // red
    dim: '\x1b[2m',
    bold: '\x1b[1m',
    reset: '\x1b[0m',
  };
  const color = process.stdout.isTTY;
  const c = (k, s) => (color ? C[k] + s + C.reset : s);

  console.log('');
  console.log(
    c('bold', `GSC SCORECARD — ${sc.site}`),
  );
  console.log(
    c(
      'dim',
      `current ${sc.window_current.startDate}..${sc.window_current.endDate}  ` +
        `vs prior ${sc.window_previous.startDate}..${sc.window_previous.endDate}  ` +
        `(${sc.window_days}d windows, ${sc.lag_days}d lag)`,
    ),
  );
  console.log('');

  const header =
    pad('STATUS', 9) +
    pad('PAGE', 40) +
    padL('IMPR', 7) +
    padL('Δ', 8) +
    padL('CLICKS', 7) +
    padL('POS', 7) +
    padL('ΔPOS', 8);
  console.log(c('bold', header));
  console.log(c('dim', '-'.repeat(header.length)));

  if (sc.pages.length === 0) {
    console.log(
      c(
        'dim',
        '  (no tracked /blogs/* or key pages with data in this window — ' +
          'this is expected for a new/low-traffic property)',
      ),
    );
  }

  for (const p of sc.pages) {
    const statusCell = c(p.status, pad(p.status.toUpperCase(), 9));
    const line =
      statusCell +
      pad(p.label || p.path, 40) +
      padL(p.impressions, 7) +
      padL(fmtDelta(p.impressions_delta), 8) +
      padL(p.clicks, 7) +
      padL(p.position == null ? '—' : p.position, 7) +
      padL(fmtDelta(p.position_delta, true), 8);
    console.log(line);
  }

  console.log(c('dim', '-'.repeat(header.length)));
  const t = sc.totals;
  console.log(
    `${c('bold', 'TOTALS')}  ` +
      `${c('climbing', `climbing ${t.climbing}`)}  ` +
      `${c('stalled', `stalled ${t.stalled}`)}  ` +
      `${c('dead', `dead ${t.dead}`)}  ` +
      c('dim', `| ${t.tracked_pages} tracked pages, ` +
        `${t.current_impressions} impr, ${t.current_clicks} clicks`),
  );
  console.log('');
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(
      [
        'scorecard.mjs — GSC feedback-loop for the celeste7.ai content pipeline.',
        '',
        'Pulls last 28d vs prior 28d Search Console performance by PAGE for',
        `${SITE_URL}, classifies each /blogs/* (and key) URL climbing/stalled/dead,`,
        'prints a table and writes scorecard-latest.json.',
        '',
        'Usage:  node scorecard.mjs',
        '',
        'Env overrides:',
        '  GSC_OAUTH_TOKEN   path to the OAuth token json (client_id/secret/refresh_token)',
        '  GSC_SITE_URL      Search Console property (default sc-domain:celeste7.ai)',
      ].join('\n'),
    );
    return 0;
  }

  const windows = buildWindows();

  let tok;
  try {
    tok = await loadToken();
  } catch (e) {
    console.error(`\x1b[31mAUTH ERROR:\x1b[0m ${e.message}`);
    return 2;
  }

  let accessToken;
  try {
    accessToken = await mintAccessToken(tok);
  } catch (e) {
    console.error(`\x1b[31mTOKEN REFRESH FAILED:\x1b[0m ${e.message}`);
    // Still write an empty scorecard so the loop has a deterministic artifact.
    const empty = buildScorecard([], [], windows);
    empty.error = `token_refresh_failed: ${e.message}`;
    await writeFile(OUT_PATH, JSON.stringify(empty, null, 2));
    console.error(`Wrote empty scorecard (with error note) -> ${OUT_PATH}`);
    return 2;
  }

  let curRows = [];
  let prevRows = [];
  let queryError = null;
  try {
    // Sequential (not parallel) to be polite to the quota and to surface the
    // first failing window clearly.
    curRows = await queryByPage(accessToken, SITE_URL, windows.current);
    prevRows = await queryByPage(accessToken, SITE_URL, windows.previous);
  } catch (e) {
    queryError = e.message;
    console.error(`\x1b[31mGSC QUERY ERROR:\x1b[0m ${e.message}`);
  }

  const sc = buildScorecard(curRows, prevRows, windows);
  if (queryError) sc.error = `gsc_query_failed: ${queryError}`;

  printTable(sc);

  try {
    await writeFile(OUT_PATH, JSON.stringify(sc, null, 2));
    console.log(
      `\x1b[2mwrote ${sc.pages.length} tracked pages -> ${OUT_PATH}\x1b[0m`,
    );
  } catch (e) {
    console.error(`Failed to write ${OUT_PATH}: ${e.message}`);
    return 3;
  }

  return queryError ? 2 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(`\x1b[31mUNEXPECTED:\x1b[0m ${e?.stack || e}`);
    process.exit(1);
  });
