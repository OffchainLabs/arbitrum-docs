import type { Browser, BrowserContextOptions, Page } from 'playwright';

import { PROJECT } from '../../components/widgets/FlowDiagram/flows.generated.ts';

export const baseUrl = process.env.STATIC_DOCS_TEST_URL ?? 'http://localhost:3000';
export const CANVAS = '[aria-roledescription="diagram"]';

interface FlowPage {
  path: string;
  actorCount: number;
}

/** Opens a flow page with reduced motion, so the camera and the scroll move without animation. */
export async function openFlow(
  browser: Browser,
  flowPage: FlowPage,
  options: BrowserContextOptions,
  hash: string,
  run: (page: Page) => Promise<void>,
) {
  const context = await browser.newContext({ reducedMotion: 'reduce', ...options });
  const page = await context.newPage();
  try {
    await page.goto(new URL(flowPage.path + hash, baseUrl).href);
    await page
      .locator('.react-flow__node-actor')
      .nth(flowPage.actorCount - 1)
      .waitFor();
    await settle(page);
    await run(page);
  } finally {
    await context.close();
  }
}

/**
 * Waits until the hash, scroll position, camera transform, card title and band names stay the same
 * for five animation frames in a row.
 */
export async function settle(page: Page) {
  await page.evaluate(() => {
    delete (window as unknown as { settleProbe?: unknown }).settleProbe;
  });
  await page.waitForFunction(
    (canvasSelector) => {
      const probe = window as unknown as { settleProbe?: { state: string; frames: number } };
      const canvas = document.querySelector(canvasSelector);
      const viewport = document.querySelector<HTMLElement>('.react-flow__viewport');
      const bandNames = [...(canvas?.querySelectorAll('div[aria-hidden="true"]') ?? [])];
      const state = [
        window.location.hash,
        window.scrollY,
        viewport?.style.transform,
        canvas?.parentElement?.querySelector('h3')?.textContent,
        ...bandNames.map((name) => name.getAttribute('style')),
      ].join('|');
      const frames = probe.settleProbe?.state === state ? probe.settleProbe.frames + 1 : 0;
      probe.settleProbe = { state, frames };
      return viewport !== null && frames >= 5;
    },
    CANVAS,
    { polling: 'raf' },
  );
}

export async function cardTitle(page: Page): Promise<string | null> {
  return page.locator(CANVAS).locator('xpath=..').locator('h3').textContent();
}

/** Each pair of band names on the canvas that intersect, with both rects. */
export async function overlappingBandNames(page: Page): Promise<string[]> {
  const names = Object.values(PROJECT.lanes)
    .filter((lane) => lane.widget)
    .map((lane) => lane.label);
  return page.evaluate(
    ({ canvasSelector, names }) => {
      const canvas = document.querySelector(canvasSelector)!;
      const labels = [...canvas.querySelectorAll('div[aria-hidden="true"]')]
        .filter((div) => names.includes(div.textContent ?? ''))
        .map((div) => ({ name: div.textContent!, rect: div.getBoundingClientRect() }));
      return labels.flatMap((a, index) =>
        labels
          .slice(index + 1)
          .filter(
            (b) =>
              a.rect.left < b.rect.right &&
              b.rect.left < a.rect.right &&
              a.rect.top < b.rect.bottom &&
              b.rect.top < a.rect.bottom,
          )
          .map((b) => `${a.name} ${JSON.stringify(a.rect)} x ${b.name} ${JSON.stringify(b.rect)}`),
      );
    },
    { canvasSelector: CANVAS, names },
  );
}
