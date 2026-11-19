/** Run against `next start` with Chromium installed: pnpm exec playwright install chromium. */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { type Browser, type BrowserContextOptions, type Page, chromium } from 'playwright';

import { transactionSubmission } from '../../components/widgets/NitroTxFlow/flows.generated.ts';
import { type ResolvedPath, flowPaths } from '../../components/widgets/NitroTxFlow/model.ts';
import { CANVAS, cardTitle, openFlow, settle } from './flow-page.ts';

const PAGE_PATH = '/how-arbitrum-works/deep-dives/transaction-submission-flow';
const PATHS = flowPaths(transactionSubmission);
const [DIRECT, RETRYABLE] = PATHS as [ResolvedPath, ResolvedPath];
const WIDE: BrowserContextOptions = { viewport: { width: 1280, height: 800 } };
const TABLET: BrowserContextOptions = { viewport: { width: 768, height: 1024 } };
// Phone emulation: overlay scrollbars, so the page is 375px wide, and touch input.
const PHONE: BrowserContextOptions = {
  viewport: { width: 375, height: 812 },
  isMobile: true,
  hasTouch: true,
};
let browser: Browser;

before(async () => {
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
});

function withFlow(
  options: BrowserContextOptions,
  hash: string,
  run: (page: Page) => Promise<void>,
) {
  const flowPage = { path: PAGE_PATH, actorCount: transactionSubmission.actors.length };
  return openFlow(browser, flowPage, options, hash, run);
}

/** Waits until the card and the hash show step `index` (0-based) of `path`, then settles. */
async function waitForStep(page: Page, path: ResolvedPath, index: number) {
  await page.waitForFunction(
    ({ canvasSelector, title, hash }) =>
      document.querySelector(canvasSelector)?.parentElement?.querySelector('h3')?.textContent ===
        title && window.location.hash === hash,
    {
      canvasSelector: CANVAS,
      title: path.steps[index]!.title,
      hash: `#${path.id}-step-${index + 1}`,
    },
  );
  await settle(page);
}

function tab(page: Page, path: ResolvedPath) {
  return page.getByRole('tab', { name: path.label, exact: true });
}

test('tab 1 is selected on load and the bar shows 9 steps', async () => {
  await withFlow(WIDE, '', async (page) => {
    assert.equal(DIRECT.steps.length, 9);
    assert.equal(await tab(page, DIRECT).getAttribute('aria-selected'), 'true');
    assert.equal(await tab(page, RETRYABLE).getAttribute('aria-selected'), 'false');
    assert.equal(await cardTitle(page), DIRECT.steps[0]!.title);
    await page.getByRole('button', { name: 'Next →' }).click();
    await waitForStep(page, DIRECT, 1);
    const bar = page.locator('nav[aria-label="Transaction steps"]');
    assert.match((await bar.textContent()) ?? '', /Step 2 of 9/);
  });
});

test('selecting tab 2 resets to its step 1 and writes #retryable-step-1', async () => {
  await withFlow(WIDE, '#direct-step-3', async (page) => {
    assert.equal(await cardTitle(page), DIRECT.steps[2]!.title);
    await tab(page, RETRYABLE).click();
    await waitForStep(page, RETRYABLE, 0);
    assert.equal(new URL(page.url()).hash, '#retryable-step-1');
    assert.equal(await tab(page, RETRYABLE).getAttribute('aria-selected'), 'true');
  });
});

test('#retryable-step-5 opens the auto-redeem step on tab 2', async () => {
  await withFlow(WIDE, '#retryable-step-5', async (page) => {
    assert.equal(RETRYABLE.steps[4]!.id, 'auto-redeem');
    assert.equal(await cardTitle(page), RETRYABLE.steps[4]!.title);
    assert.equal(await tab(page, RETRYABLE).getAttribute('aria-selected'), 'true');
  });
});

test('node boxes are the same on both tabs at 1280×800', async () => {
  await withFlow(WIDE, '', async (page) => {
    const boxes = () =>
      page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.react-flow__node-actor')].map((node) => ({
          id: node.getAttribute('data-id'),
          transform: node.style.transform,
          width: node.offsetWidth,
          height: node.offsetHeight,
        })),
      );
    const onTab1 = await boxes();
    assert.equal(onTab1.length, transactionSubmission.actors.length);
    await tab(page, RETRYABLE).click();
    await waitForStep(page, RETRYABLE, 0);
    assert.deepEqual(await boxes(), onTab1);
  });
});

test('ArrowRight on a focused tab moves tab focus and does not change the step', async () => {
  await withFlow(WIDE, '', async (page) => {
    await tab(page, DIRECT).focus();
    await page.keyboard.press('ArrowRight');
    await waitForStep(page, RETRYABLE, 0);
    const focused = await page.evaluate(() => document.activeElement?.textContent);
    assert.equal(focused, RETRYABLE.label);
    assert.equal(await cardTitle(page), RETRYABLE.steps[0]!.title);
    assert.equal(new URL(page.url()).hash, '#retryable-step-1');
  });
});

test('the settlement badge links to /glossary#settlement', async () => {
  await withFlow(WIDE, '#direct-step-9', async (page) => {
    const badge = page.getByRole('link', { name: 'Settlement', exact: true });
    assert.equal(await badge.getAttribute('href'), '/glossary#settlement');
  });
});

test('the card shows "Show details" and no Flag row', async () => {
  await withFlow(WIDE, '', async (page) => {
    assert.equal(await page.getByLabel('Show operator details').count(), 0);
    await page.getByLabel('Show details', { exact: true }).check();
    await page.getByText('Impact on the transaction', { exact: true }).waitFor();
    assert.ok(await page.getByText('What you see', { exact: true }).isVisible());
    assert.ok(await page.getByText('What to do', { exact: true }).isVisible());
    assert.equal(await page.locator('dt', { hasText: /^Flag$/ }).count(), 0);
  });
});

test('no horizontal scroll at 375px', async () => {
  for (const path of PATHS) {
    await withFlow(PHONE, `#${path.id}-step-1`, async (page) => {
      for (let index = 0; index < path.steps.length; index++) {
        if (index > 0) {
          await page.getByRole('button', { name: 'Next →' }).click();
          await waitForStep(page, path, index);
        }
        const sizes = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        assert.equal(sizes.scrollWidth, sizes.clientWidth, `${path.id} step ${index + 1}`);
      }
    });
  }
});

test('at 768×1024 every active node is inside the canvas on every step of both tabs', async () => {
  for (const path of PATHS) {
    await withFlow(TABLET, `#${path.id}-step-1`, async (page) => {
      for (let index = 0; index < path.steps.length; index++) {
        if (index > 0) {
          await page.getByRole('button', { name: 'Next →' }).click();
          await waitForStep(page, path, index);
        }
        const actors = path.steps[index]!.actors;
        const outside = await page.evaluate(
          ({ canvasSelector, actors }) => {
            const canvas = document.querySelector(canvasSelector)!.getBoundingClientRect();
            return actors.filter((id) => {
              const node = document.querySelector(`.react-flow__node-actor[data-id="${id}"]`);
              const box = node!.getBoundingClientRect();
              return (
                box.left < canvas.left - 0.5 ||
                box.right > canvas.right + 0.5 ||
                box.top < canvas.top - 0.5 ||
                box.bottom > canvas.bottom + 0.5
              );
            });
          },
          { canvasSelector: CANVAS, actors },
        );
        assert.deepEqual(outside, [], `${path.id} step ${index + 1}`);
      }
    });
  }
});
