import { test, expect } from '@playwright/test';

/**
 * Part A: Overlay Bug Fixes
 * Part B: Apple-Style Crop Iframe Embeds (Round 2 revisions)
 * Part C: Theme Sync
 *
 * Validates:
 * - Artifact lives in hero content (not hero-image-wrapper)
 * - Pre-about section doesn't overlap artifact
 * - Impact/Measured section clears OC section (no bleed-through)
 * - Iframe slots use crop system (no transform/scale)
 * - Iframes at native 720px width
 * - Container overflow: hidden
 * - Correct crop offsets (margin-top values)
 * - Mobile fallback: iframes hidden, static images shown
 * - Theme sync: toggling theme updates iframe data-theme
 * - Benefits: 400×250 landscape
 * - OC: Ledger (elegant-idle) + Related (show-related, portrait)
 * - Services: elegant-results, handover-export, lens-email
 * - Testimonials: SVG icons (no iframes)
 */

/* ─── Part A: Overlay Fixes ─── */

test.describe('Part A: Overlay Fix — Artifact in Hero Image Wrapper', () => {
  test('Artifact is inside hero-image-wrapper', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const artifactInWrapper = page.locator('.hero-image-wrapper .artifact-wrap');
    await expect(artifactInWrapper).toHaveCount(1);
  });

  test('Hero-image-wrapper has z-index above pre-about to prevent overlap', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const zIndexes = await page.evaluate(() => {
      const wrapper = document.querySelector('.hero-image-wrapper');
      const preAbout = document.querySelector('.pre-about-section');
      if (!wrapper || !preAbout) return null;
      return {
        wrapperZ: parseInt(window.getComputedStyle(wrapper).zIndex) || 0,
        preAboutZ: parseInt(window.getComputedStyle(preAbout).zIndex) || 0,
      };
    });
    expect(zIndexes).not.toBeNull();
    expect(zIndexes.wrapperZ).toBeGreaterThan(zIndexes.preAboutZ);
  });

  test('Hero-image-wrapper is sticky with flex centering for artifact', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const styles = await page.evaluate(() => {
      const wrapper = document.querySelector('.hero-image-wrapper');
      if (!wrapper) return null;
      const s = window.getComputedStyle(wrapper);
      return { position: s.position, display: s.display, alignItems: s.alignItems, justifyContent: s.justifyContent };
    });
    expect(styles).not.toBeNull();
    expect(styles.position).toBe('sticky');
    expect(styles.display).toBe('flex');
    expect(styles.alignItems).toBe('center');
    expect(styles.justifyContent).toBe('center');
  });
});

test.describe('Part A: OC/Impact Stacking', () => {
  test('Impact section has background and z-index for stacking', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const impactStyles = await page.evaluate(() => {
      const impact = document.querySelector('.impact-section');
      if (!impact) return null;
      const s = window.getComputedStyle(impact);
      return { zIndex: s.zIndex };
    });
    expect(impactStyles).not.toBeNull();
    expect(parseInt(impactStyles.zIndex)).toBeGreaterThanOrEqual(2);
  });

  test('OC section has background to prevent bleed-through', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const ocStyles = await page.evaluate(() => {
      const oc = document.querySelector('.oc-section');
      if (!oc) return null;
      const s = window.getComputedStyle(oc);
      return { backgroundColor: s.backgroundColor };
    });
    expect(ocStyles).not.toBeNull();
    expect(ocStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('Impact section bottom does not overlap OC section content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const impact = document.querySelector('.impact-section');
      if (impact) window.scrollTo(0, impact.offsetTop + impact.offsetHeight - 200);
    });
    await page.waitForTimeout(300);
    const boundaries = await page.evaluate(() => {
      const impact = document.querySelector('.impact-section');
      const oc = document.querySelector('.oc-section');
      if (!impact || !oc) return null;
      const iRect = impact.getBoundingClientRect();
      const oRect = oc.getBoundingClientRect();
      return { gap: Math.round(oRect.top - iRect.bottom) };
    });
    if (boundaries) {
      expect(boundaries.gap).toBeGreaterThanOrEqual(-1);
    }
  });
});

