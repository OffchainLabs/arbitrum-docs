/**
 * redirects-check — assert every redirect destination is a page this site actually serves.
 *
 * Usage:
 *   pnpm redirects:check                       # needs `pnpm dev` running
 *   pnpm redirects:check --base-url <origin>   # check a preview or production deploy
 *   pnpm redirects:check:offline               # no server; routability from the content tree
 *
 * `redirects.config.mjs` is built by tooling that infers routable URLs by walking the content
 * tree — `.mdx` only, `index` means the directory, `_`-prefixed files are partials, everything
 * under `/docs`. Those are guesses at what Fumadocs' `loader()` does, and a guess that drifts
 * produces a redirect to a 404: worse than no redirect, because the failure hides behind a hop.
 *
 * The online mode does not repeat the guesses. It reads `/llms.txt`, which is
 * `llms(source).index()` over the same `source` object the docs routes render from, so the URL
 * inventory comes from the router itself. That is the only authority on what is routable.
 *
 * `--offline` re-derives routability from the content tree via `buildIndex` — the same guess
 * `check-links` relies on. It needs no server, so it is what the pre-commit hook and CI run. The
 * online mode remains the stronger check; run it against a preview before merging.
 *
 * Reports (exit 1 on any of the first four):
 *   DEAD       destination is not a page (the redirect lands on a 404)
 *   SHADOWED   source is itself a live page (the redirect fires before the page can render)
 *   COLLISION  source listed more than once (Next keeps the first silently)
 *   LOOP       source redirects to itself
 *   chain      destination is another source (one extra hop) — warning only
 *
 * External (http/https) destinations are reported as SKIPPED and not verified.
 */
import { redirects } from '../redirects.config.mjs';
import { buildIndex } from './lib/doc-links.mjs';
import { auditRedirects, bareUrl } from './lib/redirects-audit.mjs';

const DEFAULT_BASE_URL = 'http://localhost:3000';

function parseArgs(argv) {
  const i = argv.indexOf('--base-url');
  return {
    baseUrl: (i === -1 ? DEFAULT_BASE_URL : argv[i + 1]).replace(/\/+$/, ''),
    offline: argv.includes('--offline'),
  };
}

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
  const { baseUrl, offline } = parseArgs(process.argv.slice(2));
  const routable = offline
    ? new Set(buildIndex(process.cwd()).byUrl.keys())
    : await fetchRoutableUrls(baseUrl);

  const { dead, shadowed, skipped, collisions, loops } = auditRedirects(redirects, routable);
  const selfLoops = loops.filter((l) => l.kind === 'self');
  const chains = loops.length - selfLoops.length;

  console.log(
    `redirects-check: ${redirects.length} redirects against ${routable.size} routable pages ` +
      `(${offline ? 'offline: content tree' : baseUrl})\n`,
  );
  for (const d of dead) console.log(`  DEAD       ${d.source}  ->  ${d.destination}`);
  for (const s of shadowed) console.log(`  SHADOWED   ${s.source}  (a live page; redirect wins)`);
  for (const c of collisions) console.log(`  COLLISION  ${c.source}  (listed ${c.count} times)`);
  for (const l of selfLoops) console.log(`  LOOP       ${l.source}  ->  ${l.destination}`);
  if (chains) console.log(`  warning: ${chains} chain(s) — destination is another source`);
  if (skipped) console.log(`\n  ${skipped} external destination(s) not verified`);

  const failures = dead.length + shadowed.length + collisions.length + selfLoops.length;
  if (failures) {
    console.log(
      `\n${dead.length} dead, ${shadowed.length} shadowed, ${collisions.length} collision(s), ` +
        `${selfLoops.length} self loop(s)`,
    );
    process.exitCode = 1;
    return;
  }
  console.log('  ok — every destination resolves, no source shadows a live page');
}

await main();
