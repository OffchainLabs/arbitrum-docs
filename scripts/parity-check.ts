/**
 * parity-check: compare every production docs page with its Fumadocs counterpart, block by block.
 *
 * Usage:
 *   pnpm parity [--prod URL] [--target URL] [--bypass TOKEN] [--threshold 0.97] [--only /a,/b]
 *               [--concurrency N] [--no-cache] [--out DIR]
 *               [--label NAME] [--commit SHA] [--prs 3601,3612] [--publish] [--fail-on-diff]
 *
 * Reads the production sitemap, follows each URL's redirects on the target by hand, extracts the
 * main article on both sides, compares the normalized blocks and scores each page (see
 * scripts/lib/parity/health.ts). A page with any score below the threshold goes to triage. Writes report.json and report.md
 * to the out dir (default .parity/, which also holds the HTTP cache). `--publish` also writes the
 * run to public/parity/runs/<label>.json and updates public/parity/runs/index.json.
 *
 * Needs the network, so it is not part of `pnpm test` or CI. Exits 0 unless `--fail-on-diff` is
 * set and a page needs triage.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { blockHash, compareBlocks } from './lib/parity/compare.ts';
import { type RawItem, extractArticle } from './lib/parity/extract.ts';
import { DEFAULT_THRESHOLD, needsTriage, scorePage } from './lib/parity/health.ts';
import { lookupPanel, panelBlocks } from './lib/parity/markdown.ts';
import { imageName } from './lib/parity/normalize.ts';
import { buildSummary, renderMarkdown, updateManifest } from './lib/parity/report.ts';
import {
  type Resolution,
  canonicalPath,
  categorize,
  resolvePath,
  sectionOf,
  withoutDocsPrefix,
} from './lib/parity/resolve.ts';
import {
  type Block,
  type BrokenLink,
  type PageReport,
  type ParityRun,
  type RunManifest,
  SCHEMA_VERSION,
} from './lib/parity/schema.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLISH_DIR = path.join(ROOT, 'public', 'parity', 'runs');

interface Options {
  prod: string;
  target: string;
  bypass: string | undefined;
  threshold: number;
  only: string[] | null;
  concurrency: number;
  cache: boolean;
  out: string;
  label: string;
  commit: string | null;
  prs: number[];
  publish: boolean;
  failOnDiff: boolean;
}

const git = (...args: string[]): string | null => {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
};

function parseOptions(argv: string[]): Options {
  const { values } = parseArgs({
    args: argv,
    options: {
      'prod': { type: 'string', default: 'https://docs.arbitrum.io' },
      'target': { type: 'string', default: 'http://localhost:3000' },
      'bypass': { type: 'string' },
      'threshold': { type: 'string', default: String(DEFAULT_THRESHOLD) },
      'only': { type: 'string' },
      'concurrency': { type: 'string', default: '6' },
      'no-cache': { type: 'boolean', default: false },
      'out': { type: 'string', default: '.parity' },
      'label': { type: 'string' },
      'commit': { type: 'string' },
      'prs': { type: 'string' },
      'publish': { type: 'boolean', default: false },
      'fail-on-diff': { type: 'boolean', default: false },
    },
  });
  const concurrency = Number(values.concurrency);
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error('--concurrency must be a positive integer');
  const threshold = Number(values.threshold);
  if (!(threshold >= 0 && threshold <= 1)) throw new Error('--threshold must be between 0 and 1');
  const prs = (values.prs ?? '')
    .split(',')
    .map((pr) => pr.trim().replace(/^#/, ''))
    .filter(Boolean)
    .map(Number);
  if (prs.some((pr) => !Number.isInteger(pr)))
    throw new Error('--prs takes comma-separated PR numbers');
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  const label = (values.label ?? (branch && branch !== 'HEAD' ? branch : 'fumadocs')).replace(
    /[^A-Za-z0-9._-]+/g,
    '-',
  );
  return {
    prod: values.prod.replace(/\/+$/, ''),
    target: values.target.replace(/\/+$/, ''),
    bypass: values.bypass,
    threshold,
    only: values.only
      ? values.only
          .split(',')
          .map((p) => canonicalPath(p.trim()))
          .filter(Boolean)
      : null,
    concurrency,
    cache: !values['no-cache'],
    out: path.resolve(ROOT, values.out),
    label,
    commit: values.commit ?? git('rev-parse', 'HEAD'),
    prs,
    publish: values.publish,
    failOnDiff: values['fail-on-diff'],
  };
}

interface Fetched {
  status: number;
  location: string | null;
  body: string;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Strip scripts before caching: Fumadocs pages repeat their markup in the flight payload. */
