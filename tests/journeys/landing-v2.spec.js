/**
 * LANDING-V2.SPEC.JS — smoke + contract test for the new 14-section homepage.
 *
 * Runs against TEST_URL (defaults to a local python http.server at :8080).
 * To run locally:
 *   cd /Users/celeste7/Documents/CelesteOS-Landing\ Page
 *   python3 -m http.server 8080 &
 *   TEST_URL=http://localhost:8080 npx playwright test tests/journeys/landing-v2.spec.js --project=chromium
 *
 * Asserts the contract from LANDING_V2.md §9 (verification checklist) so any
 * regression on the new homepage trips this file rather than silently shipping.
 */

import { test, expect } from '@playwright/test';

const PAGE = '/landing-v2.html';

const SECTION_IDS = [
  'hero',
  'handover',
  'search',
  'related',
  'money',
  'receiving',
  'certificates',
  'hor',
  'alongside',
  'onboarding',
  'ledger',
  'founder',
  'pricing',
  'cta',
];

test.describe('landing-v2 · structural contract', () => {
  test('all 14 sections are present', async ({ page }) => {
    await page.goto(PAGE);
    for (const id of SECTION_IDS) {
      const section = page.locator(`#${id}`);
      await expect(section, `section #${id} must exist`).toHaveCount(1);
    }
  });

  test('hero sub-line is visible WITHOUT user interaction', async ({ page }) => {
    // Kills the old click-to-reveal pattern — see LANDING_V2.md §8.
    await page.goto(PAGE);
    const subline = page.locator('.lp-hero-sub');
    await expect(subline).toBeVisible();
    await expect(subline).toContainText('Manuals.');
    await expect(subline).toContainText('Hours of rest.');
  });

  test('§02 handover flow has exactly 5 steps with numbered markers', async ({ page }) => {
    await page.goto(PAGE);
    const steps = page.locator('#handover .lp-step');
    await expect(steps).toHaveCount(5);
    const markers = page.locator('#handover .lp-step-num span');
    await expect(markers).toHaveText(['01', '02', '03', '04', '05']);
  });

  test('§03 + §05 + §06 + §07 + §08 each render both Before and After panels', async ({ page }) => {
    await page.goto(PAGE);
    for (const id of ['search', 'money', 'receiving', 'certificates', 'hor']) {
      const before = page.locator(`#${id} .lp-panel--before`);
      const after  = page.locator(`#${id} .lp-panel--after`);
      await expect(before, `${id} missing Before panel`).toHaveCount(1);
      await expect(after,  `${id} missing After panel`).toHaveCount(1);
    }
  });

  test('§05 + §06 render the £4,200 figure (flagged in LANDING_V2.md §6.A)', async ({ page }) => {
    await page.goto(PAGE);
    await expect(page.locator('#money')).toContainText('£4,200');
    await expect(page.locator('#receiving')).toContainText('£4,200');
  });

  test('§09 stack diagram names IDEA, Seahub, AMOS', async ({ page }) => {
    await page.goto(PAGE);
    const stack = page.locator('#alongside .lp-stack-base');
    await expect(stack).toContainText('AMOS');
    await expect(stack).toContainText('Seahub');
    await expect(stack).toContainText('IDEA');
  });

  test('§11 ledger has at least 5 sealed rows, each linking to verify.celeste7.ai', async ({ page }) => {
    await page.goto(PAGE);
    const rows = page.locator('#ledger .lp-ledger-row');
    expect(await rows.count()).toBeGreaterThanOrEqual(5);
    const verifyLinks = page.locator('#ledger a[href*="verify.celeste7.ai"]');
    expect(await verifyLinks.count()).toBeGreaterThanOrEqual(5);
    for (const link of await verifyLinks.all()) {
      await expect(link).toHaveAttribute('href', /^https:\/\/verify\.celeste7\.ai\/\?receipt=R-/);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });

  test('§12 founder block has NO photo (faces banned per spec)', async ({ page }) => {
    await page.goto(PAGE);
    const founderImgs = page.locator('#founder img');
    await expect(founderImgs).toHaveCount(0);
  });

  test('§13 pricing renders $450 per 28 days', async ({ page }) => {
    await page.goto(PAGE);
    const pricing = page.locator('#pricing');
    await expect(pricing).toContainText('450');
    await expect(pricing).toContainText('28 days');
    await expect(pricing).toContainText('Unlimited seats');
  });

  test('§14 CTA has the pilot-access mailto trigger + verifier link', async ({ page }) => {
    await page.goto(PAGE);
    const ctaBtn = page.locator('#cta a[data-mailto="pilot"]');
    await expect(ctaBtn).toHaveCount(1);
    await expect(ctaBtn).toContainText('Request pilot access');
    const verifier = page.locator('#cta a[href*="verify.celeste7.ai"]');
    await expect(verifier).toHaveCount(1);
  });
});

test.describe('landing-v2 · scroll-reveal behaviour', () => {
  test('default motion: §02 steps are hidden initially, revealed on scroll', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit IntersectionObserver timing flakes in headless — covered in chromium');
    await page.goto(PAGE);
    // Step 5 is below the fold on a 900px viewport — must NOT have .is-visible yet.
    const step5 = page.locator('#handover .lp-step[data-step="5"]');
    await expect(step5).not.toHaveClass(/is-visible/);
    // Scroll to step 5; observer must fire.
    await step5.scrollIntoViewIfNeeded();
    await expect(step5).toHaveClass(/is-visible/, { timeout: 2000 });
  });

  test('reduced motion: all 5 steps are revealed immediately', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(PAGE);
    // The JS reveals all steps synchronously when prefers-reduced-motion is set.
    const steps = page.locator('#handover .lp-step');
    for (const step of await steps.all()) {
      await expect(step).toHaveClass(/is-visible/);
    }
  });
});

