import { chromium } from 'playwright';

const baseURL = 'http://localhost:3333';
const screenshots = [
  { name: 'hero-artifact', scroll: 0, wait: 1000 },
  { name: 'benefits-sticky', selector: '.benefits-section', wait: 500 },
  { name: 'service-01-02', selector: '.service-item1', wait: 500 },
  { name: 'service-03-handover', selector: '.div-block-63', wait: 500 },
  { name: 'measured-oc-ledger', selector: '.oc-section', wait: 500 },
  { name: 'oc-related', selector: '.oc-pair:last-child', wait: 500 },
  { name: 'testimonial-strip', selector: '.testimonial-section', wait: 500 },
  { name: 'cta-footer', selector: '.cta-section', wait: 500 },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  for (const shot of screenshots) {
    if (shot.selector) {
      const el = page.locator(shot.selector).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(shot.wait);
    } else if (shot.scroll !== undefined) {
      await page.evaluate((y) => window.scrollTo(0, y), shot.scroll);
      await page.waitForTimeout(shot.wait);
    }
    await page.screenshot({ path: `/tmp/overnight-verify-${shot.name}.png`, fullPage: false });
    console.log(`Saved: /tmp/overnight-verify-${shot.name}.png`);
  }

  await browser.close();
  console.log('All screenshots done.');
})();
