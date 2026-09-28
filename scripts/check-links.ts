/**
 * check-links: fail on broken internal doc links. Exits 1 if any exists.
 *
 * Fumadocs has no broken-link check of its own. This walks every `content/docs/**` `.md(x)` file
 * and asserts that each internal link (markdown, JSX `href`/`to`, `<include>`) resolves to an
 * existing file. Fragments are checked against the site's MDX pipeline, including nested partials
 * and custom heading ids. External links and JSX expression attributes are skipped.
 */
import { findBrokenAnchors } from './lib/doc-anchors.ts';
import type { BrokenAnchor } from './lib/doc-anchors.ts';
import { type BrokenLink, buildIndex, findBrokenLinks } from './lib/doc-links.ts';

/** A path finding carries no reason; an anchor finding names the page it was checked on. */
type Finding = (BrokenLink & { reason?: undefined; page?: undefined }) | BrokenAnchor;

/** `error.message` for anything thrown, the way reading the property off it would answer. */
function messageOf(error: unknown): unknown {
  return typeof error === 'object' && error !== null && 'message' in error
    ? error.message
    : undefined;
}

async function main(): Promise<void> {
  const index = buildIndex(process.cwd());
  const broken: Finding[] = [...findBrokenLinks(index), ...(await findBrokenAnchors(index))];

  if (broken.length === 0) {
    console.log('check-links: no broken internal links.');
    return;
  }

  console.error(`check-links: ${broken.length} broken internal link(s):`);
  for (const b of broken) {
    console.error(
      `  ${b.rel}:${b.line}  ->  ${b.url}${b.reason ? ` (${b.reason}; on ${b.page})` : ''}`,
    );
  }
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(`check-links: ${messageOf(error)}`);
  process.exitCode = 1;
});
