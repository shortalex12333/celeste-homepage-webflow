// Vercel Function: lead-magnet ("Generate my handover") intake.
// Web-standard signature (current Vercel runtime): export the HTTP method, take a
// Request, return a Response. Runs on Node.js (Fluid Compute) by default: needed
// for the outbound fetch to Resend. No database: at pilot scale your inbox is the CRM.
//
// DEPLOY SETUP (one-time):
//   1. Add domain celeste7.ai to Resend (https://resend.com) + verify DNS.
//   2. Vercel → Project → Settings → Environment Variables:
//        RESEND_API_KEY = re_xxxxxxxx
//        LEAD_TO        = contact@celeste7.ai                 (optional, default below)
//        LEAD_FROM      = CelesteOS <contact@celeste7.ai>     (optional; domain must be verified in Resend)
//   3. Deploy. The page form POSTs to /api/magnet automatically.
// Absent RESEND_API_KEY, it still returns 200 (the page shows its confirmation
// regardless) so nothing breaks before email is wired up.

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { body = {}; }
  body = body || {};

  const email = String(body.email || '').trim();
  const vessel = String(body.vessel || '').trim().slice(0, 120);
  const jobs = Array.isArray(body.jobs)
    ? body.jobs.slice(0, 25).map((j) => String(j).slice(0, 500))
    : [];

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: 'A valid email is required.' }, { status: 400 });
  }

  const at = body.attribution && typeof body.attribution === 'object' ? body.attribution : {};
  const TO = process.env.LEAD_TO || 'contact@celeste7.ai';
  const FROM = process.env.LEAD_FROM || 'CelesteOS <contact@celeste7.ai>';
  const key = process.env.RESEND_API_KEY;

  // observability: non-PII summary (no email/job text) → Vercel Runtime Logs
  console.log('[magnet] received', { vessel: vessel || '(unnamed)', jobs: jobs.length });

  if (!key) {
    console.warn('[magnet] RESEND_API_KEY not set: lead NOT emailed; check env vars.');
  } else {
    const text =
      `New handover request from celeste7.ai\n\n` +
      `Vessel:  ${vessel || '(unnamed)'}\n` +
      `From:    ${email}\n\n` +
      `Jobs (${jobs.length}):\n` +
      (jobs.length ? jobs.map((j, i) => `  ${i + 1}. ${j}`).join('\n') : '  (none submitted)') +
      `\n\nSource:\n` +
      `  referrer: ${String(at.referrer || 'unknown').slice(0, 200)}\n` +
      `  landing:  ${String(at.landing || '/').slice(0, 160)}\n` +
      (at.utm_source ? `  utm:      ${[at.utm_source, at.utm_medium, at.utm_campaign].filter(Boolean).join(' / ').slice(0, 200)}\n` : '') +
      (at.gclid ? `  gclid:    ${String(at.gclid).slice(0, 80)}\n` : '') +
      `\nReceived: ${new Date().toISOString()}`;
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM,
          to: [TO],
          reply_to: email,
          subject: `Handover request: ${vessel || 'unnamed vessel'}`,
          text,
        }),
      });
      if (!r.ok) {
        console.error('[magnet] Resend non-OK', r.status, await r.text().catch(() => ''));
      }
    } catch (err) {
      // never block the visitor's confirmation on a transient email error: but log it
      console.error('[magnet] Resend request failed', err && err.message ? err.message : err);
    }
  }

  return Response.json({ ok: true });
}
