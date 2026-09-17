/**
 * check-links — fail on broken internal doc links.
 *
 * Usage:
 *   pnpm check-links           # human report; exits 1 if any broken link exists
 *   pnpm check-links --json    # JSON array of broken links to stdout; exits 0 (for tooling/diffs)
 *
 * Replicates Docusaurus's `onBrokenLinks: 'throw'`, which the Fumadocs build does not do. Walks every
 * `content/docs/**` `.md(x)` file and asserts that each internal link (markdown, JSX `href`/`to`,
 * `<include>`) resolves to an existing file. External links, fragments, JSX expression attrs, and
 * relative-URL links inside partials (which have no fixed URL) are skipped. Anchors are not validated.
 */
import { buildIndex, findBrokenLinks } from './lib/doc-links.mjs';

function main() {
  const json = process.argv.slice(2).includes('--json');
  const broken = findBrokenLinks(buildIndex(process.cwd()));

  if (json) {
    console.log(JSON.stringify(broken.map(({ rel, line, url }) => ({ rel, line, url }))));
    return;
  }

  if (broken.length === 0) {
    console.log('check-links: no broken internal links.');
    return;
  }

  console.error(`check-links: ${broken.length} broken internal link(s):`);
  for (const b of broken) console.error(`  ${b.rel}:${b.line}  ->  ${b.url}`);
  process.exit(1);
}

main();
