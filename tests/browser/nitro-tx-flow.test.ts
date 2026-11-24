/** Run against `next start` with Chromium installed: pnpm exec playwright install chromium. */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { type Browser, type BrowserContextOptions, type Page, chromium } from 'playwright';

import {
  PROJECT,
  transactionLifecycle,
} from '../../components/widgets/FlowDiagram/flows.generated.ts';
import { CANVAS, cardTitle, openFlow, settle } from './flow-page.ts';

const PAGE_PATH = '/how-arbitrum-works/deep-dives/nitro-transaction-flow';
const STEPS = transactionLifecycle.steps;
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

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface Snapshot {
  canvas: Rect;
  bar: Rect;
  zoom: number;
  nodes: { id: string; rect: Rect }[];
  activeLabels: Rect[];
  key: Rect | null;
  attribution: Rect | null;
  innerHeight: number;
}

function withFlow(
  options: BrowserContextOptions,
  hash: string,
  run: (page: Page) => Promise<void>,
) {
  const flowPage = { path: PAGE_PATH, actorCount: transactionLifecycle.actors.length };
  return openFlow(browser, flowPage, options, hash, run);
}

/** Waits until the card and the hash show step `index` (0-based), then until the view settles. */
async function waitForStep(page: Page, index: number) {
  await page.waitForFunction(
    ({ canvasSelector, title, hash }) =>
      document.querySelector(canvasSelector)?.parentElement?.querySelector('h3')?.textContent ===
        title && window.location.hash === hash,
    { canvasSelector: CANVAS, title: STEPS[index]!.title, hash: `#step-${index + 1}` },
  );
  await settle(page);
}

async function next(page: Page) {
  const title = await cardTitle(page);
  const index = STEPS.findIndex((step) => step.title === title);
  await page.getByRole('button', { name: 'Next →' }).click();
  await waitForStep(page, index + 1);
}

async function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(
    ({ canvasSelector }) => {
      const rect = (element: Element) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
      };
      const canvas = document.querySelector(canvasSelector)!;
      const transform = (document.querySelector('.react-flow__viewport') as HTMLElement).style
        .transform;
      // The key strip from 768px, or the open key box below.
      const legend = canvas.querySelector('div[data-flow-key]');
      const keyButton = [...canvas.querySelectorAll('button')].find(
        (button) => button.textContent === 'Key',
      );
      const attribution = canvas.querySelector('.react-flow__attribution');
      return {
        canvas: rect(canvas),
        // The whole step dock: the caption and the step bar.
        bar: rect(document.querySelector('[data-step-dock]')!),
        zoom: Number(/scale\(([\d.]+)\)/.exec(transform)?.[1]),
        nodes: [...canvas.querySelectorAll('.react-flow__node-actor')].map((node) => ({
          id: node.getAttribute('data-id')!,
          rect: rect(node),
        })),
        activeLabels: [...canvas.querySelectorAll('.react-flow__edgelabel-renderer > div')]
          // The chip stays opaque; its content carries the dimming.
          .filter((label) => getComputedStyle(label.firstElementChild!).opacity === '1')
          .map(rect),
        key: legend ? rect(legend) : keyButton ? rect(keyButton) : null,
        attribution: attribution ? rect(attribution) : null,
        innerHeight: window.innerHeight,
      };
    },
    { canvasSelector: CANVAS },
  );
}

function activeBoxes(shot: Snapshot, stepIndex: number): Rect[] {
  const step = STEPS[stepIndex]!;
  const nodes = shot.nodes.filter((node) => step.actors.includes(node.id)).map((n) => n.rect);
  assert.equal(nodes.length, step.actors.length, `step ${stepIndex + 1} active nodes`);
  assert.equal(shot.activeLabels.length, step.edges.length, `step ${stepIndex + 1} active labels`);
  return [...nodes, ...shot.activeLabels];
}

function intersects(a: Rect, b: Rect): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
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

/** Calls `check` on step 1 after load, then after each Next up to the last step. */
async function eachStep(page: Page, check: (shot: Snapshot, index: number) => void) {
  for (let index = 0; index < STEPS.length; index++) {
    if (index > 0) await next(page);
    check(await snapshot(page), index);
  }
}