const withoutScripts = (html: string): string => {
  let previous: string;
  let current = html;
  do {
    previous = current;
    current = current.replace(/<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gi, '');
  } while (current !== previous);
  return current;
};

/** HTTP with an on-disk cache, retries with backoff, and one concurrency limit for every host. */
class Http {
  private active = 0;
  private readonly queue: Array<() => void> = [];
  private readonly memo = new Map<string, Promise<Fetched | null>>();

  private readonly options: Options;
  private readonly cacheDir: string;

  constructor(options: Options, cacheDir: string) {
    this.options = options;
    this.cacheDir = cacheDir;
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  private async slot<T>(work: () => Promise<T>): Promise<T> {
    if (this.active >= this.options.concurrency)
      await new Promise<void>((resolve) => this.queue.push(resolve));
    this.active++;
    try {
      return await work();
    } finally {
      this.active--;
      this.queue.shift()?.();
    }
  }

  private headers(url: string): Record<string, string> {
    const headers: Record<string, string> = { 'user-agent': 'arbitrum-docs-parity-check' };
    if (this.options.bypass && new URL(url).origin === new URL(this.options.target).origin) {
      headers['x-vercel-protection-bypass'] = this.options.bypass;
    }
    return headers;
  }

  /** One request. `manual` returns the redirect itself; otherwise redirects are followed. */
  get(url: string, redirect: 'manual' | 'follow', keepBody: boolean): Promise<Fetched | null> {
    const key = `${redirect}:${keepBody}:${url}`;
    let pending = this.memo.get(key);
    if (!pending) {
      pending = this.load(url, redirect, keepBody, key);
      this.memo.set(key, pending);
    }
    return pending;
  }

  private async load(url: string, redirect: 'manual' | 'follow', keepBody: boolean, key: string) {
    const file = path.join(this.cacheDir, `${createHash('sha1').update(key).digest('hex')}.json`);
    if (this.options.cache && fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8')) as Fetched;
    }
    const result = await this.slot(async () => {
      for (let attempt = 0; ; attempt++) {
        try {
          const response = await fetch(url, { redirect, headers: this.headers(url) });
          const retryable = response.status === 429 || response.status >= 500;
          if (retryable && attempt < 3) {
            await response.body?.cancel();
            await sleep(500 * 2 ** attempt);
            continue;
          }
          const body = keepBody ? withoutScripts(await response.text()) : '';
          if (!keepBody) await response.body?.cancel();
          return { status: response.status, location: response.headers.get('location'), body };
        } catch (error) {
          if (attempt >= 3) {
            console.warn(`request failed: ${url}: ${(error as Error).message}`);
            return null;
          }
          await sleep(500 * 2 ** attempt);
        }
      }
    });
    if (result && result.status < 500) fs.writeFileSync(file, JSON.stringify(result));
    return result;
  }
}

/** Every page URL in a sitemap, following sitemap indexes. */
async function sitemapPaths(http: Http, url: string, seen = new Set<string>()): Promise<string[]> {
  if (seen.has(url)) return [];
  seen.add(url);
  const response = await http.get(url, 'follow', true);
  if (!response || response.status !== 200)
    throw new Error(`could not read ${url} (${response?.status ?? 'error'})`);
  const locs = [...response.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) =>
    m[1].replace(/&amp;/g, '&'),
  );
  if (/<sitemapindex\b/.test(response.body)) {
    const nested = await Promise.all(locs.map((loc) => sitemapPaths(http, loc, seen)));
    return nested.flat();
  }
  return locs.map((loc) => canonicalPath(new URL(loc).pathname));
}