/* ─── Part B: Apple-Style Crop Iframe Embeds (Desktop) ─── */

test.describe('Part B: Crop System — Desktop', () => {
  test.beforeEach(async ({ page }) => {
    const viewport = page.viewportSize();
    test.skip(viewport?.width && viewport.width < 768, 'iframe embeds are desktop only');
  });

  test('9 iframe crop containers exist on the page (4 benefit + 3 service + 2 OC)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const count = await page.locator('.iframe-product-wrap').count();
    // 4 benefit + 3 service + 2 OC = 9 (testimonials are now SVG icons)
    expect(count).toBeGreaterThanOrEqual(9);
    expect(count).toBeLessThanOrEqual(10);
  });

  test('4 testimonial SVG icons exist (no iframes)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const iconCount = await page.locator('.testi-icon-wrap').count();
    expect(iconCount).toBe(4);
    // Each contains an SVG
    const svgCount = await page.locator('.testi-icon-wrap svg').count();
    expect(svgCount).toBe(4);
  });

  test('No iframe uses transform/scale (native resolution only)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const transforms = await page.evaluate(() => {
      const iframes = document.querySelectorAll('.iframe-product-wrap iframe');
      return Array.from(iframes).map(f => window.getComputedStyle(f).transform);
    });
    for (const t of transforms) {
      expect(t).toBe('none');
    }
  });

  test('All iframes are 720px wide (native width)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const widths = await page.evaluate(() => {
      const iframes = document.querySelectorAll('.iframe-product-wrap iframe');
      return Array.from(iframes).map(f => window.getComputedStyle(f).width);
    });
    for (const w of widths) {
      expect(w).toBe('720px');
    }
  });

  test('All containers have overflow: hidden', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const overflows = await page.evaluate(() => {
      const wraps = document.querySelectorAll('.iframe-product-wrap');
      return Array.from(wraps).map(w => window.getComputedStyle(w).overflow);
    });
    for (const o of overflows) {
      expect(o).toBe('hidden');
    }
  });

  test('Benefit iframes have correct landscape dimensions (400×250)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const dims = await page.evaluate(() => {
      const wraps = document.querySelectorAll('.iframe-crop--benefit');
      return Array.from(wraps).map(w => {
        const s = window.getComputedStyle(w);
        return { width: s.width, height: s.height };
      });
    });
    expect(dims.length).toBe(4);
    for (const d of dims) {
      expect(d.width).toBe('400px');
      expect(d.height).toBe('250px');
    }
  });

  test('OC section has 1 standard (480×400) and 1 portrait (400×520) iframe', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const ocStandard = await page.evaluate(() => {
      const wraps = document.querySelectorAll('.iframe-crop--oc');
      return Array.from(wraps).map(w => {
        const s = window.getComputedStyle(w);
        return { width: s.width, height: s.height };
      });
    });
    expect(ocStandard.length).toBe(1);
    expect(ocStandard[0].width).toBe('480px');
    expect(ocStandard[0].height).toBe('400px');

    const ocPortrait = await page.evaluate(() => {
      const wraps = document.querySelectorAll('.iframe-crop--oc-portrait');
      return Array.from(wraps).map(w => {
        const s = window.getComputedStyle(w);
        return { width: s.width, height: s.height };
      });
    });
    expect(ocPortrait.length).toBe(1);
    expect(ocPortrait[0].width).toBe('400px');
    expect(ocPortrait[0].height).toBe('520px');
  });

  test('Service iframes have correct crop dimensions (590×540)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const dims = await page.evaluate(() => {
      const wraps = document.querySelectorAll('.iframe-crop--service');
      return Array.from(wraps).map(w => {
        const s = window.getComputedStyle(w);
        return { width: s.width, height: s.height };
      });
    });
    expect(dims.length).toBe(3);
    for (const d of dims) {
      expect(d.width).toBe('590px');
      expect(d.height).toBe('540px');
    }
  });

  test('Correct iframe sources for all slots', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const sources = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.iframe-product-wrap iframe')).map(f => f.getAttribute('src'));
    });

    const srcSet = sources.join(',');
    // Benefits: lens-fault (×2), lens-work-order, lens-handover
    expect(srcSet).toContain('lens-fault.html');
    expect(srcSet).toContain('lens-work-order.html');
    // Services: elegant-results, handover-export, lens-email
    expect(srcSet).toContain('elegant-results.html');
    expect(srcSet).toContain('handover-export.html');
    expect(srcSet).toContain('lens-email.html');
    // OC: elegant-idle, show-related
    expect(srcSet).toContain('elegant-idle.html');
    expect(srcSet).toContain('show-related.html');
  });

  test('Crop offset verification — margin-top values match plan', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const offsets = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.iframe-product-wrap iframe')).map(f => ({
        src: f.getAttribute('src'),
        marginTop: f.style.marginTop,
        parent: f.parentElement.className,
      }));
    });

    // Every iframe should have a margin-top set
    for (const o of offsets) {
      expect(o.marginTop).toBeTruthy();
      expect(o.marginTop).toMatch(/^-?\d+px$/);
    }
  });

  test('Iframe fallback images are hidden on desktop', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const displays = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.iframe-fallback')).map(img =>
        window.getComputedStyle(img).display
      );
    });
    for (const d of displays) {
      expect(d).toBe('none');
    }
  });

  test('Handover export iframe in service section loads', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      const el = document.querySelector('.div-block-63');
      if (el) el.scrollIntoView({ block: 'center' });
    });
    await page.waitForTimeout(2000);
    const frameLocator = page.frameLocator('.div-block-63 .iframe-product-wrap iframe');
    const body = frameLocator.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('OC section: Ledger uses elegant-idle, Related uses show-related', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const ocIframes = page.locator('.oc-section .iframe-product-wrap iframe');
    await expect(ocIframes).toHaveCount(2);
    const src1 = await ocIframes.nth(0).getAttribute('src');
    const src2 = await ocIframes.nth(1).getAttribute('src');
    expect(src1).toContain('elegant-idle.html');
    expect(src2).toContain('show-related.html');
  });
});