test('opens the step named in #step-4', async () => {
  await withFlow(WIDE, '#step-4', async (page) => {
    assert.equal(await cardTitle(page), STEPS[3]!.title);
  });
});

test('Next updates the hash to #step-2', async () => {
  await withFlow(WIDE, '', async (page) => {
    await next(page);
    assert.equal(new URL(page.url()).hash, '#step-2');
    assert.equal(await cardTitle(page), STEPS[1]!.title);
  });
});

test('a heading hash does not reset the step', async () => {
  await withFlow(WIDE, '#step-3', async (page) => {
    await page.evaluate(() => {
      window.location.hash = '#related-pages';
    });
    await page.waitForFunction(() => window.location.hash === '#related-pages');
    await settle(page);
    assert.equal(new URL(page.url()).hash, '#related-pages');
    assert.equal(await cardTitle(page), STEPS[2]!.title);
  });
});

test('ArrowRight steps only when focus is inside the widget', async () => {
  await withFlow(WIDE, '', async (page) => {
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press('ArrowRight');
    await settle(page);
    assert.equal(await cardTitle(page), STEPS[0]!.title);

    await page.locator(CANVAS).locator('xpath=..').focus();
    await page.keyboard.press('ArrowRight');
    await waitForStep(page, 1);
    assert.equal(await cardTitle(page), STEPS[1]!.title);
    await page.keyboard.press('ArrowLeft');
    await waitForStep(page, 0);
    assert.equal(await cardTitle(page), STEPS[0]!.title);
    await page.keyboard.press('ArrowLeft');
    await settle(page);
    assert.equal(await cardTitle(page), STEPS[0]!.title);
  });
});

test('Space scrolls the page while focus is on the page body', async () => {
  await withFlow(WIDE, '', async (page) => {
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await settle(page);
    assert.equal(await page.evaluate(() => document.activeElement === document.body), true);
    const before = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('Space');
    await page
      .waitForFunction((start) => window.scrollY > start, before, { timeout: 5_000 })
      .catch(() => undefined);
    const after = await page.evaluate(() => window.scrollY);
    assert.ok(after > before, `scrollY ${before} -> ${after}`);
  });
});

test('Tab from the widget root reaches Back within 3 presses', async () => {
  await withFlow(WIDE, '', async (page) => {
    await page.locator(CANVAS).locator('xpath=..').focus();
    const visited: string[] = [];
    for (let press = 0; press < 3 && !visited.includes('← Back'); press++) {
      await page.keyboard.press('Tab');
      visited.push(await page.evaluate(() => document.activeElement?.textContent ?? ''));
    }
    assert.ok(visited.includes('← Back'), `focus went to ${JSON.stringify(visited)}`);
  });
});

test('reaching either end keeps keyboard focus inside the widget', async () => {
  await withFlow(WIDE, '#step-6', async (page) => {
    const root = page.locator(CANVAS).locator('xpath=..');
    await page.getByRole('button', { name: 'Next →' }).focus();
    await page.keyboard.press('Enter');
    await waitForStep(page, 6);
    assert.equal(await cardTitle(page), STEPS[6]!.title);
    assert.ok(await root.evaluate((element) => element.contains(document.activeElement)));
    await page.keyboard.press('Enter');
    await settle(page);
    assert.equal(await cardTitle(page), STEPS[6]!.title, 'Next on the last step does nothing');
  });
  await withFlow(WIDE, '#step-2', async (page) => {
    const root = page.locator(CANVAS).locator('xpath=..');
    await page.getByRole('button', { name: '← Back' }).focus();
    await page.keyboard.press('Enter');
    await waitForStep(page, 0);
    assert.equal(await cardTitle(page), STEPS[0]!.title);
    assert.ok(await root.evaluate((element) => element.contains(document.activeElement)));
  });
});

test('the failure text shows on the "If it fails" tab, the flag in the footer', async () => {
  assert.ok(STEPS[0]!.failure && STEPS[0]!.flag);
  await withFlow(WIDE, '', async (page) => {
    const term = page.getByText('What the operator sees.', { exact: true });
    assert.equal(await term.count(), 0);
    const flag = page.locator('[data-step-dock] code', { hasText: STEPS[0]!.flag! });
    assert.ok(await flag.isVisible(), 'the flag is in the footer on the first tab');
    await page.getByRole('tab', { name: 'If it fails' }).click();
    await term.waitFor();
    assert.ok(await page.getByText('Impact on the transaction.', { exact: true }).isVisible());
    assert.ok(await page.getByText('Recovery.', { exact: true }).isVisible());
  });
});

