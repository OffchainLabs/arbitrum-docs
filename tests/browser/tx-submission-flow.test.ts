/** Run against `next start` with Chromium installed: pnpm exec playwright install chromium. */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { type Browser, type BrowserContextOptions, type Page, chromium } from 'playwright';

import { transactionSubmission } from '../../components/widgets/FlowDiagram/flows.generated.ts';
import { type ResolvedPath, flowPaths } from '../../components/widgets/FlowDiagram/model.ts';
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

const DETAIL_INDEX = DIRECT.steps.findIndex((step) => step.detail);
const DETAIL_STEPS = DIRECT.steps[DETAIL_INDEX]?.detail?.flow.steps.length ?? 0;
// The PGA round view covers ordering and execution, so its last Next skips to Fast Feed.
const LANDING_INDEX = DIRECT.steps.findIndex((step) => step.id === 'fast-feed');

/** Opens the detail dialog of the direct path and returns it. */
async function openDetail(page: Page) {
  await page.getByRole('button', { name: /^Look inside the / }).click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  return dialog;
}

/** True when focus is on the Next button of the widget's own step bar. */
async function focusIsOnNext(page: Page): Promise<boolean> {
  return page.evaluate(
    (canvasSelector) =>
      document.activeElement ===
      document.querySelector(canvasSelector)!.querySelector('nav [data-step-next]'),
    CANVAS,
  );
}

test('the last detail step has an active Next that closes the dialog on Fast Feed', async () => {
  assert.equal(DIRECT.steps[DETAIL_INDEX]!.detail!.next, 'fast-feed');
  assert.ok(LANDING_INDEX > DETAIL_INDEX + 1);
  assert.ok(DETAIL_STEPS > 1);
  await withFlow(WIDE, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    const dialog = await openDetail(page);
    const next = dialog.getByRole('button', { name: 'Next →' });
    for (let index = 1; index < DETAIL_STEPS; index++) await next.click();
    assert.match((await dialog.textContent()) ?? '', new RegExp(`Step ${DETAIL_STEPS} of`));
    assert.notEqual(await next.getAttribute('aria-disabled'), 'true');
    await next.click();
    await dialog.waitFor({ state: 'detached' });
    await waitForStep(page, DIRECT, LANDING_INDEX);
    assert.ok(await focusIsOnNext(page), 'focus is not on the step bar Next');
  });
});

test('ArrowRight in the detail dialog steps the dialog, then closes it on Fast Feed', async () => {
  await withFlow(WIDE, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    const dialog = await openDetail(page);
    for (let index = 1; index < DETAIL_STEPS; index++) {
      await page.keyboard.press('ArrowRight');
      assert.match((await dialog.textContent()) ?? '', new RegExp(`Step ${index + 1} of`));
      assert.equal(new URL(page.url()).hash, `#direct-step-${DETAIL_INDEX + 1}`);
    }
    await page.keyboard.press('ArrowRight');
    await dialog.waitFor({ state: 'detached' });
    await waitForStep(page, DIRECT, LANDING_INDEX);
    assert.ok(await focusIsOnNext(page), 'focus is not on the step bar Next');
  });
});

/** True when keyboard focus is inside the detail dialog. */
const focusInDialog = (page: Page) =>
  page.evaluate(
    () => !!document.querySelector('[role="dialog"]')?.contains(document.activeElement),
  );

test('Tab and Shift+Tab keep focus inside the detail dialog', async () => {
  await withFlow(WIDE, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    await openDetail(page);
    for (const key of ['Tab', 'Shift+Tab']) {
      for (let press = 0; press < 12; press++) {
        await page.keyboard.press(key);
        assert.ok(await focusInDialog(page), `focus left the dialog after ${press + 1} ${key}`);
      }
    }
  });
});

test('the page behind the detail dialog is hidden from assistive technology', async () => {
  await withFlow(WIDE, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    const dialog = await openDetail(page);
    const nextButtons = page.getByRole('button', { name: 'Next →' });
    assert.equal(await nextButtons.count(), 1);
    assert.equal(await dialog.getByRole('button', { name: 'Next →' }).count(), 1);
  });
});

test('Escape closes the detail dialog and returns focus to its opener', async () => {
  await withFlow(WIDE, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    const dialog = await openDetail(page);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    const opener = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    assert.match(opener ?? '', /^Look inside the /);
  });
});