const pool = async <T, R>(
  items: T[],
  limit: number,
  work: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await work(items[index], index);
      }
    }),
  );
  return results;
};

interface Side {
  items: RawItem[];
  found: boolean;
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const http = new Http(options, path.join(options.out, 'cache'));
  const vars = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'content', 'vars.json'), 'utf8'),
  ) as Record<string, unknown>;
  const prodOrigin = new URL(options.prod).origin;
  const targetOrigin = new URL(options.target).origin;

  const sitemap = [...new Set(await sitemapPaths(http, `${options.prod}/sitemap.xml`))];
  const prodPaths = options.only ?? sitemap;
  console.error(`checking ${prodPaths.length} production URLs against ${options.target}`);

  const resolutions = new Map<string, Promise<Resolution>>();
  const resolveOnTarget = (pathname: string): Promise<Resolution> => {
    const key = canonicalPath(pathname);
    let pending = resolutions.get(key);
    if (!pending) {
      pending = resolvePath(options.target, key, async (url) => {
        const response = await http.get(url, 'manual', false);
        return response ? { status: response.status, location: response.location } : null;
      });
      resolutions.set(key, pending);
    }
    return pending;
  };
  const prodStatus = async (url: string): Promise<number | null> =>
    (await http.get(url, 'follow', false))?.status ?? null;

  /** The path of an internal URL on either site, or null for an external one. */
  const internalPath = (url: string): string | null => {
    try {
      const parsed = new URL(url);
      return parsed.origin === prodOrigin || parsed.origin === targetOrigin
        ? canonicalPath(parsed.pathname)
        : null;
    } catch {
      return null;
    }
  };

  /** Links compare by where they land on the target, so an old slug and its new page are equal. */
  const canonicalLink = async (url: string, pagePath: string): Promise<string> => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return url;
    }
    const hash = parsed.hash;
    const internal = internalPath(url);
    if (internal === null) {
      return `${parsed.protocol}//${parsed.host.toLowerCase()}${canonicalPath(parsed.pathname)}${parsed.search}${hash}`;
    }
    // Bundled files carry a content hash and move between asset folders, so they compare by name.
    if (/\.(pdf|png|jpe?g|gif|svg|webp|zip|json|txt|csv)$/i.test(internal))
      return `asset:${imageName(internal)}`;
    if (internal === pagePath || withoutDocsPrefix(internal) === withoutDocsPrefix(pagePath)) {
      if (hash) return hash;
    }
    const resolved = await resolveOnTarget(internal);
    if (resolved.status === 200 && resolved.finalPath) return `${resolved.finalPath}${hash}`;
    const fromProd = new URL(url).origin === prodOrigin;
    return `${fromProd ? `/docs${withoutDocsPrefix(internal)}` : internal}${hash}`;
  };

  const finish = async (items: RawItem[], pagePath: string): Promise<Block[]> => {
    const blocks: Block[] = [];
    for (const item of items) {
      if (item.kind === 'panel') continue;
      blocks.push(
        item.kind === 'link' ? { ...item, text: await canonicalLink(item.text, pagePath) } : item,
      );
    }
    return blocks;
  };

  const blocksDir = path.join(options.out, 'blocks');
  fs.rmSync(blocksDir, { recursive: true, force: true });
  fs.mkdirSync(blocksDir, { recursive: true });

  let targetSitemap: string[] = [];
  try {
    targetSitemap = [...new Set(await sitemapPaths(http, `${options.target}/sitemap.xml`))];
  } catch (error) {
    console.warn(`target sitemap: ${(error as Error).message}`);
  }
  const isLanding = (pathname: string): boolean =>
    targetSitemap.some((p) => p.startsWith(`${pathname}/`));

  let done = 0;
  const pages = await pool(prodPaths, options.concurrency, async (oldPath): Promise<PageReport> => {
    const notes: string[] = [];
    const resolution = await resolveOnTarget(oldPath);
    const category = categorize(resolution, isLanding);

    const prodUrl = `${options.prod}${oldPath === '/' ? '/' : oldPath}`;
    const prodPage = await http.get(prodUrl, 'follow', true);
    const prod: Side =
      prodPage && prodPage.status === 200
        ? extractArticle(prodPage.body, prodUrl)
        : { items: [], found: false };
    if (!prod.found) notes.push(`production article not found (${prodPage?.status ?? 'error'})`);

    let target: Side = { items: [], found: false };
    if (resolution.status === 200 && resolution.finalPath) {
      const targetUrl = `${options.target}${resolution.finalPath}`;
      const targetPage = await http.get(targetUrl, 'manual', true);
      if (targetPage && targetPage.status === 200) {
        target = extractArticle(targetPage.body, targetUrl);
        if (!target.found) notes.push('target article not found');
        target = {
          ...target,
          items: await recoverPanels(target.items, resolution.finalPath, notes),
        };
      }
    }

    const prodBlocks = await finish(prod.items, oldPath);
    const targetBlocks = await finish(target.items, resolution.finalPath ?? oldPath);
    const slug = oldPath.replace(/^\//, '').replace(/\//g, '__') || 'home';
    fs.writeFileSync(
      path.join(blocksDir, `${slug}.json`),
      JSON.stringify(
        {
          oldPath,
          finalPath: resolution.finalPath,
          prod: prodBlocks.map((b) => ({ ...b, hash: blockHash(b) })),
          target: targetBlocks.map((b) => ({ ...b, hash: blockHash(b) })),
        },
        null,
        2,
      ),
    );

    const unresolved = category === 'not-found' || category === 'loop';
    if (category === 'not-found') {
      const candidate = `/docs${withoutDocsPrefix(oldPath)}`;
      const existing = await resolveOnTarget(candidate);
      if (existing.status === 200)
        notes.push(
          `${existing.finalPath} exists on the target, but ${oldPath} has no redirect to it`,
        );
    }
    const comparison = compareBlocks(prodBlocks, unresolved ? [] : targetBlocks);
    const working = new Set<string>();
    for (const block of prodBlocks) {
      if (block.kind !== 'link' || !block.text.startsWith('/')) continue;
      const linkPath = block.text.replace(/#.*$/, '');
      if ((await resolveOnTarget(linkPath)).status === 200) working.add(linkPath);
    }
    const { scores, items } = scorePage({
      category,
      prod: prodBlocks,
      target: targetBlocks,
      comparison,
      isInternal: (link) =>
        link.startsWith('/') || link.startsWith('#') || link.startsWith('asset:'),
      works: (link) => !link.startsWith('/') || working.has(link.replace(/#.*$/, '')),
    });

    const brokenLinks = await checkLinks(targetBlocks, target.items, prodBlocks, prod.items);

    if (++done % 25 === 0) console.error(`${done}/${prodPaths.length}`);
    return {
      oldPath,
      finalPath: resolution.finalPath,
      section: sectionOf(oldPath),
      category,
      redirectChain: resolution.chain,
      scores,
      triage: needsTriage(scores, options.threshold),
      items,
      blocks: unresolved ? { ...comparison.counts, exact: 0 } : comparison.counts,
      brokenLinks,
      diffs: unresolved ? [] : comparison.diffs,
      notes,
    };
  });

  /** Replace each empty panel with its content from the page's markdown export. */
  async function recoverPanels(
    items: RawItem[],
    finalPath: string,
    notes: string[],
  ): Promise<RawItem[]> {
    if (!items.some((item) => item.kind === 'panel')) return items;
    const mdUrl = `${options.target}${finalPath}.md`;
    const markdown = await http.get(mdUrl, 'follow', true);
    let panels: ReturnType<typeof panelBlocks> | undefined;
    if (markdown && markdown.status === 200) {
      try {
        panels = panelBlocks(markdown.body, vars, `${options.target}${finalPath}`);
      } catch (error) {
        notes.push(`markdown export did not parse: ${(error as Error).message.split('\n')[0]}`);
      }
    } else {
      notes.push(`markdown export unavailable (${markdown?.status ?? 'error'})`);
    }
    const result: RawItem[] = [];
    for (const item of items) {
      if (item.kind !== 'panel') {
        result.push(item);
        continue;
      }
      const recovered = panels ? lookupPanel(panels, item.panel) : undefined;
      if (recovered) result.push(...recovered);
      else notes.push(`hidden ${item.panel.type} "${item.panel.label}" not recovered`);
    }
    return result;
  }

  /** Internal target links that do not land on a 200 page, split by whether production is broken too. */
  async function checkLinks(
    targetBlocks: Block[],
    targetItems: RawItem[],
    prodBlocks: Block[],
    prodItems: RawItem[],
  ): Promise<PageReport['brokenLinks']> {
    const targetOnly: BrokenLink[] = [];
    const alsoBrokenOnProd: BrokenLink[] = [];
    const rawTarget = targetItems.filter((item): item is Block => item.kind === 'link');
    const rawProd = prodItems.filter((item): item is Block => item.kind === 'link');
    const targetLinks = targetBlocks.filter((b) => b.kind === 'link');
    const prodLinks = prodBlocks.filter((b) => b.kind === 'link');
    const seen = new Set<string>();
    for (const [index, link] of rawTarget.entries()) {
      const internal = internalPath(link.text);
      if (internal === null || seen.has(internal)) continue;
      seen.add(internal);
      const resolved = await resolveOnTarget(internal);
      if (resolved.status === 200) continue;
      const canonical = targetLinks[index]?.text.replace(/#.*$/, '');
      const counterpart =
        rawProd[prodLinks.findIndex((b) => b.text.replace(/#.*$/, '') === canonical)];
      const prodHref = counterpart
        ? counterpart.text
        : `${options.prod}${withoutDocsPrefix(internal)}`;
      const prodCode = await prodStatus(prodHref.replace(/#.*$/, ''));
      const entry: BrokenLink = {
        href: link.text,
        resolvedPath: resolved.finalPath ?? internal,
        status: resolved.status,
        prodHref,
        prodStatus: prodCode,
      };
      (prodCode === 200 ? targetOnly : alsoBrokenOnProd).push(entry);
    }
    return { targetOnly, alsoBrokenOnProd };
  }

  const landed = new Set(pages.flatMap((page) => (page.finalPath ? [page.finalPath] : [])));
  const newOnlyPages = options.only ? [] : targetSitemap.filter((p) => !landed.has(p)).sort();

  const summary = buildSummary(pages, newOnlyPages, options.threshold);
  const run: ParityRun = {
    schemaVersion: SCHEMA_VERSION,
    label: options.label,
    commit: options.commit,
    prs: options.prs,
    generatedAt: new Date().toISOString(),
    prodUrl: options.prod,
    targetUrl: options.target,
    only: options.only,
    summary,
    pages,
    newOnlyPages,
  };

  fs.writeFileSync(path.join(options.out, 'report.json'), `${JSON.stringify(run, null, 2)}\n`);
  fs.writeFileSync(path.join(options.out, 'report.md'), renderMarkdown(run));
  if (options.publish) publish(run);

  console.log(
    `${summary.checked} checked, health ${summary.health}, ${summary.triage} to triage, ` +
      `${summary.categories['not-found']} not found, ${summary.categories.unrelated} unrelated redirects, ` +
      `${summary.newOnly} only on target`,
  );
  console.log(`report: ${path.relative(ROOT, path.join(options.out, 'report.md'))}`);

  if (options.failOnDiff && summary.triage > 0) process.exitCode = 1;
}

function publish(run: ParityRun): void {
  fs.mkdirSync(PUBLISH_DIR, { recursive: true });
  const file = `${run.label}.json`;
  fs.writeFileSync(path.join(PUBLISH_DIR, file), `${JSON.stringify(run)}\n`);
  const indexPath = path.join(PUBLISH_DIR, 'index.json');
  const current = fs.existsSync(indexPath)
    ? (JSON.parse(fs.readFileSync(indexPath, 'utf8')) as RunManifest)
    : undefined;
  const manifest = updateManifest(current, {
    label: run.label,
    commit: run.commit,
    prs: run.prs,
    generatedAt: run.generatedAt,
    health: run.summary.health,
    triage: run.summary.triage,
    summary: run.summary,
    file,
  });
  fs.writeFileSync(indexPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`published: ${path.relative(ROOT, path.join(PUBLISH_DIR, file))}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