test('arrow keys on the step tabs switch tabs and do not step the diagram', async () => {
  await withFlow(WIDE, '', async (page) => {
    const failureTab = page.getByRole('tab', { name: 'If it fails' });
    await page.getByRole('tab', { name: 'What happens' }).focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await failureTab.getAttribute('aria-selected'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'If it fails');
    assert.equal(await cardTitle(page), STEPS[0]!.title);
  });
});

test('the selected tab stays on the next step with failure text', async () => {
  const index = STEPS.findIndex((step, i) => step.failure && STEPS[i + 1]?.failure);
  assert.ok(index >= 0);
  await withFlow(WIDE, `#step-${index + 1}`, async (page) => {
    await page.getByRole('tab', { name: 'If it fails' }).click();
    await next(page);
    assert.equal(
      await page.getByRole('tab', { name: 'If it fails' }).getAttribute('aria-selected'),
      'true',
    );
  });
});

test('at 1280×800 on page load the step bar is inside the viewport', async () => {
  await withFlow(WIDE, '', async (page) => {
    const shot = await snapshot(page);
    assert.ok(shot.bar.top >= 0 && shot.bar.bottom <= shot.innerHeight);
  });
});

test('while the canvas bottom is below the fold, the step bar sits 12px above it', async () => {
  await withFlow(WIDE, '', async (page) => {
    const shot = await snapshot(page);
    assert.ok(shot.canvas.bottom > shot.innerHeight, 'canvas bottom starts below the fold');
    assert.ok(Math.abs(shot.bar.bottom - (shot.innerHeight - 12)) <= 1, `bar ${shot.bar.bottom}`);
  });
});

for (const device of [WIDE, PHONE]) {
  const width = device.viewport!.width;
  test(`after Next, no active node or label intersects the step bar at ${width}px`, async () => {
    await withFlow(device, '', async (page) => {
      for (let index = 1; index < STEPS.length; index++) {
        await next(page);
        const shot = await snapshot(page);
        for (const box of activeBoxes(shot, index)) {
          assert.ok(!intersects(box, shot.bar), `step ${index + 1}: ${JSON.stringify(box)}`);
        }
      }
    });
  });
}

test('each step frames its active nodes and labels at zoom ≥0.6 at 1280×900', async () => {
  await withFlow({ viewport: { width: 1280, height: 900 } }, '', async (page) => {
    await eachStep(page, (shot, index) => {
      assert.ok(shot.zoom >= 0.6, `step ${index + 1} zoom ${shot.zoom}`);
      for (const box of activeBoxes(shot, index)) {
        assert.ok(inside(box, shot.canvas), `step ${index + 1}: ${JSON.stringify(box)}`);
      }
    });
  });
});

test('at 375×812 each step frames at zoom ≥0.6 with its first active node inside', async () => {
  await withFlow(PHONE, '', async (page) => {
    await eachStep(page, (shot, index) => {
      assert.ok(shot.zoom >= 0.6, `step ${index + 1} zoom ${shot.zoom}`);
      const first = shot.nodes.find((node) => node.id === STEPS[index]!.actors[0]);
      assert.ok(first, `step ${index + 1}: first active node drawn`);
      assert.ok(inside(first.rect, shot.canvas), `step ${index + 1}: ${JSON.stringify(first)}`);
    });
  });
});

for (const device of [WIDE, PHONE]) {
  const width = device.viewport!.width;
  test(`the key covers no active node or label at ${width}px`, async () => {
    await withFlow(device, '', async (page) => {
      await eachStep(page, (shot, index) => {
        assert.ok(shot.key, 'the key strip or the Key button is on the canvas');
        for (const box of activeBoxes(shot, index)) {
          assert.ok(!intersects(box, shot.key), `step ${index + 1}: ${JSON.stringify(box)}`);
        }
      });
    });
  });
}