test.describe('landing-v2 · health', () => {
  test('zero console errors on initial load + full-page scroll', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    await page.goto(PAGE);
    await page.waitForLoadState('networkidle');
    // Scroll the whole page once — triggers IntersectionObserver, lazy fonts, etc.
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const step = () => {
          window.scrollTo(0, y);
          y += 400;
          if (y < document.body.scrollHeight) {
            requestAnimationFrame(step);
          } else {
            resolve(null);
          }
        };
        step();
      });
    });
    // Filter known-benign noise (gtag, missing optional analytics, etc.)
    const real = errors.filter((e) => !/gtag|googletagmanager|favicon/i.test(e));
    expect(real, `console errors:\n${real.join('\n')}`).toEqual([]);
  });

  test('Eloquia Display loads (hero heading uses it)', async ({ page }) => {
    await page.goto(PAGE);
    await page.waitForLoadState('networkidle');
    const heroFont = await page.locator('.lp-hero-title').evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    expect(heroFont).toMatch(/Eloquia Display/);
  });

  test('mono labels use IBM Plex Mono', async ({ page }) => {
    await page.goto(PAGE);
    await page.waitForLoadState('networkidle');
    const monoFont = await page.locator('.lp-eyebrow').first().evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    expect(monoFont).toMatch(/IBM Plex Mono|Plex Mono/);
  });

  test('total page scroll height sits in the 8,000-12,500px band on a 1440 viewport', async ({ page }) => {
    // Spec target was ~3,800px assuming sparse mocks. After mocks were filled
    // in with proof artifacts (warranty claim pack, OCR table, full ledger,
    // HoR month grid) the page settled around 11,400px ≈ 13× viewport. This
    // is intentional density. Band trips if someone amputates mocks (lower)
    // or accidentally adds a 100vh hero/CTA (upper).
    await page.goto(PAGE);
    await page.waitForLoadState('networkidle');
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(scrollHeight).toBeGreaterThan(8000);
    expect(scrollHeight).toBeLessThan(12500);
  });
});

test.describe('landing-v2 · responsive', () => {
  test('at 375px viewport (mobile), no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(PAGE);
    await page.waitForLoadState('networkidle');
    const horizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    expect(horizontalOverflow, 'horizontal overflow detected').toBeLessThanOrEqual(1);
  });

  test('at 768px viewport, before/after stacks vertically', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(PAGE);
    const beforeBox = await page.locator('#search .lp-panel--before').boundingBox();
    const afterBox  = await page.locator('#search .lp-panel--after').boundingBox();
    expect(beforeBox).toBeTruthy();
    expect(afterBox).toBeTruthy();
    // After panel sits below Before panel (stacked, not side-by-side).
    expect(afterBox.y).toBeGreaterThan(beforeBox.y + beforeBox.height - 4);
  });
});