test('a click on the backdrop closes the detail dialog', async () => {
  await withFlow(WIDE, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    const dialog = await openDetail(page);
    await page.mouse.click(5, 5);
    await dialog.waitFor({ state: 'detached' });
  });
});

const MOTION: BrowserContextOptions = { ...WIDE, reducedMotion: 'no-preference' };

/**
 * Clicks `button`, waits two frames, and reports the dialog layer's opacity, whether the layer is
 * still in the page, and the hash. Then waits 900ms and reports the same again.
 */
function clickAndSample(page: Page, buttonName: string, inDialog: boolean) {
  return page.evaluate(
    async ({ buttonName, inDialog }) => {
      const scope: ParentNode = inDialog ? document.querySelector('[role="dialog"]')! : document;
      const button = [...scope.querySelectorAll<HTMLElement>('[role="button"], button')].find(
        (element) =>
          (element.getAttribute('aria-label') ?? element.textContent)?.startsWith(buttonName),
      )!;
      const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
      const sample = () => {
        const layer = document.querySelector('[role="dialog"]')?.parentElement;
        return {
          attached: layer !== undefined && layer !== null,
          opacity: layer ? Number(getComputedStyle(layer).opacity) : null,
          hash: window.location.hash,
        };
      };
      button.click();
      await frame();
      await frame();
      const early = sample();
      await new Promise((resolve) => setTimeout(resolve, 900));
      return { early, late: sample() };
    },
    { buttonName, inDialog },
  );
}

test('the detail dialog fades in, and fades out on Close', async () => {
  await withFlow(MOTION, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    const opened = await clickAndSample(page, 'Look inside the ', false);
    assert.ok(opened.early.attached);
    assert.ok(opened.early.opacity! < 1, `opacity ${opened.early.opacity} right after opening`);
    assert.equal(opened.late.opacity, 1);
    const closed = await clickAndSample(page, 'Close', true);
    assert.ok(closed.early.attached, 'the dialog left before fading out');
    assert.ok(closed.early.opacity! < 1, `opacity ${closed.early.opacity} right after Close`);
    assert.equal(closed.late.attached, false);
  });
});

test('the last detail Next moves the parent while the dialog fades out', async () => {
  await withFlow(MOTION, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    const dialog = await openDetail(page);
    const next = dialog.getByRole('button', { name: 'Next →' });
    for (let index = 1; index < DETAIL_STEPS; index++) await next.click();
    const finished = await clickAndSample(page, 'Next →', true);
    assert.ok(finished.early.attached, 'the dialog left before fading out');
    assert.ok(finished.early.opacity! < 1);
    assert.equal(finished.early.hash, `#direct-step-${LANDING_INDEX + 1}`);
    assert.equal(finished.late.attached, false);
  });
});

const SEQUENCER_PAGE = '/how-arbitrum-works/deep-dives/sequencer';
const previewCard = (page: Page) => page.locator('a[target="_blank"]', { hasText: 'Preview' });
const node = (page: Page, id: string) => page.locator(`.react-flow__node-actor[data-id="${id}"]`);

test('resting the pointer on the Sequencer previews the Sequencer page', async () => {
  await withFlow(WIDE, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    await node(page, 'seq').hover();
    await previewCard(page).waitFor();
    assert.equal(await previewCard(page).getAttribute('href'), SEQUENCER_PAGE);
    assert.match((await previewCard(page).textContent()) ?? '', /Sequencer/);
  });
});

test('a click on a previewed node still opens its detail dialog', async () => {
  await withFlow(WIDE, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    await node(page, 'seq').hover();
    await previewCard(page).waitFor();
    await node(page, 'seq').click();
    await page.getByRole('dialog').waitFor();
  });
});

test('a node whose part has no docs shows no preview', async () => {
  await withFlow(WIDE, `#direct-step-${LANDING_INDEX + 1}`, async (page) => {
    const fastFeed = transactionSubmission.actors.find((actor) => actor.id === 'fastfeed')!;
    assert.equal(fastFeed.docs, undefined);
    // The node takes no pointer events, so hover() refuses it: move the mouse to its centre.
    const box = (await node(page, 'fastfeed').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(1000);
    assert.equal(await previewCard(page).count(), 0);
  });
});
