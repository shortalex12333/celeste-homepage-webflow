// LinkedIn OAuth 2.0 redirect/callback — Community Management API.
// Registered redirect URL: https://www.celeste7.ai/api/linkedin/callback
// (www 308-redirects to the apex, preserving ?code/?state; this function serves on the apex.)
// Placeholder that returns 200 so LinkedIn accepts the redirect URL and the OAuth round-trip
// lands somewhere valid. After the user authorises, the browser arrives here with
// ?code=...&state=...  (or ?error=...).  TODO: exchange `code` for an access token to read
// the organisation follower count for the homepage momentum line.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  const errorDesc = searchParams.get('error_description') || '';
  const code = searchParams.get('code');

  console.log('[linkedin/callback]', { hasCode: !!code, error: error || null });

  const msg = error
    ? 'LinkedIn authorisation was cancelled or failed.'
    : code
      ? 'LinkedIn authorisation received. You can close this window.'
      : 'CelesteOS · LinkedIn OAuth endpoint.';

  const safeDesc = error && errorDesc ? String(errorDesc).slice(0, 200).replace(/[<>]/g, '') : '';

  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8">'
    + '<meta name="robots" content="noindex,nofollow">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>CelesteOS · LinkedIn</title></head>'
    + '<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0C0B0A;color:rgba(255,255,255,.9);font-family:ui-monospace,SFMono-Regular,monospace">'
    + '<div style="text-align:center;max-width:30rem;padding:2rem;line-height:1.6">'
    + '<div style="font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#5AABCC;margin-bottom:1rem">CelesteOS</div>'
    + '<p>' + msg + '</p>'
    + (safeDesc ? '<p style="opacity:.5;font-size:.85rem">' + safeDesc + '</p>' : '')
    + '</div></body></html>';

  return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
