import { test, expect } from '@playwright/test';

/**
 * OC Section Deep Test
 * Tests the "text locks, waits for image" scroll behavior
 *
 * Success criteria:
 * - Text locks at vertical center when scrolling into view
 * - Image scrolls up into alignment with locked text
 * - Once aligned, both exit together
 * - Same behavior for both pairs
 * - No sticky on mobile
 */

test.describe('OC Section: Text-Lock-For-Image Behavior', () => {

  test('Pair 1: Ledger text locks while image scrolls in', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const section = page.locator('#operational-context');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const sectionTop = await page.evaluate(() => {
      return document.getElementById('operational-context')?.offsetTop || 0;
    });

    // Scroll to start of OC section
    await page.evaluate((top) => window.scrollTo(0, top), sectionTop);
    await page.waitForTimeout(300);

    // Get viewport center
    const viewportHeight = page.viewportSize()?.height || 900;
    const viewportCenter = viewportHeight / 2;

    // Test at multiple scroll positions
    const scrollTests = [
      { offset: 0, description: 'start' },
      { offset: 150, description: 'text should be locked' },
      { offset: 300, description: 'image scrolling in' },
      { offset: 500, description: 'near alignment' },
    ];

    for (const { offset, description } of scrollTests) {
      await page.evaluate(([top, off]) => window.scrollTo(0, top + off), [sectionTop, offset]);
      await page.waitForTimeout(200);

      const positions = await page.evaluate(() => {
        const text = document.querySelector('.oc-pair:first-child .oc-sticky');
        const image = document.querySelector('.oc-pair:first-child .oc-image');

        if (!text || !image) return null;

        const textRect = text.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        const textStyle = window.getComputedStyle(text);

        return {
          textPosition: textStyle.position,
          textTop: textRect.top,
          textCenter: textRect.top + textRect.height / 2,
          imageTop: imageRect.top,
          imageCenter: imageRect.top + imageRect.height / 2,
        };
      });

      if (positions) {
        console.log(`Offset ${offset}px (${description}):`, {
          textPosition: positions.textPosition,
          textCenter: Math.round(positions.textCenter),
          imageCenter: Math.round(positions.imageCenter),
          viewportCenter: Math.round(viewportCenter),
        });

        // Text should be sticky
        expect(positions.textPosition).toBe('sticky');

        // Text should be near viewport center when locked
        if (offset > 100 && offset < 400) {
          expect(Math.abs(positions.textCenter - viewportCenter)).toBeLessThan(100);
        }
      }
    }
  });

  test('Pair 2: Related text locks while image scrolls in', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Scroll to Pair 2
    const pair2 = page.locator('.oc-pair:last-child');
    await pair2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const positions = await page.evaluate(() => {
      const text = document.querySelector('.oc-pair:last-child .oc-sticky');
      const image = document.querySelector('.oc-pair:last-child .oc-image');

      if (!text || !image) return null;

      const textRect = text.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      const textStyle = window.getComputedStyle(text);

      return {
        textPosition: textStyle.position,
        textCenter: textRect.top + textRect.height / 2,
        imageCenter: imageRect.top + imageRect.height / 2,
      };
    });

    if (positions) {
      console.log('Pair 2 positions:', positions);
      expect(positions.textPosition).toBe('sticky');
    }
  });

  test('OC content has proper padding from edges', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const section = page.locator('#operational-context');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const viewportWidth = page.viewportSize()?.width || 1440;

    // Scroll to show pair 1 aligned
    await page.evaluate(() => {
      const section = document.getElementById('operational-context');
      if (section) window.scrollTo(0, section.offsetTop + 200);
    });
    await page.waitForTimeout(300);

    const insets = await page.evaluate((vw) => {
      const pair1Text = document.querySelector('.oc-pair:first-child .oc-sticky');
      const pair1Image = document.querySelector('.oc-pair:first-child .oc-image');

      return {
        textLeftInset: pair1Text?.getBoundingClientRect().left || 0,
        imageRightInset: vw - (pair1Image?.getBoundingClientRect().right || vw),
      };
    }, viewportWidth);

    console.log('Edge insets:', insets);

    // Should have at least 60px inset from edges
    expect(insets.textLeftInset).toBeGreaterThan(60);
    expect(insets.imageRightInset).toBeGreaterThan(60);
  });

  test('Images are 16:9 aspect ratio', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const section = page.locator('#operational-context');
    await section.scrollIntoViewIfNeeded();

    const imageRatios = await page.evaluate(() => {
      const images = document.querySelectorAll('#operational-context .oc-image');
      return Array.from(images).map(img => {
        const rect = img.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          ratio: rect.width / rect.height,
        };
      });
    });

    console.log('Image dimensions:', imageRatios);

    for (const img of imageRatios) {
      // 16:9 = 1.777...
      expect(img.ratio).toBeCloseTo(16/9, 1);
    }
  });
});

test.describe('OC Section: Cross-Browser', () => {
  test('Safari sticky works correctly', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific test');

    await page.goto('/', { waitUntil: 'networkidle' });

    const section = page.locator('#operational-context');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      const section = document.getElementById('operational-context');
      if (section) window.scrollTo(0, section.offsetTop + 200);
    });
    await page.waitForTimeout(300);

    const stickyWorks = await page.evaluate(() => {
      const text = document.querySelector('.oc-pair:first-child .oc-sticky');
      if (!text) return false;
      return window.getComputedStyle(text).position === 'sticky';
    });

    expect(stickyWorks).toBe(true);
  });
});
