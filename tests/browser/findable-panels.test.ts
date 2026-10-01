/** Run against `next start` with Chromium installed: pnpm exec playwright install chromium. */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { type Browser, type Locator, chromium } from 'playwright';

const baseUrl = process.env.STATIC_DOCS_TEST_URL ?? 'http://localhost:3000';
let browser: Browser;

before(async () => {
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
});

async function panelFor(trigger: Locator): Promise<Locator> {
  const id = await trigger.getAttribute('id');
  assert.ok(id);
  // Hidden accessible names can change, and closed accordions omit aria-controls.
  return trigger.page().locator(`[aria-labelledby=${JSON.stringify(id)}]`);
}

async function reveal(panel: Locator) {
  // Simulate Find's beforematch event and subsequent removal of hidden="until-found".
  // Dispatch on the panel itself even when it is not visible.
  await panel.evaluate((element) => {
    element.dispatchEvent(new Event('beforematch', { bubbles: true }));
    element.removeAttribute('hidden');
  });
}

async function assertVisiblePanel(panel: Locator, state: string) {
  const id = await panel.getAttribute('id');
  assert.ok(id);
  await panel
    .page()
    .waitForFunction(
      ({ id, state }) => document.getElementById(id)?.getAttribute('data-state') === state,
      { id, state },
    );
  // Radix changes state before the accordion's opening animation gives it height.
  await panel.waitFor({ state: 'visible' });
  await panel.locator('p').first().waitFor({ state: 'visible' });
  assert.equal(await panel.getAttribute('hidden'), null);
  assert.ok(await panel.isVisible());
  const rendered = await panel.evaluate((element) => ({
    height: element.getBoundingClientRect().height,
    contentVisibility: getComputedStyle(element).contentVisibility,
    textHeight: element.querySelector('p')?.getBoundingClientRect().height ?? 0,
  }));
  assert.ok(rendered.height > 0, 'revealed panel has height');
  assert.ok(rendered.textHeight > 0, 'matched content is laid out');
  assert.notEqual(rendered.contentVisibility, 'hidden');
}

test('beforematch selects the matched tab and preserves manual selection', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(new URL('/docs/run-a-node/start-here', baseUrl).href);
    const firstTab = page.getByRole('tab', { name: 'Arbitrum One, Nova, Sepolia', exact: true });
    const matchedTab = page.getByRole('tab', { name: 'Arbitrum chains', exact: true });
    const firstPanel = await panelFor(firstTab);
    const matchedPanel = await panelFor(matchedTab);
    await page.waitForFunction(
      () =>
        document
          .querySelector('[role="tabpanel"][data-state="inactive"]')
          ?.getAttribute('hidden') === 'until-found',
    );
    assert.equal(await matchedTab.getAttribute('aria-selected'), 'false');
    assert.equal(await matchedPanel.getAttribute('hidden'), 'until-found');
    await reveal(matchedPanel);
    await assertVisiblePanel(matchedPanel, 'active');
    assert.equal(await matchedTab.getAttribute('aria-selected'), 'true');
    assert.equal(await firstTab.getAttribute('aria-selected'), 'false');
    assert.equal(await firstPanel.getAttribute('hidden'), 'until-found');

    await firstTab.click();
    await assertVisiblePanel(firstPanel, 'active');
    assert.equal(await matchedPanel.getAttribute('hidden'), 'until-found');
    await firstTab.press('ArrowRight');
    await assertVisiblePanel(matchedPanel, 'active');
    assert.equal(await matchedTab.getAttribute('aria-selected'), 'true');
  } finally {
    await page.close();
  }
});

test('beforematch opens an accordion and manual closing still works', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(new URL('/docs/stylus/quickstart', baseUrl).href);
    const trigger = page.getByRole('button', { name: 'Rust toolchain', exact: true });
    const panel = await panelFor(trigger);
    await page.waitForFunction(
      () =>
        document.querySelector('[role="region"][data-state="closed"]')?.getAttribute('hidden') ===
        'until-found',
    );
    assert.equal(await panel.getAttribute('hidden'), 'until-found');
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
    await reveal(panel);
    await assertVisiblePanel(panel, 'open');
    assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
    // A repeated event on an already-open panel must not toggle it closed.
    await reveal(panel);
    await assertVisiblePanel(panel, 'open');
    await trigger.click();
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(await panel.getAttribute('hidden'), 'until-found');
  } finally {
    await page.close();
  }
});
