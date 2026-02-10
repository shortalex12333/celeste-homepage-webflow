import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 * Captures screenshots at key breakpoints for comparison
 */

const breakpoints = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
];

test.describe('Visual Regression: Full Page Screenshots', () => {
  for (const bp of breakpoints) {
    test(`Full page at ${bp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      await page.screenshot({
        path: `screenshots/${bp.name}-full.png`,
        fullPage: true,
      });
    });
  }
});

test.describe('Visual Regression: Section Screenshots', () => {
  const sections = [
    { name: 'hero', selector: '#Hero, .hero-section' },
    { name: 'product', selector: '#product, .services-section' },
    { name: 'metrics', selector: '#metrics, .impact-section' },
    { name: 'oc-pair1', selector: '.oc-pair:first-child' },
    { name: 'oc-pair2', selector: '.oc-pair:last-child' },
    { name: 'pricing', selector: '#pricing, .cta-section' },
  ];

  for (const section of sections) {
    test(`Section: ${section.name} at desktop`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });

      const element = page.locator(section.selector).first();
      if (await element.count() > 0) {
        await element.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        await element.screenshot({
          path: `screenshots/section-${section.name}.png`,
        });
      }
    });
  }
});

test.describe('Visual Regression: OC Scroll States', () => {
  test('OC section at different scroll positions', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const sectionTop = await page.evaluate(() => {
      return document.getElementById('operational-context')?.offsetTop || 0;
    });

    const scrollPositions = [0, 200, 400, 600, 800];

    for (const offset of scrollPositions) {
      await page.evaluate(([top, off]) => window.scrollTo(0, top + off), [sectionTop, offset]);
      await page.waitForTimeout(300);

      await page.screenshot({
        path: `screenshots/oc-scroll-${offset}.png`,
        fullPage: false,
      });
    }
  });
});
