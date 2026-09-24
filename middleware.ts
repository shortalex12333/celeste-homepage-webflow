/**
 * SeaNet pages visibility switch.
 *
 * Every /seanet* page (landing, overview, proposal, security pitch, security companion)
 * returns 404 unless the Vercel environment variable SEANET_VISIBLE is exactly "true".
 * Unset, "false", or anything else = hidden. Changing the variable needs a redeploy.
 */
export const config = {
  matcher: ['/:page(seanet[^/]*)'],
};

export default async function middleware(request: Request) {
  const { pathname } = new URL(request.url);
  if (!/^\/seanet[^/]*$/i.test(pathname)) return;

  const flag = (process.env.SEANET_VISIBLE ?? process.env.seanet_visible ?? '').trim().toLowerCase();
  if (flag === 'true') return;

  let body: BodyInit = 'Not Found';
  let type = 'text/plain; charset=utf-8';
  try {
    const page = await fetch(new URL('/404.html', request.url));
    if (page.ok) { body = await page.text(); type = 'text/html; charset=utf-8'; }
  } catch {}
  return new Response(body, {
    status: 404,
    headers: { 'content-type': type, 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store' },
  });
}
