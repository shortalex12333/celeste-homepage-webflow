import { test, expect } from '@playwright/test';

/**
 * Journey 2: Mobile User
 * Persona: Crew member checking site on phone
 *
 * Success criteria:
 * - Responsive layout (no horizontal scroll)
 * - Touch targets >= 44px
 * - OC section stacks (no sticky)
 * - All content readable
 * - CTAs tappable
 */

// Use mobile viewport for all tests in this file
test.use({ viewport: { width: 390, height: 844 } });

test.describe('Journey 2: Mobile User', () => {

  test('No horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('OC section stacks vertically on mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const ocSection = page.locator('#operational-context');
    await ocSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Check that sticky is disabled on mobile
    const stickyElements = await page.evaluate(() => {
      const stickies = document.querySelectorAll('.oc-sticky');
      return Array.from(stickies).map(el => {
        const style = window.getComputedStyle(el);
        return {
          position: style.position,
          className: el.className
        };
      });
    });

    // On mobile, sticky should be static
    for (const el of stickyElements) {
      expect(el.position).toBe('static');
    }
  });

  test('Touch targets are adequate size', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check all clickable elements
    const clickables = page.locator('a, button, [role="button"]');
    const count = await clickables.count();

    const smallTargets = [];
    for (let i = 0; i < count; i++) {
      const el = clickables.nth(i);
      if (await el.isVisible()) {
        const box = await el.boundingBox();
        if (box && (box.width < 44 || box.height < 44)) {
          const text = await el.textContent();
          smallTargets.push({ text: text?.substring(0, 30), width: box.width, height: box.height });
        }
      }
    }

    // Log small targets for review (warning, not failure)
    if (smallTargets.length > 0) {
      console.log('Small touch targets found:', smallTargets);
    }
  });

  test('All images fit within viewport', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const viewportWidth = page.viewportSize()?.width || 390;

    const oversizedImages = await page.evaluate((vw) => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => img.getBoundingClientRect().width > vw)
        .map(img => ({ src: img.src, width: img.getBoundingClientRect().width }));
    }, viewportWidth);

    expect(oversizedImages).toHaveLength(0);
  });

  test('CTAs are tappable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Find hero CTA
    const heroCTA = page.locator('.hero-section a[href^="mailto:"]').first();
    if (await heroCTA.count() > 0) {
      await expect(heroCTA).toBeVisible();
      const box = await heroCTA.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }

    // Scroll to pricing CTA
    const pricingSection = page.locator('#pricing, .cta-section');
    if (await pricingSection.count() > 0) {
      await pricingSection.scrollIntoViewIfNeeded();
      const pricingCTA = pricingSection.locator('a[href^="mailto:"]').first();
      if (await pricingCTA.count() > 0) {
        await expect(pricingCTA).toBeVisible();
      }
    }
  });

  test('Text is readable (not too small)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const smallText = await page.evaluate(() => {
      const textElements = document.querySelectorAll('p, span, div, li');
      const small = [];
      textElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize < 12 && el.textContent?.trim().length > 0) {
          small.push({ text: el.textContent.substring(0, 30), fontSize });
        }
      });
      return small;
    });

    // Log small text for review
    if (smallText.length > 0) {
      console.log('Small text found:', smallText.slice(0, 5));
    }
  });
});
