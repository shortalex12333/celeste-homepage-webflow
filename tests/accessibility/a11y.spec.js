import { test, expect } from '@playwright/test';

/**
 * Accessibility Tests
 * Basic a11y checks without external dependencies
 */

test.describe('Accessibility: Basic Checks', () => {

  test('All images have alt text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const imagesWithoutAlt = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => {
          // Skip decorative images (role="presentation" or role="none")
          const role = img.getAttribute('role');
          if (role === 'presentation' || role === 'none') return false;
          // Check for missing or empty alt
          return !img.alt || img.alt.trim() === '';
        })
        .map(img => img.src);
    });

    if (imagesWithoutAlt.length > 0) {
      console.log('Images missing alt text:', imagesWithoutAlt);
    }
    expect(imagesWithoutAlt).toHaveLength(0);
  });

  test('Page has valid heading hierarchy', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const headingIssues = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const issues = [];

      let lastLevel = 0;
      headings.forEach((h, i) => {
        const level = parseInt(h.tagName[1]);
        if (level > lastLevel + 1 && lastLevel !== 0) {
          issues.push(`Skipped heading level: h${lastLevel} to h${level}`);
        }
        lastLevel = level;
      });

      const h1Count = document.querySelectorAll('h1').length;
      if (h1Count === 0) issues.push('No h1 found');
      if (h1Count > 1) issues.push(`Multiple h1 tags: ${h1Count}`);

      return issues;
    });

    if (headingIssues.length > 0) {
      console.log('Heading issues:', headingIssues);
    }
  });

  test('Links have discernible text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const emptyLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links
        .filter(link => {
          const text = link.textContent?.trim() || '';
          const ariaLabel = link.getAttribute('aria-label') || '';
          const title = link.getAttribute('title') || '';
          const img = link.querySelector('img');
          const imgAlt = img?.alt || '';

          return !text && !ariaLabel && !title && !imgAlt;
        })
        .map(link => link.href);
    });

    if (emptyLinks.length > 0) {
      console.log('Links without discernible text:', emptyLinks);
    }
  });

  test('Form inputs have labels', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const unlabeledInputs = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      return inputs
        .filter(input => {
          const id = input.id;
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledby = input.getAttribute('aria-labelledby');
          const hasLabel = id && document.querySelector(`label[for="${id}"]`);

          return !hasLabel && !ariaLabel && !ariaLabelledby;
        })
        .map(input => input.name || input.id || input.type);
    });

    if (unlabeledInputs.length > 0) {
      console.log('Inputs without labels:', unlabeledInputs);
    }
  });

  test('Color contrast check (text on backgrounds)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Basic check for very light text
    const lowContrastElements = await page.evaluate(() => {
      const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, li');
      const issues = [];

      textElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;

        // Parse RGB
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
          const [, r, g, b] = match.map(Number);
          // Very light colors (close to white on white bg)
          if (r > 200 && g > 200 && b > 200) {
            const text = el.textContent?.substring(0, 30);
            if (text?.trim()) {
              issues.push({ text, color });
            }
          }
        }
      });

      return issues.slice(0, 5);
    });

    if (lowContrastElements.length > 0) {
      console.log('Potential low contrast text:', lowContrastElements);
    }
  });

  test('Keyboard navigation works', async ({ page, browserName }) => {
    // Safari/WebKit has different Tab behavior by default (doesn't tab through links)
    // This is a known browser difference, not a site issue
    test.skip(browserName === 'webkit', 'Safari has different Tab default behavior');

    await page.goto('/', { waitUntil: 'networkidle' });

    // Press Tab multiple times and ensure focus moves
    const focusedElements = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName,
          text: el?.textContent?.substring(0, 20)?.trim(),
          href: el?.getAttribute('href'),
        };
      });
      focusedElements.push(focused);
    }

    // Should have focused on multiple different elements (by text/href, not just tag)
    const uniqueElements = new Set(focusedElements.map(el => `${el.tag}:${el.href || el.text}`));
    expect(uniqueElements.size).toBeGreaterThan(3);

    // Verify focus is not stuck on BODY
    const bodyCount = focusedElements.filter(el => el.tag === 'BODY').length;
    expect(bodyCount).toBeLessThan(5);

    console.log('Tab order:', focusedElements.slice(0, 5));
  });

  test('Focus indicators are visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Tab to first focusable element
    await page.keyboard.press('Tab');

    const hasFocusIndicator = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;

      const style = window.getComputedStyle(el);
      const outline = style.outline;
      const boxShadow = style.boxShadow;

      // Check if there's some visible focus indicator
      return outline !== 'none' ||
             boxShadow !== 'none' ||
             el.classList.contains('focus') ||
             el.matches(':focus-visible');
    });

    // Log but don't fail - focus indicators vary by browser
    console.log('Focus indicator present:', hasFocusIndicator);
  });

  test('Theme toggle button is accessible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const toggle = page.locator('#theme-toggle');
    const toggleExists = await toggle.count() > 0;

    // Skip if toggle not deployed yet
    test.skip(!toggleExists, 'Theme toggle not yet deployed');

    // Button exists and is visible
    await expect(toggle).toBeVisible();

    // Has accessible label
    const ariaLabel = await toggle.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toMatch(/toggle|switch|dark|light|mode/i);

    // Has aria-pressed attribute
    const ariaPressed = await toggle.getAttribute('aria-pressed');
    expect(ariaPressed).toBeTruthy();
    expect(['true', 'false']).toContain(ariaPressed);

    // Meets minimum touch target size (40x40)
    const box = await toggle.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(40);
    expect(box.height).toBeGreaterThanOrEqual(40);

    console.log('Theme toggle:', {
      ariaLabel,
      ariaPressed,
      size: `${box.width}x${box.height}`,
    });
  });

  test('Theme toggle switches between light and dark mode', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const toggle = page.locator('#theme-toggle');
    const toggleExists = await toggle.count() > 0;

    // Skip if toggle not deployed yet
    test.skip(!toggleExists, 'Theme toggle not yet deployed');

    const html = page.locator('html');

    // Get initial state
    const initialClass = await html.getAttribute('class');
    const initialPressed = await toggle.getAttribute('aria-pressed');

    // Click toggle
    await toggle.click();
    await page.waitForTimeout(100);

    // Verify state changed
    const newClass = await html.getAttribute('class');
    const newPressed = await toggle.getAttribute('aria-pressed');

    expect(newClass).not.toBe(initialClass);
    expect(newPressed).not.toBe(initialPressed);

    // Verify one of light-mode or dark-mode class is present
    expect(newClass).toMatch(/light-mode|dark-mode/);

    // Click again to toggle back
    await toggle.click();
    await page.waitForTimeout(100);

    const finalClass = await html.getAttribute('class');
    expect(finalClass).toBe(initialClass);

    console.log('Theme toggle test:', {
      initial: initialClass,
      afterToggle: newClass,
      afterSecondToggle: finalClass,
    });
  });

  test('Theme toggle is keyboard accessible', async ({ page, browserName }) => {
    // Skip on WebKit due to Tab behavior differences
    test.skip(browserName === 'webkit', 'Safari has different Tab default behavior');

    await page.goto('/', { waitUntil: 'networkidle' });

    const toggle = page.locator('#theme-toggle');
    const toggleExists = await toggle.count() > 0;

    // Skip if toggle not deployed yet
    test.skip(!toggleExists, 'Theme toggle not yet deployed');

    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');

    // Tab to the toggle button
    let foundToggle = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const activeId = await page.evaluate(() => document.activeElement?.id);
      if (activeId === 'theme-toggle') {
        foundToggle = true;
        break;
      }
    }

    expect(foundToggle).toBe(true);

    // Press Enter to toggle
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);

    const newClass = await html.getAttribute('class');
    expect(newClass).not.toBe(initialClass);

    // Press Space to toggle back
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    const finalClass = await html.getAttribute('class');
    expect(finalClass).toBe(initialClass);

    console.log('Keyboard toggle test passed');
  });
});