test('the key names both chains at 1280×800, and in the Key box at 375×812', async () => {
  const names = ['child', 'parent'].map((chain) => PROJECT.lanes[chain]!.label);
  await withFlow(WIDE, '', async (page) => {
    for (const name of names) {
      assert.ok(await page.locator('[data-flow-key]', { hasText: name }).isVisible(), name);
    }
  });
  await withFlow(PHONE, '', async (page) => {
    await page.getByRole('button', { name: 'Key' }).click();
    for (const name of names) {
      assert.ok(await page.locator('div[data-flow-key]', { hasText: name }).isVisible(), name);
    }
  });
});

test('at 375×812 the key opens from the Key button', async () => {
  await withFlow(PHONE, '', async (page) => {
    const button = page.getByRole('button', { name: 'Key' });
    assert.equal(await button.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.getByText('Parent chain contract', { exact: true }).count(), 0);
    await button.click();
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    assert.ok(await page.getByText('Parent chain contract', { exact: true }).isVisible());
  });
});

for (const stepNumber of [5, 6]) {
  test(`only the txChain band has the active border on step ${stepNumber}`, async () => {
    await withFlow(WIDE, `#step-${stepNumber}`, async (page) => {
      const txChain = STEPS[stepNumber - 1]!.txChain;
      const bands = await page.evaluate((styles) => {
        const computed = (color: string) => {
          const probe = document.createElement('div');
          probe.style.borderColor = color;
          document.body.append(probe);
          const value = getComputedStyle(probe).borderTopColor;
          probe.remove();
          return value;
        };
        return [...document.querySelectorAll('.react-flow__node-band')].map((node) => {
          const chain = node.getAttribute('data-id')!.split('-')[1]!;
          const border = getComputedStyle(node.firstElementChild!).borderTopColor;
          return { chain, active: border === computed(styles[chain]!.widget!.border[1]) };
        });
      }, PROJECT.lanes);
      assert.ok(bands.length >= 2);
      for (const band of bands) assert.equal(band.active, band.chain === txChain, band.chain);
    });
  });
}

test('no horizontal scroll at 375px', async () => {
  await withFlow(PHONE, '', async (page) => {
    for (let index = 0; index < STEPS.length; index++) {
      if (index > 0) await next(page);
      const sizes = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      assert.equal(sizes.scrollWidth, sizes.clientWidth, `step ${index + 1}`);
    }
  });
});

test('after Show all at 1280×800 no node is under the key strip', async () => {
  await withFlow(WIDE, '', async (page) => {
    await page.locator(CANVAS).evaluate((canvas) => canvas.scrollIntoView({ block: 'start' }));
    await page.getByRole('button', { name: 'Show all' }).click();
    await settle(page);
    const shot = await snapshot(page);
    assert.ok(shot.key);
    for (const node of shot.nodes) {
      assert.ok(!intersects(node.rect, shot.key), `${node.id} is under the key strip`);
    }
  });
});

test('after Show all at 375×812 the step bar covers no node', async () => {
  await withFlow(PHONE, '', async (page) => {
    await next(page);
    await page.getByRole('button', { name: 'Show all' }).click();
    await settle(page);
    const shot = await snapshot(page);
    for (const node of shot.nodes) {
      assert.ok(!intersects(node.rect, shot.bar), node.id);
      assert.ok(inside(node.rect, shot.canvas), node.id);
    }
  });
});

test('after Show all at 375×812 every node is inside the canvas', async () => {
  await withFlow(PHONE, '', async (page) => {
    await page.getByRole('button', { name: 'Show all' }).click();
    await settle(page);
    const shot = await snapshot(page);
    assert.equal(shot.nodes.length, transactionLifecycle.actors.length);
    for (const node of shot.nodes) {
      assert.ok(inside(node.rect, shot.canvas), `${node.id} zoom ${shot.zoom}`);
    }
  });
});

// After Next the canvas is on screen and the bar sits at its bottom. Before that, the floating bar
// can cross any part of the canvas, the attribution included.
test('after Next at 375×812 the React Flow attribution does not touch the step bar', async () => {
  await withFlow(PHONE, '', async (page) => {
    for (let index = 1; index < STEPS.length; index++) {
      await next(page);
      const shot = await snapshot(page);
      assert.ok(shot.attribution, 'attribution shown');
      assert.ok(!intersects(shot.attribution, shot.bar), `step ${index + 1}`);
    }
  });
});

