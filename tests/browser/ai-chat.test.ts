/**
 * Run against `next start`. The test process must see the same NEXT_PUBLIC_AI_CHAT_ENABLED and
 * NEXT_PUBLIC_INKEEP_API_KEY as the build: tests that need a setting the build lacks skip, and
 * say why. CI builds with neither, so it runs only the flag-off test. Next reads `.env` for the
 * build but `node --test` does not, so export the variables when running this file locally.
 */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { type Browser, type Locator, type Page, chromium } from 'playwright';

const baseUrl = process.env.STATIC_DOCS_TEST_URL ?? 'http://localhost:3000';
const page = '/get-started/arbitrum-introduction';
let browser: Browser;

const chatEnabled = process.env.NEXT_PUBLIC_AI_CHAT_ENABLED === 'true';
const searchEnabled = Boolean(process.env.NEXT_PUBLIC_INKEEP_API_KEY);
const panel = { skip: chatEnabled ? false : 'needs a build with NEXT_PUBLIC_AI_CHAT_ENABLED=true' };
const handOff = {
  skip:
    chatEnabled && searchEnabled
      ? false
      : 'needs a build with NEXT_PUBLIC_AI_CHAT_ENABLED=true and NEXT_PUBLIC_INKEEP_API_KEY',
};

/** Opens the cxkit search dialog, types the query, and returns the dialog's host element. */
async function openSearch(p: Page, query?: string): Promise<Locator> {
  await p.keyboard.press('Meta+k');
  const dialog = p.locator('[id^="inkeep-shadow"]');
  const input = dialog.getByPlaceholder('Search documentation...');
  await input.waitFor();
  if (query) await input.fill(query);
  return dialog;
}

/** The "Ask AI" half of the view toggle in cxkit's search input row. */
function askAIToggle(dialog: Locator): Locator {
  return dialog
    .locator('[data-part="ai-search-input-group"] [data-part="view_toggle"]')
    .getByRole('button', { name: 'Ask AI', exact: true });
}

before(async () => {
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
});

test(
  'flag off: no Ask AI control and no chat request',
  { skip: chatEnabled ? 'runs only on a build without NEXT_PUBLIC_AI_CHAT_ENABLED' : false },
  async () => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const p = await browser.newPage({ viewport });
      let chatRequests = 0;
      p.on('request', (r) => {
        if (new URL(r.url()).pathname === '/api/chat') chatRequests += 1;
      });
      await p.goto(baseUrl + page, { waitUntil: 'load' });
      assert.equal(await p.getByRole('button', { name: 'Ask AI' }).count(), 0);
      assert.equal(chatRequests, 0);
      await p.close();
    }
  },
);

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`trigger opens and Escape closes the panel at ${viewport.width}px`, panel, async () => {
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

test('mobile: no floating pill, navbar icon opens the panel', panel, async () => {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(baseUrl + page);
  const pill = p.locator('button', { hasText: 'Ask AI' });
  assert.equal(await pill.isVisible(), false, 'floating pill hidden below md');
  await p.getByRole('button', { name: 'Ask AI' }).filter({ visible: true }).click();
  await p.getByRole('textbox').waitFor();
  await p.close();
});

test('desktop: no navbar AI icon', panel, async () => {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(baseUrl + page);
  assert.equal(await p.locator('header button[aria-label="Ask AI"]').isVisible(), false);
  await p.close();
});

test('search Ask AI opens the panel and sends the query once', handOff, async () => {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const posts: string[] = [];
  await p.route('**/api/chat', async (route) => {
    posts.push(route.request().postData() ?? '');
    await route.fulfill({ status: 503, body: '{"error":"stub"}' });
  });
  await p.goto(baseUrl + page);
  const dialog = await openSearch(p, 'how do fees work');
  await askAIToggle(dialog).click();
  await p.getByText('how do fees work').last().waitFor();
  await dialog.waitFor({ state: 'hidden' });
  await p.getByText('The AI assistant is not available.').waitFor();
  await p.waitForTimeout(1500);
  assert.equal(posts.length, 1);
  assert.match(posts[0] ?? '', /how do fees work/);
  await p.close();
});

test('search Ask AI with no query opens the panel and sends nothing', handOff, async () => {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  let posts = 0;
  await p.route('**/api/chat', (route) => {
    posts += 1;
    return route.fulfill({ status: 503, body: '{}' });
  });
  await p.goto(baseUrl + page);
  const dialog = await openSearch(p);
  await askAIToggle(dialog).click();
  await p.getByRole('textbox').last().waitFor();
  await p.getByRole('button', { name: 'What is Arbitrum Stylus?' }).waitFor();
  assert.equal(posts, 0);
  await p.close();
});

test('search opens in search view after an Ask AI hand-off', handOff, async () => {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.route('**/api/chat', (route) => route.fulfill({ status: 503, body: '{}' }));
  await p.goto(baseUrl + page);
  const dialog = await openSearch(p, 'how do fees work');
  await askAIToggle(dialog).click();
  await dialog.waitFor({ state: 'hidden' });
  await openSearch(p);
  assert.equal(await dialog.getByPlaceholder('Search documentation...').isVisible(), true);
  assert.equal(await dialog.locator('[data-part="ai-chat-root"]').isVisible(), false);
  await p.close();
});

test('search Ask AI hand-off sends nothing to Inkeep chat', handOff, async () => {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const chatRequests: string[] = [];
  await p.route('**/api.inkeep.com/**', (route) => {
    const url = route.request().url();
    if (!url.includes('chat')) return route.continue();
    chatRequests.push(url);
    return route.abort();
  });
  await p.route('**/api/chat', (route) => route.fulfill({ status: 503, body: '{}' }));
  await p.goto(baseUrl + page);
  const dialog = await openSearch(p, 'how do fees work');
  assert.equal(await dialog.getByText('Start conversation').count(), 0, 'no Ask AI card');
  await askAIToggle(dialog).click();
  await p.getByText('how do fees work').last().waitFor();
  await p.waitForTimeout(1500);
  assert.deepEqual(chatRequests, []);
  await p.close();
});
