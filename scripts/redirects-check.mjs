/**
 * redirects-check — assert every redirect destination is a page this site actually serves.
 *
 * Usage:
 *   pnpm redirects:check                       # needs `pnpm dev` running
 *   pnpm redirects:check --base-url <origin>   # check a preview or production deploy
 *
 * `redirects.config.mjs` is built by tooling that infers routable URLs by walking the content
 * tree — `.mdx` only, `index` means the directory, `_`-prefixed files are partials, everything
 * under `/docs`. Those are guesses at what Fumadocs' `loader()` does, and a guess that drifts
 * produces a redirect to a 404: worse than no redirect, because the failure hides behind a hop.
 *
 * This check does not repeat the guesses. It reads `/llms.txt`, which is `llms(source).index()`
 * over the same `source` object the docs routes render from, so the URL inventory comes from the
 * router itself. That is the only authority on what is routable.
 *
 * Reports two defects:
 *   DEAD      destination is not a page (the redirect lands on a 404)
 *   SHADOWED  source is itself a live page (the redirect fires before the page can render)
 *
 * External (http/https) destinations are reported as SKIPPED and not verified.
 */
import { redirects } from '../redirects.config.mjs';

const DEFAULT_BASE_URL = 'http://localhost:3000';

function parseArgs(argv) {
  const i = argv.indexOf('--base-url');
  return { baseUrl: (i === -1 ? DEFAULT_BASE_URL : argv[i + 1]).replace(/\/+$/, '') };
}

const isExternal = (value) => /^https?:\/\//.test(value);

/** Strip `#anchor` / `?query` so a redirect to a valid page with a fragment still matches. */
const bareUrl = (value) => value.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/';

/**
 * Every routable doc URL, taken from the site's own source-derived index rather than re-derived
 * from the filesystem. `/llms.txt` renders markdown links, so the URLs are the `](...)` targets.
 */
async function fetchRoutableUrls(baseUrl) {
  const url = `${baseUrl}/llms.txt`;
  let response;
  try {
    response = await fetch(url);
  } catch (cause) {
    throw new Error(
      `redirects-check: cannot reach ${url}. Start the site with \`pnpm dev\`, or pass ` +
        `--base-url <origin>. (${cause.message})`,
    );
  }
  if (!response.ok) {
    throw new Error(`redirects-check: ${url} returned ${response.status}`);
  }
  const body = await response.text();
  const urls = new Set([...body.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => bareUrl(m[1])));
  if (urls.size === 0) {
    throw new Error(
      `redirects-check: ${url} listed no page URLs — the index format may have changed`,
    );
  }
  return urls;
}

async function main() {
  const { baseUrl } = parseArgs(process.argv.slice(2));
  const routable = await fetchRoutableUrls(baseUrl);

  const dead = [];
  const shadowed = [];
  let skipped = 0;

  for (const { source, destination } of redirects) {
    if (isExternal(destination)) {
      skipped += 1;
    } else if (!routable.has(bareUrl(destination))) {
      dead.push({ source, destination });
    }
    if (routable.has(bareUrl(source))) shadowed.push({ source, destination });
  }

  console.log(
    `redirects-check: ${redirects.length} redirects against ${routable.size} routable pages ` +
      `(${baseUrl})\n`,
  );
  for (const d of dead) console.log(`  DEAD      ${d.source}  ->  ${d.destination}`);
  if (dead.length && shadowed.length) console.log('');
  for (const s of shadowed) console.log(`  SHADOWED  ${s.source}  (a live page; redirect wins)`);
  if (skipped) console.log(`\n  ${skipped} external destination(s) not verified`);

  if (dead.length || shadowed.length) {
    console.log(`\n${dead.length} dead, ${shadowed.length} shadowed`);
    process.exitCode = 1;
    return;
  }
  console.log('  ok — every destination resolves, no source shadows a live page');
}

await main();
