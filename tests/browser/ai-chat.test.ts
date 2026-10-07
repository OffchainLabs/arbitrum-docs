/** Run against `next start` built with NEXT_PUBLIC_AI_CHAT_ENABLED=true. */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { type Browser, type Locator, type Page, chromium } from 'playwright';

const baseUrl = process.env.STATIC_DOCS_TEST_URL ?? 'http://localhost:3000';
const page = '/get-started/arbitrum-introduction';
let browser: Browser;

/** Opens the cxkit search dialog, types the query, and returns the dialog's host element. */
async function openSearch(p: Page, query?: string): Promise<Locator> {
  await p.keyboard.press('Meta+k');
  const dialog = p.locator('[id^="inkeep-shadow"]');
  const input = dialog.getByPlaceholder('Search documentation...');
  await input.waitFor();
  if (query) await input.fill(query);
  return dialog;
}

before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`trigger opens and Escape closes the panel at ${viewport.width}px`, async () => {
    const p = await browser.newPage({ viewport });
    const errors: string[] = [];
    p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await p.goto(baseUrl + page);
    // One visible Ask AI control per width: the pill on desktop, the navbar icon on mobile.
    await p.getByRole('button', { name: 'Ask AI' }).filter({ visible: true }).click();
    const input = p.getByRole('textbox');
    await input.waitFor();
    await p.keyboard.press('Escape');
    await input.waitFor({ state: 'hidden' });
    await p.mouse.wheel(0, 800);
    // The wheel scroll is smoothed, so wait for it to start.
    await p.waitForFunction(() => window.scrollY > 0, undefined, { timeout: 3000 });
    assert.deepEqual(
      errors.filter((e) => /ai|chat/i.test(e)),
      [],
    );
    await p.close();
  });
}

test('mobile: no floating pill, navbar icon opens the panel', async () => {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(baseUrl + page);
  const pill = p.locator('button', { hasText: 'Ask AI' });
  assert.equal(await pill.isVisible(), false, 'floating pill hidden below md');
  await p.getByRole('button', { name: 'Ask AI' }).filter({ visible: true }).click();
  await p.getByRole('textbox').waitFor();
  await p.close();
});

test('desktop: no navbar AI icon', async () => {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(baseUrl + page);
  assert.equal(await p.locator('header button[aria-label="Ask AI"]').isVisible(), false);
  await p.close();
});

test('search Ask AI opens the panel and sends the query once', async () => {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const posts: string[] = [];
  await p.route('**/api/chat', async (route) => {
    posts.push(route.request().postData() ?? '');
    await route.fulfill({ status: 503, body: '{"error":"stub"}' });
  });
  await p.goto(baseUrl + page);
  const dialog = await openSearch(p, 'how do fees work');
  await dialog.getByText('Ask AI').first().click();
  await p.getByText('how do fees work').last().waitFor();
  await dialog.waitFor({ state: 'hidden' });
  await p.waitForTimeout(1500);
  assert.equal(posts.length, 1);
  assert.match(posts[0] ?? '', /how do fees work/);
  await p.close();
});

test('search Ask AI with no query opens the panel and sends nothing', async () => {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  let posts = 0;
  await p.route('**/api/chat', (route) => {
    posts += 1;
    return route.fulfill({ status: 503, body: '{}' });
  });
  await p.goto(baseUrl + page);
  const dialog = await openSearch(p);
  await dialog.getByText('Ask AI').first().click();
  await p.getByRole('textbox').last().waitFor();
  assert.equal(posts, 0);
  await p.close();
});
