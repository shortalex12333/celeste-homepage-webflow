import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const screenshots = [
  // Benefits section
  { proto: 'lens-fault.html', marginTop: -56, cropW: 400, cropH: 250, out: 'benefit-1.webp' },
  { proto: 'lens-work-order.html', marginTop: -380, cropW: 400, cropH: 250, out: 'benefit-2.webp' },
  { proto: 'lens-handover.html', marginTop: -1200, cropW: 400, cropH: 250, out: 'benefit-3.webp' },
  { proto: 'lens-fault.html', marginTop: -380, cropW: 400, cropH: 250, out: 'benefit-4.webp' },
  // Services section
  { proto: 'elegant-idle.html', marginTop: -40, cropW: 540, cropH: 460, out: 'service-1.webp' },
  { proto: 'elegant-results.html', marginTop: -90, cropW: 590, cropH: 540, out: 'service-2.webp' },
  { proto: 'handover-export.html', marginTop: 0, cropW: 590, cropH: 540, out: 'service-3.webp' },
  { proto: 'lens-email.html', marginTop: -56, cropW: 590, cropH: 540, out: 'service-4.webp' },
  // OC section
  { proto: 'elegant-results.html', marginTop: -340, cropW: 420, cropH: 720, out: 'oc-ledger.webp' },
  { proto: 'show-related.html', marginTop: -92, cropW: 360, cropH: 920, out: 'oc-related.webp' },
];

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 720, height: 2000 },
    deviceScaleFactor: 2,
  });

  for (const s of screenshots) {
    const page = await context.newPage();
    const url = `file://${path.join(root, 'prototypes', s.proto)}`;
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait a moment for any CSS animations/transitions
    await page.waitForTimeout(500);

    // The iframe crop works by setting the iframe at 720px wide and using
    // negative margin-top to scroll the content. We replicate this by
    // scrolling the page and then clipping.
    const yOffset = Math.abs(s.marginTop);

    const outPath = path.join(root, 'images', s.out);
    await page.screenshot({
      path: outPath,
      type: 'png', // We'll convert to webp after
      clip: {
        x: 0,
        y: yOffset,
        width: s.cropW,
        height: s.cropH,
      },
    });

    console.log(`✓ ${s.out} (${s.cropW}x${s.cropH} from ${s.proto} @y=${yOffset})`);
    await page.close();
  }

  await browser.close();
  console.log('\nDone! All screenshots saved to images/');
}

run().catch(e => { console.error(e); process.exit(1); });