test('at 375×812 the step bar fits inside the canvas', async () => {
  await withFlow(PHONE, '', async (page) => {
    await eachStep(page, (shot, index) => {
      assert.ok(shot.bar.left >= shot.canvas.left, `step ${index + 1}: ${JSON.stringify(shot)}`);
      assert.ok(shot.bar.right <= shot.canvas.right, `step ${index + 1}`);
    });
  });
});

for (const device of [WIDE, TABLET, PHONE]) {
  const width = device.viewport!.width;
  test(`Next scrolls the canvas top below the site header at ${width}px`, async () => {
    await withFlow(device, '', async (page) => {
      await next(page);
      const gap = await page.evaluate((canvasSelector) => {
        const canvas = document.querySelector(canvasSelector)!.getBoundingClientRect();
        const pinned = [...document.querySelectorAll('body *')]
          .filter((element) => ['fixed', 'sticky'].includes(getComputedStyle(element).position))
          .map((element) => element.getBoundingClientRect())
          .filter((box) => box.height > 0 && box.bottom < window.innerHeight / 2);
        // The header stack: pinned bars that start at the screen top or under another one.
        let header = 0;
        for (let grew = true; grew;) {
          grew = false;
          for (const box of pinned) {
            if (box.top <= header + 0.5 && box.bottom > header) {
              header = box.bottom;
              grew = true;
            }
          }
        }
        return { canvasTop: canvas.top, header };
      }, CANVAS);
      assert.ok(gap.header > 0, 'a site header is pinned to the top');
      assert.ok(gap.canvasTop >= gap.header, JSON.stringify(gap));
    });
  });
}

test('a one-finger vertical swipe over the canvas at 375px scrolls the page', async () => {
  await withFlow(PHONE, '', async (page) => {
    await page.locator(CANVAS).evaluate((canvas) => canvas.scrollIntoView({ block: 'start' }));
    await settle(page);
    const canvas = await page.locator(CANVAS).boundingBox();
    assert.ok(canvas);
    const point = { x: canvas.x + canvas.width / 2, y: canvas.y + canvas.height / 2 };
    const onCanvas = await page.evaluate(
      ({ point, canvasSelector }) =>
        document
          .querySelector(canvasSelector)!
          .contains(document.elementFromPoint(point.x, point.y)),
      { point, canvasSelector: CANVAS },
    );
    assert.ok(onCanvas, 'the swipe starts on the canvas');
    const before = await page.evaluate(() => window.scrollY);
    // A real touch sequence. Input.synthesizeScrollGesture did not scroll even plain page text.
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    for (let move = 1; move <= 10; move++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: point.x, y: point.y - move * 20 }],
      });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page
      .waitForFunction((start) => window.scrollY > start + 100, before, { timeout: 5_000 })
      .catch(() => undefined);
    const after = await page.evaluate(() => window.scrollY);
    assert.ok(after - before > 100, `scrollY ${before} -> ${after}`);
  });
});

test('at 375×812 a one-finger horizontal drag over the canvas pans the diagram', async () => {
  await withFlow(PHONE, '', async (page) => {
    await page.locator(CANVAS).evaluate((canvas) => canvas.scrollIntoView({ block: 'start' }));
    await settle(page);
    const canvas = await page.locator(CANVAS).boundingBox();
    assert.ok(canvas);
    const point = { x: canvas.x + canvas.width * 0.75, y: canvas.y + canvas.height / 2 };
    const state = () =>
      page.evaluate(() => {
        const transform =
          document.querySelector<HTMLElement>('.react-flow__viewport')!.style.transform;
        return { x: Number(/translate\((-?[\d.]+)px/.exec(transform)?.[1]), scrollY: scrollY };
      });
    const before = await state();
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    for (let move = 1; move <= 10; move++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: point.x - move * 15, y: point.y }],
      });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await settle(page);
    const after = await state();
    assert.ok(Math.abs(after.x - before.x + 150) <= 1, `viewport x ${before.x} -> ${after.x}`);
    assert.equal(after.scrollY, before.scrollY);
  });
});
