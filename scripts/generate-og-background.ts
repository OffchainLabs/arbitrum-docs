/** Run with the docs dev server up. Re-capture after changing the homepage hero background. */
import path from 'node:path';
import { chromium } from 'playwright';

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1240, height: 1000 },
    deviceScaleFactor: 1,
  });
  await page.goto(process.env.DOCS_BASE_URL ?? 'http://localhost:3000');
  const hero = page.locator('[data-home-hero]');
  await hero.locator('img').evaluate((image: HTMLImageElement) => image.decode());
  await hero.evaluate((element: HTMLElement) => {
    Object.assign(element.style, { width: '1200px', height: '630px', borderRadius: '0' });
    // Keep the real gradient, color-dodge texture and SVG. Hide only the copy and buttons.
    const copy = element.lastElementChild as HTMLElement;
    copy.style.visibility = 'hidden';
  });
  const output = path.join(process.cwd(), 'public/img/og-hero-background.jpg');
  await hero.screenshot({ path: output, type: 'jpeg', quality: 95, animations: 'disabled' });
  console.log(`Wrote ${output}`);
} finally {
  await browser.close();
}