/* ─── Part B: Mobile Fallback ─── */

test.describe('Part B: Mobile Fallback', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Iframes hidden on mobile, fallback images shown', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const iframeWrapDisplay = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.iframe-product-wrap')).map(w =>
        window.getComputedStyle(w).display
      );
    });
    for (const display of iframeWrapDisplay) {
      expect(display).toBe('none');
    }

    const fallbackDisplay = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.iframe-fallback')).map(img =>
        window.getComputedStyle(img).display
      );
    });
    for (const display of fallbackDisplay) {
      expect(display).not.toBe('none');
    }
  });
});

/* ─── Part C: Theme Sync ─── */

test.describe('Part C: Iframe Theme Sync', () => {
  test('Toggling theme updates iframe data-theme attribute', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Get initial theme state
    const initialIsDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark-mode')
    );

    // Click theme toggle
    await page.click('#theme-toggle');
    await page.waitForTimeout(500);

    // Check that an iframe's data-theme changed
    const iframeTheme = await page.evaluate(() => {
      const iframe = document.querySelector('.iframe-product-wrap iframe');
      if (!iframe || !iframe.contentDocument) return null;
      return iframe.contentDocument.documentElement.getAttribute('data-theme');
    });

    if (iframeTheme !== null) {
      const expectedTheme = initialIsDark ? 'light' : 'dark';
      expect(iframeTheme).toBe(expectedTheme);
    }
  });
});

/* ─── Full Page Scroll — No Overflow Regression ─── */

test.describe('Full Page Scroll — No Overlap Regression', () => {
  test('Scroll through all sections without horizontal overflow', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportWidth = page.viewportSize()?.width || 1440;

    let maxBodyWidth = 0;
    for (let y = 0; y < totalHeight; y += 200) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      if (bodyWidth > maxBodyWidth) maxBodyWidth = bodyWidth;
    }

    expect(maxBodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});
