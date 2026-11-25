/** Run against `next start` with Chromium installed: pnpm exec playwright install chromium. */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { type Browser, type BrowserContextOptions, type Page, chromium } from 'playwright';

import { PHONE_MIN_ZOOM } from '../../components/widgets/FlowDiagram/camera.ts';
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
  // A tab draws only the parts its steps use; a hash without a tab opens the first tab.
  const path = hash.startsWith(`#${RETRYABLE.id}-`) ? RETRYABLE : DIRECT;
  const flowPage = { path: PAGE_PATH, actorCount: pathActors(path).size };
  return openFlow(browser, flowPage, options, hash, run);
}

function pathActors(path: ResolvedPath): Set<string> {
  return new Set(path.steps.flatMap((step) => step.actors));
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

test('each tab shows only the parts its steps use', async () => {
  await withFlow(WIDE, '', async (page) => {
    const ids = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('.react-flow__node-actor')]
          .map((node) => node.getAttribute('data-id')!)
          .sort(),
      );
    assert.deepEqual(await ids(), [...pathActors(DIRECT)].sort());
    await tab(page, RETRYABLE).click();
    await waitForStep(page, RETRYABLE, 0);
    assert.deepEqual(await ids(), [...pathActors(RETRYABLE)].sort());
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

test('the finality track links each level, and marks the level a step reaches', async () => {
  const track = (page: Page) => page.getByRole('list', { name: 'Finality' });
  await withFlow(WIDE, '#direct-step-1', async (page) => {
    assert.equal(await track(page).getByText('(reached)').count(), 0, 'nothing reached on step 1');
    const settlement = track(page).getByRole('link', { name: /^Settlement/ });
    assert.equal(await settlement.getAttribute('href'), '/glossary#settlement');
  });
  await withFlow(WIDE, '#direct-step-9', async (page) => {
    assert.equal(await track(page).getByText('(reached)').count(), 3);
    const current = track(page).locator('[aria-current="step"]');
    assert.match((await current.textContent()) ?? '', /Settlement/);
  });
  await withFlow(WIDE, '#direct-step-6', async (page) => {
    // Step 6 reaches no new level: soft confirmation still holds, and none is current.
    assert.equal(await track(page).getByText('(reached)').count(), 1);
    assert.equal(await track(page).locator('[aria-current="step"]').count(), 0);
  });
});

test('a step that lights no edge shows its number on its node', async () => {
  await withFlow(WIDE, '#direct-step-2', async (page) => {
    assert.equal(DIRECT.steps[1]!.edges.length, 0);
    const seq = page.locator('.react-flow__node-actor[data-id="seq"]');
    assert.equal(await seq.locator('span', { hasText: /^2$/ }).count(), 1);
    assert.ok(await seq.getByText('Look inside ›').isVisible(), 'the detail chip shows');
  });
  await withFlow(WIDE, '#direct-step-1', async (page) => {
    assert.equal(await page.locator('.react-flow__node-actor span', { hasText: /^1$/ }).count(), 0);
  });
});

test('Show all at 1280×800 opens full screen with no caption, and "Back to this step" leaves it', async () => {
  await withFlow(WIDE, '#direct-step-3', async (page) => {
    const dock = page.locator('[data-step-dock]');
    const text = dock.getByText(/^When the round/);
    assert.ok(await text.isVisible());
    await page.getByRole('button', { name: 'Show all' }).click();
    await text.waitFor({ state: 'detached' });
    await dock.getByRole('button', { name: 'Exit full screen' }).waitFor();
    await settle(page);
    const shot = await frameShot(page, []);
    assert.ok(shot.zoom >= PHONE_MIN_ZOOM, `zoom ${shot.zoom}`);
    for (const node of shot.nodes) assert.ok(inside(node.rect, shot.canvas), node.id);
    await dock.getByRole('button', { name: 'Back to this step' }).click();
    await text.waitFor();
    await dock.getByRole('button', { name: 'Full screen' }).waitFor();
  });
});

test('Escape ends a Show all that opened full screen', async () => {
  await withFlow(WIDE, '#direct-step-3', async (page) => {
    const dock = page.locator('[data-step-dock]');
    await page.getByRole('button', { name: 'Show all' }).click();
    await dock.getByRole('button', { name: 'Exit full screen' }).waitFor();
    await page.keyboard.press('Escape');
    await dock.getByText(/^When the round/).waitFor();
    assert.ok(await dock.getByRole('button', { name: 'Show all' }).isVisible());
  });
});

test('the caption has "What happens" and "If it fails" tabs, and no flag', async () => {
  await withFlow(WIDE, '', async (page) => {
    await page.getByRole('tab', { name: 'If it fails' }).click();
    await page.getByText('Impact on the transaction.', { exact: true }).waitFor();
    assert.ok(await page.getByText('What you see.', { exact: true }).isVisible());
    assert.ok(await page.getByText('What to do.', { exact: true }).isVisible());
    assert.equal(await page.locator('[data-step-dock]', { hasText: 'Flag:' }).count(), 0);
  });
});

test('a step with no failure text has no tabs, and shows its code link', async () => {
  const index = DIRECT.steps.findIndex((step) => !step.failure && step.code);
  await withFlow(WIDE, `#direct-step-${index + 1}`, async (page) => {
    assert.equal(await page.locator('[data-step-dock]').getByRole('tab').count(), 0);
    const code = page.locator('[data-step-dock] a', { hasText: DIRECT.steps[index]!.code!.path });
    assert.ok(await code.isVisible());
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

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** True when `inner` is inside the height of `outer`. A whole-graph view on a phone pans sideways. */
function withinHeight(inner: Rect, outer: Rect): boolean {
  return inner.top >= outer.top - 0.5 && inner.bottom <= outer.bottom + 0.5;
}

function inside(inner: Rect, outer: Rect): boolean {
  const slack = 0.5;
  return (
    inner.left >= outer.left - slack &&
    inner.right <= outer.right + slack &&
    inner.top >= outer.top - slack &&
    inner.bottom <= outer.bottom + slack
  );
}

/** The camera zoom, the canvas, every node, and the active nodes and edge labels of `actors`. */
function frameShot(page: Page, actors: readonly string[]) {
  return page.evaluate(
    ({ canvasSelector, actors }) => {
      const rect = (element: Element) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
      };
      const canvas = document.querySelector(canvasSelector)!;
      const transform =
        document.querySelector<HTMLElement>('.react-flow__viewport')!.style.transform;
      const nodes = [...canvas.querySelectorAll('.react-flow__node-actor')].map((node) => ({
        id: node.getAttribute('data-id')!,
        rect: rect(node),
      }));
      return {
        zoom: Number(/scale\(([\d.]+)\)/.exec(transform)?.[1]),
        canvas: rect(canvas),
        nodes,
        activeNodes: nodes.filter((node) => actors.includes(node.id)).map((node) => node.rect),
        activeLabels: [...canvas.querySelectorAll('.react-flow__edgelabel-renderer > div')]
          // The chip stays opaque; its content carries the dimming.
          .filter((label) => getComputedStyle(label.firstElementChild!).opacity === '1')
          .map(rect),
      };
    },
    { canvasSelector: CANVAS, actors },
  );
}

test('each submission step frames its active nodes at zoom ≥0.6 at 1280×900', async () => {
  for (const path of PATHS) {
    const options = { viewport: { width: 1280, height: 900 } };
    await withFlow(options, `#${path.id}-step-1`, async (page) => {
      for (let index = 0; index < path.steps.length; index++) {
        if (index > 0) {
          await page.getByRole('button', { name: 'Next →' }).click();
          await waitForStep(page, path, index);
        }
        const step = path.steps[index]!;
        const shot = await frameShot(page, step.actors);
        const name = `${path.id} step ${index + 1}`;
        assert.ok(shot.zoom >= 0.6, `${name} zoom ${shot.zoom}`);
        assert.equal(shot.activeNodes.length, step.actors.length, `${name} active nodes`);
        assert.equal(shot.activeLabels.length, step.edges.length, `${name} active labels`);
        for (const box of [...shot.activeNodes, ...shot.activeLabels]) {
          assert.ok(inside(box, shot.canvas), `${name}: ${JSON.stringify(box)}`);
        }
      }
    });
  }
});

/** Calls `check` on every step of every tab, starting each tab from its step 1. */
async function eachPathStep(
  options: BrowserContextOptions,
  check: (page: Page, path: ResolvedPath, index: number) => Promise<void>,
) {
  for (const path of PATHS) {
    await withFlow(options, `#${path.id}-step-1`, async (page) => {
      for (let index = 0; index < path.steps.length; index++) {
        if (index > 0) {
          await page.getByRole('button', { name: 'Next →' }).click();
          await waitForStep(page, path, index);
        }
        await check(page, path, index);
      }
    });
  }
}

test('at 375×812 each step of both tabs frames at zoom ≥0.6, first node inside', async () => {
  await eachPathStep(PHONE, async (page, path, index) => {
    const step = path.steps[index]!;
    const shot = await frameShot(page, step.actors);
    const name = `${path.id} step ${index + 1}`;
    assert.ok(shot.zoom >= 0.6, `${name} zoom ${shot.zoom}`);
    const first = shot.nodes.find((node) => node.id === step.actors[0]);
    assert.ok(first, `${name}: first active node drawn`);
    assert.ok(inside(first.rect, shot.canvas), `${name}: ${JSON.stringify(first)}`);
  });
});

test('after Show all at 375×812 every node is inside the canvas height, at the zoom floor', async () => {
  for (const path of PATHS) {
    await withFlow(PHONE, `#${path.id}-step-1`, async (page) => {
      await page.getByRole('button', { name: 'Show all' }).click();
      await settle(page);
      const shot = await frameShot(page, []);
      assert.equal(shot.nodes.length, pathActors(path).size, path.id);
      assert.ok(shot.zoom >= PHONE_MIN_ZOOM, `${path.id} zoom ${shot.zoom}`);
      for (const node of shot.nodes) {
        assert.ok(withinHeight(node.rect, shot.canvas), `${path.id} ${node.id} zoom ${shot.zoom}`);
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

const fullScreenButton = (page: Page) =>
  page.locator(CANVAS).getByRole('button', { name: /^(Exit full screen|Full screen)$/ });

test('Full screen fills the window and frames each step, at 1280×800 and 375×812', async () => {
  for (const [name, options] of [
    ['1280×800', WIDE],
    ['375×812', PHONE],
  ] as const) {
    await withFlow(options, '#direct-step-1', async (page) => {
      await fullScreenButton(page).click();
      assert.equal(await fullScreenButton(page).getAttribute('aria-pressed'), 'true');
      await settle(page);
      const root = await page.getByRole('region', { name: /diagram$/ }).boundingBox();
      const size = page.viewportSize()!;
      assert.deepEqual(root, { x: 0, y: 0, width: size.width, height: size.height }, name);
      for (let index = 0; index < DIRECT.steps.length; index++) {
        if (index > 0) {
          await page.locator(CANVAS).getByRole('button', { name: 'Next →' }).click();
          await waitForStep(page, DIRECT, index);
        }
        const step = DIRECT.steps[index]!;
        const shot = await frameShot(page, step.actors);
        // On a phone a step keeps zoom ≥0.6 and centers on its first active node, so only that
        // node is sure to be inside.
        const boxes =
          options === PHONE
            ? shot.nodes.filter((node) => node.id === step.actors[0]).map((node) => node.rect)
            : shot.activeNodes;
        if (options === PHONE) assert.ok(shot.zoom >= 0.6, `${name} step ${index + 1} zoom`);
        assert.ok(boxes.length > 0, `${name} step ${index + 1}: active node drawn`);
        for (const box of boxes) {
          assert.ok(inside(box, shot.canvas), `${name} step ${index + 1}: ${JSON.stringify(box)}`);
        }
      }
    });
  }
});

test('Escape leaves full screen and restores the scroll position', async () => {
  await withFlow(WIDE, '#direct-step-1', async (page) => {
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
    const before = await page.evaluate(() => window.scrollY);
    await fullScreenButton(page).click();
    await page.locator(CANVAS).getByRole('button', { name: 'Next →' }).click();
    await waitForStep(page, DIRECT, 1);
    assert.equal(await page.evaluate(() => window.scrollY), before, 'the page moved behind');
    await page.keyboard.press('Escape');
    assert.equal(await fullScreenButton(page).getAttribute('aria-pressed'), 'false');
    assert.equal(await page.evaluate(() => window.scrollY), before);
    assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '');
  });
});

test('full screen shows the Escape hint at 1280×800, then fades it, and none at 375×812', async () => {
  await withFlow(WIDE, '#direct-step-1', async (page) => {
    await fullScreenButton(page).click();
    const hint = page.getByRole('status').filter({ hasText: 'to exit full screen' });
    await hint.waitFor();
    assert.equal(await hint.evaluate((element) => getComputedStyle(element).opacity), '1');
    await page.waitForFunction(
      (element) => getComputedStyle(element!).opacity === '0',
      await hint.elementHandle(),
      { timeout: 5000 },
    );
  });
  await withFlow(PHONE, '#direct-step-1', async (page) => {
    await fullScreenButton(page).click();
    const hint = page.getByRole('status').filter({ hasText: 'to exit full screen' });
    assert.equal(await hint.isVisible(), false);
  });
});

test('Escape in the detail dialog closes only the dialog, not full screen', async () => {
  await withFlow(WIDE, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    await fullScreenButton(page).click();
    const dialog = await openDetail(page);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await fullScreenButton(page).getAttribute('aria-pressed'), 'true');
  });
});

test('the step bar keeps its width when the widget gains focus, so a click lands', async () => {
  await withFlow(WIDE, '#direct-step-1', async (page) => {
    const bar = page.locator(CANVAS).getByRole('navigation', { name: 'Transaction steps' });
    const before = await bar.boundingBox();
    await page.locator(CANVAS).getByRole('button', { name: 'Show all' }).focus();
    assert.deepEqual(await bar.boundingBox(), before);
  });
});

const DOCK = '[data-step-dock]';
const grip = (page: Page) => page.getByRole('button', { name: 'Move the step caption' });

test('with the diagram scrolled into view at 1280×800, the caption is on screen by Next', async () => {
  await withFlow(WIDE, '#direct-step-3', async (page) => {
    await page.locator(CANVAS).evaluate((canvas) => canvas.scrollIntoView({ block: 'start' }));
    await settle(page);
    const title = page.locator(DOCK).getByRole('heading', { name: DIRECT.steps[2]!.title });
    const box = (await title.boundingBox())!;
    assert.ok(box.y >= 0 && box.y + box.height <= 800, `caption title at ${box.y}`);
    await page.locator(CANVAS).getByRole('button', { name: 'Next →' }).click();
    await waitForStep(page, DIRECT, 3);
    await page.locator(DOCK).getByRole('heading', { name: DIRECT.steps[3]!.title }).waitFor();
  });
});

test('a drag on the grip moves the dock inside the canvas, and the camera then uses it all', async () => {
  await withFlow(WIDE, '#direct-step-3', async (page) => {
    await page.locator(CANVAS).evaluate((canvas) => canvas.scrollIntoView({ block: 'start' }));
    await settle(page);
    const docked = (await page.locator(DOCK).boundingBox())!;
    const handle = (await grip(page).boundingBox())!;
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    // Far past the canvas top, so the clamp shows.
    await page.mouse.move(handle.x + handle.width / 2, handle.y - 2000, { steps: 6 });
    await page.mouse.up();
    await settle(page);
    const canvas = (await page.locator(CANVAS).boundingBox())!;
    const moved = (await page.locator(DOCK).boundingBox())!;
    assert.equal(await page.locator(DOCK).getAttribute('data-moved'), '');
    assert.ok(Math.abs(moved.y - canvas.y) <= 1, `dock top ${moved.y}, canvas top ${canvas.y}`);
    assert.ok(moved.y < docked.y);
    // The active nodes now sit below the moved dock, framed on the whole canvas.
    const shot = await frameShot(page, DIRECT.steps[2]!.actors);
    for (const box of shot.activeNodes) assert.ok(inside(box, shot.canvas), JSON.stringify(box));
    await grip(page).dblclick();
    assert.equal(await page.locator(DOCK).getAttribute('data-moved'), null);
  });
});

test('arrow keys on the grip move the dock and do not step; Home puts it back', async () => {
  await withFlow(WIDE, '#direct-step-3', async (page) => {
    const docked = (await page.locator(DOCK).boundingBox())!;
    await grip(page).focus();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    const moved = (await page.locator(DOCK).boundingBox())!;
    assert.ok(Math.abs(docked.y - moved.y - 32) <= 1, `moved ${docked.y - moved.y}px`);
    assert.equal(new URL(page.url()).hash, '#direct-step-3');
    await page.keyboard.press('Home');
    assert.equal(await page.locator(DOCK).getAttribute('data-moved'), null);
  });
});

test('a click on the backdrop closes the detail dialog', async () => {
  await withFlow(WIDE, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    const dialog = await openDetail(page);
    await page.mouse.click(5, 5);
    await dialog.waitFor({ state: 'detached' });
  });
});

test('the detail dialog fits its graph with at most 80px of space around it at 1280×800', async () => {
  await withFlow(WIDE, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
    const dialog = await openDetail(page);
    await dialog.locator('.react-flow__node-actor').first().waitFor();
    const gaps = await page.waitForFunction(() => {
      const root = document.querySelector('[role="dialog"]')!;
      const canvas = root.querySelector('.react-flow')!.parentElement!.parentElement!;
      const bar = canvas.querySelector('nav')!.getBoundingClientRect();
      const parts = [
        ...root.querySelectorAll('.react-flow__node-actor, .react-flow__edgelabel-renderer > *'),
      ].map((part) => part.getBoundingClientRect());
      if (parts.length === 0) return null;
      const box = canvas.getBoundingClientRect();
      return {
        top: Math.min(...parts.map((part) => part.top)) - box.top,
        bottom: bar.top - Math.max(...parts.map((part) => part.bottom)),
        left: Math.min(...parts.map((part) => part.left)) - box.left,
        right: box.right - Math.max(...parts.map((part) => part.right)),
        barWidth: bar.width,
        canvasWidth: box.width,
      };
    });
    const { top, bottom, left, right, barWidth, canvasWidth } = (await gaps.jsonValue())!;
    assert.ok(top <= 80, `${top}px above the graph`);
    assert.ok(bottom <= 80, `${bottom}px between the graph and the step bar`);
    // A graph narrower than the step bar keeps the canvas as wide as the bar plus its margins.
    if (canvasWidth > barWidth + 48) {
      assert.ok(left <= 80 && right <= 80, `${left}px left and ${right}px right of the graph`);
    }
  });
});

for (const [name, options] of [
  ['768×1024', TABLET],
  ['1024×1366', { viewport: { width: 1024, height: 1366 } }],
  ['1280×800', WIDE],
] as const) {
  test(`at ${name} the detail dialog is centered over the diagram that opened it`, async () => {
    await withFlow(options, `#direct-step-${DETAIL_INDEX + 1}`, async (page) => {
      await openDetail(page);
      await page.getByRole('dialog').locator('.react-flow__node-actor').first().waitFor();
      const { dialog, canvas, viewport } = await page.evaluate((canvasSelector) => {
        const rect = (element: Element) => element.getBoundingClientRect().toJSON() as DOMRect;
        return {
          dialog: rect(document.querySelector('[role="dialog"]')!),
          canvas: rect(document.querySelector(canvasSelector)!),
          viewport: document.documentElement.clientWidth,
        };
      }, CANVAS);
      const offset = dialog.left + dialog.width / 2 - (canvas.left + canvas.width / 2);
      assert.ok(Math.abs(offset) <= 2, `the dialog center is ${offset}px from the diagram center`);
      assert.ok(dialog.left >= 0 && dialog.right <= viewport, 'the dialog leaves the viewport');
    });
  });
}

test('on every direct step, each label chip paints above the edge that runs through it', async () => {
  await withFlow(WIDE, '', async (page) => {
    // Hit-testing skips pointer-events: none, which React Flow sets on edges and labels.
    await page.addStyleTag({ content: `${CANVAS} * { pointer-events: auto !important; }` });
    for (let index = 0; index < DIRECT.steps.length; index++) {
      if (index > 0) await page.getByRole('button', { name: 'Next →' }).click();
      await settle(page);
      const covered = await page.evaluate((canvasSelector) => {
        const labels = document.querySelectorAll(
          `${canvasSelector} .react-flow__edgelabel-renderer > *`,
        );
        return [...labels].flatMap((label) => {
          const box = label.getBoundingClientRect();
          const x = box.left + box.width / 2;
          const y = box.top + box.height / 2;
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return [];
          const top = document.elementFromPoint(x, y);
          // The site header, the step bar or the key can cover a chip; only an edge must not.
          return top?.closest('.react-flow__edges') ? [label.textContent] : [];
        });
      }, CANVAS);
      assert.deepEqual(covered, [], `step ${index + 1}: chips under an edge`);
    }
  });
});

const MOTION: BrowserContextOptions = { ...WIDE, reducedMotion: 'no-preference' };

/**
 * Clicks `button`, waits 2 to 10 frames for the dialog layer's opacity to leave 1, and reports
 * that opacity, whether the layer is still in the page, and the hash. Then waits 1400ms and
 * reports the same again.
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
      // Two frames let the click's state reach the page. A fade can start a frame or two later;
      // 10 frames in all is a sixth of the fade.
      await frame();
      await frame();
      let early = sample();
      for (let count = 2; count < 10 && !(early.attached && early.opacity! < 1); count++) {
        await frame();
        early = sample();
      }
      await new Promise((resolve) => setTimeout(resolve, 1400));
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

test('every part with docs previews its own page on the first step that shows it', async () => {
  for (const actor of transactionSubmission.actors.filter((each) => each.docs)) {
    const path = PATHS.find((each) => each.steps.some((step) => step.actors.includes(actor.id)))!;
    const index = path.steps.findIndex((step) => step.actors.includes(actor.id));
    await withFlow(WIDE, `#${path.id}-step-${index + 1}`, async (page) => {
      // A reader scrolls the diagram into view first. Until then the canvas bottom is below the
      // fold, and the sticky step dock covers the lower part of the framed step.
      await page.locator(CANVAS).evaluate((canvas) => canvas.scrollIntoView({ block: 'start' }));
      await settle(page);
      await node(page, actor.id).hover();
      await previewCard(page).waitFor();
      assert.equal(await previewCard(page).getAttribute('href'), actor.docs!.href, actor.id);
    });
  }
});

test('a node whose part has no docs shows no preview', async () => {
  await withFlow(WIDE, '#direct-step-1', async (page) => {
    const wallet = transactionSubmission.actors.find((actor) => actor.id === 'wallet')!;
    assert.equal(wallet.docs, undefined);
    // The node takes no pointer events, so hover() refuses it: move the mouse to its centre.
    const box = (await node(page, 'wallet').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(1000);
    assert.equal(await previewCard(page).count(), 0);
  });
});
