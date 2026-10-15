/** Run against `next start` with Chromium installed: pnpm exec playwright install chromium. */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { type Browser, type Locator, type Page, chromium } from 'playwright';

const baseUrl = process.env.STATIC_DOCS_TEST_URL ?? 'http://localhost:3000';
const gethPath = '/how-arbitrum-works/reference/geth';
const nitroPath = '/how-arbitrum-works/inside-arbitrum-nitro';
let browser: Browser;

before(async () => {
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
});

async function open(path: string): Promise<Page> {
  const page = await browser.newPage();
  // The card attaches to the link in an effect, so hovering before hydration finds nothing.
  await page.goto(new URL(path, baseUrl).href, { waitUntil: 'networkidle' });
  return page;
}

function articleLink(page: Page, name: string): Locator {
  return page.locator('article').getByRole('link', { name, exact: true }).first();
}

/** Hover `link` and return the card it describes once the card is visible. */
async function hoverCard(link: Locator): Promise<Locator> {
  await link.hover();
  await link
    .page()
    .waitForFunction(
      (element) => element?.hasAttribute('aria-describedby'),
      await link.elementHandle(),
    );
  const id = await link.getAttribute('aria-describedby');
  assert.ok(id);
  const card = link.page().locator(`[id=${JSON.stringify(id)}]`);
  await card.waitFor({ state: 'visible' });
  return card;
}

test('hovering an internal link shows the target page', async () => {
  const page = await open(gethPath);
  try {
    const card = await hoverCard(articleLink(page, 'Arbitrum Nitro'));
    assert.ok((await card.textContent())?.includes('Inside Arbitrum Nitro'));
  } finally {
    await page.close();
  }
});

test('hovering a hash link shows that section', async () => {
  const page = await open('/arbitrum-essentials/how-to-get-l2block-on-l1');
  try {
    const card = await hoverCard(articleLink(page, 'Inside Arbitrum Nitro'));
    const text = (await card.textContent()) ?? '';
    assert.ok(text.includes('Resolving disputes using interactive fraud proofs'), text);
    assert.ok(text.includes('Among optimistic rollups'), text);
  } finally {
    await page.close();
  }
});

test('a Term inside a link keeps its own popover and gets no card', async () => {
  const page = await open(gethPath);
  try {
    const link = articleLink(page, 'ArbOS');
    await link.hover();
    await page.getByRole('dialog').waitFor({ state: 'visible' });
    await page.waitForTimeout(700);
    assert.equal(await link.getAttribute('aria-describedby'), null);
    const cards = page.locator(
      '[data-floating-ui-portal] div[style]:not([data-hover-popover-panel])',
    );
    assert.equal(await cards.count(), 0);
  } finally {
    await page.close();
  }
});

test('clicking the card opens the previewed page in a new tab', async () => {
  const page = await open(gethPath);
  try {
    const card = await hoverCard(articleLink(page, 'Arbitrum Nitro'));
    const [tab] = await Promise.all([page.context().waitForEvent('page'), card.click()]);
    await tab.waitForLoadState('domcontentloaded');
    assert.ok(new URL(tab.url()).pathname.endsWith(nitroPath), tab.url());
    await tab.close();
  } finally {
    await page.close();
  }
});

test('Escape closes the card', async () => {
  const page = await open(gethPath);
  try {
    const card = await hoverCard(articleLink(page, 'Arbitrum Nitro'));
    await page.keyboard.press('Escape');
    await card.waitFor({ state: 'hidden' });
  } finally {
    await page.close();
  }
});
