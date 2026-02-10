import { test, expect } from '@playwright/test';

/**
 * Journey 1: First-Time Visitor (Desktop)
 * Persona: Chief Engineer, first time seeing Celeste
 *
 * Success criteria:
 * - No console errors
 * - No broken images
 * - No horizontal overflow
 * - All sections render
 * - Smooth scroll through entire page
 */

test.describe('Journey 1: First-Time Desktop Visitor', () => {
  let consoleErrors = [];
  let consoleWarnings = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    consoleWarnings = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
      if (msg.type() === 'warning') consoleWarnings.push(msg.text());
    });

    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });
  });

  test('Complete scroll journey without errors', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Step 1: Hero visible on load
    const hero = page.locator('#Hero, .hero-section');
    await expect(hero).toBeVisible();

    // Step 2: No horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Step 3: Scroll through all major sections
    const sections = [
      { selector: '#how, .about-section', name: 'Philosophy/How' },
      { selector: '#product, .services-section', name: 'Product' },
      { selector: '#metrics, .impact-section', name: 'Metrics' },
      { selector: '#operational-context', name: 'Operational Context' },
      { selector: '#pricing, .cta-section', name: 'Pricing' },
      { selector: '#contact, .footer-section', name: 'Footer' },
    ];

    for (const section of sections) {
      const element = page.locator(section.selector).first();
      if (await element.count() > 0) {
        await element.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        await expect(element).toBeVisible();
      }
    }

    // Step 4: Check for broken images
    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.src);
    });
    expect(brokenImages).toHaveLength(0);

    // Step 5: No console errors (filter known benign ones)
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('404') &&
      !err.includes('third-party')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('All CTAs are clickable and have valid hrefs', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Find all mailto links
    const mailtoLinks = page.locator('a[href^="mailto:"]');
    const count = await mailtoLinks.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = mailtoLinks.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toContain('mailto:');
      expect(href).toContain('@');
    }
  });

  test('Page load performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const domContentLoaded = Date.now() - startTime;

    await page.waitForLoadState('networkidle');
    const fullyLoaded = Date.now() - startTime;

    console.log(`DOM Content Loaded: ${domContentLoaded}ms`);
    console.log(`Fully Loaded: ${fullyLoaded}ms`);

    // DOM should be interactive within 3 seconds
    expect(domContentLoaded).toBeLessThan(3000);
  });

  test('No layout shift on scroll', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Get initial body width
    const initialWidth = await page.evaluate(() => document.body.scrollWidth);

    // Scroll through page
    await page.evaluate(async () => {
      const totalHeight = document.documentElement.scrollHeight;
      const step = window.innerHeight;
      for (let y = 0; y < totalHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 100));
      }
    });

    // Check width hasn't changed (no horizontal overflow introduced)
    const finalWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(finalWidth).toBe(initialWidth);
  });
});
